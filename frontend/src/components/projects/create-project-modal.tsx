"use client";

import { useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { X } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { createProject } from "@/services/project.service";
import { getUsers } from "@/services/user.service";
import type { CreateProjectInput } from "@/types/project";

const createProjectSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(3, "Project name must contain at least 3 characters")
      .max(100, "Project name cannot exceed 100 characters"),

    code: z
      .string()
      .min(2, "Project code is required")
      .max(20),
        
    description: z
      .string()
      .trim()
      .max(1000, "Description cannot exceed 1000 characters")
      .optional(),

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

type CreateProjectFormData = z.infer<
  typeof createProjectSchema
>;

interface CreateProjectModalProps {
  isOpen: boolean;
  currentUserId: string;
  currentUserRole: "ADMIN" | "PROJECT_MANAGER" | "TEAM_MEMBER";
  onClose: () => void;
  onCreated: () => void;
}

export default function CreateProjectModal({
  isOpen,
  onClose,
  onCreated,
  currentUserId,
  currentUserRole,
}: CreateProjectModalProps) {
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
  } = useForm<CreateProjectFormData>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: "",
      description: "",
      status: "PLANNING",
      startDate: "",
      endDate: "",
      managerId: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: (input: CreateProjectInput) =>
      createProject(input),

    onSuccess: () => {
      reset();
      onCreated();
      onClose();
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        name: "",
        description: "",
        status: "PLANNING",
        startDate: "",
        endDate: "",
        managerId: "",
      });

      createMutation.reset();
    }
  }, [isOpen, reset]);

  function handleClose() {
    if (createMutation.isPending) {
      return;
    }

    createMutation.reset();
    onClose();
  }

  function onSubmit(data: CreateProjectFormData) {

    const managerId =
        currentUserRole === "PROJECT_MANAGER"
        ? currentUserId
        : data.managerId;

    if (!managerId) {
        return;
    }

    createMutation.mutate({
      name: data.name,
      code: data.code,
      description: data.description || undefined,
      status: data.status,
      startDate: data.startDate || undefined,
      endDate: data.endDate || undefined,
      managerId,
    });
  }

  const errorMessage = axios.isAxiosError(
    createMutation.error,
  )
    ? createMutation.error.response?.data?.message
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
              Create Project
            </h2>

            <p className="mt-1 text-sm text-text-secondary">
              Add a new project to TaskFlow.
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={createMutation.isPending}
            className="rounded-lg p-2 text-text-secondary hover:bg-background"
            aria-label="Close modal"
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
              htmlFor="project-name"
              className="mb-2 block text-sm font-medium text-text-primary"
            >
              Project name
            </label>

            <input
              id="project-name"
              type="text"
              {...register("name")}
              placeholder="Enter project name"
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
            />

            {errors.name && (
              <p className="mt-1 text-xs text-danger">
                {errors.name.message}
              </p>
            )}
          </div>

          <div>
            <label
                htmlFor="code"
                className="mb-2 block text-sm font-medium text-text-primary"
            >
                Project Code
            </label>

            <input
                id="code"
                type="text"
                placeholder="HOTEL01"
                {...register("code")}
                className="w-full rounded-lg border border-border px-3 py-2.5"
            />

            {errors.code && (
                <p className="mt-1 text-xs text-danger">
                {errors.code.message}
                </p>
            )}
          </div>

          <div>
            <label
              htmlFor="project-description"
              className="mb-2 block text-sm font-medium text-text-primary"
            >
              Description
            </label>

            <textarea
              id="project-description"
              rows={4}
              {...register("description")}
              placeholder="Describe the project"
              className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
            />

            {errors.description && (
              <p className="mt-1 text-xs text-danger">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
                <label
                    htmlFor="project-manager"
                    className="mb-2 block text-sm font-medium text-text-primary"
                >
                    Project manager
                </label>

                {currentUserRole === "ADMIN" ? (
                    <>
                    <select
                        id="project-manager"
                        {...register("managerId")}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
                    >
                        <option value="">
                        Select a project manager
                        </option>

                        {managersQuery.data?.users.map((manager) => (
                        <option key={manager.id} value={manager.id}>
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
                    value="You will manage this project"
                    disabled
                    className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-text-secondary"
                    />
                )}
                            
            </div>

            <div>
              <label
                htmlFor="project-status"
                className="mb-2 block text-sm font-medium text-text-primary"
              >
                Status
              </label>

              <select
                id="project-status"
                {...register("status")}
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
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
              <label
                htmlFor="project-start-date"
                className="mb-2 block text-sm font-medium text-text-primary"
              >
                Start date
              </label>

              <input
                id="project-start-date"
                type="date"
                {...register("startDate")}
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
              />
            </div>

            <div>
              <label
                htmlFor="project-end-date"
                className="mb-2 block text-sm font-medium text-text-primary"
              >
                End date
              </label>

              <input
                id="project-end-date"
                type="date"
                {...register("endDate")}
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
              />

              {errors.endDate && (
                <p className="mt-1 text-xs text-danger">
                  {errors.endDate.message}
                </p>
              )}
            </div>
          </div>

          {createMutation.isError && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-danger">
              {errorMessage ||
                "Unable to create the project."}
            </div>
          )}

          <div className="flex justify-end gap-3 border-t border-border pt-5">
            <button
              type="button"
              onClick={handleClose}
              disabled={createMutation.isPending}
              className="rounded-lg border border-border px-4 py-2.5 text-sm font-semibold"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={createMutation.isPending}
              className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
            >
              {createMutation.isPending
                ? "Creating..."
                : "Create Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}