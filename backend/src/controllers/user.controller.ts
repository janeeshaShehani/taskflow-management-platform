import type { Request, Response } from "express";
import { UserRole } from "../generated/prisma/client.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { createUserSchema, updateUserSchema} from "../validators/user.validator.js";
import { ApiError } from "../utils/ApiError.js";
import {
  createUser,
  findUsers,
  findUserById,
  updateUser
} from "../services/user.service.js";

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

export const createNewUser = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const validationResult = createUserSchema.safeParse(req.body);

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

    const user = await createUser(
      validationResult.data,
      req.user.id,
    );

    res.status(201).json(
      new ApiResponse("User created successfully", {
        user,
      }),
    );
  },
);

export const getUserById = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id;

    if (typeof id !== "string" || id.trim() === "") {
    throw new ApiError(400, "User ID is required");
    }

    const user = await findUserById(id);

    res.status(200).json(
      new ApiResponse("User retrieved successfully", {
        user,
      }),
    );
  },
);

export const updateExistingUser = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id;

    if (typeof id !== "string" || id.trim() === "") {
      throw new ApiError(400, "User ID is required");
    }

    const validationResult = updateUserSchema.safeParse(req.body);

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

    const user = await updateUser(
      id,
      validationResult.data,
      req.user.id,
    );

    res.status(200).json(
      new ApiResponse("User updated successfully", {
        user,
      }),
    );
  },
);