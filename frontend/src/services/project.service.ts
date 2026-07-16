import api from "@/lib/api";

import type {
  AddProjectMemberInput,
  CreateProjectInput,
  DeleteProjectResponse,
  GetProjectsParams,
  ProjectDetailsResponse,
  ProjectListResponse,
  ProjectMemberResponse,
  ProjectResponse,
  UpdateProjectInput,
} from "@/types/project";


export async function getProjects(
  params: GetProjectsParams = {},
): Promise<ProjectListResponse["data"]> {
  const response = await api.get<ProjectListResponse>(
    "/projects",
    {
      params,
    },
  );

  return response.data.data;
}

export async function createProject(
  input: CreateProjectInput,
) {
  const response = await api.post<ProjectResponse>(
    "/projects",
    input,
  );

  return response.data.data.project;
}

export async function updateProject(
  projectId: string,
  input: UpdateProjectInput,
) {
  const response = await api.patch<ProjectResponse>(
    `/projects/${projectId}`,
    input,
  );

  return response.data.data.project;
}

export async function deleteProject(
  projectId: string,
): Promise<void> {
  await api.delete<DeleteProjectResponse>(
    `/projects/${projectId}`,
  );
}

export async function getProjectById(
  projectId: string,
) {
  const response =
    await api.get<ProjectDetailsResponse>(
      `/projects/${projectId}`,
    );

  return response.data.data.project;
}

export async function addProjectMember(
  projectId: string,
  input: AddProjectMemberInput,
) {
  const response =
    await api.post<ProjectMemberResponse>(
      `/projects/${projectId}/members`,
      input,
    );

  return response.data.data.member;
}

export async function removeProjectMember(
  projectId: string,
  userId: string,
): Promise<void> {
  await api.delete(
    `/projects/${projectId}/members/${userId}`,
  );
}