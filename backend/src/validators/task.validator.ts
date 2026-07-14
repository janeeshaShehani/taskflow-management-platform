import { z } from "zod";
import {
  TaskPriority,
  TaskStatus,
} from "../generated/prisma/client.js";

export const createTaskSchema = z.object({
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

export const getTasksQuerySchema = z.object({
  page: z.coerce
    .number()
    .int()
    .positive()
    .default(1),

  limit: z.coerce
    .number()
    .int()
    .positive()
    .max(100)
    .default(10),

  search: z
    .string()
    .trim()
    .optional(),

  status: z
    .nativeEnum(TaskStatus)
    .optional(),

  priority: z
    .nativeEnum(TaskPriority)
    .optional(),

  projectId: z
    .string()
    .uuid("Project ID must be a valid UUID")
    .optional(),

  assigneeId: z
    .string()
    .uuid("Assignee ID must be a valid UUID")
    .optional(),

  overdue: z
    .enum(["true", "false"])
    .transform((value) => value === "true")
    .optional(),
});

export type GetTasksQuery = z.infer<
  typeof getTasksQuerySchema
>;

export const updateTaskSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(3, "Task title must contain at least 3 characters")
      .max(150, "Task title cannot exceed 150 characters")
      .optional(),

    description: z
      .string()
      .trim()
      .max(2000, "Task description cannot exceed 2000 characters")
      .nullable()
      .optional(),

    priority: z
      .nativeEnum(TaskPriority)
      .optional(),

    dueDate: z.coerce
      .date()
      .nullable()
      .optional(),

    assigneeId: z
      .string()
      .uuid("Assignee ID must be a valid UUID")
      .nullable()
      .optional(),
  })
  .refine(
    (data) => Object.keys(data).length > 0,
    {
      message: "At least one field must be provided",
    },
  );

export type UpdateTaskInput = z.infer<
  typeof updateTaskSchema
>;

export const updateTaskStatusSchema = z.object({
  status: z.nativeEnum(TaskStatus),
});

export type UpdateTaskStatusInput = z.infer<
  typeof updateTaskStatusSchema
>;