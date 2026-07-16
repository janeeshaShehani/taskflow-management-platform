import api from "@/lib/api";

import type {
  CreateTaskInput,
  DeleteTaskResponse,
  GetTasksParams,
  TaskListResponse,
  TaskResponse,
  UpdateTaskInput,
  UpdateTaskStatusInput,
} from "@/types/task";

export async function getTasks(
  params: GetTasksParams = {},
): Promise<TaskListResponse["data"]> {
  const response = await api.get<TaskListResponse>(
    "/tasks",
    {
      params: {
        ...params,
        overdue:
          params.overdue === undefined
            ? undefined
            : String(params.overdue),
      },
    },
  );

  return response.data.data;
}

export async function getTaskById(
  taskId: string,
) {
  const response = await api.get<TaskResponse>(
    `/tasks/${taskId}`,
  );

  return response.data.data.task;
}

export async function createTask(
  input: CreateTaskInput,
) {
  const response = await api.post<TaskResponse>(
    "/tasks",
    input,
  );

  return response.data.data.task;
}

export async function updateTask(
  taskId: string,
  input: UpdateTaskInput,
) {
  const response = await api.patch<TaskResponse>(
    `/tasks/${taskId}`,
    input,
  );

  return response.data.data.task;
}

export async function updateTaskStatus(
  taskId: string,
  input: UpdateTaskStatusInput,
) {
  const response = await api.patch<TaskResponse>(
    `/tasks/${taskId}/status`,
    input,
  );

  return response.data.data.task;
}

export async function deleteTask(
  taskId: string,
): Promise<void> {
  await api.delete<DeleteTaskResponse>(
    `/tasks/${taskId}`,
  );
}