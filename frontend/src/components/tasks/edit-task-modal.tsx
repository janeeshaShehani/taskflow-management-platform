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

import { getProjectById, getProjects, } from "@/services/project.service";
import { updateTask } from "@/services/task.service";
import type {
  Task,
  UpdateTaskInput,
} from "@/types/task";

const editTaskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Task title must contain at least 3 characters")
    .max(150, "Task title cannot exceed 150 characters"),

  description: z
    .string()
    .trim()
    .max(2000, "Description cannot exceed 2000 characters")
    .optional(),

  priority: z.enum([
    "LOW",
    "MEDIUM",
    "HIGH",
    "URGENT",
  ]),

  assigneeId: z.string().optional(),

  dueDate: z.string().optional(),
});

type EditTaskFormData = z.infer<
  typeof editTaskSchema
>;

interface EditTaskModalProps {
  isOpen: boolean;
  task: Task | null;
  onClose: () => void;
  onUpdated: () => void;
}

function formatDateForInput(date: string | null) {
  if (!date) {
    return "";
  }

  return new Date(date)
    .toISOString()
    .split("T")[0];
}

export default function EditTaskModal({
  isOpen,
  task,
  onClose,
  onUpdated,
}: EditTaskModalProps) {
  const projectsQuery = useQuery({
    queryKey: ["task-project-options"],
    queryFn: () =>
      getProjects({
        page: 1,
        limit: 100,
      }),
    enabled: isOpen,
  });

  const projectDetailsQuery = useQuery({
    queryKey: [
        "edit-task-project-members",
        task?.project.id,
    ],
    queryFn: () =>
        getProjectById(task!.project.id),
    enabled:
        isOpen &&
        Boolean(task?.project.id),
         staleTime: 0,
         refetchOnMount: "always",
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditTaskFormData>({
    resolver: zodResolver(editTaskSchema),
  });

  const updateMutation = useMutation({
    mutationFn: ({
      taskId,
      input,
    }: {
      taskId: string;
      input: UpdateTaskInput;
    }) => updateTask(taskId, input),

    onSuccess: () => {
      onUpdated();
      onClose();
    },
  });

  useEffect(() => {
    if (isOpen && task) {
      reset({
        title: task.title,
        description: task.description ?? "",
        priority: task.priority,
        dueDate: formatDateForInput(task.dueDate),
        assigneeId: task.assignee?.id ?? "",
      });

      updateMutation.reset();
    }
  }, [isOpen, task, reset]);

  function handleClose() {
    if (updateMutation.isPending) {
      return;
    }

    updateMutation.reset();
    onClose();
  }

  function onSubmit(data: EditTaskFormData) {
    if (!task) {
      return;
    }

    updateMutation.mutate({
      taskId: task.id,
      input: {
        title: data.title,
        description: data.description || null,
        priority: data.priority,
        dueDate: data.dueDate || null,
        assigneeId: data.assigneeId || null,
      },
    });
  }

  const errorMessage = axios.isAxiosError(
    updateMutation.error,
  )
    ? updateMutation.error.response?.data?.message
    : null;

  const selectedProject =
    projectsQuery.data?.projects.find(
      (project) =>
        project.id === task?.project.id,
    );

  if (!isOpen || !task) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4">
      <div className="my-8 w-full max-w-2xl rounded-xl border border-border bg-surface shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h2 className="text-xl font-bold text-text-primary">
              Edit Task
            </h2>

            <p className="mt-1 text-sm text-text-secondary">
              Update task details.
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={updateMutation.isPending}
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
              htmlFor="edit-task-title"
              className="mb-2 block text-sm font-medium text-text-primary"
            >
              Task title
            </label>

            <input
              id="edit-task-title"
              type="text"
              {...register("title")}
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
              htmlFor="edit-task-description"
              className="mb-2 block text-sm font-medium text-text-primary"
            >
              Description
            </label>

            <textarea
              id="edit-task-description"
              rows={4}
              {...register("description")}
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
              className="mb-2 block text-sm font-medium text-text-primary"
            >
              Project
            </label>

            <input
              type="text"
              value={`${task.project.name} (${task.project.code})`}
              disabled
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-text-secondary"
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="edit-task-priority"
                className="mb-2 block text-sm font-medium text-text-primary"
              >
                Priority
              </label>

              <select
                id="edit-task-priority"
                {...register("priority")}
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-text-primary outline-none transition focus:border-primary"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>

              {errors.priority && (
                <p className="mt-1 text-xs text-danger">
                  {errors.priority.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="edit-task-due-date"
                className="mb-2 block text-sm font-medium text-text-primary"
              >
                Due date
              </label>

              <input
                id="edit-task-due-date"
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

              {errors.dueDate && (
                <p className="mt-1 text-xs text-danger">
                  {errors.dueDate.message}
                </p>
              )}
            </div>
          </div>

          <div>
                <label
                    htmlFor="edit-task-assignee"
                    className="mb-2 block text-sm font-medium text-text-primary"
                >
                    Assignee
                </label>

                <select
                    id="edit-task-assignee"
                    {...register("assigneeId")}
                    disabled={projectDetailsQuery.isPending}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-text-primary outline-none focus:border-primary disabled:cursor-not-allowed disabled:opacity-60"
                >
                    <option value="">
                    {projectDetailsQuery.isPending
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
                        {membership.user.role.replaceAll("_", " ")}
                        </option>
                    ))}
                </select>

                {projectDetailsQuery.isError && (
                    <p className="mt-1 text-xs text-danger">
                    Unable to load project members.
                    </p>
                )}
            </div>

          {updateMutation.isError && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-danger">
              {errorMessage ||
                "Unable to update the task."}
            </div>
          )}

          <div className="flex justify-end gap-3 border-t border-border pt-5">
            <button
              type="button"
              onClick={handleClose}
              disabled={updateMutation.isPending}
              className="rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-text-primary transition hover:bg-background disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              {updateMutation.isPending
                ? "Updating..."
                : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}