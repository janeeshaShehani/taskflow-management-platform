import prisma from "../config/prisma.js";
import { UserRole } from "../generated/prisma/client.js";
import { ApiError } from "../utils/ApiError.js";
import type { AssignMemberInput } from "../validators/project-member.validator.js";

interface AssignMemberContext {
  currentUserId: string;
  currentUserRole: UserRole;
}

export async function assignProjectMember(
  projectId: string,
  input: AssignMemberInput,
  context: AssignMemberContext,
) {
  const project = await prisma.project.findUnique({
    where: {
      id: projectId,
    },
    select: {
      id: true,
      name: true,
      managerId: true,
    },
  });

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  if (
    context.currentUserRole === UserRole.PROJECT_MANAGER &&
    project.managerId !== context.currentUserId
  ) {
    throw new ApiError(
      403,
      "You can only assign members to projects that you manage",
    );
  }

  const user = await prisma.user.findUnique({
    where: {
      id: input.userId,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      isActive: true,
    },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (!user.isActive) {
    throw new ApiError(
      400,
      "An inactive user cannot be assigned to a project",
    );
  }

  if (user.role !== UserRole.TEAM_MEMBER) {
    throw new ApiError(
      400,
      "Only users with the TEAM_MEMBER role can be assigned",
    );
  }

  const existingMembership = await prisma.projectMember.findUnique({
    where: {
      projectId_userId: {
        projectId,
        userId: input.userId,
      },
    },
  });

  if (existingMembership) {
    throw new ApiError(
      409,
      "This user is already a member of the project",
    );
  }

  const membership = await prisma.$transaction(async (tx) => {
    const createdMembership = await tx.projectMember.create({
      data: {
        projectId,
        userId: input.userId,
      },
      select: {
        id: true,
        joinedAt: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
            isActive: true,
          },
        },
      },
    });

    await tx.activityLog.create({
      data: {
        action: "PROJECT_MEMBER_ASSIGNED",
        entityType: "PROJECT_MEMBER",
        entityId: createdMembership.id,
        description: `${user.firstName} ${user.lastName} was assigned to project ${project.name}`,
        userId: context.currentUserId,
        metadata: {
          projectId,
          assignedUserId: user.id,
          assignedUserEmail: user.email,
        },
      },
    });

    return createdMembership;
  });

  return membership;
}