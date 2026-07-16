"use client";

import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { AlertTriangle, X } from "lucide-react";

import { deleteProject } from "@/services/project.service";
import type { Project } from "@/types/project";

interface DeleteProjectDialogProps {
  isOpen: boolean;
  project: Project | null;
  onClose: () => void;
  onDeleted: () => void;
}

export default function DeleteProjectDialog({
  isOpen,
  project,
  onClose,
  onDeleted,
}: DeleteProjectDialogProps) {
  const deleteMutation = useMutation({
    mutationFn: (projectId: string) =>
      deleteProject(projectId),

    onSuccess: () => {
      onDeleted();
      onClose();
    },
  });

  const errorMessage = axios.isAxiosError(
    deleteMutation.error,
  )
    ? deleteMutation.error.response?.data?.message
    : null;

  function handleClose() {
    if (deleteMutation.isPending) {
      return;
    }

    deleteMutation.reset();
    onClose();
  }

  if (!isOpen || !project) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-surface shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-lg font-bold">
            Delete Project
          </h2>

          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg p-2 text-text-secondary hover:bg-background"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-50 text-danger">
              <AlertTriangle size={22} />
            </div>

            <div>
              <p className="font-semibold">
                Delete this project?
              </p>

              <p className="mt-2 text-sm text-text-secondary">
                You are about to delete{" "}
                <span className="font-semibold text-text-primary">
                  {project.name}
                </span>
                .
              </p>

              <p className="mt-2 text-sm text-text-secondary">
                This action cannot be undone.
              </p>
            </div>
          </div>

          {deleteMutation.isError && (
            <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-danger">
              {errorMessage ||
                "Unable to delete the project."}
            </div>
          )}

          <div className="mt-6 flex justify-end gap-3 border-t border-border pt-5">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-lg border border-border px-4 py-2.5 font-semibold"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={deleteMutation.isPending}
              onClick={() =>
                deleteMutation.mutate(project.id)
              }
              className="rounded-lg bg-danger px-4 py-2.5 font-semibold text-white disabled:opacity-60"
            >
              {deleteMutation.isPending
                ? "Deleting..."
                : "Delete Project"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}