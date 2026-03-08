import { PrismaClient, Role } from "@prisma/client";
import * as argon2 from "argon2";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding social-app...");

  // ─── Admin User ──────────────────────────────────────────────────
  const passwordHash = await argon2.hash("changeme12345", {
    type: argon2.argon2id,
  });

  const admin = await prisma.user.upsert({
    where: { email: "admin@social-app.com" },
    update: {},
    create: {
      email: "admin@social-app.com",
      passwordHash,
      emailVerified: true,
      role: Role.ADMIN,
      firstName: "Admin",
      lastName: "Social",
    },
  });
  console.log("Seeded admin user:", admin.email);

  // ─── Shop Settings ──────────────────────────────────────────────
  let shop = await prisma.shopSettings.findFirst({
    where: { deleted: false },
  });

  if (!shop) {
    shop = await prisma.shopSettings.create({
      data: {
        name: "Social App",
        description: "Plateforme sociale",
        timezone: "Europe/Paris",
      },
    });
    console.log("Seeded shop settings:", shop.name);
  }

  console.log("\nSeed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
