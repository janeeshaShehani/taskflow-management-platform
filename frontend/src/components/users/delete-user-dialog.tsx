"use client";

import { useMutation } from "@tanstack/react-query";
import { AlertTriangle, X } from "lucide-react";

import { deleteUser } from "@/services/user.service";
import type { User } from "@/types/user";

interface DeleteUserDialogProps {
  isOpen: boolean;
  user: User | null;
  onClose: () => void;
  onDeleted: () => void;
}

export default function DeleteUserDialog({
  isOpen,
  user,
  onClose,
  onDeleted,
}: DeleteUserDialogProps) {
  const deleteMutation = useMutation({
    mutationFn: (userId: string) => deleteUser(userId),

    onSuccess: () => {
      onDeleted();
      onClose();
    },
  });

  function handleClose() {
    if (deleteMutation.isPending) {
      return;
    }

    deleteMutation.reset();
    onClose();
  }

  function handleDelete() {
    if (!user) {
      return;
    }

    deleteMutation.mutate(user.id);
  }

  if (!isOpen || !user) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-surface shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-lg font-bold text-text-primary">
            Delete User
          </h2>

          <button
            type="button"
            onClick={handleClose}
            disabled={deleteMutation.isPending}
            className="rounded-lg p-2 text-text-secondary hover:bg-background hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Close dialog"
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
              <p className="font-semibold text-text-primary">
                Are you sure you want to delete this user?
              </p>

              <p className="mt-2 text-sm text-text-secondary">
                You are about to delete{" "}
                <span className="font-semibold text-text-primary">
                  {user.firstName} {user.lastName}
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
              Unable to delete this user. The user may manage projects,
              own tasks, or be protected by an administrator rule.
            </div>
          )}

          <div className="mt-6 flex justify-end gap-3 border-t border-border pt-5">
            <button
              type="button"
              onClick={handleClose}
              disabled={deleteMutation.isPending}
              className="rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-text-primary hover:bg-background disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="rounded-lg bg-danger px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {deleteMutation.isPending
                ? "Deleting..."
                : "Delete User"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}