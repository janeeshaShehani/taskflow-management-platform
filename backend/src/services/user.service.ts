import { Prisma, UserRole } from "../generated/prisma/client.js";
import prisma from "../config/prisma.js";

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