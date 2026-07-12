import { Prisma, UserRole } from "../generated/prisma/client.js";
import prisma from "../config/prisma.js";
import bcrypt from "bcryptjs";
import { ApiError } from "../utils/ApiError.js";
import type { CreateUserInput } from "../validators/user.validator.js";

export interface GetUsersQuery {
  page: number;
  limit: number;
  search?: string;
  role?: UserRole;
  isActive?: boolean;
}

export async function findUsers(query: GetUsersQuery) {
  const { page, limit, search, role, isActive } = query;
  const skip = (page - 1) * limit;

  const where: Prisma.UserWhereInput = {};

  if (search) {
    where.OR = [
      {
        firstName: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        lastName: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        email: {
          contains: search,
          mode: "insensitive",
        },
      },
    ];
  }

  if (role) {
    where.role = role;
  }

  if (typeof isActive === "boolean") {
    where.isActive = isActive;
  }

  const [users, total] = await prisma.$transaction([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        avatarUrl: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    }),

    prisma.user.count({
      where,
    }),
  ]);

  return {
    users,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function createUser(
  input: CreateUserInput,
  adminUserId: string,
) {
  const existingUser = await prisma.user.findUnique({
    where: {
      email: input.email,
    },
  });

  if (existingUser) {
    throw new ApiError(
      409,
      "A user with this email address already exists",
    );
  }

  const passwordHash = await bcrypt.hash(input.password, 12);

  const createdUser = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email,
        passwordHash,
        role: input.role,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        avatarUrl: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    await tx.activityLog.create({
      data: {
        action: "USER_CREATED",
        entityType: "USER",
        entityId: user.id,
        description: `${user.firstName} ${user.lastName} was created`,
        userId: adminUserId,
        metadata: {
          createdUserEmail: user.email,
          createdUserRole: user.role,
        },
      },
    });

    return user;
  });

  return createdUser;
}