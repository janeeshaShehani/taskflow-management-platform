import { Request, Response } from "express";
import { UserRole } from "../generated/prisma/client.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { createProject } from "../services/project.service.js";
import { createProjectSchema } from "../validators/project.validator.js";

export const createNewProject = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const validationResult = createProjectSchema.safeParse(req.body);

    if (!validationResult.success) {
      throw new ApiError(
        400,
        validationResult.error.issues
          .map((issue) => issue.message)
          .join(", "),
      );
    }

    if (!req.user) {
      throw new ApiError(401, "Authentication is required");
    }

    const project = await createProject(
      validationResult.data,
      {
        currentUserId: req.user.id,
        currentUserRole: req.user.role as UserRole,
      },
    );

    res.status(201).json(
      new ApiResponse(
        "Project created successfully",
        {
          project,
        },
      ),
    );
  },
);