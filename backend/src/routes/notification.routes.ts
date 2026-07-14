import { Router } from "express";
import { getUserNotifications, markUserNotificationAsRead, markAllUserNotificationsAsRead, } from "../controllers/notification.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const notificationRouter = Router();

notificationRouter.get(
  "/",
  authenticate,
  getUserNotifications,
);

notificationRouter.patch(
  "/read-all",
  authenticate,
  markAllUserNotificationsAsRead,
);

notificationRouter.patch(
  "/:id/read",
  authenticate,
  markUserNotificationAsRead,
);


export default notificationRouter;
