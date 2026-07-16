export type UserRole =
  | "ADMIN"
  | "PROJECT_MANAGER"
  | "TEAM_MEMBER";

export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  avatarUrl: string | null;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: AuthUser;
  };
}

export interface CurrentUserResponse {
  success: boolean;
  data: {
    user: AuthUser;
  };
}