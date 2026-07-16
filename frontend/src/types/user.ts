import type { UserRole } from "@/types/auth";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  avatarUrl: string | null;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface UserListResponse {
  success: boolean;
  message: string;
  data: {
    users: User[];
    pagination: UserPagination;
  };
}

export interface GetUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: UserRole;
  isActive?: boolean;
}

export interface CreateUserInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface CreateUserResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
  };
}

export interface UpdateUserInput {
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: UserRole;
  isActive?: boolean;
}

export interface UpdateUserResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
  };
}

export interface UpdateUserStatusInput {
  isActive: boolean;
}

export interface UpdateUserStatusResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
  };
}

export interface DeleteUserResponse {
  success: boolean;
  message: string;
}