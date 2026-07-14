import type { Request, Response } from "express";
import { getNotifications, markNotificationAsRead,} from "../services/notification.service.js";
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

export const markUserNotificationAsRead = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id;

    if (typeof id !== "string" || id.trim() === "") {
      throw new ApiError(
        400,
        "Notification ID is required",
      );
    }

    if (!req.user) {
      throw new ApiError(
        401,
        "Authentication is required",
      );
    }

    const notification = await markNotificationAsRead(
      id,
      req.user.id,
    );

    res.status(200).json(
      new ApiResponse(
        "Notification marked as read successfully",
        {
          notification,
        },
      ),
    );
  },
);