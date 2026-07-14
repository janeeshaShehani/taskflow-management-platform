import prisma from "../config/prisma.js";
import { UserRole } from "../generated/prisma/client.js";

interface ActivityContext {
  currentUserId: string;
  currentUserRole: UserRole;
}

export async function getRecentActivity(
  context: ActivityContext,
) {
  const where =
    context.currentUserRole === UserRole.ADMIN
      ? {}
      : {
          OR: [
            {
              userId: context.currentUserId,
            },
          ],
        };

  const activities = await prisma.activityLog.findMany({
    where,
    orderBy: {
      createdAt: "desc",
    },
    take: 20,

    select: {
      id: true,
      action: true,
      entityType: true,
      entityId: true,
      description: true,
      metadata: true,
      createdAt: true,

      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  });

  return activities;
}