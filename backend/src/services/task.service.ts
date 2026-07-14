import prisma from "../config/prisma.js";
import {
  Prisma,
  TaskStatus,
  UserRole,
  type TaskPriority,
} from "../generated/prisma/client.js";
import { ApiError } from "../utils/ApiError.js";
import type {
  CreateTaskInput,
  GetTasksQuery,
  UpdateTaskInput,
  UpdateTaskStatusInput,
} from "../validators/task.validator.js";

interface TaskContext {
  currentUserId: string;
  currentUserRole: UserRole;
}

const taskSelect = {
  id: true,
  title: true,
  description: true,
  status: true,
  priority: true,
  dueDate: true,
  completedAt: true,
  createdAt: true,
  updatedAt: true,

  project: {
    select: {
      id: true,
      name: true,
      code: true,
      status: true,
      managerId: true,
    },
  },

  assignee: {
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

  createdBy: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
    },
  },

  _count: {
    select: {
      comments: true,
    },
  },
} satisfies Prisma.TaskSelect;

async function validateAssignee(
  projectId: string,
  assigneeId: string,
) {
  const membership =
    await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId: assigneeId,
        },
      },
      select: {
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

  if (!membership) {
    throw new ApiError(
      400,
      "The selected assignee is not a member of this project",
    );
  }

  if (!membership.user.isActive) {
    throw new ApiError(
      400,
      "An inactive user cannot be assigned to a task",
    );
  }

  return membership.user;
}

async function getTaskForManagement(
  taskId: string,
  context: TaskContext,
) {
  const task = await prisma.task.findUnique({
    where: {
      id: taskId,
    },
    select: {
      id: true,
      title: true,
      status: true,
      assigneeId: true,
      projectId: true,
      project: {
        select: {
          id: true,
          name: true,
          managerId: true,
          endDate: true,
        },
      },
    },
  });

  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  if (
    context.currentUserRole ===
      UserRole.PROJECT_MANAGER &&
    task.project.managerId !== context.currentUserId
  ) {
    throw new ApiError(
      403,
      "You can only manage tasks in projects that you manage",
    );
  }

  return task;
}

// ======================================================
// CREATE TASK
// ======================================================

export async function createTask(
  input: CreateTaskInput,
  context: TaskContext,
) {
  const project = await prisma.project.findUnique({
    where: {
      id: input.projectId,
    },
    select: {
      id: true,
      name: true,
      managerId: true,
      endDate: true,
    },
  });

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  if (
    context.currentUserRole ===
      UserRole.PROJECT_MANAGER &&
    project.managerId !== context.currentUserId
  ) {
    throw new ApiError(
      403,
      "You can only create tasks for projects that you manage",
    );
  }

  if (
    context.currentUserRole === UserRole.TEAM_MEMBER
  ) {
    throw new ApiError(
      403,
      "Team members cannot create tasks",
    );
  }

  if (
    input.dueDate &&
    project.endDate &&
    input.dueDate > project.endDate
  ) {
    throw new ApiError(
      400,
      "Task due date cannot be later than the project end date",
    );
  }

  if (input.assigneeId) {
    await validateAssignee(
      input.projectId,
      input.assigneeId,
    );
  }

  return prisma.$transaction(async (tx) => {
    const task = await tx.task.create({
      data: {
        title: input.title,
        description: input.description,
        status: input.status,
        priority: input.priority,
        dueDate: input.dueDate,
        projectId: input.projectId,
        assigneeId: input.assigneeId,
        createdById: context.currentUserId,
        completedAt:
          input.status === TaskStatus.COMPLETED
            ? new Date()
            : null,
      },
      select: taskSelect,
    });

    await tx.activityLog.create({
      data: {
        action: "TASK_CREATED",
        entityType: "TASK",
        entityId: task.id,
        description: `Task ${task.title} was created in project ${project.name}`,
        userId: context.currentUserId,
        metadata: {
          projectId: input.projectId,
          assigneeId: input.assigneeId ?? null,
          priority: task.priority,
          status: task.status,
        },
      },
    });

    if (input.assigneeId) {
      await tx.notification.create({
        data: {
          title: "New task assigned",
          message: `You were assigned the task "${task.title}"`,
          userId: input.assigneeId,
          taskId: task.id,
        },
      });
    }

    return task;
  });
}

// ======================================================
// GET ALL TASKS
// ======================================================

export async function findTasks(
  query: GetTasksQuery,
  context: TaskContext,
) {
  const skip = (query.page - 1) * query.limit;

  const where: Prisma.TaskWhereInput = {};

  if (query.search) {
    where.OR = [
      {
        title: {
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

  if (query.priority) {
    where.priority = query.priority;
  }

  if (query.projectId) {
    where.projectId = query.projectId;
  }

  if (query.assigneeId) {
    where.assigneeId = query.assigneeId;
  }

  if (query.overdue === true) {
    where.dueDate = {
      lt: new Date(),
    };

    where.status = {
      not: TaskStatus.COMPLETED,
    };
  }

  if (
    context.currentUserRole ===
    UserRole.PROJECT_MANAGER
  ) {
    where.project = {
      managerId: context.currentUserId,
    };
  }

  if (
    context.currentUserRole === UserRole.TEAM_MEMBER
  ) {
    where.assigneeId = context.currentUserId;
  }

  const [tasks, total] = await prisma.$transaction([
    prisma.task.findMany({
      where,
      skip,
      take: query.limit,
      orderBy: [
        {
          dueDate: "asc",
        },
        {
          createdAt: "desc",
        },
      ],
      select: taskSelect,
    }),

    prisma.task.count({
      where,
    }),
  ]);

  return {
    tasks,
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit),
    },
  };
}

// ======================================================
// GET TASK BY ID
// ======================================================

export async function findTaskById(
  taskId: string,
  context: TaskContext,
) {
  const task = await prisma.task.findUnique({
    where: {
      id: taskId,
    },
    select: {
      ...taskSelect,

      comments: {
        orderBy: {
          createdAt: "asc",
        },
        select: {
          id: true,
          content: true,
          createdAt: true,
          updatedAt: true,
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatarUrl: true,
            },
          },
        },
      },
    },
  });

  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  if (
    context.currentUserRole ===
      UserRole.PROJECT_MANAGER &&
    task.project.managerId !== context.currentUserId
  ) {
    throw new ApiError(
      403,
      "You do not have permission to view this task",
    );
  }

  if (
    context.currentUserRole === UserRole.TEAM_MEMBER &&
    task.assignee?.id !== context.currentUserId
  ) {
    throw new ApiError(
      403,
      "You can only view tasks assigned to you",
    );
  }

  return task;
}

// ======================================================
// UPDATE TASK DETAILS
// ======================================================

export async function updateTask(
  taskId: string,
  input: UpdateTaskInput,
  context: TaskContext,
) {
  const existingTask = await getTaskForManagement(
    taskId,
    context,
  );

  if (
    context.currentUserRole === UserRole.TEAM_MEMBER
  ) {
    throw new ApiError(
      403,
      "Team members cannot update task details",
    );
  }

  if (
    input.dueDate &&
    existingTask.project.endDate &&
    input.dueDate > existingTask.project.endDate
  ) {
    throw new ApiError(
      400,
      "Task due date cannot be later than the project end date",
    );
  }

  if (input.assigneeId) {
    await validateAssignee(
      existingTask.projectId,
      input.assigneeId,
    );
  }

  const assigneeChanged =
    input.assigneeId !== undefined &&
    input.assigneeId !== existingTask.assigneeId;

  return prisma.$transaction(async (tx) => {
    const task = await tx.task.update({
      where: {
        id: taskId,
      },
      data: {
        title: input.title,
        description: input.description,
        priority:
          input.priority as TaskPriority | undefined,
        dueDate: input.dueDate,
        assigneeId: input.assigneeId,
      },
      select: taskSelect,
    });

    await tx.activityLog.create({
      data: {
        action: "TASK_UPDATED",
        entityType: "TASK",
        entityId: task.id,
        description: `Task ${task.title} was updated`,
        userId: context.currentUserId,
        metadata: {
          updatedFields: Object.keys(input),
          projectId: existingTask.projectId,
          assigneeId: task.assignee?.id ?? null,
        },
      },
    });

    if (
      assigneeChanged &&
      input.assigneeId
    ) {
      await tx.notification.create({
        data: {
          title: "Task assigned",
          message: `You were assigned the task "${task.title}"`,
          userId: input.assigneeId,
          taskId: task.id,
        },
      });
    }

    return task;
  });
}

// ======================================================
// UPDATE TASK STATUS
// ======================================================

export async function updateTaskStatus(
  taskId: string,
  input: UpdateTaskStatusInput,
  context: TaskContext,
) {
  const existingTask = await getTaskForManagement(
    taskId,
    context,
  );

  if (
    context.currentUserRole === UserRole.TEAM_MEMBER &&
    existingTask.assigneeId !== context.currentUserId
  ) {
    throw new ApiError(
      403,
      "You can only update the status of tasks assigned to you",
    );
  }

  return prisma.$transaction(async (tx) => {
    const task = await tx.task.update({
      where: {
        id: taskId,
      },
      data: {
        status: input.status,
        completedAt:
          input.status === TaskStatus.COMPLETED
            ? new Date()
            : null,
      },
      select: taskSelect,
    });

    await tx.activityLog.create({
      data: {
        action: "TASK_STATUS_UPDATED",
        entityType: "TASK",
        entityId: task.id,
        description: `Task ${task.title} status changed to ${task.status}`,
        userId: context.currentUserId,
        metadata: {
          previousStatus: existingTask.status,
          newStatus: task.status,
          projectId: existingTask.projectId,
        },
      },
    });

    return task;
  });
}

// ======================================================
// DELETE TASK
// ======================================================

export async function deleteTask(
  taskId: string,
  context: TaskContext,
) {
  const existingTask = await getTaskForManagement(
    taskId,
    context,
  );

  if (
    context.currentUserRole === UserRole.TEAM_MEMBER
  ) {
    throw new ApiError(
      403,
      "Team members cannot delete tasks",
    );
  }

  await prisma.$transaction(async (tx) => {
    await tx.activityLog.create({
      data: {
        action: "TASK_DELETED",
        entityType: "TASK",
        entityId: existingTask.id,
        description: `Task ${existingTask.title} was deleted`,
        userId: context.currentUserId,
        metadata: {
          projectId: existingTask.projectId,
          assigneeId:
            existingTask.assigneeId ?? null,
          previousStatus: existingTask.status,
        },
      },
    });

    await tx.task.delete({
      where: {
        id: taskId,
      },
    });
  });
}