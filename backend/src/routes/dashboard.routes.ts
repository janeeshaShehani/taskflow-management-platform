import { Router } from "express";
import { getAdminDashboard , getManagerDashboard, getMemberDashboard,} from "../controllers/dashboard.controller.js";
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

dashboardRouter.get(
  "/manager",
  authenticate,
  authorizeRoles(UserRole.PROJECT_MANAGER),
  getManagerDashboard,
);

dashboardRouter.get(
  "/member",
  authenticate,
  authorizeRoles(UserRole.TEAM_MEMBER),
  getMemberDashboard,
);

export default dashboardRouter;