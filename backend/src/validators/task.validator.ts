import { z } from "zod";
import {
  TaskPriority,
  TaskStatus,
} from "../generated/prisma/client.js";

export const createTaskSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(3, "Task title must contain at least 3 characters")
      .max(150, "Task title cannot exceed 150 characters"),

    description: z
      .string()
      .trim()
      .max(2000, "Task description cannot exceed 2000 characters")
      .optional(),

    status: z
      .nativeEnum(TaskStatus)
      .default(TaskStatus.TODO),

    priority: z
      .nativeEnum(TaskPriority)
      .default(TaskPriority.MEDIUM),

    dueDate: z.coerce.date().optional(),

    projectId: z
      .string()
      .uuid("Project ID must be a valid UUID"),

    assigneeId: z
      .string()
      .uuid("Assignee ID must be a valid UUID")
      .optional(),
  });

export type CreateTaskInput = z.infer<
  typeof createTaskSchema
>;