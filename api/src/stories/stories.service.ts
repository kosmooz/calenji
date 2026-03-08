import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateStoryDto, UpdateStoryDto } from "./dto/create-story.dto";
import { PostStatus, MediaType, ContentType, SocialPlatform } from "@prisma/client";
import { MediaValidationService } from "../publisher/media-validation.service";

@Injectable()
export class StoriesService {
  constructor(
    private prisma: PrismaService,
    private mediaValidation: MediaValidationService,
  ) {}

  async findAll(
    userId: string,
    query: { status?: string; socialAccountId?: string; from?: string; to?: string },
  ) {
    const where: any = { userId };
    if (query.status) where.status = query.status;
    if (query.socialAccountId) {
      where.accounts = { some: { socialAccountId: query.socialAccountId } };
    }
    if (query.from || query.to) {
      where.scheduledAt = {};
      if (query.from) where.scheduledAt.gte = new Date(query.from);
      if (query.to) where.scheduledAt.lte = new Date(query.to);
    }

    return this.prisma.story.findMany({
      where,
      include: {
        media: { orderBy: { position: "asc" } },
        accounts: { include: { socialAccount: { select: { id: true, platform: true, accountName: true, accountAvatar: true } } } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async findOne(userId: string, id: string) {
    const story = await this.prisma.story.findFirst({
      where: { id, userId },
      include: {
        media: true,
        accounts: { include: { socialAccount: { select: { id: true, platform: true, accountName: true, accountAvatar: true } } } },
      },
    });
    if (!story) throw new NotFoundException("Story non trouvée");
    return story;
  }

  async create(userId: string, dto: CreateStoryDto) {
    if (dto.scheduledAt && new Date(dto.scheduledAt) < new Date()) {
      throw new BadRequestException("La date de programmation doit être dans le futur");
    }

    // Validate media format against platforms
    const platforms = await this.resolvePlatforms(dto.socialAccountIds);
    const validation = this.mediaValidation.validate(
      platforms,
      ContentType.STORY,
      null,
      [dto.mediaUrl],
    );
    if (!validation.valid) {
      throw new BadRequestException(validation.errors);
    }

    const status = dto.scheduledAt ? PostStatus.SCHEDULED : PostStatus.DRAFT;

    return this.prisma.story.create({
      data: {
        userId,
        status,
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : null,
        media: {
          create: [{
            type: this.guessMediaType(dto.mediaUrl),
            localUrl: dto.mediaUrl,
            position: 0,
          }],
        },
        accounts: {
          create: dto.socialAccountIds.map((saId) => ({
            socialAccountId: saId,
            status,
          })),
        },
      },
      include: { media: true, accounts: true },
    });
  }

  async update(userId: string, id: string, dto: UpdateStoryDto) {
    const story = await this.prisma.story.findFirst({ where: { id, userId } });
    if (!story) throw new NotFoundException("Story non trouvée");

    if (story.status !== PostStatus.DRAFT && story.status !== PostStatus.SCHEDULED) {
      throw new BadRequestException("Seuls les brouillons et programmés peuvent être modifiés");
    }

    if (dto.scheduledAt && new Date(dto.scheduledAt) < new Date()) {
      throw new BadRequestException("La date de programmation doit être dans le futur");
    }

    // Validate media format if media or accounts changed
    if (dto.mediaUrl || dto.socialAccountIds) {
      const mediaUrl = dto.mediaUrl || (await this.prisma.storyMedia.findFirst({ where: { storyId: id } }))?.localUrl;
      const accountIds = dto.socialAccountIds || (await this.prisma.storyAccount.findMany({ where: { storyId: id } })).map((a) => a.socialAccountId);
      if (mediaUrl && accountIds.length) {
        const platforms = await this.resolvePlatforms(accountIds);
        const validation = this.mediaValidation.validate(
          platforms,
          ContentType.STORY,
          null,
          [mediaUrl],
        );
        if (!validation.valid) {
          throw new BadRequestException(validation.errors);
        }
      }
    }

    if (dto.mediaUrl) {
      await this.prisma.storyMedia.deleteMany({ where: { storyId: id } });
      await this.prisma.storyMedia.create({
        data: {
          storyId: id,
          type: this.guessMediaType(dto.mediaUrl),
          localUrl: dto.mediaUrl,
          position: 0,
        },
      });
    }

    if (dto.socialAccountIds) {
      await this.prisma.storyAccount.deleteMany({ where: { storyId: id } });
      await this.prisma.storyAccount.createMany({
        data: dto.socialAccountIds.map((saId) => ({
          storyId: id,
          socialAccountId: saId,
          status: dto.scheduledAt ? PostStatus.SCHEDULED : story.status,
        })),
      });
    }

    const newStatus = dto.scheduledAt ? PostStatus.SCHEDULED : story.status;
    return this.prisma.story.update({
      where: { id },
      data: {
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
        status: newStatus,
      },
      include: { media: true, accounts: true },
    });
  }

  async remove(userId: string, id: string) {
    const story = await this.prisma.story.findFirst({ where: { id, userId } });
    if (!story) throw new NotFoundException("Story non trouvée");
    if (story.status !== PostStatus.DRAFT && story.status !== PostStatus.SCHEDULED && story.status !== PostStatus.FAILED) {
      throw new BadRequestException("Impossible de supprimer une story en cours ou publiée");
    }
    await this.prisma.story.delete({ where: { id } });
    return { success: true };
  }

  async publishNow(userId: string, id: string) {
    const story = await this.prisma.story.findFirst({ where: { id, userId } });
    if (!story) throw new NotFoundException("Story non trouvée");
    if (story.status === PostStatus.PUBLISHING || story.status === PostStatus.PUBLISHED) {
      throw new BadRequestException("Story déjà en cours ou publiée");
    }

    await this.prisma.story.update({
      where: { id },
      data: { status: PostStatus.SCHEDULED, scheduledAt: new Date() },
    });
    await this.prisma.storyAccount.updateMany({
      where: { storyId: id },
      data: { status: PostStatus.SCHEDULED },
    });

    return { success: true };
  }

  async duplicate(userId: string, id: string, scheduledAt?: string) {
    const original = await this.prisma.story.findFirst({
      where: { id, userId },
      include: { media: true, accounts: true },
    });
    if (!original) throw new NotFoundException("Story non trouvée");

    if (scheduledAt && new Date(scheduledAt) < new Date()) {
      throw new BadRequestException("La date de programmation doit être dans le futur");
    }

    const status = scheduledAt ? PostStatus.SCHEDULED : PostStatus.DRAFT;

    return this.prisma.story.create({
      data: {
        userId,
        status,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        media: {
          create: original.media.map((m) => ({
            type: m.type,
            localUrl: m.localUrl,
            position: m.position,
          })),
        },
        accounts: {
          create: original.accounts.map((a) => ({
            socialAccountId: a.socialAccountId,
            status,
          })),
        },
      },
      include: { media: true, accounts: true },
    });
  }

  private guessMediaType(url: string): MediaType {
    const ext = url.split(".").pop()?.toLowerCase();
    if (ext && ["mp4", "webm", "mov"].includes(ext)) return MediaType.VIDEO;
    return MediaType.IMAGE;
  }

  private async resolvePlatforms(socialAccountIds: string[]): Promise<SocialPlatform[]> {
    const accounts = await this.prisma.socialAccount.findMany({
      where: { id: { in: socialAccountIds } },
      select: { platform: true },
    });
    return [...new Set(accounts.map((a) => a.platform))];
  }
}
