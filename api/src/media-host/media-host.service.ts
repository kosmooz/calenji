import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { readFileSync } from "fs";
import { join, basename } from "path";
import { lookup } from "mime-types";

@Injectable()
export class MediaHostService {
  private readonly logger = new Logger(MediaHostService.name);
  private readonly wpApiUrl: string;
  private readonly wpAuthToken: string;
  private readonly publicUrl: string;
  private readonly cache = new Map<string, string>();

  constructor(private config: ConfigService) {
    this.wpApiUrl = this.config.get<string>("WORDPRESS_API_URL") || "";
    this.wpAuthToken = this.config.get<string>("WORDPRESS_AUTH_TOKEN") || "";
    this.publicUrl = this.config.get<string>("PUBLIC_URL") || "http://localhost:3004";
  }

  async getPublicUrl(localUrl: string): Promise<string> {
    // Check cache
    if (this.cache.has(localUrl)) {
      return this.cache.get(localUrl)!;
    }

    // If WordPress is configured, upload there
    if (this.wpApiUrl && this.wpAuthToken) {
      try {
        const url = await this.uploadToWordPress(localUrl);
        this.cache.set(localUrl, url);
        return url;
      } catch (err) {
        this.logger.error(`WordPress upload failed: ${err}`);
      }
    }

    // Fallback: use public URL prefix (works if server is publicly accessible)
    const publicUrl = `${this.publicUrl}${localUrl}`;
    this.cache.set(localUrl, publicUrl);
    return publicUrl;
  }

  private async uploadToWordPress(localUrl: string): Promise<string> {
    // localUrl is like /api/uploads/xxxx.jpg — resolve to filesystem
    const relativePath = localUrl.replace(/^\/api\/uploads\//, "");
    const filePath = join(process.cwd(), "uploads", relativePath);
    const fileName = basename(filePath);
    const mimeType = lookup(filePath) || "application/octet-stream";

    const fileBuffer = readFileSync(filePath);

    const res = await fetch(`${this.wpApiUrl}/wp-json/wp/v2/media`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(this.wpAuthToken).toString("base64")}`,
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Type": mimeType,
      },
      body: fileBuffer,
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`WordPress upload error: ${res.status} ${err}`);
    }

    const data = await res.json();
    return data.source_url;
  }
}
