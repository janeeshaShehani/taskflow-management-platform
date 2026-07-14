import { Router } from "express";
import { getUserNotifications, markUserNotificationAsRead, } from "../controllers/notification.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const notificationRouter = Router();

notificationRouter.get(
  "/",
  authenticate,
  getUserNotifications,
);

notificationRouter.patch(
  "/:id/read",
  authenticate,
  markUserNotificationAsRead,
);

export default notificationRouter;
