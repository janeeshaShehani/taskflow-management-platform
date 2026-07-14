import type { Request, Response } from "express";
import { getNotifications } from "../services/notification.service.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getUserNotifications = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new ApiError(
        401,
        "Authentication is required",
      );
    }

    const result = await getNotifications(req.user.id);

    res.status(200).json(
      new ApiResponse(
        "Notifications retrieved successfully",
        result,
      ),
    );
  },
);