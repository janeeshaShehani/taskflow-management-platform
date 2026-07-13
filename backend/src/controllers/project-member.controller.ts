import type { Request, Response } from "express";
import { assignProjectMember } from "../services/project-member.service.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { assignMemberSchema } from "../validators/project-member.validator.js";

export const addProjectMember = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const projectId = req.params.id;

    if (
      typeof projectId !== "string" ||
      projectId.trim() === ""
    ) {
      throw new ApiError(400, "Project ID is required");
    }

    if (!req.user) {
      throw new ApiError(401, "Authentication is required");
    }

    const validationResult = assignMemberSchema.safeParse(req.body);

    if (!validationResult.success) {
      throw new ApiError(
        400,
        validationResult.error.issues
          .map((issue) => issue.message)
          .join(", "),
      );
    }

    const membership = await assignProjectMember(
      projectId,
      validationResult.data,
      {
        currentUserId: req.user.id,
        currentUserRole: req.user.role,
      },
    );

    res.status(201).json(
      new ApiResponse(
        "Project member assigned successfully",
        {
          membership,
        },
      ),
    );
  },
);