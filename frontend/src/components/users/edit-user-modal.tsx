"use client";

import { useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { updateUser ,updateUserStatus,} from "@/services/user.service";
import type { UpdateUserInput, User } from "@/types/user";

const editUserSchema = z.object({
  firstName: z
    .string()
    .min(2, "First name must contain at least 2 characters"),

  lastName: z
    .string()
    .min(2, "Last name must contain at least 2 characters"),

  email: z
    .string()
    .email("Enter a valid email address"),

  role: z.enum([
    "ADMIN",
    "PROJECT_MANAGER",
    "TEAM_MEMBER",
  ]),

  isActive: z.boolean(),
});

type EditUserFormData = z.infer<typeof editUserSchema>;

interface EditUserModalProps {
  isOpen: boolean;
  user: User | null;
  onClose: () => void;
  onUpdated: () => void;
}

export default function EditUserModal({
  isOpen,
  user,
  onClose,
  onUpdated,
}: EditUserModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<EditUserFormData>({
    resolver: zodResolver(editUserSchema),
  });
  const isActive = watch("isActive");

    const updateUserMutation = useMutation({
    mutationFn: async ({
        userId,
        input,
        originalStatus,
    }: {
        userId: string;
        input: UpdateUserInput & {
        isActive: boolean;
        };
        originalStatus: boolean;
    }) => {
        const {
        isActive,
        ...profileInput
        } = input;

        await updateUser(userId, profileInput);

        if (isActive !== originalStatus) {
        await updateUserStatus(userId, {
            isActive,
        });
        }
    },

    onSuccess: () => {
        onUpdated();
        onClose();
    },
    });

  useEffect(() => {
    if (isOpen && user) {
      reset({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      });

      updateUserMutation.reset();
    }
  }, [isOpen, user, reset]);

  function handleClose() {
    if (updateUserMutation.isPending) {
      return;
    }

    updateUserMutation.reset();
    onClose();
  }

  function onSubmit(data: EditUserFormData) {
    if (!user) {
      return;
    }
    
    updateUserMutation.mutate({
      userId: user.id,
      input: data,
      originalStatus: user.isActive,
    });
  }

  if (!isOpen || !user) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-xl border border-border bg-surface shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h2 className="text-xl font-bold text-text-primary">
              Edit User
            </h2>

            <p className="mt-1 text-sm text-text-secondary">
              Update the selected user&apos;s information.
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={updateUserMutation.isPending}
            className="rounded-lg p-2 text-text-secondary hover:bg-background hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5 p-6"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="edit-firstName"
                className="mb-2 block text-sm font-medium text-text-primary"
              >
                First name
              </label>

              <input
                id="edit-firstName"
                type="text"
                {...register("firstName")}
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-text-primary outline-none focus:border-primary"
              />

              {errors.firstName && (
                <p className="mt-1 text-xs text-danger">
                  {errors.firstName.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="edit-lastName"
                className="mb-2 block text-sm font-medium text-text-primary"
              >
                Last name
              </label>

              <input
                id="edit-lastName"
                type="text"
                {...register("lastName")}
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-text-primary outline-none focus:border-primary"
              />

              {errors.lastName && (
                <p className="mt-1 text-xs text-danger">
                  {errors.lastName.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="edit-email"
              className="mb-2 block text-sm font-medium text-text-primary"
            >
              Email address
            </label>

            <input
              id="edit-email"
              type="email"
              {...register("email")}
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-text-primary outline-none focus:border-primary"
            />

            {errors.email && (
              <p className="mt-1 text-xs text-danger">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="edit-role"
              className="mb-2 block text-sm font-medium text-text-primary"
            >
              Role
            </label>

            <select
              id="edit-role"
              {...register("role")}
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-text-primary outline-none focus:border-primary"
            >
              <option value="TEAM_MEMBER">
                Team Member
              </option>

              <option value="PROJECT_MANAGER">
                Project Manager
              </option>

              <option value="ADMIN">
                Administrator
              </option>
            </select>
          </div>

          <div>
            <label
              htmlFor="edit-isActive"
              className="flex items-center gap-3 rounded-lg border border-border bg-background p-4"
            >
              <input
                id="edit-isActive"
                type="checkbox"
                {...register("isActive")}
                className="h-4 w-4 accent-primary"
              />

              <div>
                <p className="text-sm font-semibold text-text-primary">
                  {isActive ? "Active account" : "Inactive account"}
                </p>

                <p className="mt-1 text-xs text-text-secondary">
                  {isActive
                    ? "This user can sign in to the system."
                    : "This user cannot sign in until the account is activated."}
                </p>
              </div>
            </label>
          </div>

          {updateUserMutation.isError && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-danger">
              Unable to update the user. Check the entered details and try again.
            </div>
          )}

          <div className="flex justify-end gap-3 border-t border-border pt-5">
            <button
              type="button"
              onClick={handleClose}
              disabled={updateUserMutation.isPending}
              className="rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-text-primary hover:bg-background disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={updateUserMutation.isPending}
              className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              {updateUserMutation.isPending
                ? "Updating..."
                : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}