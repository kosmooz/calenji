import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { PostStatus } from "@prisma/client";

export interface CalendarItem {
  id: string;
  type: "post" | "story";
  contentType: string | null;
  mediaType: string | null;
  status: string;
  scheduledAt: string | null;
  publishedAt: string | null;
  caption: string | null;
  thumbnailUrl: string | null;
  platforms: string[];
  accountNames: string[];
  platformAccounts: { platform: string; accountName: string; accountAvatar: string | null }[];
}

@Injectable()
export class CalendarService {
  constructor(private prisma: PrismaService) {}

  async getItems(
    userId: string,
    from: string,
    to: string,
    socialAccountId?: string | string[],
  ): Promise<{ items: CalendarItem[] }> {
    const fromDate = new Date(from);
    const toDate = new Date(to);

    const dateFilter = {
      OR: [
        { scheduledAt: { gte: fromDate, lte: toDate } },
        { publishedAt: { gte: fromDate, lte: toDate } },
      ],
    };

    let accountFilter = {};
    if (socialAccountId) {
      const ids = Array.isArray(socialAccountId) ? socialAccountId : [socialAccountId];
      accountFilter = { accounts: { some: { socialAccountId: { in: ids } } } };
    }

    const [posts, stories] = await Promise.all([
      this.prisma.post.findMany({
        where: { userId, ...dateFilter, ...accountFilter },
        include: {
          media: { take: 1, orderBy: { position: "asc" } },
          accounts: {
            include: {
              socialAccount: { select: { platform: true, accountName: true, accountAvatar: true } },
            },
          },
        },
        orderBy: { scheduledAt: "asc" },
      }),
      this.prisma.story.findMany({
        where: { userId, ...dateFilter, ...accountFilter },
        include: {
          media: { take: 1, orderBy: { position: "asc" } },
          accounts: {
            include: {
              socialAccount: { select: { platform: true, accountName: true, accountAvatar: true } },
            },
          },
        },
        orderBy: { scheduledAt: "asc" },
      }),
    ]);

    const items: CalendarItem[] = [
      ...posts.map((p) => ({
        id: p.id,
        type: "post" as const,
        contentType: p.contentType,
        mediaType: p.media[0]?.type || null,
        status: p.status,
        scheduledAt: p.scheduledAt?.toISOString() || null,
        publishedAt: p.publishedAt?.toISOString() || null,
        caption: p.caption ? p.caption.slice(0, 100) : null,
        thumbnailUrl: p.media[0]?.localUrl || null,
        platforms: [...new Set(p.accounts.map((a) => a.socialAccount.platform))],
        accountNames: p.accounts.map((a) => a.socialAccount.accountName),
        platformAccounts: p.accounts.map((a) => ({ platform: a.socialAccount.platform, accountName: a.socialAccount.accountName, accountAvatar: a.socialAccount.accountAvatar })),
      })),
      ...stories.map((s) => ({
        id: s.id,
        type: "story" as const,
        contentType: "STORY",
        mediaType: s.media[0]?.type || null,
        status: s.status,
        scheduledAt: s.scheduledAt?.toISOString() || null,
        publishedAt: s.publishedAt?.toISOString() || null,
        caption: null,
        thumbnailUrl: s.media[0]?.localUrl || null,
        platforms: [...new Set(s.accounts.map((a) => a.socialAccount.platform))],
        accountNames: s.accounts.map((a) => a.socialAccount.accountName),
        platformAccounts: s.accounts.map((a) => ({ platform: a.socialAccount.platform, accountName: a.socialAccount.accountName, accountAvatar: a.socialAccount.accountAvatar })),
      })),
    ];

    // Sort by scheduledAt or publishedAt
    items.sort((a, b) => {
      const dateA = a.scheduledAt || a.publishedAt || "";
      const dateB = b.scheduledAt || b.publishedAt || "";
      return dateA.localeCompare(dateB);
    });

    return { items };
  }

  async reschedule(
    userId: string,
    type: string,
    id: string,
    scheduledAt: string,
  ) {
    const newDate = new Date(scheduledAt);

    if (newDate < new Date()) {
      throw new BadRequestException("La date de programmation doit être dans le futur");
    }

    if (type === "post") {
      const post = await this.prisma.post.findFirst({
        where: { id, userId },
      });
      if (!post) throw new NotFoundException("Publication non trouvée");
      if (post.status !== PostStatus.DRAFT && post.status !== PostStatus.SCHEDULED) {
        throw new BadRequestException("Impossible de reprogrammer");
      }
      return this.prisma.post.update({
        where: { id },
        data: { scheduledAt: newDate, status: PostStatus.SCHEDULED },
      });
    }

    if (type === "story") {
      const story = await this.prisma.story.findFirst({
        where: { id, userId },
      });
      if (!story) throw new NotFoundException("Story non trouvée");
      if (story.status !== PostStatus.DRAFT && story.status !== PostStatus.SCHEDULED) {
        throw new BadRequestException("Impossible de reprogrammer");
      }
      return this.prisma.story.update({
        where: { id },
        data: { scheduledAt: newDate, status: PostStatus.SCHEDULED },
      });
    }

    throw new BadRequestException("Type invalide");
  }
}
