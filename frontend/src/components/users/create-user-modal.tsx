"use client";

import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import axios from "axios";
import { createUser } from "@/services/user.service";
import type { CreateUserInput } from "@/types/user";

const createUserSchema = z.object({
  firstName: z
    .string()
    .min(2, "First name must contain at least 2 characters"),

  lastName: z
    .string()
    .min(2, "Last name must contain at least 2 characters"),

  email: z
    .string()
    .email("Enter a valid email address"),

  password: z
    .string()
    .min(8, "Password must contain at least 8 characters")
    .regex(
        /[A-Z]/,
        "Password must contain an uppercase letter",
    )
    .regex(
        /[a-z]/,
        "Password must contain a lowercase letter",
    )
    .regex(
        /[0-9]/,
        "Password must contain a number",
    )
    .regex(
        /[^A-Za-z0-9]/,
        "Password must contain a special character",
    ),

  role: z.enum([
    "ADMIN",
    "PROJECT_MANAGER",
    "TEAM_MEMBER",
  ]),
});

type CreateUserFormData = z.infer<
  typeof createUserSchema
>;

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export default function CreateUserModal({
  isOpen,
  onClose,
  onCreated,
}: CreateUserModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      role: "TEAM_MEMBER",
    },
  });

  const [emailReadOnly, setEmailReadOnly] = useState(true);
  const [passwordReadOnly, setPasswordReadOnly] = useState(true);

  const createUserMutation = useMutation({
    mutationFn: (input: CreateUserInput) =>
      createUser(input),

    onSuccess: () => {
      reset();
      onCreated();
      onClose();
    },
  });

  useEffect(() => {
  reset({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "TEAM_MEMBER",
  });
  
  setPasswordReadOnly(true);
  setEmailReadOnly(true);
  createUserMutation.reset();

}, [isOpen, reset]);

  function handleClose() {
    if (createUserMutation.isPending) {
      return;
    }

    reset();
    createUserMutation.reset();
    onClose();
  }

  function onSubmit(data: CreateUserFormData) {
    createUserMutation.mutate(data);
  }

  if (!isOpen) {
    return null;
  }

  const createErrorMessage = axios.isAxiosError(
    createUserMutation.error,
  )
    ? createUserMutation.error.response?.data?.message
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-xl border border-border bg-surface shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h2 className="text-xl font-bold text-text-primary">
              Create User
            </h2>

            <p className="mt-1 text-sm text-text-secondary">
              Add a new user to the TaskFlow system.
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={createUserMutation.isPending}
            className="rounded-lg p-2 text-text-secondary hover:bg-background hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5 p-6"
          autoComplete="off"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="firstName"
                className="mb-2 block text-sm font-medium text-text-primary"
              >
                First name
              </label>

              <input
                id="firstName"
                type="text"
                {...register("firstName")}
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-text-primary outline-none focus:border-primary"
                placeholder="Enter First Name"
              />

              {errors.firstName && (
                <p className="mt-1 text-xs text-danger">
                  {errors.firstName.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="lastName"
                className="mb-2 block text-sm font-medium text-text-primary"
              >
                Last name
              </label>

              <input
                id="lastName"
                type="text"
                {...register("lastName")}
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-text-primary outline-none focus:border-primary"
                placeholder="Enter First Name"
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
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-text-primary"
            >
              Email address
            </label>

            <input
              id="email"
              type="email"
              readOnly={emailReadOnly}
              onFocus={() => setEmailReadOnly(false)}
              autoComplete="off"
              {...register("email")}
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-text-primary outline-none focus:border-primary"
              placeholder="user@example.com"
            />

            {errors.email && (
              <p className="mt-1 text-xs text-danger">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-text-primary"
            >
              Temporary password
            </label>

            <input
              id="password"
              type="password"
              readOnly={passwordReadOnly}
              onFocus={() => setPasswordReadOnly(false)}
              autoComplete="off"
              {...register("password")}
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-text-primary outline-none focus:border-primary"
              placeholder="Example: Admin@123"
            />

            {errors.password && (
              <p className="mt-1 text-xs text-danger">
                {errors.password.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="role"
              className="mb-2 block text-sm font-medium text-text-primary"
            >
              Role
            </label>

            <select
              id="role"
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
                Admin
              </option>
            </select>

            {errors.role && (
              <p className="mt-1 text-xs text-danger">
                {errors.role.message}
              </p>
            )}
          </div>

          {createUserMutation.isError && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-danger">
              {createErrorMessage || "Unable to create the user."}
            </div>
          )}

          <div className="flex justify-end gap-3 border-t border-border pt-5">
            <button
              type="button"
              onClick={handleClose}
              disabled={createUserMutation.isPending}
              className="rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-text-primary hover:bg-background disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={createUserMutation.isPending}
              className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              {createUserMutation.isPending
                ? "Creating..."
                : "Create User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}