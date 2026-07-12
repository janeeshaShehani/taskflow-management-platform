import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  PrismaClient,
  UserRole,
} from "../src/generated/prisma/client.js";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not defined");
}

const adapter = new PrismaPg({
  connectionString: databaseUrl,
});

const prisma = new PrismaClient({
  adapter,
});

async function main(): Promise<void> {
  console.log("Starting database seed...");

  const adminPassword = await bcrypt.hash("Admin@123", 12);
  const managerPassword = await bcrypt.hash("Manager@123", 12);
  const memberPassword = await bcrypt.hash("Member@123", 12);

  await prisma.user.upsert({
    where: {
      email: "admin@taskflow.com",
    },
    update: {
      firstName: "System",
      lastName: "Administrator",
      role: UserRole.ADMIN,
      isActive: true,
      passwordHash: adminPassword,
    },
    create: {
      firstName: "System",
      lastName: "Administrator",
      email: "admin@taskflow.com",
      passwordHash: adminPassword,
      role: UserRole.ADMIN,
      isActive: true,
    },
  });

  await prisma.user.upsert({
    where: {
      email: "manager@taskflow.com",
    },
    update: {
      firstName: "Project",
      lastName: "Manager",
      role: UserRole.PROJECT_MANAGER,
      isActive: true,
      passwordHash: managerPassword,
    },
    create: {
      firstName: "Project",
      lastName: "Manager",
      email: "manager@taskflow.com",
      passwordHash: managerPassword,
      role: UserRole.PROJECT_MANAGER,
      isActive: true,
    },
  });

  await prisma.user.upsert({
    where: {
      email: "member@taskflow.com",
    },
    update: {
      firstName: "Team",
      lastName: "Member",
      role: UserRole.TEAM_MEMBER,
      isActive: true,
      passwordHash: memberPassword,
    },
    create: {
      firstName: "Team",
      lastName: "Member",
      email: "member@taskflow.com",
      passwordHash: memberPassword,
      role: UserRole.TEAM_MEMBER,
      isActive: true,
    },
  });

  console.log("Database seed completed successfully.");
}

main()
  .catch((error) => {
    console.error("Database seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });