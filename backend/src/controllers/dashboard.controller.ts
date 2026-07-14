import type { Request, Response } from "express";
import { getAdminDashboardSummary, getManagerDashboardSummary, getMemberDashboardSummary,} from "../services/dashboard.service.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

export const getAdminDashboard = asyncHandler(
  async (_req: Request, res: Response): Promise<void> => {
    const summary = await getAdminDashboardSummary();

    res.status(200).json(
      new ApiResponse(
        "Admin dashboard summary retrieved successfully",
        {
          summary,
        },
      ),
    );
  },
);

export const getManagerDashboard = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new ApiError(
        401,
        "Authentication is required",
      );
    }

    const summary = await getManagerDashboardSummary(
      req.user.id,
    );

    res.status(200).json(
      new ApiResponse(
        "Project manager dashboard summary retrieved successfully",
        {
          summary,
        },
      ),
    );
  },
);

export const getMemberDashboard = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new ApiError(
        401,
        "Authentication is required",
      );
    }

    const summary = await getMemberDashboardSummary(
      req.user.id,
    );

    res.status(200).json(
      new ApiResponse(
        "Team member dashboard summary retrieved successfully",
        {
          summary,
        },
      ),
    );
  },
);