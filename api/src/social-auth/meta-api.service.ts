import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

const GRAPH_BASE = "https://graph.facebook.com/v21.0";

@Injectable()
export class MetaApiService {
  private readonly logger = new Logger(MetaApiService.name);
  private readonly appId: string;
  private readonly appSecret: string;
  private readonly redirectUri: string;
  private readonly configId: string;

  constructor(private config: ConfigService) {
    this.appId = this.config.getOrThrow<string>("META_APP_ID");
    this.appSecret = this.config.getOrThrow<string>("META_APP_SECRET");
    this.redirectUri = this.config.getOrThrow<string>("META_REDIRECT_URI");
    this.configId = this.config.getOrThrow<string>("META_FLB_CONFIG_ID");
  }

  // ─── OAuth ────────────────────────────────────────────────────────

  getOAuthUrl(state?: string): string {
    const params = new URLSearchParams({
      client_id: this.appId,
      redirect_uri: this.redirectUri,
      config_id: this.configId,
      response_type: "code",
    });
    if (state) params.set("state", state);
    return `https://www.facebook.com/v21.0/dialog/oauth?${params}`;
  }

  async exchangeCodeForToken(code: string): Promise<{ access_token: string; expires_in: number }> {
    const params = new URLSearchParams({
      client_id: this.appId,
      client_secret: this.appSecret,
      redirect_uri: this.redirectUri,
      code,
    });
    const res = await fetch(`${GRAPH_BASE}/oauth/access_token?${params}`);
    return this.handleResponse(res);
  }

  async exchangeLongLivedToken(shortToken: string): Promise<{ access_token: string; expires_in: number }> {
    const params = new URLSearchParams({
      grant_type: "fb_exchange_token",
      client_id: this.appId,
      client_secret: this.appSecret,
      fb_exchange_token: shortToken,
    });
    const res = await fetch(`${GRAPH_BASE}/oauth/access_token?${params}`);
    return this.handleResponse(res);
  }

  // ─── Discovery ────────────────────────────────────────────────────

  async getUserPages(userToken: string): Promise<any[]> {
    const res = await fetch(
      `${GRAPH_BASE}/me/accounts?fields=id,name,access_token,picture{url}&access_token=${userToken}`,
    );
    const data = await this.handleResponse(res);
    return data.data || [];
  }

  async getPageInstagramAccount(
    pageId: string,
    pageToken: string,
  ): Promise<{ id: string; username: string; profile_picture_url: string } | null> {
    const res = await fetch(
      `${GRAPH_BASE}/${pageId}?fields=instagram_business_account{id,username,profile_picture_url}&access_token=${pageToken}`,
    );
    const data = await this.handleResponse(res);
    return data.instagram_business_account || null;
  }

  // ─── Instagram Publishing ─────────────────────────────────────────

  async createIGMediaContainer(
    igAccountId: string,
    token: string,
    params: {
      image_url?: string;
      video_url?: string;
      caption?: string;
      media_type?: string;
      cover_url?: string;
      is_carousel_item?: boolean;
    },
  ): Promise<{ id: string }> {
    const body: Record<string, any> = { access_token: token };
    if (params.image_url) body.image_url = params.image_url;
    if (params.video_url) body.video_url = params.video_url;
    if (params.caption) body.caption = params.caption;
    if (params.media_type) body.media_type = params.media_type;
    if (params.cover_url) body.cover_url = params.cover_url;
    if (params.is_carousel_item) body.is_carousel_item = true;

    const res = await fetch(`${GRAPH_BASE}/${igAccountId}/media`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return this.handleResponse(res);
  }

  async createIGCarouselContainer(
    igAccountId: string,
    token: string,
    childrenIds: string[],
    caption?: string,
  ): Promise<{ id: string }> {
    const body: Record<string, any> = {
      access_token: token,
      media_type: "CAROUSEL",
      children: childrenIds.join(","),
    };
    if (caption) body.caption = caption;

    const res = await fetch(`${GRAPH_BASE}/${igAccountId}/media`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return this.handleResponse(res);
  }

  async publishIGContainer(
    igAccountId: string,
    token: string,
    containerId: string,
  ): Promise<{ id: string }> {
    const res = await fetch(`${GRAPH_BASE}/${igAccountId}/media_publish`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ creation_id: containerId, access_token: token }),
    });
    return this.handleResponse(res);
  }

  async checkIGContainerStatus(
    containerId: string,
    token: string,
  ): Promise<{ status_code: string; id: string }> {
    const res = await fetch(
      `${GRAPH_BASE}/${containerId}?fields=status_code&access_token=${token}`,
    );
    return this.handleResponse(res);
  }

  // ─── Instagram Stories ────────────────────────────────────────────

  async createIGStoryContainer(
    igAccountId: string,
    token: string,
    params: { image_url?: string; video_url?: string },
  ): Promise<{ id: string }> {
    const body: Record<string, string> = {
      access_token: token,
      media_type: params.video_url ? "VIDEO" : "IMAGE",
    };
    if (params.image_url) body.image_url = params.image_url;
    if (params.video_url) body.video_url = params.video_url;

    const res = await fetch(`${GRAPH_BASE}/${igAccountId}/media`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return this.handleResponse(res);
  }

  // ─── Facebook Publishing ──────────────────────────────────────────

  async publishFBPagePost(
    pageId: string,
    pageToken: string,
    params: { message?: string; link?: string; attached_media?: { media_fbid: string }[] },
  ): Promise<{ id: string }> {
    const body: Record<string, any> = { access_token: pageToken, ...params };
    const res = await fetch(`${GRAPH_BASE}/${pageId}/feed`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return this.handleResponse(res);
  }

  async uploadFBPagePhoto(
    pageId: string,
    pageToken: string,
    imageUrl: string,
    published = false,
  ): Promise<{ id: string }> {
    const res = await fetch(`${GRAPH_BASE}/${pageId}/photos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: imageUrl,
        published,
        access_token: pageToken,
      }),
    });
    return this.handleResponse(res);
  }

  async uploadFBPageVideo(
    pageId: string,
    pageToken: string,
    videoUrl: string,
    description?: string,
  ): Promise<{ id: string }> {
    const res = await fetch(`${GRAPH_BASE}/${pageId}/videos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        file_url: videoUrl,
        description,
        access_token: pageToken,
      }),
    });
    return this.handleResponse(res);
  }

  // ─── Facebook Stories ─────────────────────────────────────────────

  async publishFBPagePhotoStory(
    pageId: string,
    pageToken: string,
    photoUrl: string,
  ): Promise<{ id: string }> {
    const res = await fetch(`${GRAPH_BASE}/${pageId}/photo_stories`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ photo_url: photoUrl, access_token: pageToken }),
    });
    return this.handleResponse(res);
  }

  async publishFBPageVideoStory(
    pageId: string,
    pageToken: string,
    videoUrl: string,
  ): Promise<{ id: string }> {
    // Phase 1: start
    const startRes = await fetch(`${GRAPH_BASE}/${pageId}/video_stories`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ upload_phase: "start", access_token: pageToken }),
    });
    const startData = await this.handleResponse(startRes);
    const videoId = startData.video_id;
    const uploadUrl = startData.upload_url;

    // Phase 2: transfer
    await fetch(uploadUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ file_url: videoUrl, access_token: pageToken }),
    });

    // Phase 3: finish
    const finishRes = await fetch(`${GRAPH_BASE}/${pageId}/video_stories`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        upload_phase: "finish",
        video_id: videoId,
        access_token: pageToken,
      }),
    });
    return this.handleResponse(finishRes);
  }

  // ─── Facebook Reels ─────────────────────────────────────────────

  async initializeFBReelUpload(
    pageId: string,
    pageToken: string,
  ): Promise<{ video_id: string; upload_url: string }> {
    const res = await fetch(`${GRAPH_BASE}/${pageId}/video_reels`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ upload_phase: "start", access_token: pageToken }),
    });
    return this.handleResponse(res);
  }

  async uploadFBReelContent(
    uploadUrl: string,
    pageToken: string,
    videoUrl: string,
  ): Promise<void> {
    const res = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        Authorization: `OAuth ${pageToken}`,
        file_url: videoUrl,
      },
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      this.logger.error(`FB Reel upload error: ${JSON.stringify(data)}`);
      throw new MetaApiError(data?.error?.message || "Reel upload failed", data?.error?.code);
    }
  }

  async finalizeFBReel(
    pageId: string,
    pageToken: string,
    videoId: string,
    description?: string,
  ): Promise<{ id: string }> {
    const body: Record<string, any> = {
      upload_phase: "finish",
      video_id: videoId,
      access_token: pageToken,
    };
    if (description) body.description = description;

    const res = await fetch(`${GRAPH_BASE}/${pageId}/video_reels`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return this.handleResponse(res);
  }

  async checkFBVideoStatus(
    videoId: string,
    token: string,
  ): Promise<{ status: { video_status: string } }> {
    const res = await fetch(
      `${GRAPH_BASE}/${videoId}?fields=status&access_token=${token}`,
    );
    return this.handleResponse(res);
  }

  async setFBVideoThumbnail(
    videoId: string,
    token: string,
    thumbnailUrl: string,
  ): Promise<void> {
    const res = await fetch(`${GRAPH_BASE}/${videoId}/thumbnails`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        source: thumbnailUrl,
        is_preferred: true,
        access_token: token,
      }),
    });
    await this.handleResponse(res);
  }

  // ─── Token Validation ─────────────────────────────────────────────

  async debugToken(inputToken: string): Promise<any> {
    const res = await fetch(
      `${GRAPH_BASE}/debug_token?input_token=${inputToken}&access_token=${this.appId}|${this.appSecret}`,
    );
    return this.handleResponse(res);
  }

  // ─── Helpers ──────────────────────────────────────────────────────

  private async handleResponse(res: Response): Promise<any> {
    const data = await res.json();
    if (!res.ok) {
      const err = data?.error;
      this.logger.error(`Meta API error: ${JSON.stringify(err)}`);
      throw new MetaApiError(
        err?.message || "Unknown Meta API error",
        err?.code,
        err?.error_subcode,
      );
    }
    return data;
  }
}

export class MetaApiError extends Error {
  constructor(
    message: string,
    public readonly code?: number,
    public readonly subcode?: number,
  ) {
    super(message);
    this.name = "MetaApiError";
  }
}
