export type ProjectStatus =
  | "PLANNING"
  | "ACTIVE"
  | "ON_HOLD"
  | "COMPLETED"
  | "CANCELLED";

export interface ProjectManager {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface Project {
  id: string;
  name: string;
  code: string;
  description: string | null;
  status: ProjectStatus;
  startDate: string | null;
  endDate: string | null;
  managerId: string;
  manager: ProjectManager | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface GetProjectsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: ProjectStatus;
}

export interface ProjectListResponse {
  success: boolean;
  message: string;
  data: {
    projects: Project[];
    pagination: ProjectPagination;
  };
}

export interface CreateProjectInput {
  name: string;
  code: string;
  description?: string;
  status: ProjectStatus;
  startDate?: string;
  endDate?: string;
  managerId: string;
}

export interface UpdateProjectInput {
  name?: string;
  code?: string;
  description?: string | null;
  status?: ProjectStatus;
  startDate?: string | null;
  endDate?: string | null;
  managerId?: string;
}

export interface ProjectResponse {
  success: boolean;
  message: string;
  data: {
    project: Project;
  };
}

export interface ProjectMemberUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "ADMIN" | "PROJECT_MANAGER" | "TEAM_MEMBER";
  avatarUrl: string | null;
  isActive: boolean;
}

export interface ProjectMember {
  id: string;
  joinedAt: string;
  user: ProjectMemberUser;
}

export interface ProjectDetails extends Project {
  members: ProjectMember[];
}

export interface ProjectDetailsResponse {
  success: boolean;
  message: string;
  data: {
    project: ProjectDetails;
  };
}

export interface DeleteProjectResponse {
  success: boolean;
  message: string;
}

export interface AddProjectMemberInput {
  userId: string;
}

export interface ProjectMemberResponse {
  success: boolean;
  message: string;
  data: {
    member: ProjectMember;
  };
}