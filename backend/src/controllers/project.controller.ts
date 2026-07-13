import { Request, Response } from "express";
import { UserRole } from "../generated/prisma/client.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { createProject, findProjects,  findProjectById, } from "../services/project.service.js";
import { createProjectSchema, getProjectsQuerySchema, } from "../validators/project.validator.js";

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

export const getProjects = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new ApiError(401, "Authentication is required");
    }

    const validationResult =
      getProjectsQuerySchema.safeParse(req.query);

    if (!validationResult.success) {
      throw new ApiError(
        400,
        validationResult.error.issues
          .map((issue) => issue.message)
          .join(", "),
      );
    }

    const result = await findProjects(
      validationResult.data,
      {
        currentUserId: req.user.id,
        currentUserRole: req.user.role,
      },
    );

    res.status(200).json(
      new ApiResponse(
        "Projects retrieved successfully",
        result,
      ),
    );
  },
);

export const getProjectById = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id;

    if (typeof id !== "string" || id.trim() === "") {
      throw new ApiError(400, "Project ID is required");
    }

    if (!req.user) {
      throw new ApiError(401, "Authentication is required");
    }

    const project = await findProjectById(id, {
      currentUserId: req.user.id,
      currentUserRole: req.user.role,
    });

    res.status(200).json(
      new ApiResponse(
        "Project retrieved successfully",
        {
          project,
        },
      ),
    );
  },
);