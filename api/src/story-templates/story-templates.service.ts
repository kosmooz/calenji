import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateStoryTemplateDto, UpdateStoryTemplateDto } from "./dto/create-story-template.dto";
import { MediaType } from "@prisma/client";

@Injectable()
export class StoryTemplatesService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string) {
    return this.prisma.storyTemplate.findMany({
      where: { userId },
      include: { media: { orderBy: { position: "asc" } } },
      orderBy: { createdAt: "desc" },
    });
  }

  async create(userId: string, dto: CreateStoryTemplateDto) {
    if (dto.storyId) {
      return this.createFromStory(userId, dto);
    }
    if (dto.mediaUrl && dto.socialAccountIds?.length) {
      return this.createFromData(userId, dto);
    }
    throw new BadRequestException("storyId ou mediaUrl + socialAccountIds requis");
  }

  private async createFromStory(userId: string, dto: CreateStoryTemplateDto) {
    const story = await this.prisma.story.findFirst({
      where: { id: dto.storyId, userId },
      include: {
        media: { orderBy: { position: "asc" } },
        accounts: true,
      },
    });
    if (!story) throw new NotFoundException("Story non trouvée");

    // Extract time from scheduledAt if available
    const scheduledTime = dto.scheduledTime
      || (story.scheduledAt ? this.extractTime(story.scheduledAt) : null);

    return this.prisma.storyTemplate.create({
      data: {
        userId,
        name: dto.name || null,
        scheduledTime,
        socialAccountIds: story.accounts.map((a) => a.socialAccountId),
        media: {
          create: story.media.map((m) => ({
            type: m.type,
            localUrl: m.localUrl,
            publicUrl: m.publicUrl,
            position: m.position,
          })),
        },
      },
      include: { media: true },
    });
  }

  private async createFromData(userId: string, dto: CreateStoryTemplateDto) {
    return this.prisma.storyTemplate.create({
      data: {
        userId,
        name: dto.name || null,
        scheduledTime: dto.scheduledTime || null,
        socialAccountIds: dto.socialAccountIds!,
        media: {
          create: [{
            type: this.guessMediaType(dto.mediaUrl!),
            localUrl: dto.mediaUrl!,
            position: 0,
          }],
        },
      },
      include: { media: true },
    });
  }

  async update(userId: string, id: string, dto: UpdateStoryTemplateDto) {
    const template = await this.prisma.storyTemplate.findFirst({
      where: { id, userId },
    });
    if (!template) throw new NotFoundException("Modèle non trouvé");

    return this.prisma.storyTemplate.update({
      where: { id },
      data: { name: dto.name },
      include: { media: true },
    });
  }

  async remove(userId: string, id: string) {
    const template = await this.prisma.storyTemplate.findFirst({
      where: { id, userId },
    });
    if (!template) throw new NotFoundException("Modèle non trouvé");

    await this.prisma.storyTemplate.delete({ where: { id } });
    return { success: true };
  }

  private extractTime(date: Date): string {
    const h = date.getHours().toString().padStart(2, "0");
    const m = date.getMinutes().toString().padStart(2, "0");
    return `${h}:${m}`;
  }

  private guessMediaType(url: string): MediaType {
    const ext = url.split(".").pop()?.toLowerCase();
    if (ext && ["mp4", "webm", "mov"].includes(ext)) return MediaType.VIDEO;
    return MediaType.IMAGE;
  }
}
