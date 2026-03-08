import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { MailService } from "../mail/mail.service";
import * as argon2 from "argon2";

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  // ─── Users ─────────────────────────────────────────────────────────

  async listUsers(
    search?: string,
    page = 1,
    limit = 20,
    includeDeleted = false,
    includeAddresses = false,
  ) {
    const where: any = {};

    if (!includeDeleted) {
      where.deleted = false;
    }

    if (search) {
      where.OR = [
        { email: { contains: search, mode: "insensitive" } },
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
      ];
    }

    const select: any = {
      id: true,
      email: true,
      emailVerified: true,
      role: true,
      deleted: true,
      createdAt: true,
      updatedAt: true,
    };

    if (includeAddresses) {
      select.firstName = true;
      select.lastName = true;
      select.phone = true;
      select.company = true;
      select.siret = true;
      select.tvaNumber = true;
      select.addresses = {
        orderBy: { isDefault: "desc" as const },
      };
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getUser(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        addresses: { orderBy: { isDefault: "desc" } },
      },
    });

    if (!user) {
      throw new NotFoundException("Utilisateur introuvable");
    }

    const { passwordHash, ...rest } = user;
    return rest;
  }

  async createUser(data: {
    email: string;
    password: string;
    role?: string;
    emailVerified?: boolean;
    firstName?: string;
    lastName?: string;
    phone?: string;
    company?: string;
    siret?: string;
    tvaNumber?: string;
  }) {
    const existing = await this.prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existing) {
      throw new ConflictException("Email deja utilise");
    }

    const passwordHash = await argon2.hash(data.password, {
      type: argon2.argon2id,
    });

    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        role: (data.role as any) || "USER",
        emailVerified: data.emailVerified ?? false,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        company: data.company,
        siret: data.siret,
        tvaNumber: data.tvaNumber,
      },
    });

    const { passwordHash: _, ...rest } = user;
    return rest;
  }

  async updateUser(
    id: string,
    data: {
      email?: string;
      role?: string;
      emailVerified?: boolean;
      firstName?: string;
      lastName?: string;
      phone?: string;
      company?: string;
      siret?: string;
      tvaNumber?: string;
    },
  ) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException("Utilisateur introuvable");
    }

    if (data.email && data.email !== user.email) {
      const existing = await this.prisma.user.findUnique({
        where: { email: data.email },
      });
      if (existing) {
        throw new ConflictException("Email deja utilise");
      }
    }

    const updateData: any = {};
    if (data.email !== undefined) updateData.email = data.email;
    if (data.role !== undefined) updateData.role = data.role;
    if (data.emailVerified !== undefined) updateData.emailVerified = data.emailVerified;
    if (data.firstName !== undefined) updateData.firstName = data.firstName;
    if (data.lastName !== undefined) updateData.lastName = data.lastName;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.company !== undefined) updateData.company = data.company;
    if (data.siret !== undefined) updateData.siret = data.siret;
    if (data.tvaNumber !== undefined) updateData.tvaNumber = data.tvaNumber;

    const updated = await this.prisma.user.update({
      where: { id },
      data: updateData,
    });

    const { passwordHash, ...rest } = updated;
    return rest;
  }

  async softDeleteUser(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException("Utilisateur introuvable");
    }

    await this.prisma.user.update({
      where: { id },
      data: { deleted: true },
    });

    await this.prisma.refreshToken.updateMany({
      where: { userId: id },
      data: { revoked: true },
    });

    return { message: "Utilisateur desactive" };
  }

  async restoreUser(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException("Utilisateur introuvable");
    }

    await this.prisma.user.update({
      where: { id },
      data: { deleted: false },
    });

    return { message: "Utilisateur reactive" };
  }

  // ─── User Addresses ───────────────────────────────────────────────

  async createUserAddress(userId: string, data: any) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException("Utilisateur introuvable");
    }

    if (data.isDefault) {
      await this.prisma.address.updateMany({
        where: { userId, type: data.type, isDefault: true },
        data: { isDefault: false },
      });
    }

    return this.prisma.address.create({
      data: { userId, ...data },
    });
  }

  async updateUserAddress(userId: string, addressId: string, data: any) {
    const address = await this.prisma.address.findFirst({
      where: { id: addressId, userId },
    });
    if (!address) {
      throw new NotFoundException("Adresse introuvable");
    }

    if (data.isDefault) {
      const type = data.type ?? address.type;
      await this.prisma.address.updateMany({
        where: { userId, type, isDefault: true, id: { not: addressId } },
        data: { isDefault: false },
      });
    }

    return this.prisma.address.update({
      where: { id: addressId },
      data,
    });
  }

  async deleteUserAddress(userId: string, addressId: string) {
    const address = await this.prisma.address.findFirst({
      where: { id: addressId, userId },
    });
    if (!address) {
      throw new NotFoundException("Adresse introuvable");
    }

    await this.prisma.address.delete({ where: { id: addressId } });
    return { message: "Adresse supprimee" };
  }

  // ─── Stats ─────────────────────────────────────────────────────────

  async getStats() {
    const [totalUsers, verifiedUsers, adminUsers, deletedUsers] =
      await Promise.all([
        this.prisma.user.count({ where: { deleted: false } }),
        this.prisma.user.count({ where: { deleted: false, emailVerified: true } }),
        this.prisma.user.count({ where: { deleted: false, role: "ADMIN" } }),
        this.prisma.user.count({ where: { deleted: true } }),
      ]);

    return {
      totalUsers,
      verifiedUsers,
      adminUsers,
      deletedUsers,
    };
  }

  // ─── Dashboard ────────────────────────────────────────────────────

  async getDashboard() {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [totalUsers, newUsersMonth, newUsersWeek, recentAuthLogs] =
      await Promise.all([
        this.prisma.user.count({ where: { deleted: false } }),
        this.prisma.user.count({
          where: { deleted: false, createdAt: { gte: thirtyDaysAgo } },
        }),
        this.prisma.user.count({
          where: { deleted: false, createdAt: { gte: sevenDaysAgo } },
        }),
        this.prisma.authLog.findMany({
          orderBy: { createdAt: "desc" },
          take: 20,
          select: {
            id: true,
            email: true,
            action: true,
            ip: true,
            createdAt: true,
          },
        }),
      ]);

    return {
      totalUsers,
      newUsersMonth,
      newUsersWeek,
      recentAuthLogs,
    };
  }

  // ─── Shop Settings ────────────────────────────────────────────────

  async getShopSettings() {
    let settings = await this.prisma.shopSettings.findFirst({
      where: { deleted: false },
      include: { images: { orderBy: { position: "asc" } } },
      orderBy: { createdAt: "asc" },
    });

    if (!settings) {
      settings = await this.prisma.shopSettings.create({
        data: { name: "Social App" },
        include: { images: { orderBy: { position: "asc" } } },
      });
    }

    return settings;
  }

  async updateShopSettings(data: any) {
    let settings = await this.prisma.shopSettings.findFirst({
      where: { deleted: false },
      orderBy: { createdAt: "asc" },
    });

    if (!settings) {
      settings = await this.prisma.shopSettings.create({
        data: { name: "Social App" },
      });
    }

    const { images, ...settingsData } = data;

    const updated = await this.prisma.shopSettings.update({
      where: { id: settings.id },
      data: settingsData,
      include: { images: { orderBy: { position: "asc" } } },
    });

    if (images && Array.isArray(images)) {
      await this.prisma.shopImage.deleteMany({
        where: { shopSettingsId: settings.id },
      });

      if (images.length > 0) {
        await this.prisma.shopImage.createMany({
          data: images.map((url: string, index: number) => ({
            shopSettingsId: settings.id,
            url,
            position: index,
          })),
        });
      }
    }

    this.mailService.invalidateCache();

    return this.prisma.shopSettings.findUnique({
      where: { id: settings.id },
      include: { images: { orderBy: { position: "asc" } } },
    });
  }

  async testSmtp(adminEmail: string) {
    return this.mailService.sendTestEmail(adminEmail);
  }
}
