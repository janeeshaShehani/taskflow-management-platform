import api from "@/lib/api";

export interface ActivityUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface ActivityItem {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  description: string;
  metadata: unknown;
  createdAt: string;
  user: ActivityUser | null;
}

interface ActivityResponse {
  success: boolean;
  message: string;
  data: {
    activities: ActivityItem[];
  };
}

export async function getRecentActivities(): Promise<
  ActivityItem[]
> {
  const response = await api.get<ActivityResponse>(
    "/activity",
  );

  return response.data.data.activities;
}