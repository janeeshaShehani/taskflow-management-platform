import { Router } from "express";
import { UserRole } from "../generated/prisma/client.js";
import { createNewProject } from "../controllers/project.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";

const projectRouter = Router();

projectRouter.post(
  "/",
  authenticate,
  authorizeRoles(
    UserRole.ADMIN,
    UserRole.PROJECT_MANAGER,
  ),
  createNewProject,
);

export default projectRouter;