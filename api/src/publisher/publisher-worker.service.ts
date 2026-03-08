import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { SocialAuthService } from "../social-auth/social-auth.service";
import { MetaApiService, MetaApiError } from "../social-auth/meta-api.service";
import { MediaHostService } from "../media-host/media-host.service";
import { PostStatus, SocialPlatform, MediaType, ContentType } from "@prisma/client";

@Injectable()
export class PublisherWorkerService {
  private readonly logger = new Logger(PublisherWorkerService.name);

  constructor(
    private prisma: PrismaService,
    private socialAuth: SocialAuthService,
    private metaApi: MetaApiService,
    private mediaHost: MediaHostService,
  ) {}

  // ─── Post Publishing ──────────────────────────────────────────────

  async publishPost(postId: string) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      include: {
        media: { orderBy: { position: "asc" } },
        accounts: { include: { socialAccount: true } },
      },
    });
    if (!post) return;

    // Mark as publishing
    await this.prisma.post.update({
      where: { id: postId },
      data: { status: PostStatus.PUBLISHING },
    });

    let anySuccess = false;
    let allFailed = true;

    for (const postAccount of post.accounts) {
      if (postAccount.status === PostStatus.PUBLISHED) {
        anySuccess = true;
        allFailed = false;
        continue;
      }

      try {
        await this.prisma.postAccount.update({
          where: { id: postAccount.id },
          data: { status: PostStatus.PUBLISHING },
        });

        const token = await this.socialAuth.getDecryptedToken(
          postAccount.socialAccountId,
        );
        const account = postAccount.socialAccount;

        // Resolve public URLs for media
        const publicMedia = await Promise.all(
          post.media.map(async (m) => ({
            ...m,
            publicUrl: await this.mediaHost.getPublicUrl(m.localUrl),
          })),
        );

        let platformPostId: string | undefined;

        if (account.platform === SocialPlatform.INSTAGRAM) {
          platformPostId = await this.publishToInstagram(
            account.platformAccountId,
            token,
            post.caption,
            publicMedia,
            post.contentType,
            post.reelCoverUrl,
          );
        } else {
          platformPostId = await this.publishToFacebook(
            account.facebookPageId || account.platformAccountId,
            token,
            post.caption,
            publicMedia,
            post.contentType,
            post.reelCoverUrl,
          );
        }

        await this.prisma.postAccount.update({
          where: { id: postAccount.id },
          data: {
            status: PostStatus.PUBLISHED,
            platformPostId,
            publishedAt: new Date(),
          },
        });

        await this.log("PUBLISH_POST", "post", postId, postAccount.socialAccountId, true);
        anySuccess = true;
        allFailed = false;
      } catch (err: any) {
        this.logger.error(
          `Failed to publish post ${postId} to ${postAccount.socialAccount.platform}: ${err.message}`,
        );

        await this.prisma.postAccount.update({
          where: { id: postAccount.id },
          data: {
            status: PostStatus.FAILED,
            errorMessage: err.message,
          },
        });

        await this.log(
          "PUBLISH_POST",
          "post",
          postId,
          postAccount.socialAccountId,
          false,
          err.message,
        );

        // Deactivate account on OAuth error
        if (err instanceof MetaApiError && err.code === 190) {
          await this.prisma.socialAccount.update({
            where: { id: postAccount.socialAccountId },
            data: { isActive: false },
          });
        }
      }
    }

    // Update global status
    await this.prisma.post.update({
      where: { id: postId },
      data: {
        status: anySuccess ? PostStatus.PUBLISHED : PostStatus.FAILED,
        publishedAt: anySuccess ? new Date() : undefined,
      },
    });
  }

  // ─── Story Publishing ─────────────────────────────────────────────

  async publishStory(storyId: string) {
    const story = await this.prisma.story.findUnique({
      where: { id: storyId },
      include: {
        media: { orderBy: { position: "asc" } },
        accounts: { include: { socialAccount: true } },
      },
    });
    if (!story || !story.media[0]) return;

    await this.prisma.story.update({
      where: { id: storyId },
      data: { status: PostStatus.PUBLISHING },
    });

    let anySuccess = false;
    const media = story.media[0];
    const publicUrl = await this.mediaHost.getPublicUrl(media.localUrl);

    for (const storyAccount of story.accounts) {
      if (storyAccount.status === PostStatus.PUBLISHED) {
        anySuccess = true;
        continue;
      }

      try {
        await this.prisma.storyAccount.update({
          where: { id: storyAccount.id },
          data: { status: PostStatus.PUBLISHING },
        });

        const token = await this.socialAuth.getDecryptedToken(
          storyAccount.socialAccountId,
        );
        const account = storyAccount.socialAccount;
        let platformPostId: string | undefined;

        if (account.platform === SocialPlatform.INSTAGRAM) {
          const isVideo = media.type === MediaType.VIDEO;
          const container = await this.metaApi.createIGMediaContainer(
            account.platformAccountId,
            token,
            {
              ...(isVideo ? { video_url: publicUrl } : { image_url: publicUrl }),
              media_type: "STORIES",
            },
          );

          if (isVideo) {
            await this.pollIGContainer(container.id, token);
          }

          const result = await this.publishIGContainerWithRetry(
            account.platformAccountId,
            token,
            container.id,
          );
          platformPostId = result.id;
        } else {
          // Facebook story: dispatch by media type
          const pageId = account.facebookPageId || account.platformAccountId;
          const isVideo = media.type === MediaType.VIDEO;

          if (isVideo) {
            const result = await this.metaApi.publishFBPageVideoStory(
              pageId,
              token,
              publicUrl,
            );
            platformPostId = result.id;
          } else {
            const result = await this.metaApi.publishFBPagePhotoStory(
              pageId,
              token,
              publicUrl,
            );
            platformPostId = result.id;
          }
        }

        await this.prisma.storyAccount.update({
          where: { id: storyAccount.id },
          data: {
            status: PostStatus.PUBLISHED,
            platformPostId,
            publishedAt: new Date(),
          },
        });

        await this.log("PUBLISH_STORY", "story", storyId, storyAccount.socialAccountId, true);
        anySuccess = true;
      } catch (err: any) {
        this.logger.error(
          `Failed to publish story ${storyId}: ${err.message}`,
        );

        await this.prisma.storyAccount.update({
          where: { id: storyAccount.id },
          data: { status: PostStatus.FAILED, errorMessage: err.message },
        });

        await this.log("PUBLISH_STORY", "story", storyId, storyAccount.socialAccountId, false, err.message);

        if (err instanceof MetaApiError && err.code === 190) {
          await this.prisma.socialAccount.update({
            where: { id: storyAccount.socialAccountId },
            data: { isActive: false },
          });
        }
      }
    }

    await this.prisma.story.update({
      where: { id: storyId },
      data: {
        status: anySuccess ? PostStatus.PUBLISHED : PostStatus.FAILED,
        publishedAt: anySuccess ? new Date() : undefined,
      },
    });
  }

  // ─── Instagram Helpers ────────────────────────────────────────────

  private async publishToInstagram(
    igAccountId: string,
    token: string,
    caption: string | null,
    media: { type: MediaType; publicUrl: string }[],
    contentType: ContentType = ContentType.POST,
    reelCoverUrl?: string | null,
  ): Promise<string> {
    if (media.length === 0) {
      throw new Error("Instagram nécessite au moins un média");
    }

    if (media.length === 1) {
      const m = media[0];
      const isVideo = m.type === MediaType.VIDEO;
      const isReel = contentType === ContentType.REEL || isVideo;

      const container = await this.metaApi.createIGMediaContainer(
        igAccountId,
        token,
        {
          ...(isVideo ? { video_url: m.publicUrl } : { image_url: m.publicUrl }),
          caption: caption || undefined,
          ...(isReel ? { media_type: "REELS" } : {}),
          ...(isReel && reelCoverUrl ? { cover_url: reelCoverUrl } : {}),
        },
      );

      if (isVideo) {
        await this.pollIGContainer(container.id, token);
      }

      const result = await this.publishIGContainerWithRetry(
        igAccountId,
        token,
        container.id,
      );
      return result.id;
    }

    // Carousel (2-10 items)
    const childIds: string[] = [];
    for (const m of media.slice(0, 10)) {
      const isVideo = m.type === MediaType.VIDEO;
      const child = await this.metaApi.createIGMediaContainer(
        igAccountId,
        token,
        {
          ...(isVideo ? { video_url: m.publicUrl } : { image_url: m.publicUrl }),
          ...(isVideo ? { media_type: "VIDEO" } : {}),
          is_carousel_item: true,
        },
      );

      if (isVideo) {
        await this.pollIGContainer(child.id, token);
      }

      childIds.push(child.id);
    }

    const carousel = await this.metaApi.createIGCarouselContainer(
      igAccountId,
      token,
      childIds,
      caption || undefined,
    );

    const result = await this.publishIGContainerWithRetry(
      igAccountId,
      token,
      carousel.id,
    );
    return result.id;
  }

  // ─── Facebook Helpers ─────────────────────────────────────────────

  private async publishToFacebook(
    pageId: string,
    pageToken: string,
    caption: string | null,
    media: { type: MediaType; publicUrl: string }[],
    contentType: ContentType = ContentType.POST,
    reelCoverUrl?: string | null,
  ): Promise<string> {
    // Facebook Reel: 3-phase upload
    if (contentType === ContentType.REEL) {
      const video = media.find((m) => m.type === MediaType.VIDEO);
      if (!video) throw new Error("Un Reel nécessite une vidéo");
      return this.publishFBReel(pageId, pageToken, video.publicUrl, caption, reelCoverUrl);
    }

    // Text-only post
    if (media.length === 0) {
      const result = await this.metaApi.publishFBPagePost(pageId, pageToken, {
        message: caption || undefined,
      });
      return result.id;
    }

    // Video post (non-reel)
    const hasVideo = media.some((m) => m.type === MediaType.VIDEO);
    if (hasVideo) {
      const video = media.find((m) => m.type === MediaType.VIDEO)!;
      const result = await this.metaApi.uploadFBPageVideo(
        pageId,
        pageToken,
        video.publicUrl,
        caption || undefined,
      );
      // Poll until video is ready
      await this.pollFBVideo(result.id, pageToken);
      return result.id;
    }

    // Single photo
    if (media.length === 1) {
      const photo = await this.metaApi.uploadFBPagePhoto(
        pageId,
        pageToken,
        media[0].publicUrl,
        false,
      );
      const result = await this.metaApi.publishFBPagePost(pageId, pageToken, {
        message: caption || undefined,
        attached_media: [{ media_fbid: photo.id }],
      });
      return result.id;
    }

    // Multiple photos
    const photoIds: { media_fbid: string }[] = [];
    for (const m of media) {
      const photo = await this.metaApi.uploadFBPagePhoto(
        pageId,
        pageToken,
        m.publicUrl,
        false,
      );
      photoIds.push({ media_fbid: photo.id });
    }

    const result = await this.metaApi.publishFBPagePost(pageId, pageToken, {
      message: caption || undefined,
      attached_media: photoIds,
    });
    return result.id;
  }

  // ─── Facebook Reel 3-phase flow ───────────────────────────────────

  private async publishFBReel(
    pageId: string,
    pageToken: string,
    videoUrl: string,
    caption: string | null,
    coverUrl?: string | null,
  ): Promise<string> {
    // Phase 1: initialize
    const { video_id, upload_url } = await this.metaApi.initializeFBReelUpload(
      pageId,
      pageToken,
    );

    // Phase 2: upload content
    await this.metaApi.uploadFBReelContent(upload_url, pageToken, videoUrl);

    // Poll until video is ready
    await this.pollFBVideo(video_id, pageToken);

    // Phase 3: finalize
    const result = await this.metaApi.finalizeFBReel(
      pageId,
      pageToken,
      video_id,
      caption || undefined,
    );

    // Set cover thumbnail if provided
    if (coverUrl) {
      try {
        await this.metaApi.setFBVideoThumbnail(video_id, pageToken, coverUrl);
      } catch (err: any) {
        this.logger.warn(`Failed to set FB reel cover: ${err.message}`);
      }
    }

    return result.id || video_id;
  }

  // ─── Polling ──────────────────────────────────────────────────────

  private async pollIGContainer(
    containerId: string,
    token: string,
    maxAttempts = 30,
  ): Promise<void> {
    for (let i = 0; i < maxAttempts; i++) {
      const status = await this.metaApi.checkIGContainerStatus(
        containerId,
        token,
      );
      this.logger.debug(`IG container ${containerId} status: ${status.status_code} (attempt ${i + 1}/${maxAttempts})`);
      if (status.status_code === "FINISHED") return;
      if (status.status_code === "ERROR") {
        throw new Error("Le traitement du média Instagram a échoué");
      }
      // Wait 10 seconds between polls (5 min total)
      await new Promise((r) => setTimeout(r, 10_000));
    }
    throw new Error("Timeout: le traitement du média Instagram est trop long");
  }

  private async publishIGContainerWithRetry(
    igAccountId: string,
    token: string,
    containerId: string,
    maxAttempts = 30,
  ): Promise<{ id: string }> {
    for (let i = 0; i < maxAttempts; i++) {
      try {
        return await this.metaApi.publishIGContainer(
          igAccountId,
          token,
          containerId,
        );
      } catch (err: any) {
        // Retry on subcode 9007 ("media not ready")
        if (err instanceof MetaApiError && err.subcode === 9007) {
          this.logger.debug(
            `IG publish retry ${i + 1}/${maxAttempts} for container ${containerId} (subcode 9007)`,
          );
          await new Promise((r) => setTimeout(r, 60_000));
          continue;
        }
        throw err;
      }
    }
    throw new Error("Timeout: la publication Instagram a échoué après plusieurs tentatives (subcode 9007)");
  }

  private async pollFBVideo(
    videoId: string,
    token: string,
    maxAttempts = 30,
  ): Promise<void> {
    for (let i = 0; i < maxAttempts; i++) {
      try {
        const data = await this.metaApi.checkFBVideoStatus(videoId, token);
        const videoStatus = data.status?.video_status;
        this.logger.debug(`FB video ${videoId} status: ${videoStatus} (attempt ${i + 1}/${maxAttempts})`);
        if (videoStatus === "ready") return;
        if (videoStatus === "error") {
          throw new Error("Le traitement de la vidéo Facebook a échoué");
        }
      } catch (err: any) {
        if (err.message?.includes("traitement de la vidéo")) throw err;
        this.logger.warn(`FB video status check failed: ${err.message}`);
      }
      // Wait 10 seconds between polls (5 min total)
      await new Promise((r) => setTimeout(r, 10_000));
    }
    throw new Error("Timeout: le traitement de la vidéo Facebook est trop long");
  }

  // ─── Logging ──────────────────────────────────────────────────────

  private async log(
    action: string,
    entityType: string,
    entityId: string,
    accountId: string | null,
    success: boolean,
    error?: string,
  ) {
    await this.prisma.publishLog.create({
      data: { action, entityType, entityId, accountId, success, error },
    });
  }
}
