import prisma from "../config/prisma.js";
import {
  UserRole,
  type TaskStatus,
  type TaskPriority,
} from "../generated/prisma/client.js";
import { ApiError } from "../utils/ApiError.js";
import type { CreateTaskInput } from "../validators/task.validator.js";

interface TaskContext {
  currentUserId: string;
  currentUserRole: UserRole;
}

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
    context.currentUserRole === UserRole.PROJECT_MANAGER &&
    project.managerId !== context.currentUserId
  ) {
    throw new ApiError(
      403,
      "You can only create tasks for projects that you manage",
    );
  }

  if (context.currentUserRole === UserRole.TEAM_MEMBER) {
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

  let assignee = null;

  if (input.assigneeId) {
    const membership = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId: input.projectId,
          userId: input.assigneeId,
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

    assignee = membership.user;
  }

  const task = await prisma.$transaction(async (tx) => {
    const createdTask = await tx.task.create({
      data: {
        title: input.title,
        description: input.description,
        status: input.status as TaskStatus,
        priority: input.priority as TaskPriority,
        dueDate: input.dueDate,
        projectId: input.projectId,
        assigneeId: input.assigneeId,
        createdById: context.currentUserId,
      },
      select: {
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
          },
        },

        assignee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
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
      },
    });

    await tx.activityLog.create({
      data: {
        action: "TASK_CREATED",
        entityType: "TASK",
        entityId: createdTask.id,
        description: `Task ${createdTask.title} was created in project ${project.name}`,
        userId: context.currentUserId,
        metadata: {
          projectId: input.projectId,
          assigneeId: input.assigneeId ?? null,
          priority: createdTask.priority,
          status: createdTask.status,
        },
      },
    });

    if (input.assigneeId && assignee) {
      await tx.notification.create({
        data: {
          title: "New task assigned",
          message: `You were assigned the task "${createdTask.title}"`,
          userId: input.assigneeId,
          taskId: createdTask.id,
        },
      });
    }

    return createdTask;
  });

  return task;
}