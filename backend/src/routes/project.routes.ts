import { Router } from "express";
import { UserRole } from "../generated/prisma/client.js";
import { createNewProject, getProjects, getProjectById,} from "../controllers/project.controller.js";
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

export default projectRouter;