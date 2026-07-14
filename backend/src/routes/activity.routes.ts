import { Router } from "express";
import { getActivityFeed } from "../controllers/activity.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const activityRouter = Router();

activityRouter.get(
  "/",
  authenticate,
  getActivityFeed,
);

export default activityRouter;