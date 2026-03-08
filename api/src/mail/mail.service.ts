import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../prisma/prisma.service";
import * as nodemailer from "nodemailer";

interface SmtpConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
  from: string;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter | null = null;
  private cachedConfig: SmtpConfig | null = null;
  private cacheExpiry = 0;
  private fingerprint = "";

  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
  ) {}

  private get frontendUrl(): string {
    return this.config.get<string>("FRONTEND_URL", "http://localhost:3000");
  }

  private async getSmtpConfig(): Promise<SmtpConfig> {
    const now = Date.now();
    if (this.cachedConfig && now < this.cacheExpiry) {
      return this.cachedConfig;
    }

    const shop = await this.prisma.shopSettings.findFirst({
      where: { deleted: false },
      select: {
        smtpHost: true,
        smtpPort: true,
        smtpUser: true,
        smtpPass: true,
        smtpFrom: true,
      },
      orderBy: { createdAt: "asc" },
    });

    if (!shop?.smtpHost || !shop?.smtpUser || !shop?.smtpPass || !shop?.smtpFrom) {
      throw new Error(
        "Configuration SMTP incomplete. Verifiez les reglages email dans l'administration.",
      );
    }

    this.cachedConfig = {
      host: shop.smtpHost,
      port: shop.smtpPort ?? 465,
      user: shop.smtpUser,
      pass: shop.smtpPass,
      from: shop.smtpFrom,
    };
    this.cacheExpiry = now + 60_000;
    return this.cachedConfig;
  }

  private async getTransporter(): Promise<nodemailer.Transporter> {
    const cfg = await this.getSmtpConfig();
    const fp = `${cfg.host}:${cfg.port}:${cfg.user}:${cfg.pass}`;

    if (this.transporter && fp === this.fingerprint) {
      return this.transporter;
    }

    this.transporter = nodemailer.createTransport({
      host: cfg.host,
      port: cfg.port,
      secure: cfg.port === 465,
      auth: { user: cfg.user, pass: cfg.pass },
    });
    this.fingerprint = fp;
    return this.transporter;
  }

  invalidateCache(): void {
    this.cachedConfig = null;
    this.cacheExpiry = 0;
  }

  private getEmailFooter(): string {
    return `
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;border-top:2px solid #3b82f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:11px;color:#444;">
        <tr><td style="padding:10px 0 6px;">
          <span style="font-size:14px;color:#3b82f6;font-weight:bold;">Social App</span>
        </td></tr>
        <tr><td style="padding:8px 0;border-top:1px solid #eee;text-align:center;font-size:10px;color:#888;">
          &copy; ${new Date().getFullYear()} Social App — Tous droits reserves.
        </td></tr>
      </table>
    `;
  }

  async sendTestEmail(to: string): Promise<{ success: boolean; error?: string }> {
    try {
      const transporter = await this.getTransporter();
      const cfg = await this.getSmtpConfig();
      await transporter.sendMail({
        from: `"Social App" <${cfg.from}>`,
        to,
        subject: "Test SMTP - Social App",
        html: `
          <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; padding: 32px;">
            <h1 style="color: #3b82f6; font-size: 24px; margin-bottom: 16px;">Test SMTP reussi</h1>
            <p style="color: #333; font-size: 16px; line-height: 1.6;">
              Si vous recevez cet email, votre configuration SMTP fonctionne correctement.
            </p>
            ${this.getEmailFooter()}
          </div>
        `,
      });
      this.logger.log(`Test email sent to ${to}`);
      return { success: true };
    } catch (err: any) {
      this.logger.error(`Failed to send test email to ${to}: ${err.message}`);
      return { success: false, error: err.message };
    }
  }

  async sendVerificationEmail(to: string, token: string): Promise<void> {
    const verifyUrl = `${this.frontendUrl}/verify-email?token=${token}`;
    const transporter = await this.getTransporter();
    const cfg = await this.getSmtpConfig();

    try {
      await transporter.sendMail({
        from: `"Social App" <${cfg.from}>`,
        to,
        subject: "Verifiez votre adresse email - Social App",
        html: `
          <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; padding: 32px;">
            <h1 style="color: #3b82f6; font-size: 24px; margin-bottom: 16px;">Bienvenue sur Social App</h1>
            <p style="color: #333; font-size: 16px; line-height: 1.6;">
              Merci pour votre inscription ! Cliquez sur le bouton ci-dessous pour verifier votre adresse email.
            </p>
            <div style="text-align: center; margin: 32px 0;">
              <a href="${verifyUrl}"
                 style="display: inline-block; padding: 14px 32px; background-color: #3b82f6; color: #fff; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                Verifier mon email
              </a>
            </div>
            <p style="color: #666; font-size: 13px; line-height: 1.5;">
              Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :<br/>
              <a href="${verifyUrl}" style="color: #3b82f6;">${verifyUrl}</a>
            </p>
            ${this.getEmailFooter()}
          </div>
        `,
      });
      this.logger.log(`Verification email sent to ${to}`);
    } catch (err) {
      this.logger.error(`Failed to send verification email to ${to}: ${err}`);
      throw err;
    }
  }

  async sendLoginCode(to: string, code: string): Promise<void> {
    const transporter = await this.getTransporter();
    const cfg = await this.getSmtpConfig();

    try {
      await transporter.sendMail({
        from: `"Social App" <${cfg.from}>`,
        to,
        subject: "Votre code de connexion - Social App",
        html: `
          <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; padding: 32px;">
            <h1 style="color: #3b82f6; font-size: 24px; margin-bottom: 16px;">Code de connexion</h1>
            <p style="color: #333; font-size: 16px; line-height: 1.6;">
              Voici votre code de verification pour vous connecter :
            </p>
            <div style="text-align: center; margin: 32px 0;">
              <div style="display: inline-block; padding: 20px 40px; background-color: #f0f4ff; border: 2px solid #3b82f6; border-radius: 12px; letter-spacing: 8px; font-size: 32px; font-weight: bold; color: #3b82f6;">
                ${code}
              </div>
            </div>
            <p style="color: #666; font-size: 13px; line-height: 1.5;">
              Ce code expire dans 10 minutes. Si vous n'avez pas demande ce code, ignorez cet email.
            </p>
            ${this.getEmailFooter()}
          </div>
        `,
      });
      this.logger.log(`Login code sent to ${to}`);
    } catch (err) {
      this.logger.error(`Failed to send login code to ${to}: ${err}`);
      throw err;
    }
  }

  async sendPasswordResetEmail(to: string, token: string): Promise<void> {
    const resetUrl = `${this.frontendUrl}/reset-password?token=${token}&email=${encodeURIComponent(to)}`;
    const transporter = await this.getTransporter();
    const cfg = await this.getSmtpConfig();

    try {
      await transporter.sendMail({
        from: `"Social App" <${cfg.from}>`,
        to,
        subject: "Reinitialisation de votre mot de passe - Social App",
        html: `
          <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; padding: 32px;">
            <h1 style="color: #3b82f6; font-size: 24px; margin-bottom: 16px;">Reinitialisation du mot de passe</h1>
            <p style="color: #333; font-size: 16px; line-height: 1.6;">
              Vous avez demande la reinitialisation de votre mot de passe. Cliquez sur le bouton ci-dessous pour en creer un nouveau.
            </p>
            <div style="text-align: center; margin: 32px 0;">
              <a href="${resetUrl}"
                 style="display: inline-block; padding: 14px 32px; background-color: #3b82f6; color: #fff; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                Reinitialiser mon mot de passe
              </a>
            </div>
            <p style="color: #666; font-size: 13px; line-height: 1.5;">
              Ce lien expire dans 1 heure. Si vous n'avez pas demande cette reinitialisation, ignorez cet email.<br/>
              <a href="${resetUrl}" style="color: #3b82f6;">${resetUrl}</a>
            </p>
            ${this.getEmailFooter()}
          </div>
        `,
      });
      this.logger.log(`Password reset email sent to ${to}`);
    } catch (err) {
      this.logger.error(`Failed to send password reset email to ${to}: ${err}`);
      throw err;
    }
  }
}
