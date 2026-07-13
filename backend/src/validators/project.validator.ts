import { z } from "zod";
import { ProjectStatus } from "../generated/prisma/client.js";

export const createProjectSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(3, "Project name must contain at least 3 characters")
      .max(100, "Project name cannot exceed 100 characters"),

    code: z
      .string()
      .trim()
      .min(2, "Project code must contain at least 2 characters")
      .max(20, "Project code cannot exceed 20 characters")
      .regex(
        /^[A-Za-z0-9_-]+$/,
        "Project code may contain only letters, numbers, underscores, and hyphens",
      )
      .transform((code) => code.toUpperCase()),

    description: z
      .string()
      .trim()
      .max(1000, "Description cannot exceed 1000 characters")
      .optional(),

    status: z
      .nativeEnum(ProjectStatus)
      .default(ProjectStatus.PLANNING),

    startDate: z.coerce.date(),

    endDate: z.coerce.date().optional(),

    managerId: z
      .string()
      .uuid("Manager ID must be a valid UUID")
      .optional(),
  })
  .refine(
    (data) => {
      if (!data.endDate) {
        return true;
      }

      return data.endDate >= data.startDate;
    },
    {
      message: "End date must be after or equal to the start date",
      path: ["endDate"],
    },
  );

export type CreateProjectInput = z.infer<
  typeof createProjectSchema
>;