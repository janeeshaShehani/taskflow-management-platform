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