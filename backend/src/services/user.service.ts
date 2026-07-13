import { Prisma, UserRole } from "../generated/prisma/client.js";
import prisma from "../config/prisma.js";
import bcrypt from "bcryptjs";
import { ApiError } from "../utils/ApiError.js";
import type { CreateUserInput,  UpdateUserInput, UpdateUserStatusInput } from "../validators/user.validator.js";

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

export async function findUserById(userId: string) {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
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

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return user;
}

export async function updateUser(
  userId: string,
  input: UpdateUserInput,
  adminUserId: string,
) {
  const existingUser = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!existingUser) {
    throw new ApiError(404, "User not found");
  }

  if (input.email && input.email !== existingUser.email) {
    const duplicateUser = await prisma.user.findUnique({
      where: {
        email: input.email,
      },
    });

    if (duplicateUser) {
      throw new ApiError(
        409,
        "A user with this email address already exists",
      );
    }
  }

  const updatedUser = await prisma.$transaction(async (tx) => {
    const user = await tx.user.update({
      where: {
        id: userId,
      },
      data: {
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email,
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
        action: "USER_UPDATED",
        entityType: "USER",
        entityId: user.id,
        description: `${user.firstName} ${user.lastName} was updated`,
        userId: adminUserId,
        metadata: {
          updatedFields: Object.keys(input),
          updatedUserEmail: user.email,
          updatedUserRole: user.role,
        },
      },
    });

    return user;
  });

  return updatedUser;
}

export async function updateUserStatus(
  userId: string,
  input: UpdateUserStatusInput,
  adminUserId: string,
) {
  const existingUser = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!existingUser) {
    throw new ApiError(404, "User not found");
  }

  // Prevent admin from deactivating themselves
  if (
    existingUser.id === adminUserId &&
    input.isActive === false
  ) {
    throw new ApiError(
      400,
      "You cannot deactivate your own account",
    );
  }

  // Prevent deactivating the last active admin
  if (
    existingUser.role === UserRole.ADMIN &&
    input.isActive === false
  ) {
    const activeAdminCount = await prisma.user.count({
      where: {
        role: UserRole.ADMIN,
        isActive: true,
      },
    });

    if (activeAdminCount <= 1) {
      throw new ApiError(
        400,
        "The last active administrator cannot be deactivated",
      );
    }
  }

  const updatedUser = await prisma.$transaction(async (tx) => {
    const user = await tx.user.update({
      where: { id: userId },
      data: {
        isActive: input.isActive,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        isActive: true,
        updatedAt: true,
      },
    });

    await tx.activityLog.create({
      data: {
        action: "USER_STATUS_UPDATED",
        entityType: "USER",
        entityId: user.id,
        description: `${user.firstName} ${user.lastName} status changed`,
        userId: adminUserId,
        metadata: {
          isActive: user.isActive,
        },
      },
    });

    return user;
  });

  return updatedUser;
}

export async function deleteUser(
  userId: string,
  adminUserId: string,
) {
  const existingUser = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      managedProjects: {
        select: {
          id: true,
        },
        take: 1,
      },
      createdTasks: {
        select: {
          id: true,
        },
        take: 1,
      },
    },
  });

  if (!existingUser) {
    throw new ApiError(404, "User not found");
  }

  if (existingUser.id === adminUserId) {
    throw new ApiError(
      400,
      "You cannot delete your own account",
    );
  }

  if (existingUser.role === UserRole.ADMIN) {
    const adminCount = await prisma.user.count({
      where: {
        role: UserRole.ADMIN,
      },
    });

    if (adminCount <= 1) {
      throw new ApiError(
        400,
        "The last administrator cannot be deleted",
      );
    }
  }

  if (existingUser.managedProjects.length > 0) {
    throw new ApiError(
      409,
      "This user manages one or more projects. Assign another manager before deleting the user",
    );
  }

  if (existingUser.createdTasks.length > 0) {
    throw new ApiError(
      409,
      "This user created one or more tasks and cannot be deleted",
    );
  }

  await prisma.$transaction(async (tx) => {
    await tx.activityLog.create({
      data: {
        action: "USER_DELETED",
        entityType: "USER",
        entityId: existingUser.id,
        description: `${existingUser.firstName} ${existingUser.lastName} was deleted`,
        userId: adminUserId,
        metadata: {
          deletedUserEmail: existingUser.email,
          deletedUserRole: existingUser.role,
        },
      },
    });

    await tx.user.delete({
      where: {
        id: userId,
      },
    });
  });
}