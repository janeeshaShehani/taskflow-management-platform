import bcrypt from "bcryptjs";
import prisma from "../config/prisma.js";
import { generateAccessToken } from "../utils/jwt.js";
import type { LoginInput } from "../validators/auth.validator.js";

const publicUserSelect = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  role: true,
  avatarUrl: true,
  isActive: true,
  lastLoginAt: true,
  createdAt: true,
} as const;

export async function loginUser(input: LoginInput) {
  const user = await prisma.user.findUnique({
    where: {
      email: input.email,
    },
  });

  if (!user) {
    throw new Error("INVALID_CREDENTIALS");
  }

  if (!user.isActive) {
    throw new Error("ACCOUNT_INACTIVE");
  }

  const passwordMatches = await bcrypt.compare(
    input.password,
    user.passwordHash,
  );

  if (!passwordMatches) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const updatedUser = await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      lastLoginAt: new Date(),
    },
    select: publicUserSelect,
  });

  const token = generateAccessToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  await prisma.activityLog.create({
    data: {
      action: "USER_LOGIN",
      entityType: "USER",
      entityId: user.id,
      description: `${user.firstName} ${user.lastName} logged into the system`,
      userId: user.id,
    },
  });

  return {
    user: updatedUser,
    token,
  };
}

export async function getCurrentUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: publicUserSelect,
  });

  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }

  if (!user.isActive) {
    throw new Error("ACCOUNT_INACTIVE");
  }

  return user;
}