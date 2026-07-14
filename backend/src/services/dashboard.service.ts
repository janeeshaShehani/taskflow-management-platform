import prisma from "../config/prisma.js";
import {
  ProjectStatus,
  TaskStatus,
  UserRole,
} from "../generated/prisma/client.js";

export async function getAdminDashboardSummary() {
  const now = new Date();

  const [
    totalUsers,
    activeUsers,
    totalProjects,
    activeProjects,
    totalTasks,
    completedTasks,
    overdueTasks,
    adminCount,
    managerCount,
    memberCount,
  ] = await prisma.$transaction([
    prisma.user.count(),

    prisma.user.count({
      where: {
        isActive: true,
      },
    }),

    prisma.project.count(),

    prisma.project.count({
      where: {
        status: ProjectStatus.ACTIVE,
      },
    }),

    prisma.task.count(),

    prisma.task.count({
      where: {
        status: TaskStatus.COMPLETED,
      },
    }),

    prisma.task.count({
      where: {
        dueDate: {
          lt: now,
        },
        status: {
          not: TaskStatus.COMPLETED,
        },
      },
    }),

    prisma.user.count({
      where: {
        role: UserRole.ADMIN,
      },
    }),

    prisma.user.count({
      where: {
        role: UserRole.PROJECT_MANAGER,
      },
    }),

    prisma.user.count({
      where: {
        role: UserRole.TEAM_MEMBER,
      },
    }),
  ]);

  return {
    users: {
      total: totalUsers,
      active: activeUsers,
      inactive: totalUsers - activeUsers,
      byRole: {
        admins: adminCount,
        projectManagers: managerCount,
        teamMembers: memberCount,
      },
    },

    projects: {
      total: totalProjects,
      active: activeProjects,
    },

    tasks: {
      total: totalTasks,
      completed: completedTasks,
      overdue: overdueTasks,
    },
  };
}

export async function getManagerDashboardSummary(
  managerId: string,
) {
  const now = new Date();

  const [
    totalProjects,
    activeProjects,
    totalTasks,
    completedTasks,
    pendingTasks,
    overdueTasks,
    totalMembers,
    recentTasks,
  ] = await prisma.$transaction([

    prisma.project.count({
      where: {
        managerId,
      },
    }),

    prisma.project.count({
      where: {
        managerId,
        status: ProjectStatus.ACTIVE,
      },
    }),

    prisma.task.count({
      where: {
        project: {
          managerId,
        },
      },
    }),

    prisma.task.count({
      where: {
        project: {
          managerId,
        },
        status: TaskStatus.COMPLETED,
      },
    }),

    prisma.task.count({
      where: {
        project: {
          managerId,
        },
        status: {
          in: [
            TaskStatus.TODO,
            TaskStatus.IN_PROGRESS,
            TaskStatus.IN_REVIEW,
          ],
        },
      },
    }),

    prisma.task.count({
      where: {
        project: {
          managerId,
        },
        dueDate: {
          lt: now,
        },
        status: {
          not: TaskStatus.COMPLETED,
        },
      },
    }),

    prisma.projectMember.count({
      where: {
        project: {
          managerId,
        },
      },
    }),

    prisma.task.findMany({
      where: {
        project: {
          managerId,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
      select: {
        id: true,
        title: true,
        status: true,
        priority: true,
        dueDate: true,

        project: {
          select: {
            id: true,
            name: true,
          },
        },

        assignee: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    }),

  ]);

  return {
    projects: {
      total: totalProjects,
      active: activeProjects,
    },

    tasks: {
      total: totalTasks,
      completed: completedTasks,
      pending: pendingTasks,
      overdue: overdueTasks,
    },

    teamMembers: totalMembers,

    recentTasks,
  };
}

export async function getMemberDashboardSummary(
  memberId: string,
) {
  const now = new Date();

  const [
    assignedTasks,
    completedTasks,
    pendingTasks,
    overdueTasks,
    highPriorityTasks,
    assignedProjects,
    recentTasks,
    upcomingTasks,
  ] = await prisma.$transaction([
    prisma.task.count({
      where: {
        assigneeId: memberId,
      },
    }),

    prisma.task.count({
      where: {
        assigneeId: memberId,
        status: TaskStatus.COMPLETED,
      },
    }),

    prisma.task.count({
      where: {
        assigneeId: memberId,
        status: {
          in: [
            TaskStatus.TODO,
            TaskStatus.IN_PROGRESS,
            TaskStatus.IN_REVIEW,
            TaskStatus.BLOCKED,
          ],
        },
      },
    }),

    prisma.task.count({
      where: {
        assigneeId: memberId,
        dueDate: {
          lt: now,
        },
        status: {
          not: TaskStatus.COMPLETED,
        },
      },
    }),

    prisma.task.count({
      where: {
        assigneeId: memberId,
        priority: {
          in: ["HIGH", "URGENT"],
        },
        status: {
          not: TaskStatus.COMPLETED,
        },
      },
    }),

    prisma.projectMember.count({
      where: {
        userId: memberId,
      },
    }),

    prisma.task.findMany({
      where: {
        assigneeId: memberId,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
      select: {
        id: true,
        title: true,
        status: true,
        priority: true,
        dueDate: true,
        project: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    }),

    prisma.task.findMany({
      where: {
        assigneeId: memberId,
        dueDate: {
          gte: now,
        },
        status: {
          not: TaskStatus.COMPLETED,
        },
      },
      orderBy: {
        dueDate: "asc",
      },
      take: 5,
      select: {
        id: true,
        title: true,
        status: true,
        priority: true,
        dueDate: true,
        project: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    }),
  ]);

  const completionPercentage =
    assignedTasks === 0
      ? 0
      : Math.round(
          (completedTasks / assignedTasks) * 100,
        );

  return {
    projects: {
      assigned: assignedProjects,
    },

    tasks: {
      assigned: assignedTasks,
      completed: completedTasks,
      pending: pendingTasks,
      overdue: overdueTasks,
      highPriority: highPriorityTasks,
      completionPercentage,
    },

    recentTasks,
    upcomingTasks,
  };
}