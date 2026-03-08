import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreatePostDto, UpdatePostDto } from "./dto/create-post.dto";
import { PostStatus, ContentType, MediaType, SocialPlatform } from "@prisma/client";
import {
  MediaValidationService,
  ValidationResult,
} from "../publisher/media-validation.service";

@Injectable()
export class PostsService {
  constructor(
    private prisma: PrismaService,
    private mediaValidation: MediaValidationService,
  ) {}

  async findAll(
    userId: string,
    query: { status?: string; socialAccountId?: string; from?: string; to?: string; page?: number; limit?: number },
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

    const page = query.page || 1;
    const limit = query.limit || 20;

    const [items, total] = await Promise.all([
      this.prisma.post.findMany({
        where,
        include: {
          media: { orderBy: { position: "asc" } },
          accounts: { include: { socialAccount: { select: { id: true, platform: true, accountName: true, accountAvatar: true } } } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.post.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  async findOne(userId: string, id: string) {
    const post = await this.prisma.post.findFirst({
      where: { id, userId },
      include: {
        media: { orderBy: { position: "asc" } },
        accounts: { include: { socialAccount: { select: { id: true, platform: true, accountName: true, accountAvatar: true } } } },
      },
    });
    if (!post) throw new NotFoundException("Publication non trouvée");
    return post;
  }

  async validateForFrontend(
    userId: string,
    body: {
      socialAccountIds?: string[];
      contentType?: ContentType;
      caption?: string;
      mediaUrls?: string[];
    },
  ): Promise<ValidationResult> {
    const platforms = await this.resolvePlatforms(
      userId,
      body.socialAccountIds || [],
    );
    return this.mediaValidation.validate(
      platforms,
      body.contentType || ContentType.POST,
      body.caption || null,
      body.mediaUrls || [],
    );
  }

  async create(userId: string, dto: CreatePostDto) {
    // Run platform validation
    const platforms = await this.resolvePlatforms(userId, dto.socialAccountIds);
    const validation = this.mediaValidation.validate(
      platforms,
      dto.contentType || ContentType.POST,
      dto.caption || null,
      dto.mediaUrls || [],
    );
    if (!validation.valid) {
      throw new BadRequestException(validation.errors);
    }

    if (dto.scheduledAt && new Date(dto.scheduledAt) < new Date()) {
      throw new BadRequestException("La date de programmation doit être dans le futur");
    }

    const status = dto.scheduledAt ? PostStatus.SCHEDULED : PostStatus.DRAFT;

    const post = await this.prisma.post.create({
      data: {
        userId,
        caption: dto.caption || null,
        contentType: dto.contentType || ContentType.POST,
        reelCoverUrl: dto.reelCoverUrl || null,
        status,
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : null,
        media: dto.mediaUrls?.length
          ? {
              create: dto.mediaUrls.map((url, i) => ({
                type: this.guessMediaType(url),
                localUrl: url,
                position: i,
              })),
            }
          : undefined,
        accounts: {
          create: dto.socialAccountIds.map((saId) => ({
            socialAccountId: saId,
            status,
          })),
        },
      },
      include: {
        media: true,
        accounts: { include: { socialAccount: { select: { id: true, platform: true, accountName: true, accountAvatar: true } } } },
      },
    });

    return post;
  }

  async update(userId: string, id: string, dto: UpdatePostDto) {
    const post = await this.prisma.post.findFirst({
      where: { id, userId },
      include: { media: true, accounts: true },
    });
    if (!post) throw new NotFoundException("Publication non trouvée");
    if (post.status !== PostStatus.DRAFT && post.status !== PostStatus.SCHEDULED) {
      throw new BadRequestException("Seuls les brouillons et programmés peuvent être modifiés");
    }

    // Run platform validation with merged data
    const accountIds =
      dto.socialAccountIds || post.accounts.map((a) => a.socialAccountId);
    const mediaUrls =
      dto.mediaUrls ?? post.media.map((m) => m.localUrl);
    const contentType = dto.contentType || post.contentType;

    const platforms = await this.resolvePlatforms(userId, accountIds);
    const validation = this.mediaValidation.validate(
      platforms,
      contentType,
      dto.caption !== undefined ? dto.caption || null : post.caption,
      mediaUrls,
    );
    if (!validation.valid) {
      throw new BadRequestException(validation.errors);
    }

    if (dto.scheduledAt && new Date(dto.scheduledAt) < new Date()) {
      throw new BadRequestException("La date de programmation doit être dans le futur");
    }

    const newStatus = dto.scheduledAt
      ? PostStatus.SCHEDULED
      : post.scheduledAt
        ? PostStatus.SCHEDULED
        : PostStatus.DRAFT;

    // Update media if provided
    if (dto.mediaUrls) {
      await this.prisma.postMedia.deleteMany({ where: { postId: id } });
      if (dto.mediaUrls.length) {
        await this.prisma.postMedia.createMany({
          data: dto.mediaUrls.map((url, i) => ({
            postId: id,
            type: this.guessMediaType(url),
            localUrl: url,
            position: i,
          })),
        });
      }
    }

    // Update accounts if provided
    if (dto.socialAccountIds) {
      await this.prisma.postAccount.deleteMany({ where: { postId: id } });
      if (dto.socialAccountIds.length) {
        await this.prisma.postAccount.createMany({
          data: dto.socialAccountIds.map((saId) => ({
            postId: id,
            socialAccountId: saId,
            status: newStatus,
          })),
        });
      }
    }

    return this.prisma.post.update({
      where: { id },
      data: {
        caption: dto.caption !== undefined ? dto.caption : undefined,
        contentType: dto.contentType || undefined,
        reelCoverUrl: dto.reelCoverUrl !== undefined ? dto.reelCoverUrl || null : undefined,
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
        status: newStatus,
      },
      include: {
        media: { orderBy: { position: "asc" } },
        accounts: { include: { socialAccount: { select: { id: true, platform: true, accountName: true, accountAvatar: true } } } },
      },
    });
  }

  async remove(userId: string, id: string) {
    const post = await this.prisma.post.findFirst({ where: { id, userId } });
    if (!post) throw new NotFoundException("Publication non trouvée");
    if (post.status !== PostStatus.DRAFT && post.status !== PostStatus.SCHEDULED && post.status !== PostStatus.FAILED) {
      throw new BadRequestException("Impossible de supprimer une publication en cours ou publiée");
    }
    await this.prisma.post.delete({ where: { id } });
    return { success: true };
  }

  async publishNow(userId: string, id: string) {
    const post = await this.prisma.post.findFirst({
      where: { id, userId },
      include: { accounts: true },
    });
    if (!post) throw new NotFoundException("Publication non trouvée");
    if (post.status === PostStatus.PUBLISHING || post.status === PostStatus.PUBLISHED) {
      throw new BadRequestException("Publication déjà en cours ou publiée");
    }

    // Set to scheduled with past date so cron picks it up immediately
    await this.prisma.post.update({
      where: { id },
      data: {
        status: PostStatus.SCHEDULED,
        scheduledAt: new Date(),
      },
    });

    await this.prisma.postAccount.updateMany({
      where: { postId: id },
      data: { status: PostStatus.SCHEDULED },
    });

    return { success: true, message: "Publication programmée pour maintenant" };
  }

  async duplicate(userId: string, id: string, scheduledAt?: string) {
    const original = await this.prisma.post.findFirst({
      where: { id, userId },
      include: { media: true, accounts: true },
    });
    if (!original) throw new NotFoundException("Publication non trouvée");

    if (scheduledAt && new Date(scheduledAt) < new Date()) {
      throw new BadRequestException("La date de programmation doit être dans le futur");
    }

    const status = scheduledAt ? PostStatus.SCHEDULED : PostStatus.DRAFT;

    return this.prisma.post.create({
      data: {
        userId,
        caption: original.caption,
        contentType: original.contentType,
        reelCoverUrl: original.reelCoverUrl,
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
    if (ext && ["mp4", "webm", "mov", "avi"].includes(ext)) return MediaType.VIDEO;
    return MediaType.IMAGE;
  }

  private async resolvePlatforms(
    userId: string,
    socialAccountIds: string[],
  ): Promise<SocialPlatform[]> {
    if (!socialAccountIds.length) return [];
    const accounts = await this.prisma.socialAccount.findMany({
      where: { id: { in: socialAccountIds }, userId },
      select: { platform: true },
    });
    return [...new Set(accounts.map((a) => a.platform))];
  }
}
