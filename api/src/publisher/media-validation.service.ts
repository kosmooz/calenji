import { Injectable } from "@nestjs/common";
import { SocialPlatform, ContentType } from "@prisma/client";

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

const IG_IMAGE_FORMATS = ["jpeg", "jpg", "png"];
const FB_IMAGE_FORMATS = ["jpeg", "jpg", "png", "bmp", "gif", "tiff", "tif"];
const IG_VIDEO_FORMATS = ["mp4"];
const FB_VIDEO_FORMATS = ["mp4", "mov"];

const IG_MAX_CAPTION = 2200;
const FB_MAX_CAPTION = 63206;
const IG_MAX_HASHTAGS = 30;
const IG_CAROUSEL_MIN = 2;
const IG_CAROUSEL_MAX = 10;

@Injectable()
export class MediaValidationService {
  validate(
    platforms: SocialPlatform[],
    contentType: ContentType,
    caption: string | null,
    mediaUrls: string[],
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    const hasIG = platforms.includes(SocialPlatform.INSTAGRAM);
    const hasFB = platforms.includes(SocialPlatform.FACEBOOK);

    // ─── Caption validation ────────────────────────────────────────
    if (caption) {
      if (hasIG && caption.length > IG_MAX_CAPTION) {
        errors.push(
          `La légende dépasse la limite Instagram (${caption.length}/${IG_MAX_CAPTION} caractères)`,
        );
      }
      if (hasFB && caption.length > FB_MAX_CAPTION) {
        errors.push(
          `La légende dépasse la limite Facebook (${caption.length}/${FB_MAX_CAPTION} caractères)`,
        );
      }

      // Hashtag count for IG
      if (hasIG) {
        const hashtags = caption.match(/#\w+/g) || [];
        if (hashtags.length > IG_MAX_HASHTAGS) {
          errors.push(
            `Trop de hashtags pour Instagram (${hashtags.length}/${IG_MAX_HASHTAGS})`,
          );
        }
      }
    }

    // ─── Media required for IG ─────────────────────────────────────
    if (hasIG && contentType === ContentType.POST && mediaUrls.length === 0) {
      errors.push("Instagram nécessite au moins un média pour les publications");
    }

    // ─── Reel = exactly 1 video ────────────────────────────────────
    if (contentType === ContentType.REEL) {
      const videoUrls = mediaUrls.filter((u) => this.isVideo(u));
      if (videoUrls.length !== 1) {
        errors.push("Un Reel doit contenir exactement une vidéo");
      }
      const imageUrls = mediaUrls.filter((u) => !this.isVideo(u));
      if (imageUrls.length > 0) {
        errors.push("Un Reel ne peut contenir que de la vidéo");
      }
    }

    // ─── Story = exactly 1 media ───────────────────────────────────
    if (contentType === ContentType.STORY) {
      if (mediaUrls.length !== 1) {
        errors.push("Une story doit contenir exactement un média");
      }
    }

    // ─── Carousel validation (IG only) ─────────────────────────────
    if (
      hasIG &&
      contentType === ContentType.POST &&
      mediaUrls.length > 1
    ) {
      if (mediaUrls.length < IG_CAROUSEL_MIN) {
        errors.push(
          `Un carrousel Instagram nécessite au minimum ${IG_CAROUSEL_MIN} médias`,
        );
      }
      if (mediaUrls.length > IG_CAROUSEL_MAX) {
        errors.push(
          `Un carrousel Instagram est limité à ${IG_CAROUSEL_MAX} médias (${mediaUrls.length} fournis)`,
        );
      }
    }

    // ─── FB: no mix video + images in multi-media post ─────────────
    if (hasFB && contentType === ContentType.POST && mediaUrls.length > 1) {
      const hasVideo = mediaUrls.some((u) => this.isVideo(u));
      const hasImage = mediaUrls.some((u) => !this.isVideo(u));
      if (hasVideo && hasImage) {
        errors.push(
          "Facebook n'autorise pas le mélange vidéo et images dans un même post",
        );
      }
    }

    // ─── Format validation per platform ────────────────────────────
    for (const url of mediaUrls) {
      const ext = this.getExtension(url);
      const isVideo = this.isVideo(url);

      if (hasIG) {
        if (isVideo && !IG_VIDEO_FORMATS.includes(ext)) {
          errors.push(
            `Format vidéo "${ext}" non supporté par Instagram (MP4 uniquement)`,
          );
        }
        if (!isVideo && !IG_IMAGE_FORMATS.includes(ext)) {
          errors.push(
            `Format image "${ext}" non supporté par Instagram (JPEG, PNG uniquement)`,
          );
        }
      }

      if (hasFB) {
        if (isVideo && !FB_VIDEO_FORMATS.includes(ext)) {
          warnings.push(
            `Format vidéo "${ext}" potentiellement non supporté par Facebook (MP4, MOV recommandés)`,
          );
        }
        if (!isVideo && !FB_IMAGE_FORMATS.includes(ext)) {
          warnings.push(
            `Format image "${ext}" potentiellement non supporté par Facebook`,
          );
        }
      }
    }

    // ─── Warnings ──────────────────────────────────────────────────
    if (hasIG && caption && caption.length > 2000 && caption.length <= IG_MAX_CAPTION) {
      warnings.push("La légende approche de la limite Instagram (2200 caractères)");
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  private getExtension(url: string): string {
    const path = url.split("?")[0];
    return (path.split(".").pop() || "").toLowerCase();
  }

  private isVideo(url: string): boolean {
    const ext = this.getExtension(url);
    return ["mp4", "webm", "mov", "avi"].includes(ext);
  }
}
