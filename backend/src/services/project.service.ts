import prisma from "../config/prisma.js";
import {
    Prisma,
  UserRole,
  type ProjectStatus,
} from "../generated/prisma/client.js";
import { ApiError } from "../utils/ApiError.js";
import type { CreateProjectInput, GetProjectsQuery, UpdateProjectInput, } from "../validators/project.validator.js";

interface CreateProjectContext {
  currentUserId: string;
  currentUserRole: UserRole;
}

export async function createProject(
  input: CreateProjectInput,
  context: CreateProjectContext,
) {
  const existingProject = await prisma.project.findUnique({
    where: {
      code: input.code,
    },
  });

  if (existingProject) {
    throw new ApiError(
      409,
      "A project with this code already exists",
    );
  }

  let managerId: string;

  if (context.currentUserRole === UserRole.PROJECT_MANAGER) {
    if (
      input.managerId &&
      input.managerId !== context.currentUserId
    ) {
      throw new ApiError(
        403,
        "Project managers can only assign themselves as the project manager",
      );
    }

    managerId = context.currentUserId;
  } else {
    if (!input.managerId) {
      throw new ApiError(
        400,
        "Manager ID is required when an administrator creates a project",
      );
    }

    managerId = input.managerId;
  }

  const manager = await prisma.user.findUnique({
    where: {
      id: managerId,
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

  if (!manager) {
    throw new ApiError(404, "Selected project manager was not found");
  }

  if (!manager.isActive) {
    throw new ApiError(
      400,
      "An inactive user cannot be assigned as project manager",
    );
  }

  if (manager.role !== UserRole.PROJECT_MANAGER) {
    throw new ApiError(
      400,
      "The selected user must have the PROJECT_MANAGER role",
    );
  }

  const project = await prisma.$transaction(async (tx) => {
    const createdProject = await tx.project.create({
      data: {
        name: input.name,
        code: input.code,
        description: input.description,
        status: input.status as ProjectStatus,
        startDate: input.startDate,
        endDate: input.endDate,
        managerId,
      },
      select: {
        id: true,
        name: true,
        code: true,
        description: true,
        status: true,
        startDate: true,
        endDate: true,
        createdAt: true,
        updatedAt: true,
        manager: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
      },
    });

    await tx.projectMember.create({
      data: {
        projectId: createdProject.id,
        userId: managerId,
      },
    });

    await tx.activityLog.create({
      data: {
        action: "PROJECT_CREATED",
        entityType: "PROJECT",
        entityId: createdProject.id,
        description: `Project ${createdProject.name} was created`,
        userId: context.currentUserId,
        metadata: {
          projectCode: createdProject.code,
          managerId,
          status: createdProject.status,
        },
      },
    });

    return createdProject;
  });

  return project;
}

interface GetProjectsContext {
  currentUserId: string;
  currentUserRole: UserRole;
}

export async function findProjects(
  query: GetProjectsQuery,
  context: GetProjectsContext,
) {
  const skip = (query.page - 1) * query.limit;

  const where: Prisma.ProjectWhereInput = {};

  if (query.search) {
    where.OR = [
      {
        name: {
          contains: query.search,
          mode: "insensitive",
        },
      },
      {
        code: {
          contains: query.search,
          mode: "insensitive",
        },
      },
      {
        description: {
          contains: query.search,
          mode: "insensitive",
        },
      },
    ];
  }

  if (query.status) {
    where.status = query.status;
  }

  if (context.currentUserRole === UserRole.PROJECT_MANAGER) {
    where.managerId = context.currentUserId;
  }

  if (context.currentUserRole === UserRole.TEAM_MEMBER) {
    where.members = {
      some: {
        userId: context.currentUserId,
      },
    };
  }

  const [projects, total] = await prisma.$transaction([
    prisma.project.findMany({
      where,
      skip,
      take: query.limit,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        name: true,
        code: true,
        description: true,
        status: true,
        startDate: true,
        endDate: true,
        createdAt: true,
        updatedAt: true,

        manager: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },

        _count: {
          select: {
            members: true,
            tasks: true,
          },
        },
      },
    }),

    prisma.project.count({
      where,
    }),
  ]);

  return {
    projects,
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit),
    },
  };
}

export async function findProjectById(
  projectId: string,
  context: GetProjectsContext,
) {
  const project = await prisma.project.findUnique({
    where: {
      id: projectId,
    },
    select: {
      id: true,
      name: true,
      code: true,
      description: true,
      status: true,
      startDate: true,
      endDate: true,
      createdAt: true,
      updatedAt: true,

      manager: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          isActive: true,
        },
      },

      members: {
        orderBy: {
          joinedAt: "asc",
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
              avatarUrl: true,
              isActive: true,
            },
          },
        },
      },

      tasks: {
        select: {
          id: true,
          status: true,
        },
      },

      _count: {
        select: {
          members: true,
          tasks: true,
        },
      },
    },
  });

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  if (
    context.currentUserRole === UserRole.PROJECT_MANAGER &&
    project.manager.id !== context.currentUserId
  ) {
    throw new ApiError(
      403,
      "You do not have permission to view this project",
    );
  }

  if (context.currentUserRole === UserRole.TEAM_MEMBER) {
    const isMember = project.members.some(
      (membership) =>
        membership.user.id === context.currentUserId,
    );

    if (!isMember) {
      throw new ApiError(
        403,
        "You do not have permission to view this project",
      );
    }
  }

  const taskSummary = {
    total: project.tasks.length,
    todo: project.tasks.filter(
      (task) => task.status === "TODO",
    ).length,
    inProgress: project.tasks.filter(
      (task) => task.status === "IN_PROGRESS",
    ).length,
    inReview: project.tasks.filter(
      (task) => task.status === "IN_REVIEW",
    ).length,
    completed: project.tasks.filter(
      (task) => task.status === "COMPLETED",
    ).length,
    blocked: project.tasks.filter(
      (task) => task.status === "BLOCKED",
    ).length,
  };

  const completionPercentage =
    taskSummary.total === 0
      ? 0
      : Math.round(
          (taskSummary.completed / taskSummary.total) * 100,
        );

  return {
    ...project,
    tasks: undefined,
    taskSummary,
    completionPercentage,
  };
}

export async function updateProject(
  projectId: string,
  input: UpdateProjectInput,
  context: GetProjectsContext,
) {
  const existingProject = await prisma.project.findUnique({
    where: {
      id: projectId,
    },
  });

  if (!existingProject) {
    throw new ApiError(404, "Project not found");
  }

  if (
    context.currentUserRole === UserRole.PROJECT_MANAGER &&
    existingProject.managerId !== context.currentUserId
  ) {
    throw new ApiError(
      403,
      "You can only update projects that you manage",
    );
  }

  if (context.currentUserRole === UserRole.TEAM_MEMBER) {
    throw new ApiError(
      403,
      "Team members cannot update projects",
    );
  }

  if (
    input.code &&
    input.code !== existingProject.code
  ) {
    const duplicateProject = await prisma.project.findUnique({
      where: {
        code: input.code,
      },
    });

    if (duplicateProject) {
      throw new ApiError(
        409,
        "A project with this code already exists",
      );
    }
  }

  let managerId = existingProject.managerId;

  if (input.managerId) {
    if (context.currentUserRole !== UserRole.ADMIN) {
      throw new ApiError(
        403,
        "Only administrators can change the project manager",
      );
    }

    const manager = await prisma.user.findUnique({
      where: {
        id: input.managerId,
      },
      select: {
        id: true,
        role: true,
        isActive: true,
      },
    });

    if (!manager) {
      throw new ApiError(
        404,
        "Selected project manager was not found",
      );
    }

    if (!manager.isActive) {
      throw new ApiError(
        400,
        "An inactive user cannot be assigned as project manager",
      );
    }

    if (manager.role !== UserRole.PROJECT_MANAGER) {
      throw new ApiError(
        400,
        "The selected user must have the PROJECT_MANAGER role",
      );
    }

    managerId = manager.id;
  }

  const startDate = input.startDate ?? existingProject.startDate;
  const endDate =
    input.endDate === undefined
      ? existingProject.endDate
      : input.endDate;

  if (endDate && endDate < startDate) {
    throw new ApiError(
      400,
      "End date must be after or equal to the start date",
    );
  }

  const updatedProject = await prisma.$transaction(async (tx) => {
    const project = await tx.project.update({
      where: {
        id: projectId,
      },
      data: {
        name: input.name,
        code: input.code,
        description: input.description,
        status: input.status,
        startDate: input.startDate,
        endDate: input.endDate,
        managerId,
      },
      select: {
        id: true,
        name: true,
        code: true,
        description: true,
        status: true,
        startDate: true,
        endDate: true,
        createdAt: true,
        updatedAt: true,
        manager: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (
      input.managerId &&
      input.managerId !== existingProject.managerId
    ) {
      await tx.projectMember.upsert({
        where: {
          projectId_userId: {
            projectId,
            userId: input.managerId,
          },
        },
        update: {},
        create: {
          projectId,
          userId: input.managerId,
        },
      });
    }

    await tx.activityLog.create({
      data: {
        action: "PROJECT_UPDATED",
        entityType: "PROJECT",
        entityId: project.id,
        description: `Project ${project.name} was updated`,
        userId: context.currentUserId,
        metadata: {
          updatedFields: Object.keys(input),
          projectCode: project.code,
          managerId: project.manager.id,
        },
      },
    });

    return project;
  });

  return updatedProject;
}