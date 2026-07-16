export type TaskStatus =
  | "TODO"
  | "IN_PROGRESS"
  | "IN_REVIEW"
  | "COMPLETED"
  | "BLOCKED";

export type TaskPriority =
  | "LOW"
  | "MEDIUM"
  | "HIGH"
  | "URGENT";

export interface TaskProject {
  id: string;
  name: string;
  code: string;
  status:
    | "PLANNING"
    | "ACTIVE"
    | "ON_HOLD"
    | "COMPLETED"
    | "CANCELLED";
  managerId: string;
}

export interface TaskAssignee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "ADMIN" | "PROJECT_MANAGER" | "TEAM_MEMBER";
  avatarUrl: string | null;
  isActive: boolean;
}

export interface TaskCreator {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  project: TaskProject;
  assignee: TaskAssignee | null;
  createdBy: TaskCreator;
  _count: {
    comments: number;
  };
}

export interface TaskPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface GetTasksParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  projectId?: string;
  assigneeId?: string;
  overdue?: boolean;
}

export interface TaskListResponse {
  success: boolean;
  message: string;
  data: {
    tasks: Task[];
    pagination: TaskPagination;
  };
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string;
  projectId: string;
  assigneeId?: string;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string | null;
  priority?: TaskPriority;
  dueDate?: string | null;
  assigneeId?: string | null;
}

export interface UpdateTaskStatusInput {
  status: TaskStatus;
}

export interface TaskResponse {
  success: boolean;
  message: string;
  data: {
    task: Task;
  };
}

export interface DeleteTaskResponse {
  success: boolean;
  message: string;
}