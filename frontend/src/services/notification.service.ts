import api from "@/lib/api";

export interface NotificationTask {
  id: string;
  title: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  task: NotificationTask | null;
}

interface NotificationResponse {
  success: boolean;
  message: string;
  data: {
    unreadCount: number;
    notifications: NotificationItem[];
  };
}

export async function getNotifications() {
  const response = await api.get<NotificationResponse>(
    "/notifications",
  );

  return response.data.data;
}