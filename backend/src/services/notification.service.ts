import prisma from "../config/prisma.js";

export async function getNotifications(
  userId: string,
) {
  const notifications = await prisma.notification.findMany({
    where: {
      userId,
    },

    orderBy: {
      createdAt: "desc",
    },

    take: 20,

    select: {
      id: true,
      title: true,
      message: true,
      isRead: true,
      createdAt: true,

      task: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  });

  const unreadCount =
    await prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });

  return {
    unreadCount,
    notifications,
  };
}

import { ApiError } from "../utils/ApiError.js";

export async function markNotificationAsRead(
  notificationId: string,
  userId: string,
) {
  const notification =
    await prisma.notification.findFirst({
      where: {
        id: notificationId,
        userId,
      },
    });

  if (!notification) {
    throw new ApiError(
      404,
      "Notification not found",
    );
  }

  if (notification.isRead) {
    return notification;
  }

  return prisma.notification.update({
    where: {
      id: notificationId,
    },
    data: {
      isRead: true,
    },
    select: {
      id: true,
      title: true,
      message: true,
      isRead: true,
      createdAt: true,
    },
  });
}