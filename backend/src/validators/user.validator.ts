import { z } from "zod";
import { UserRole } from "../generated/prisma/client.js";

export const createUserSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(2, "First name must contain at least 2 characters")
    .max(50, "First name cannot exceed 50 characters"),

  lastName: z
    .string()
    .trim()
    .min(2, "Last name must contain at least 2 characters")
    .max(50, "Last name cannot exceed 50 characters"),

  email: z
    .string()
    .trim()
    .email("Please enter a valid email address")
    .transform((email) => email.toLowerCase()),

  password: z
    .string()
    .min(8, "Password must contain at least 8 characters")
    .regex(/[A-Z]/, "Password must contain an uppercase letter")
    .regex(/[a-z]/, "Password must contain a lowercase letter")
    .regex(/[0-9]/, "Password must contain a number")
    .regex(
      /[^A-Za-z0-9]/,
      "Password must contain a special character",
    ),

  role: z.nativeEnum(UserRole),
});

export const updateUserSchema = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(2, "First name must contain at least 2 characters")
      .max(50, "First name cannot exceed 50 characters")
      .optional(),

    lastName: z
      .string()
      .trim()
      .min(2, "Last name must contain at least 2 characters")
      .max(50, "Last name cannot exceed 50 characters")
      .optional(),

    email: z
      .string()
      .trim()
      .email("Please enter a valid email address")
      .transform((email) => email.toLowerCase())
      .optional(),

    role: z.nativeEnum(UserRole).optional(),
  })
  .refine(
    (data) => Object.keys(data).length > 0,
    {
      message: "At least one field must be provided",
    },
  );

export type CreateUserInput = z.infer<typeof createUserSchema>;