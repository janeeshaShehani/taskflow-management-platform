import api from "@/lib/api";
import type {
  CreateUserInput,
  CreateUserResponse,
  GetUsersParams,
  UpdateUserInput,
  UpdateUserResponse,
  UpdateUserStatusInput,
  UpdateUserStatusResponse,
  UserListResponse,
  DeleteUserResponse
} from "@/types/user";

export async function getUsers(
  params: GetUsersParams = {}
): Promise<UserListResponse["data"]> {
  const response = await api.get<UserListResponse>("/users", {
    params,
  });

  return response.data.data;
}

export async function createUser(
  input: CreateUserInput,
) {
  const response = await api.post<CreateUserResponse>(
    "/users",
    input,
  );

  return response.data.data.user;
}

export async function updateUser(
  userId: string,
  input: UpdateUserInput,
) {
  const response = await api.patch<UpdateUserResponse>(
    `/users/${userId}`,
    input,
  );

  return response.data.data.user;
}

export async function updateUserStatus(
  userId: string,
  input: UpdateUserStatusInput,
) {
  const response =
    await api.patch<UpdateUserStatusResponse>(
      `/users/${userId}/status`,
      input,
    );

  return response.data.data.user;
}

export async function deleteUser(
  userId: string,
): Promise<void> {
  await api.delete<DeleteUserResponse>(
    `/users/${userId}`,
  );
}