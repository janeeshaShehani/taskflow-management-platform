"use client";

import { useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { X } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { updateProject } from "@/services/project.service";
import { getUsers } from "@/services/user.service";
import type {
  Project,
  UpdateProjectInput,
} from "@/types/project";

const editProjectSchema = z
  .object({
    name: z.string().trim().min(3).max(100),
    description: z.string().trim().max(1000).optional(),

    status: z.enum([
      "PLANNING",
      "ACTIVE",
      "ON_HOLD",
      "COMPLETED",
      "CANCELLED",
    ]),

    startDate: z.string().optional(),
    endDate: z.string().optional(),
    managerId: z.string().optional(),
  })
  .refine(
    (data) => {
      if (!data.startDate || !data.endDate) {
        return true;
      }

      return new Date(data.endDate) >= new Date(data.startDate);
    },
    {
      message: "End date cannot be before the start date",
      path: ["endDate"],
    },
  );

type EditProjectFormData = z.infer<
  typeof editProjectSchema
>;

interface EditProjectModalProps {
  isOpen: boolean;
  project: Project | null;
  currentUserRole:
    | "ADMIN"
    | "PROJECT_MANAGER"
    | "TEAM_MEMBER";
  onClose: () => void;
  onUpdated: () => void;
}

function formatDateForInput(date: string | null) {
  if (!date) {
    return "";
  }

  return new Date(date).toISOString().split("T")[0];
}

export default function EditProjectModal({
  isOpen,
  project,
   currentUserRole,
  onClose,
  onUpdated,
}: EditProjectModalProps) {
  const managersQuery = useQuery({
    queryKey: ["project-managers"],
    queryFn: () =>
      getUsers({
        page: 1,
        limit: 100,
        role: "PROJECT_MANAGER",
        isActive: true,
      }),
    enabled: isOpen && currentUserRole === "ADMIN",
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditProjectFormData>({
    resolver: zodResolver(editProjectSchema),
  });

  const updateMutation = useMutation({
    mutationFn: ({
      projectId,
      input,
    }: {
      projectId: string;
      input: UpdateProjectInput;
    }) => updateProject(projectId, input),

    onSuccess: () => {
      onUpdated();
      onClose();
    },
  });

  useEffect(() => {
    if (isOpen && project) {
      reset({
        name: project.name,
        description: project.description || "",
        status: project.status,
        startDate: formatDateForInput(project.startDate),
        endDate: formatDateForInput(project.endDate),
        managerId: project.manager?.id ?? "",
      });

      updateMutation.reset();
    }
  }, [isOpen, project, reset]);

  function handleClose() {
    if (updateMutation.isPending) {
      return;
    }

    updateMutation.reset();
    onClose();
  }

  function onSubmit(data: EditProjectFormData) {
    if (!project) {
        return;
    }

    const input: UpdateProjectInput = {
        name: data.name,
        description: data.description || "",
        status: data.status,
        startDate: data.startDate || null,
        endDate: data.endDate || null,
    };

    if (currentUserRole === "ADMIN" && data.managerId) {
        input.managerId = data.managerId;
    }

    updateMutation.mutate({
        projectId: project.id,
        input,
    });
  }

  const errorMessage = axios.isAxiosError(
    updateMutation.error,
  )
    ? updateMutation.error.response?.data?.message
    : null;

  if (!isOpen || !project) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4">
      <div className="my-8 w-full max-w-2xl rounded-xl border border-border bg-surface shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h2 className="text-xl font-bold text-text-primary">
              Edit Project
            </h2>

            <p className="mt-1 text-sm text-text-secondary">
              Update project information.
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg p-2 text-text-secondary hover:bg-background"
          >
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5 p-6"
        >
          <div>
            <label className="mb-2 block text-sm font-medium">
              Project name
            </label>

            <input
              type="text"
              {...register("name")}
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 outline-none focus:border-primary"
            />

            {errors.name && (
              <p className="mt-1 text-xs text-danger">
                {errors.name.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Description
            </label>

            <textarea
              rows={4}
              {...register("description")}
              className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2.5 outline-none focus:border-primary"
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
                <label
                    htmlFor="edit-project-manager"
                    className="mb-2 block text-sm font-medium text-text-primary"
                >
                    Project manager
                </label>

                {currentUserRole === "ADMIN" ? (
                    <>
                    <select
                        id="edit-project-manager"
                        {...register("managerId")}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
                    >
                        <option value="">Select manager</option>

                        {managersQuery.data?.users.map((manager) => (
                        <option
                            key={manager.id}
                            value={manager.id}
                        >
                            {manager.firstName} {manager.lastName}
                        </option>
                        ))}
                    </select>

                    {errors.managerId && (
                        <p className="mt-1 text-xs text-danger">
                        {errors.managerId.message}
                        </p>
                    )}
                    </>
                ) : (
                    <input
                    type="text"
                    value={
                        project.manager
                        ? `${project.manager.firstName} ${project.manager.lastName}`
                        : "Current project manager"
                    }
                    disabled
                    className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-text-secondary"
                    />
                )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Status
              </label>

              <select
                {...register("status")}
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5"
              >
                <option value="PLANNING">Planning</option>
                <option value="ACTIVE">Active</option>
                <option value="ON_HOLD">On Hold</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Start date
              </label>

              <input
                type="date"
                {...register("startDate")}
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                End date
              </label>

              <input
                type="date"
                {...register("endDate")}
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5"
              />

              {errors.endDate && (
                <p className="mt-1 text-xs text-danger">
                  {errors.endDate.message}
                </p>
              )}
            </div>
          </div>

          {updateMutation.isError && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-danger">
              {errorMessage ||
                "Unable to update the project."}
            </div>
          )}

          <div className="flex justify-end gap-3 border-t border-border pt-5">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-lg border border-border px-4 py-2.5 font-semibold"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="rounded-lg bg-primary px-4 py-2.5 font-semibold text-white disabled:opacity-60"
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