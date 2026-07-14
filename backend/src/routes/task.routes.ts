import { Router } from "express";
import {
  createNewTask,
  deleteExistingTask,
  getTaskById,
  getTasks,
  updateExistingTask,
  updateExistingTaskStatus,
} from "../controllers/task.controller.js";
import { UserRole } from "../generated/prisma/client.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";

const taskRouter = Router();

taskRouter.get(
  "/",
  authenticate,
  getTasks,
);

taskRouter.post(
  "/",
  authenticate,
  authorizeRoles(
    UserRole.ADMIN,
    UserRole.PROJECT_MANAGER,
  ),
  createNewTask,
);

taskRouter.patch(
  "/:id/status",
  authenticate,
  updateExistingTaskStatus,
);

taskRouter.get(
  "/:id",
  authenticate,
  getTaskById,
);

taskRouter.patch(
  "/:id",
  authenticate,
  authorizeRoles(
    UserRole.ADMIN,
    UserRole.PROJECT_MANAGER,
  ),
  updateExistingTask,
);

taskRouter.delete(
  "/:id",
  authenticate,
  authorizeRoles(
    UserRole.ADMIN,
    UserRole.PROJECT_MANAGER,
  ),
  deleteExistingTask,
);

export default taskRouter;