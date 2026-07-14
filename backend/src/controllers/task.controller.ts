import type { Request, Response } from "express";
import { createTask } from "../services/task.service.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { createTaskSchema } from "../validators/task.validator.js";

export const createNewTask = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new ApiError(401, "Authentication is required");
    }

    const validationResult = createTaskSchema.safeParse(req.body);

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
      new ApiResponse("Task created successfully", {
        task,
      }),
    );
  },
);