import api from "@/lib/api";

export interface AdminDashboardSummary {
  users: {
    total: number;
    active: number;
    inactive: number;
    byRole: {
      admins: number;
      projectManagers: number;
      teamMembers: number;
    };
  };
  projects: {
    total: number;
    active: number;
  };
  tasks: {
    total: number;
    completed: number;
    overdue: number;
  };
}

export interface ManagerDashboardSummary {
  projects: {
    total: number;
    active: number;
  };
  tasks: {
    total: number;
    completed: number;
    pending: number;
    overdue: number;
  };
  teamMembers: number;
  recentTasks: Array<{
    id: string;
    title: string;
    status: string;
    priority: string;
    dueDate: string | null;
    project: {
      id: string;
      name: string;
    };
    assignee: {
      firstName: string;
      lastName: string;
    } | null;
  }>;
}

export interface MemberDashboardSummary {
  projects: {
    assigned: number;
  };
  tasks: {
    assigned: number;
    completed: number;
    pending: number;
    overdue: number;
    highPriority: number;
    completionPercentage: number;
  };
  recentTasks: Array<{
    id: string;
    title: string;
    status: string;
    priority: string;
    dueDate: string | null;
    project: {
      id: string;
      name: string;
      code: string;
    };
  }>;
  upcomingTasks: Array<{
    id: string;
    title: string;
    status: string;
    priority: string;
    dueDate: string | null;
    project: {
      id: string;
      name: string;
      code: string;
    };
  }>;
}

interface DashboardResponse<T> {
  success: boolean;
  message: string;
  data: {
    summary: T;
  };
}

export async function getAdminDashboard(): Promise<AdminDashboardSummary> {
  const response =
    await api.get<DashboardResponse<AdminDashboardSummary>>(
      "/dashboard/admin",
    );

  return response.data.data.summary;
}

export async function getManagerDashboard(): Promise<ManagerDashboardSummary> {
  const response =
    await api.get<DashboardResponse<ManagerDashboardSummary>>(
      "/dashboard/manager",
    );

  return response.data.data.summary;
}

export async function getMemberDashboard(): Promise<MemberDashboardSummary> {
  const response =
    await api.get<DashboardResponse<MemberDashboardSummary>>(
      "/dashboard/member",
    );

  return response.data.data.summary;
}