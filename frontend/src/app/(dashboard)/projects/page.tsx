"use client";
import AppSelect from "@/components/common/app-select";
import { useState } from "react";
import {
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  BriefcaseBusiness,
  Pencil,
  Plus,
  Search,
  Trash2,
  Users,
} from "lucide-react";
import ManageProjectMembersModal from "@/components/projects/manage-project-members-modal";
import CreateProjectModal from "@/components/projects/create-project-modal";
import DeleteProjectDialog from "@/components/projects/delete-project-dialog";
import EditProjectModal from "@/components/projects/edit-project-modal";
import { useAuth } from "@/providers/auth-provider";
import { getProjects } from "@/services/project.service";
import type {
  Project,
  ProjectStatus,
} from "@/types/project";

function getStatusClass(status: ProjectStatus) {
  switch (status) {
    case "ACTIVE":
      return "bg-green-50 text-success";

    case "COMPLETED":
      return "bg-blue-50 text-primary";

    case "ON_HOLD":
      return "bg-amber-50 text-warning";

    case "CANCELLED":
      return "bg-red-50 text-danger";

    default:
      return "bg-slate-100 text-text-secondary";
  }
}

function formatStatus(status: ProjectStatus) {
  return status.replaceAll("_", " ");
}

export default function ProjectsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const [isCreateModalOpen, setIsCreateModalOpen] =
    useState(false);

  const [selectedProject, setSelectedProject] =
    useState<Project | null>(null);

  const [projectToDelete, setProjectToDelete] =
    useState<Project | null>(null);

  const projectsQuery = useQuery({
    queryKey: ["projects", page, search, status],
    queryFn: () =>
      getProjects({
        page,
        limit: 10,
        search: search || undefined,
        status:
          status === ""
            ? undefined
            : (status as ProjectStatus),
      }),
  });

  const canManageProjects =
    user?.role === "ADMIN" ||
    user?.role === "PROJECT_MANAGER";

  async function refreshProjectData() {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: ["projects"],
      }),
      queryClient.invalidateQueries({
        queryKey: ["dashboard"],
      }),
      queryClient.invalidateQueries({
        queryKey: ["recent-activity"],
      }),
    ]);
  }

  const [projectForMembers, setProjectForMembers] =
    useState<Project | null>(null);

  return (
    <section>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            Project Management
          </h1>

          <p className="mt-1 text-sm text-text-secondary">
            Create, manage and monitor projects.
          </p>
        </div>

        {canManageProjects && (
          <button
            type="button"
            onClick={() =>
              setIsCreateModalOpen(true)
            }
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark"
          >
            <Plus size={18} />
            Create Project
          </button>
        )}
      </div>

      <div className="mt-6 rounded-xl border border-border bg-surface shadow-sm">
        <div className="border-b border-border p-4">
          <div className="grid gap-3 md:grid-cols-[1fr_220px]">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"
              />

              <input
                type="text"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Search projects..."
                className="w-full rounded-lg border border-border bg-background py-2.5 pl-10 pr-4 text-sm outline-none focus:border-primary"
              />
            </div>

            <AppSelect
              value={status}
              placeholder="All statuses"
              options={[
                { value: "PLANNING", label: "Planning" },
                { value: "ACTIVE", label: "Active" },
                { value: "ON_HOLD", label: "On Hold" },
                { value: "COMPLETED", label: "Completed" },
                { value: "CANCELLED", label: "Cancelled" },
              ]}
              onChange={(value) => {
                setStatus(value);
                setPage(1);
              }}
            />
          </div>
        </div>

        {projectsQuery.isPending && (
          <div className="space-y-3 p-5">
            {[1, 2, 3, 4, 5].map((item) => (
              <div
                key={item}
                className="h-16 animate-pulse rounded-lg bg-background"
              />
            ))}
          </div>
        )}

        {projectsQuery.isError && (
          <div className="p-6 text-sm text-danger">
            Unable to load projects. Check that your
            backend project endpoint is running.
          </div>
        )}

        {projectsQuery.data &&
          projectsQuery.data.projects.length === 0 && (
            <div className="flex min-h-64 flex-col items-center justify-center p-10 text-center">
              <BriefcaseBusiness
                size={38}
                className="text-text-secondary"
              />

              <p className="mt-4 font-semibold text-text-primary">
                No projects found
              </p>

              <p className="mt-1 text-sm text-text-secondary">
                Create a project or change the filters.
              </p>
            </div>
          )}

        {projectsQuery.data &&
          projectsQuery.data.projects.length > 0 && (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1000px] text-left text-sm">
                  <thead className="border-b border-border bg-background text-text-secondary">
                    <tr>
                      <th className="px-5 py-3 font-medium">
                        Project
                      </th>

                      <th className="px-5 py-3 font-medium">
                        Manager
                      </th>

                      <th className="px-5 py-3 font-medium">
                        Status
                      </th>

                      <th className="px-5 py-3 font-medium">
                        Start date
                      </th>

                      <th className="px-5 py-3 font-medium">
                        End date
                      </th>

                      <th className="px-5 py-3 font-medium">
                        Created
                      </th>

                      {canManageProjects && (
                        <th className="px-5 py-3 text-right font-medium">
                          Actions
                        </th>
                      )}
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-border">
                    {projectsQuery.data.projects.map(
                      (project) => (
                        <tr
                          key={project.id}
                          className="hover:bg-background"
                        >
                          <td className="px-5 py-4">
                            <p className="font-semibold text-text-primary">
                              {project.name}
                            </p>

                            <p className="mt-1 max-w-xs truncate text-xs text-text-secondary">
                              {project.description ||
                                "No description"}
                            </p>
                          </td>

                          <td className="px-5 py-4">
                            {project.manager
                              ? `${project.manager.firstName} ${project.manager.lastName}`
                              : "Not assigned"}
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={[
                                "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
                                getStatusClass(
                                  project.status,
                                ),
                              ].join(" ")}
                            >
                              {formatStatus(
                                project.status,
                              )}
                            </span>
                          </td>

                          <td className="px-5 py-4 text-text-secondary">
                            {project.startDate
                              ? new Date(
                                  project.startDate,
                                ).toLocaleDateString()
                              : "Not set"}
                          </td>

                          <td className="px-5 py-4 text-text-secondary">
                            {project.endDate
                              ? new Date(
                                  project.endDate,
                                ).toLocaleDateString()
                              : "Not set"}
                          </td>

                          <td className="px-5 py-4 text-text-secondary">
                            {new Date(
                              project.createdAt,
                            ).toLocaleDateString()}
                          </td>

                          {canManageProjects && (
                            <td className="px-5 py-4">
                              <div className="flex justify-end gap-2">

                                 <button
                                  type="button"
                                  title="Manage members"
                                  onClick={() =>
                                    setProjectForMembers(project)
                                  }
                                  className="rounded-lg border border-border p-2 text-text-secondary hover:border-primary hover:bg-primary-light hover:text-primary"
                                >
                                  <Users size={16} />
                                </button>

                                <button
                                  type="button"
                                  title="Edit project"
                                  onClick={() =>
                                    setSelectedProject(
                                      project,
                                    )
                                  }
                                  className="rounded-lg border border-border p-2 text-text-secondary hover:border-primary hover:bg-primary-light hover:text-primary"
                                >
                                  <Pencil size={16} />
                                </button>

                                <button
                                  type="button"
                                  title="Delete project"
                                  onClick={() =>
                                    setProjectToDelete(
                                      project,
                                    )
                                  }
                                  className="rounded-lg border border-border p-2 text-text-secondary hover:border-danger hover:bg-red-50 hover:text-danger"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between border-t border-border px-5 py-4">
                <p className="text-sm text-text-secondary">
                  Page{" "}
                  {
                    projectsQuery.data.pagination
                      .page
                  }{" "}
                  of{" "}
                  {
                    projectsQuery.data.pagination
                      .totalPages
                  }
                </p>

                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={page === 1}
                    onClick={() =>
                      setPage((current) =>
                        Math.max(current - 1, 1),
                      )
                    }
                    className="rounded-lg border border-border px-3 py-2 text-sm disabled:opacity-50"
                  >
                    Previous
                  </button>

                  <button
                    type="button"
                    disabled={
                      page >=
                      projectsQuery.data.pagination
                        .totalPages
                    }
                    onClick={() =>
                      setPage(
                        (current) => current + 1,
                      )
                    }
                    className="rounded-lg border border-border px-3 py-2 text-sm disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
      </div>

      {user && (
        <CreateProjectModal
            isOpen={isCreateModalOpen}
            currentUserId={user.id}
            currentUserRole={user.role}
            onClose={() => setIsCreateModalOpen(false)}
            onCreated={async () => {
            setPage(1);
            await refreshProjectData();
            }}
        />
      )}

      {user && (
        <EditProjectModal
            isOpen={Boolean(selectedProject)}
            project={selectedProject}
            currentUserRole={user.role}
            onClose={() => setSelectedProject(null)}
            onUpdated={async () => {
            await refreshProjectData();
            setSelectedProject(null);
            }}
        />
      )}

      <DeleteProjectDialog
        isOpen={Boolean(projectToDelete)}
        project={projectToDelete}
        onClose={() =>
          setProjectToDelete(null)
        }
        onDeleted={async () => {
          await refreshProjectData();
          setProjectToDelete(null);
        }}
      />

      <ManageProjectMembersModal
        isOpen={Boolean(projectForMembers)}
        project={projectForMembers}
        onClose={() =>
          setProjectForMembers(null)
        }
        onMembersChanged={async () => {
          await Promise.all([
            refreshProjectData(),

            queryClient.invalidateQueries({
              queryKey: [
                "task-project-members",
              ],
            }),
          ]);
        }}
      />

    </section>
  );
}