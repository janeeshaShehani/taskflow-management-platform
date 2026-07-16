import api from "@/lib/api";
import type {
  CurrentUserResponse,
  LoginInput,
  LoginResponse,
} from "@/types/auth";

export async function loginUser(
  input: LoginInput,
): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>(
    "/auth/login",
    input,
  );

  return response.data;
}

export async function getCurrentUser(): Promise<CurrentUserResponse> {
  const response =
    await api.get<CurrentUserResponse>("/auth/me");

  return response.data;
}

export async function logoutUser(): Promise<void> {
  await api.post("/auth/logout");
}