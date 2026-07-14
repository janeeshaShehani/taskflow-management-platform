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