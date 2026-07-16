"use client";

import { useEffect } from "react";
import {
  useMutation,
  useQuery,
} from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { X } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { getProjects, getProjectById } from "@/services/project.service";
import { createTask } from "@/services/task.service";
import type { CreateTaskInput } from "@/types/task";

const createTaskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(
      3,
      "Task title must contain at least 3 characters",
    )
    .max(
      150,
      "Task title cannot exceed 150 characters",
    ),

  description: z
    .string()
    .trim()
    .max(
      2000,
      "Description cannot exceed 2000 characters",
    )
    .optional(),

  projectId: z
    .string()
    .min(1, "Please select a project"),

  assigneeId: z.string().optional(), 

  status: z.enum([
    "TODO",
    "IN_PROGRESS",
    "IN_REVIEW",
    "COMPLETED",
    "BLOCKED",
  ]),

  priority: z.enum([
    "LOW",
    "MEDIUM",
    "HIGH",
    "URGENT",
  ]),

  dueDate: z.string().optional(),
});

type CreateTaskFormData = z.infer<
  typeof createTaskSchema
>;

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export default function CreateTaskModal({
  isOpen,
  onClose,
  onCreated,
}: CreateTaskModalProps) {
  const projectsQuery = useQuery({
    queryKey: ["task-project-options"],
    queryFn: () =>
      getProjects({
        page: 1,
        limit: 100,
      }),
    enabled: isOpen,
  });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<CreateTaskFormData>({
    resolver: zodResolver(createTaskSchema),

    defaultValues: {
      title: "",
      description: "",
      projectId: "",
      status: "TODO",
      priority: "MEDIUM",
      dueDate: "",
      assigneeId: "",
    },
  });

  const selectedProjectId = watch("projectId");


  const projectDetailsQuery = useQuery({
    queryKey: [
        "task-project-members",
        selectedProjectId,
    ],
    queryFn: () =>
        getProjectById(selectedProjectId),
    enabled:
        isOpen && Boolean(selectedProjectId),
    staleTime: 0,
    refetchOnMount: "always",
  });

  const selectedProject =
    projectsQuery.data?.projects.find(
      (project) =>
        project.id === selectedProjectId,
    );

  const createTaskMutation = useMutation({
    mutationFn: (input: CreateTaskInput) =>
      createTask(input),

    onSuccess: () => {
      reset();
      onCreated();
      onClose();
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        title: "",
        description: "",
        projectId: "",
         assigneeId: "",
        status: "TODO",
        priority: "MEDIUM",
        dueDate: "",
      });

      createTaskMutation.reset();
    }
  }, [isOpen, reset]);

  function handleClose() {
    if (createTaskMutation.isPending) {
      return;
    }

    reset();
    createTaskMutation.reset();
    onClose();
  }

  function onSubmit(data: CreateTaskFormData) {
    createTaskMutation.mutate({
      title: data.title,
      description:
        data.description || undefined,
      projectId: data.projectId,
      assigneeId: data.assigneeId || undefined,
      status: data.status,
      priority: data.priority,
      dueDate: data.dueDate || undefined,
    });
  }

  const errorMessage = axios.isAxiosError(
    createTaskMutation.error,
  )
    ? createTaskMutation.error.response?.data
        ?.message
    : null;

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4">
      <div className="my-8 w-full max-w-2xl rounded-xl border border-border bg-surface shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h2 className="text-xl font-bold text-text-primary">
              Create Task
            </h2>

            <p className="mt-1 text-sm text-text-secondary">
              Add a new task to one of your
              projects.
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={
              createTaskMutation.isPending
            }
            aria-label="Close modal"
            className="rounded-lg p-2 text-text-secondary transition hover:bg-background hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5 p-6"
        >
          <div>
            <label
              htmlFor="task-title"
              className="mb-2 block text-sm font-medium text-text-primary"
            >
              Task title
            </label>

            <input
              id="task-title"
              type="text"
              {...register("title")}
              placeholder="Enter task title"
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-text-primary outline-none transition focus:border-primary"
            />

            {errors.title && (
              <p className="mt-1 text-xs text-danger">
                {errors.title.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="task-description"
              className="mb-2 block text-sm font-medium text-text-primary"
            >
              Description
            </label>

            <textarea
              id="task-description"
              rows={4}
              {...register("description")}
              placeholder="Describe the task"
              className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-text-primary outline-none transition focus:border-primary"
            />

            {errors.description && (
              <p className="mt-1 text-xs text-danger">
                {errors.description.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="task-project"
              className="mb-2 block text-sm font-medium text-text-primary"
            >
              Project
            </label>

            <select
              id="task-project"
              {...register("projectId")}
              disabled={
                projectsQuery.isPending
              }
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-text-primary outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:opacity-60"
            >
              <option value="">
                {projectsQuery.isPending
                  ? "Loading projects..."
                  : "Select a project"}
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

            {errors.projectId && (
              <p className="mt-1 text-xs text-danger">
                {errors.projectId.message}
              </p>
            )}

            {projectsQuery.isError && (
              <p className="mt-1 text-xs text-danger">
                Unable to load projects.
              </p>
            )}

            {projectsQuery.data &&
              projectsQuery.data.projects.length ===
                0 && (
                <p className="mt-1 text-xs text-warning">
                  No projects are available. Create a
                  project first.
                </p>
              )}
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="task-status"
                className="mb-2 block text-sm font-medium text-text-primary"
              >
                Status
              </label>

              <select
                id="task-status"
                {...register("status")}
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-text-primary outline-none transition focus:border-primary"
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

              {errors.status && (
                <p className="mt-1 text-xs text-danger">
                  {errors.status.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="task-priority"
                className="mb-2 block text-sm font-medium text-text-primary"
              >
                Priority
              </label>

              <select
                id="task-priority"
                {...register("priority")}
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-text-primary outline-none transition focus:border-primary"
              >
                <option value="LOW">Low</option>

                <option value="MEDIUM">
                  Medium
                </option>

                <option value="HIGH">High</option>

                <option value="URGENT">
                  Urgent
                </option>
              </select>

              {errors.priority && (
                <p className="mt-1 text-xs text-danger">
                  {errors.priority.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="task-due-date"
              className="mb-2 block text-sm font-medium text-text-primary"
            >
              Due date
            </label>

            <input
              id="task-due-date"
              type="date"
              {...register("dueDate")}
              min={
                selectedProject?.startDate
                  ? new Date(
                      selectedProject.startDate,
                    )
                      .toISOString()
                      .split("T")[0]
                  : undefined
              }
              max={
                selectedProject?.endDate
                  ? new Date(
                      selectedProject.endDate,
                    )
                      .toISOString()
                      .split("T")[0]
                  : undefined
              }
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-text-primary outline-none transition focus:border-primary"
            />

            <p className="mt-1 text-xs text-text-secondary">
              The due date cannot be later than the
              project end date.
            </p>

            {errors.dueDate && (
              <p className="mt-1 text-xs text-danger">
                {errors.dueDate.message}
              </p>
            )}
          </div>

          <div>
            <label
                htmlFor="task-assignee"
                className="mb-2 block text-sm font-medium text-text-primary"
            >
                Assignee
            </label>

            <select
                id="task-assignee"
                {...register("assigneeId")}
                disabled={
                !selectedProjectId ||
                projectDetailsQuery.isPending
                }
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-text-primary outline-none focus:border-primary disabled:cursor-not-allowed disabled:opacity-60"
            >
                <option value="">
                {!selectedProjectId
                    ? "Select a project first"
                    : projectDetailsQuery.isPending
                    ? "Loading project members..."
                    : "Unassigned"}
                </option>

                {projectDetailsQuery.data?.members
                .filter(
                    (membership) =>
                    membership.user.isActive,
                )
                .map((membership) => (
                    <option
                    key={membership.user.id}
                    value={membership.user.id}
                    >
                    {membership.user.firstName}{" "}
                    {membership.user.lastName} —{" "}
                    {membership.user.role.replaceAll(
                        "_",
                        " ",
                    )}
                                </option>
                ))}
            </select>

            {projectDetailsQuery.data &&
                projectDetailsQuery.data.members.length ===
                0 && (
                <p className="mt-1 text-xs text-warning">
                    This project has no members available
                    for task assignment.
                </p>
                )}
          </div>

          {createTaskMutation.isError && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-danger">
              {errorMessage ||
                "Unable to create the task."}
            </div>
          )}

          <div className="flex justify-end gap-3 border-t border-border pt-5">
            <button
              type="button"
              onClick={handleClose}
              disabled={
                createTaskMutation.isPending
              }
              className="rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-text-primary transition hover:bg-background disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                createTaskMutation.isPending ||
                projectsQuery.isPending ||
                projectsQuery.data?.projects
                  .length === 0
              }
              className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              {createTaskMutation.isPending
                ? "Creating..."
                : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}