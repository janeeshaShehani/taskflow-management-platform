import { Router } from "express";
import { UserRole } from "../generated/prisma/client.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";
import {
  createNewUser,
  getUserById,
  getUsers,
  updateExistingUser,
  updateExistingUserStatus,
} from "../controllers/user.controller.js";

const userRouter = Router();

userRouter.get(
  "/",
  authenticate,
  authorizeRoles(UserRole.ADMIN),
  getUsers,
);

userRouter.post(
  "/",
  authenticate,
  authorizeRoles(UserRole.ADMIN),
  createNewUser,
);

userRouter.get(
  "/:id",
  authenticate,
  authorizeRoles(UserRole.ADMIN),
  getUserById,
);

userRouter.patch(
  "/:id",
  authenticate,
  authorizeRoles(UserRole.ADMIN),
  updateExistingUser,
);

export default userRouter;

userRouter.patch(
  "/:id/status",
  authenticate,
  authorizeRoles(UserRole.ADMIN),
  updateExistingUserStatus,
);