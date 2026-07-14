import type { Request, Response } from "express";
import { getRecentActivity } from "../services/activity.service.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getActivityFeed = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new ApiError(
        401,
        "Authentication is required",
      );
    }

    const activities = await getRecentActivity({
      currentUserId: req.user.id,
      currentUserRole: req.user.role,
    });

    res.status(200).json(
      new ApiResponse(
        "Recent activity retrieved successfully",
        {
          activities,
        },
      ),
    );
  },
);