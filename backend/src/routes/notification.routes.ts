import { Router } from "express";
import { getUserNotifications } from "../controllers/notification.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const notificationRouter = Router();

notificationRouter.get(
  "/",
  authenticate,
  getUserNotifications,
);

export default notificationRouter;
