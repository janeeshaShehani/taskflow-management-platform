import type { Request, Response } from "express";
import {
  createTask,
  deleteTask,
  findTaskById,
  findTasks,
  updateTask,
  updateTaskStatus,
} from "../services/task.service.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  createTaskSchema,
  getTasksQuerySchema,
  updateTaskSchema,
  updateTaskStatusSchema,
} from "../validators/task.validator.js";

export const createNewTask = asyncHandler(
  async (
    req: Request,
    res: Response,
  ): Promise<void> => {
    if (!req.user) {
      throw new ApiError(
        401,
        "Authentication is required",
      );
    }

    const validationResult =
      createTaskSchema.safeParse(req.body);

    if (!validationResult.success) {
      throw new ApiError(
        400,
        validationResult.error.issues
          .map((issue) => issue.message)
          .join(", "),
      );
    }

    const task = await createTask(
      validationResult.data,
      {
        currentUserId: req.user.id,
        currentUserRole: req.user.role,
      },
    );

    res.status(201).json(
      new ApiResponse(
        "Task created successfully",
        {
          task,
        },
      ),
    );
  },
);

export const getTasks = asyncHandler(
  async (
    req: Request,
    res: Response,
  ): Promise<void> => {
    if (!req.user) {
      throw new ApiError(
        401,
        "Authentication is required",
      );
    }

    const validationResult =
      getTasksQuerySchema.safeParse(req.query);

    if (!validationResult.success) {
      throw new ApiError(
        400,
        validationResult.error.issues
          .map((issue) => issue.message)
          .join(", "),
      );
    }

    const result = await findTasks(
      validationResult.data,
      {
        currentUserId: req.user.id,
        currentUserRole: req.user.role,
      },
    );

    res.status(200).json(
      new ApiResponse(
        "Tasks retrieved successfully",
        result,
      ),
    );
  },
);

export const getTaskById = asyncHandler(
  async (
    req: Request,
    res: Response,
  ): Promise<void> => {
    const id = req.params.id;

    if (
      typeof id !== "string" ||
      id.trim() === ""
    ) {
      throw new ApiError(
        400,
        "Task ID is required",
      );
    }

    if (!req.user) {
      throw new ApiError(
        401,
        "Authentication is required",
      );
    }

    const task = await findTaskById(id, {
      currentUserId: req.user.id,
      currentUserRole: req.user.role,
    });

    res.status(200).json(
      new ApiResponse(
        "Task retrieved successfully",
        {
          task,
        },
      ),
    );
  },
);

export const updateExistingTask = asyncHandler(
  async (
    req: Request,
    res: Response,
  ): Promise<void> => {
    const id = req.params.id;

    if (
      typeof id !== "string" ||
      id.trim() === ""
    ) {
      throw new ApiError(
        400,
        "Task ID is required",
      );
    }

    if (!req.user) {
      throw new ApiError(
        401,
        "Authentication is required",
      );
    }

    const validationResult =
      updateTaskSchema.safeParse(req.body);

    if (!validationResult.success) {
      throw new ApiError(
        400,
        validationResult.error.issues
          .map((issue) => issue.message)
          .join(", "),
      );
    }

    const task = await updateTask(
      id,
      validationResult.data,
      {
        currentUserId: req.user.id,
        currentUserRole: req.user.role,
      },
    );

    res.status(200).json(
      new ApiResponse(
        "Task updated successfully",
        {
          task,
        },
      ),
    );
  },
);

export const updateExistingTaskStatus =
  asyncHandler(
    async (
      req: Request,
      res: Response,
    ): Promise<void> => {
      const id = req.params.id;

      if (
        typeof id !== "string" ||
        id.trim() === ""
      ) {
        throw new ApiError(
          400,
          "Task ID is required",
        );
      }

      if (!req.user) {
        throw new ApiError(
          401,
          "Authentication is required",
        );
      }

      const validationResult =
        updateTaskStatusSchema.safeParse(req.body);

      if (!validationResult.success) {
        throw new ApiError(
          400,
          validationResult.error.issues
            .map((issue) => issue.message)
            .join(", "),
        );
      }

      const task = await updateTaskStatus(
        id,
        validationResult.data,
        {
          currentUserId: req.user.id,
          currentUserRole: req.user.role,
        },
      );

      res.status(200).json(
        new ApiResponse(
          "Task status updated successfully",
          {
            task,
          },
        ),
      );
    },
  );

export const deleteExistingTask = asyncHandler(
  async (
    req: Request,
    res: Response,
  ): Promise<void> => {
    const id = req.params.id;

    if (
      typeof id !== "string" ||
      id.trim() === ""
    ) {
      throw new ApiError(
        400,
        "Task ID is required",
      );
    }

    if (!req.user) {
      throw new ApiError(
        401,
        "Authentication is required",
      );
    }

    await deleteTask(id, {
      currentUserId: req.user.id,
      currentUserRole: req.user.role,
    });

    res.status(200).json(
      new ApiResponse(
        "Task deleted successfully",
      ),
    );
  },
);