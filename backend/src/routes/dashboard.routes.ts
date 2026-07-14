import { Router } from "express";
import { getAdminDashboard } from "../controllers/dashboard.controller.js";
import { UserRole } from "../generated/prisma/client.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";

const dashboardRouter = Router();

dashboardRouter.get(
  "/admin",
  authenticate,
  authorizeRoles(UserRole.ADMIN),
  getAdminDashboard,
);

export default dashboardRouter;