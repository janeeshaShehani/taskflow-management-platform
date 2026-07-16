"use client";

import { useState } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  CheckSquare,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";

import CreateTaskModal from "@/components/tasks/create-task-modal";
import DeleteTaskDialog from "@/components/tasks/delete-task-dialog";
import EditTaskModal from "@/components/tasks/edit-task-modal";
import { useAuth } from "@/providers/auth-provider";
import { getProjects } from "@/services/project.service";
import {
  getTasks,
  updateTaskStatus,
} from "@/services/task.service";
import type {
  Task,
  TaskPriority,
  TaskStatus,
} from "@/types/task";

function formatLabel(value: string) {
  return value.replaceAll("_", " ");
}

function getStatusClass(status: TaskStatus) {
  switch (status) {
    case "IN_PROGRESS":
      return "bg-blue-50 text-primary";

    case "IN_REVIEW":
      return "bg-purple-50 text-purple-700";

    case "COMPLETED":
      return "bg-green-50 text-success";

    case "BLOCKED":
      return "bg-red-50 text-danger";

    default:
      return "bg-slate-100 text-text-secondary";
  }
}

function getPriorityClass(priority: TaskPriority) {
  switch (priority) {
    case "LOW":
      return "bg-slate-100 text-text-secondary";

    case "MEDIUM":
      return "bg-blue-50 text-primary";

    case "HIGH":
      return "bg-amber-50 text-warning";

    case "URGENT":
      return "bg-red-50 text-danger";
  }
}

function isTaskOverdue(task: Task) {
  if (!task.dueDate || task.status === "COMPLETED") {
    return false;
  }

  return new Date(task.dueDate) < new Date();
}

export default function TasksPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [projectId, setProjectId] = useState("");
  const [overdueOnly, setOverdueOnly] =
    useState(false);

  const [isCreateModalOpen, setIsCreateModalOpen] =
    useState(false);

  const [selectedTask, setSelectedTask] =
    useState<Task | null>(null);

  const [taskToDelete, setTaskToDelete] =
    useState<Task | null>(null);

  const tasksQuery = useQuery({
    queryKey: [
      "tasks",
      page,
      search,
      status,
      priority,
      projectId,
      overdueOnly,
      user?.id,
    ],

    queryFn: () =>
      getTasks({
        page,
        limit: 10,
        search: search || undefined,

        status:
          status === ""
            ? undefined
            : (status as TaskStatus),

        priority:
          priority === ""
            ? undefined
            : (priority as TaskPriority),

        projectId: projectId || undefined,

        overdue: overdueOnly
          ? true
          : undefined,
      }),

    enabled: Boolean(user),
  });

  const projectsQuery = useQuery({
    queryKey: ["task-filter-projects", user?.id],

    queryFn: () =>
      getProjects({
        page: 1,
        limit: 100,
      }),

    enabled: Boolean(user),
  });

  const statusMutation = useMutation({
    mutationFn: ({
      taskId,
      status,
    }: {
      taskId: string;
      status: TaskStatus;
    }) =>
      updateTaskStatus(taskId, {
        status,
      }),

    onSuccess: async () => {
      await refreshTaskData();
    },
  });

  const canManageTasks =
    user?.role === "ADMIN" ||
    user?.role === "PROJECT_MANAGER";

  async function refreshTaskData() {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: ["tasks"],
      }),

      queryClient.invalidateQueries({
        queryKey: ["dashboard"],
      }),

      queryClient.invalidateQueries({
        queryKey: ["recent-activity"],
      }),

      queryClient.invalidateQueries({
        queryKey: ["notifications"],
      }),
    ]);
  }

  function resetFilters() {
    setSearch("");
    setStatus("");
    setPriority("");
    setProjectId("");
    setOverdueOnly(false);
    setPage(1);
  }

  return (
    <section>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            Task Management
          </h1>

          <p className="mt-1 text-sm text-text-secondary">
            Manage, assign and monitor project tasks.
          </p>
        </div>

        {canManageTasks && (
          <button
            type="button"
            onClick={() =>
              setIsCreateModalOpen(true)
            }
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-dark"
          >
            <Plus size={18} />
            Create Task
          </button>
        )}
      </div>

      <div className="mt-6 rounded-xl border border-border bg-surface shadow-sm">
        <div className="border-b border-border p-4">
          <div className="grid gap-3 lg:grid-cols-[1fr_180px_180px_220px]">
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
                placeholder="Search tasks..."
                className="w-full rounded-lg border border-border bg-background py-2.5 pl-10 pr-4 text-sm text-text-primary outline-none transition focus:border-primary"
              />
            </div>

            <select
              value={status}
              onChange={(event) => {
                setStatus(event.target.value);
                setPage(1);
              }}
              className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-text-primary outline-none transition focus:border-primary"
            >
              <option value="">All statuses</option>
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">
                In Progress
              </option>
              <option value="IN_REVIEW">
                In Review
              </option>
              <option value="COMPLETED">
                Completed
              </option>
              <option value="BLOCKED">
                Blocked
              </option>
            </select>

            <select
              value={priority}
              onChange={(event) => {
                setPriority(event.target.value);
                setPage(1);
              }}
              className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-text-primary outline-none transition focus:border-primary"
            >
              <option value="">All priorities</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">
                Medium
              </option>
              <option value="HIGH">High</option>
              <option value="URGENT">
                Urgent
              </option>
            </select>

            <select
              value={projectId}
              onChange={(event) => {
                setProjectId(event.target.value);
                setPage(1);
              }}
              disabled={projectsQuery.isPending}
              className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-text-primary outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:opacity-60"
            >
              <option value="">
                {projectsQuery.isPending
                  ? "Loading projects..."
                  : "All projects"}
              </option>

              {projectsQuery.data?.projects.map(
                (project) => (
                  <option
                    key={project.id}
                    value={project.id}
                  >
                    {project.name} ({project.code})
                  </option>
                ),
              )}
            </select>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <label className="flex items-center gap-2 text-sm text-text-primary">
              <input
                type="checkbox"
                checked={overdueOnly}
                onChange={(event) => {
                  setOverdueOnly(
                    event.target.checked,
                  );
                  setPage(1);
                }}
                className="h-4 w-4 accent-primary"
              />

              Show overdue tasks only
            </label>

            <button
              type="button"
              onClick={resetFilters}
              className="text-sm font-medium text-primary hover:underline"
            >
              Clear filters
            </button>
          </div>
        </div>

        {statusMutation.isError && (
          <div className="border-b border-red-200 bg-red-50 px-5 py-3 text-sm text-danger">
            Unable to update task status.
          </div>
        )}

        {tasksQuery.isPending && (
          <div className="space-y-3 p-5">
            {[1, 2, 3, 4, 5].map((item) => (
              <div
                key={item}
                className="h-16 animate-pulse rounded-lg bg-background"
              />
            ))}
          </div>
        )}

        {tasksQuery.isError && (
          <div className="p-6 text-sm text-danger">
            Unable to load tasks. Check that the
            backend task endpoint is running.
          </div>
        )}

        {tasksQuery.data &&
          tasksQuery.data.tasks.length === 0 && (
            <div className="flex min-h-64 flex-col items-center justify-center p-10 text-center">
              <CheckSquare
                size={40}
                className="text-text-secondary"
              />

              <p className="mt-4 font-semibold text-text-primary">
                No tasks found
              </p>

              <p className="mt-1 text-sm text-text-secondary">
                Create a task or change the current
                filters.
              </p>
            </div>
          )}

        {tasksQuery.data &&
          tasksQuery.data.tasks.length > 0 && (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1200px] text-left text-sm">
                  <thead className="border-b border-border bg-background text-text-secondary">
                    <tr>
                      <th className="px-5 py-3 font-medium">
                        Task
                      </th>

                      <th className="px-5 py-3 font-medium">
                        Project
                      </th>

                      <th className="px-5 py-3 font-medium">
                        Assignee
                      </th>

                      <th className="px-5 py-3 font-medium">
                        Priority
                      </th>

                      <th className="px-5 py-3 font-medium">
                        Status
                      </th>

                      <th className="px-5 py-3 font-medium">
                        Due date
                      </th>

                      <th className="px-5 py-3 font-medium">
                        Comments
                      </th>

                      {canManageTasks && (
                        <th className="px-5 py-3 text-right font-medium">
                          Actions
                        </th>
                      )}
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-border">
                    {tasksQuery.data.tasks.map(
                      (task) => (
                        <tr
                          key={task.id}
                          className="hover:bg-background"
                        >
                          <td className="px-5 py-4">
                            <p className="font-semibold text-text-primary">
                              {task.title}
                            </p>

                            <p className="mt-1 max-w-xs truncate text-xs text-text-secondary">
                              {task.description ||
                                "No description"}
                            </p>
                          </td>

                          <td className="px-5 py-4">
                            <p className="font-medium text-text-primary">
                              {task.project.name}
                            </p>

                            <p className="mt-1 text-xs text-text-secondary">
                              {task.project.code}
                            </p>
                          </td>

                          <td className="px-5 py-4">
                            {task.assignee ? (
                              <div>
                                <p className="font-medium text-text-primary">
                                  {
                                    task.assignee
                                      .firstName
                                  }{" "}
                                  {
                                    task.assignee
                                      .lastName
                                  }
                                </p>

                                <p className="mt-1 text-xs text-text-secondary">
                                  {task.assignee.email}
                                </p>
                              </div>
                            ) : (
                              <span className="text-text-secondary">
                                Unassigned
                              </span>
                            )}
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={[
                                "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
                                getPriorityClass(
                                  task.priority,
                                ),
                              ].join(" ")}
                            >
                              {formatLabel(
                                task.priority,
                              )}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <select
                              value={task.status}
                              disabled={
                                statusMutation.isPending
                              }
                              onChange={(event) =>
                                statusMutation.mutate({
                                  taskId: task.id,
                                  status:
                                    event.target
                                      .value as TaskStatus,
                                })
                              }
                              className={[
                                "rounded-lg border border-border px-2.5 py-2 text-xs font-semibold outline-none disabled:cursor-not-allowed disabled:opacity-60",
                                getStatusClass(
                                  task.status,
                                ),
                              ].join(" ")}
                            >
                              <option value="TODO">
                                To Do
                              </option>

                              <option value="IN_PROGRESS">
                                In Progress
                              </option>

                              <option value="IN_REVIEW">
                                In Review
                              </option>

                              <option value="COMPLETED">
                                Completed
                              </option>

                              <option value="BLOCKED">
                                Blocked
                              </option>
                            </select>
                          </td>

                          <td className="px-5 py-4">
                            {task.dueDate ? (
                              <div>
                                <p
                                  className={
                                    isTaskOverdue(task)
                                      ? "font-semibold text-danger"
                                      : "text-text-secondary"
                                  }
                                >
                                  {new Date(
                                    task.dueDate,
                                  ).toLocaleDateString()}
                                </p>

                                {isTaskOverdue(task) && (
                                  <p className="mt-1 text-xs font-medium text-danger">
                                    Overdue
                                  </p>
                                )}
                              </div>
                            ) : (
                              <span className="text-text-secondary">
                                Not set
                              </span>
                            )}
                          </td>

                          <td className="px-5 py-4 text-text-secondary">
                            {task._count.comments}
                          </td>

                          {canManageTasks && (
                            <td className="px-5 py-4">
                              <div className="flex justify-end gap-2">
                                <button
                                  type="button"
                                  title="Edit task"
                                  aria-label={`Edit ${task.title}`}
                                  onClick={() =>
                                    setSelectedTask(
                                      task,
                                    )
                                  }
                                  className="rounded-lg border border-border p-2 text-text-secondary transition hover:border-primary hover:bg-primary-light hover:text-primary"
                                >
                                  <Pencil size={16} />
                                </button>

                                <button
                                  type="button"
                                  title="Delete task"
                                  aria-label={`Delete ${task.title}`}
                                  onClick={() =>
                                    setTaskToDelete(
                                      task,
                                    )
                                  }
                                  className="rounded-lg border border-border p-2 text-text-secondary transition hover:border-danger hover:bg-red-50 hover:text-danger"
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

              <div className="flex flex-col gap-3 border-t border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-text-secondary">
                  Page{" "}
                  {tasksQuery.data.pagination.page}{" "}
                  of{" "}
                  {
                    tasksQuery.data.pagination
                      .totalPages
                  }{" "}
                  ·{" "}
                  {tasksQuery.data.pagination.total}{" "}
                  task
                  {tasksQuery.data.pagination.total ===
                  1
                    ? ""
                    : "s"}
                </p>

                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={page === 1}
                    onClick={() =>
                      setPage((currentPage) =>
                        Math.max(
                          currentPage - 1,
                          1,
                        ),
                      )
                    }
                    className="rounded-lg border border-border px-3 py-2 text-sm text-text-primary transition hover:bg-background disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Previous
                  </button>

                  <button
                    type="button"
                    disabled={
                      page >=
                      tasksQuery.data.pagination
                        .totalPages
                    }
                    onClick={() =>
                      setPage(
                        (currentPage) =>
                          currentPage + 1,
                      )
                    }
                    className="rounded-lg border border-border px-3 py-2 text-sm text-text-primary transition hover:bg-background disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
      </div>

      {canManageTasks && (
        <CreateTaskModal
          isOpen={isCreateModalOpen}
          onClose={() =>
            setIsCreateModalOpen(false)
          }
          onCreated={async () => {
            setPage(1);
            await refreshTaskData();
          }}
        />
      )}

      {canManageTasks && (
        <EditTaskModal
          isOpen={Boolean(selectedTask)}
          task={selectedTask}
          onClose={() =>
            setSelectedTask(null)
          }
          onUpdated={async () => {
            await refreshTaskData();
            setSelectedTask(null);
          }}
        />
      )}

      {canManageTasks && (
        <DeleteTaskDialog
          isOpen={Boolean(taskToDelete)}
          task={taskToDelete}
          onClose={() =>
            setTaskToDelete(null)
          }
          onDeleted={async () => {
            await refreshTaskData();
            setTaskToDelete(null);
          }}
        />
      )}
    </section>
  );
}