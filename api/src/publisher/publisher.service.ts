import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { PrismaService } from "../prisma/prisma.service";
import { CryptoService } from "../crypto/crypto.service";
import { SocialAuthService } from "../social-auth/social-auth.service";
import { MetaApiService } from "../social-auth/meta-api.service";
import { PublisherWorkerService } from "./publisher-worker.service";
import { PostStatus } from "@prisma/client";

@Injectable()
export class PublisherService {
  private readonly logger = new Logger(PublisherService.name);
  private publishing = false;

  constructor(
    private prisma: PrismaService,
    private crypto: CryptoService,
    private socialAuth: SocialAuthService,
    private metaApi: MetaApiService,
    private worker: PublisherWorkerService,
  ) {}

  // ─── Cron: Publish scheduled content every 60s ────────────────────

  @Cron(CronExpression.EVERY_MINUTE)
  async handleScheduledPublishing() {
    if (this.publishing) return;
    this.publishing = true;

    try {
      const now = new Date();

      // Find scheduled posts
      const posts = await this.prisma.post.findMany({
        where: {
          status: PostStatus.SCHEDULED,
          scheduledAt: { lte: now },
        },
        select: { id: true },
      });

      for (const post of posts) {
        try {
          await this.worker.publishPost(post.id);
        } catch (err: any) {
          this.logger.error(`Post publish error ${post.id}: ${err.message}`);
        }
      }

      // Find scheduled stories
      const stories = await this.prisma.story.findMany({
        where: {
          status: PostStatus.SCHEDULED,
          scheduledAt: { lte: now },
        },
        select: { id: true },
      });

      for (const story of stories) {
        try {
          await this.worker.publishStory(story.id);
        } catch (err: any) {
          this.logger.error(`Story publish error ${story.id}: ${err.message}`);
        }
      }
    } finally {
      this.publishing = false;
    }
  }

  // ─── Cron: Refresh expiring tokens daily at 3am ──────────────────

  @Cron("0 3 * * *")
  async handleTokenRefresh() {
    this.logger.log("Starting token refresh check...");

    const sevenDaysFromNow = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000,
    );

    const accounts = await this.prisma.socialAccount.findMany({
      where: {
        isActive: true,
        metaUserTokenExp: { lte: sevenDaysFromNow },
        metaUserTokenEnc: { not: null },
      },
    });

    for (const account of accounts) {
      try {
        const currentToken = this.crypto.decrypt(
          account.metaUserTokenEnc!,
          account.metaUserTokenIv!,
          account.metaUserTokenTag!,
        );

        const newTokenRes =
          await this.metaApi.exchangeLongLivedToken(currentToken);
        const newEnc = this.crypto.encrypt(newTokenRes.access_token);
        const newExp = new Date(
          Date.now() + newTokenRes.expires_in * 1000,
        );

        await this.prisma.socialAccount.update({
          where: { id: account.id },
          data: {
            metaUserTokenEnc: newEnc.encrypted,
            metaUserTokenIv: newEnc.iv,
            metaUserTokenTag: newEnc.tag,
            metaUserTokenExp: newExp,
          },
        });

        this.logger.log(
          `Token refreshed for account ${account.accountName} (${account.platform})`,
        );
      } catch (err: any) {
        this.logger.error(
          `Token refresh failed for ${account.id}: ${err.message}`,
        );

        // If token is invalid, deactivate account
        if (err.code === 190) {
          await this.prisma.socialAccount.update({
            where: { id: account.id },
            data: { isActive: false },
          });
        }
      }
    }
  }
}
