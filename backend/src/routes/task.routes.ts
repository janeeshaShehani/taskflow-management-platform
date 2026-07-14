import { Router } from "express";
import { UserRole } from "../generated/prisma/client.js";
import { createNewTask } from "../controllers/task.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";

const taskRouter = Router();

taskRouter.post(
  "/",
  authenticate,
  authorizeRoles(
    UserRole.ADMIN,
    UserRole.PROJECT_MANAGER,
  ),
  createNewTask,
);

export default taskRouter;