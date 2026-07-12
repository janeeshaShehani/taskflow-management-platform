import type { Request, Response } from "express";
import { UserRole } from "../generated/prisma/client.js";
import { findUsers } from "../services/user.service.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getUsers = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const pageValue = Number(req.query.page ?? 1);
    const limitValue = Number(req.query.limit ?? 10);

    const page =
      Number.isInteger(pageValue) && pageValue > 0 ? pageValue : 1;

    const limit =
      Number.isInteger(limitValue) && limitValue > 0
        ? Math.min(limitValue, 100)
        : 10;

    const search =
      typeof req.query.search === "string"
        ? req.query.search.trim()
        : undefined;

    const roleValue =
      typeof req.query.role === "string"
        ? req.query.role
        : undefined;

    const role = Object.values(UserRole).includes(
      roleValue as UserRole,
    )
      ? (roleValue as UserRole)
      : undefined;

    let isActive: boolean | undefined;

    if (req.query.isActive === "true") {
      isActive = true;
    }

    if (req.query.isActive === "false") {
      isActive = false;
    }

    const result = await findUsers({
      page,
      limit,
      search: search || undefined,
      role,
      isActive,
    });

    res.status(200).json(
      new ApiResponse(
        "Users retrieved successfully",
        result,
      ),
    );
  },
);