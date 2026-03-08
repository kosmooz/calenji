import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CryptoService } from "../crypto/crypto.service";
import { MetaApiService, MetaApiError } from "./meta-api.service";
import { SocialPlatform } from "@prisma/client";

@Injectable()
export class SocialAuthService {
  private readonly logger = new Logger(SocialAuthService.name);

  constructor(
    private prisma: PrismaService,
    private crypto: CryptoService,
    private metaApi: MetaApiService,
  ) {}

  getConnectUrl(): { url: string } {
    return { url: this.metaApi.getOAuthUrl() };
  }

  async connectAccounts(userId: string, code: string) {
    // 1. Exchange code for short-lived token
    const shortRes = await this.metaApi.exchangeCodeForToken(code);
    // 2. Exchange for long-lived token (60 days)
    const longRes = await this.metaApi.exchangeLongLivedToken(shortRes.access_token);
    const userToken = longRes.access_token;
    // expires_in may be missing for tokens that never expire (system user tokens)
    const userTokenExp = longRes.expires_in
      ? new Date(Date.now() + longRes.expires_in * 1000)
      : new Date(Date.now() + 60 * 24 * 60 * 60 * 1000); // default 60 days

    // Encrypt user token
    const userTokenEnc = this.crypto.encrypt(userToken);

    // 3. Get user's pages
    const pages = await this.metaApi.getUserPages(userToken);
    const accounts: any[] = [];

    for (const page of pages) {
      const pageToken = page.access_token;
      const pageTokenEnc = this.crypto.encrypt(pageToken);

      // Create/update Facebook Page account
      const fbAccount = await this.prisma.socialAccount.upsert({
        where: {
          userId_platform_platformAccountId: {
            userId,
            platform: SocialPlatform.FACEBOOK,
            platformAccountId: page.id,
          },
        },
        create: {
          userId,
          platform: SocialPlatform.FACEBOOK,
          platformAccountId: page.id,
          accountName: page.name,
          accountAvatar: page.picture?.data?.url || null,
          facebookPageId: page.id,
          accessTokenEnc: pageTokenEnc.encrypted,
          accessTokenIv: pageTokenEnc.iv,
          accessTokenTag: pageTokenEnc.tag,
          metaUserTokenEnc: userTokenEnc.encrypted,
          metaUserTokenIv: userTokenEnc.iv,
          metaUserTokenTag: userTokenEnc.tag,
          metaUserTokenExp: userTokenExp,
          isActive: true,
        },
        update: {
          accountName: page.name,
          accountAvatar: page.picture?.data?.url || null,
          accessTokenEnc: pageTokenEnc.encrypted,
          accessTokenIv: pageTokenEnc.iv,
          accessTokenTag: pageTokenEnc.tag,
          metaUserTokenEnc: userTokenEnc.encrypted,
          metaUserTokenIv: userTokenEnc.iv,
          metaUserTokenTag: userTokenEnc.tag,
          metaUserTokenExp: userTokenExp,
          isActive: true,
        },
      });
      accounts.push(fbAccount);

      // 4. Check for Instagram Business account
      const igAccount = await this.metaApi.getPageInstagramAccount(page.id, pageToken);
      if (igAccount) {
        const igAcc = await this.prisma.socialAccount.upsert({
          where: {
            userId_platform_platformAccountId: {
              userId,
              platform: SocialPlatform.INSTAGRAM,
              platformAccountId: igAccount.id,
            },
          },
          create: {
            userId,
            platform: SocialPlatform.INSTAGRAM,
            platformAccountId: igAccount.id,
            accountName: igAccount.username,
            accountAvatar: igAccount.profile_picture_url || null,
            facebookPageId: page.id,
            accessTokenEnc: pageTokenEnc.encrypted,
            accessTokenIv: pageTokenEnc.iv,
            accessTokenTag: pageTokenEnc.tag,
            metaUserTokenEnc: userTokenEnc.encrypted,
            metaUserTokenIv: userTokenEnc.iv,
            metaUserTokenTag: userTokenEnc.tag,
            metaUserTokenExp: userTokenExp,
            isActive: true,
          },
          update: {
            accountName: igAccount.username,
            accountAvatar: igAccount.profile_picture_url || null,
            accessTokenEnc: pageTokenEnc.encrypted,
            accessTokenIv: pageTokenEnc.iv,
            accessTokenTag: pageTokenEnc.tag,
            metaUserTokenEnc: userTokenEnc.encrypted,
            metaUserTokenIv: userTokenEnc.iv,
            metaUserTokenTag: userTokenEnc.tag,
            metaUserTokenExp: userTokenExp,
            isActive: true,
          },
        });
        accounts.push(igAcc);
      }
    }

    return { accounts };
  }

  async getAccounts(userId: string) {
    return this.prisma.socialAccount.findMany({
      where: { userId },
      select: {
        id: true,
        platform: true,
        platformAccountId: true,
        accountName: true,
        accountAvatar: true,
        facebookPageId: true,
        isActive: true,
        metaUserTokenExp: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "asc" },
    });
  }

  async disconnectAccount(userId: string, accountId: string) {
    const account = await this.prisma.socialAccount.findFirst({
      where: { id: accountId, userId },
    });
    if (!account) throw new NotFoundException("Compte non trouvé");

    await this.prisma.socialAccount.update({
      where: { id: accountId },
      data: { isActive: false },
    });
    return { success: true };
  }

  async reconnectAccount(userId: string, accountId: string) {
    const account = await this.prisma.socialAccount.findFirst({
      where: { id: accountId, userId },
    });
    if (!account) throw new NotFoundException("Compte non trouvé");
    // The user needs to re-do the OAuth flow — return the connect URL
    return this.getConnectUrl();
  }

  async getAccountStatus(userId: string, accountId: string) {
    const account = await this.prisma.socialAccount.findFirst({
      where: { id: accountId, userId },
    });
    if (!account) throw new NotFoundException("Compte non trouvé");

    const tokenValid =
      account.isActive &&
      account.metaUserTokenExp &&
      account.metaUserTokenExp > new Date();

    let expiresSoon = false;
    if (account.metaUserTokenExp) {
      const sevenDays = 7 * 24 * 60 * 60 * 1000;
      expiresSoon =
        account.metaUserTokenExp.getTime() - Date.now() < sevenDays;
    }

    return {
      isActive: account.isActive,
      tokenValid,
      expiresSoon,
      expiresAt: account.metaUserTokenExp,
    };
  }

  // Used by publisher to get decrypted token
  async getDecryptedToken(accountId: string): Promise<string> {
    const account = await this.prisma.socialAccount.findUnique({
      where: { id: accountId },
    });
    if (!account) throw new NotFoundException("Compte non trouvé");
    if (!account.isActive)
      throw new ForbiddenException("Compte désactivé");

    return this.crypto.decrypt(
      account.accessTokenEnc,
      account.accessTokenIv,
      account.accessTokenTag,
    );
  }

  async getDecryptedUserToken(accountId: string): Promise<string | null> {
    const account = await this.prisma.socialAccount.findUnique({
      where: { id: accountId },
    });
    if (!account?.metaUserTokenEnc) return null;

    return this.crypto.decrypt(
      account.metaUserTokenEnc,
      account.metaUserTokenIv!,
      account.metaUserTokenTag!,
    );
  }
}
