import type { Request, Response } from "express";
import { getAdminDashboardSummary } from "../services/dashboard.service.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

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