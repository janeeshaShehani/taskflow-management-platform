import { Router } from "express";
import { UserRole } from "../generated/prisma/client.js";
import { getUsers } from "../controllers/user.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";

const userRouter = Router();

userRouter.get(
  "/",
  authenticate,
  authorizeRoles(UserRole.ADMIN),
  getUsers,
);

export default userRouter;