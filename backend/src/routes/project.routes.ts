import { Router } from "express";
import { UserRole } from "../generated/prisma/client.js";
import { createNewProject, getProjects, getProjectById, updateExistingProject, deleteExistingProject,} from "../controllers/project.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";
import { addProjectMember,  deleteProjectMember,} from "../controllers/project-member.controller.js";

const projectRouter = Router();

projectRouter.get("/", authenticate, getProjects);

projectRouter.post(
  "/",
  authenticate,
  authorizeRoles(
    UserRole.ADMIN,
    UserRole.PROJECT_MANAGER,
  ),
  createNewProject,
);

projectRouter.post(
  "/:id/members",
  authenticate,
  authorizeRoles(
    UserRole.ADMIN,
    UserRole.PROJECT_MANAGER,
  ),
  addProjectMember,
);

projectRouter.delete(
  "/:id/members/:userId",
  authenticate,
  authorizeRoles(
    UserRole.ADMIN,
    UserRole.PROJECT_MANAGER,
  ),
  deleteProjectMember,
);

projectRouter.get("/:id", authenticate, getProjectById);

projectRouter.patch(
  "/:id",
  authenticate,
  authorizeRoles(
    UserRole.ADMIN,
    UserRole.PROJECT_MANAGER,
  ),
  updateExistingProject,
);

projectRouter.delete(
  "/:id",
  authenticate,
  authorizeRoles(
    UserRole.ADMIN,
    UserRole.PROJECT_MANAGER,
  ),
  deleteExistingProject,
);

export default projectRouter;