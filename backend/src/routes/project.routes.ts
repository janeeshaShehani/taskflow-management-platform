import { Router } from "express";
import { UserRole } from "../generated/prisma/client.js";
import { createNewProject, getProjects, getProjectById, updateExistingProject,} from "../controllers/project.controller.js";
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

projectRouter.get(
  "/",
  authenticate,
  getProjects,
);

projectRouter.get(
  "/:id",
  authenticate,
  getProjectById,
);

projectRouter.patch(
  "/:id",
  authenticate,
  authorizeRoles(
    UserRole.ADMIN,
    UserRole.PROJECT_MANAGER,
  ),
  updateExistingProject,
);

export default projectRouter;