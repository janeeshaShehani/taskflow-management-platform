import { Router } from "express";
import { UserRole } from "../generated/prisma/client.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";
import {
  createNewUser,
  getUsers,
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

export default userRouter;