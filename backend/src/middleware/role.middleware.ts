import type {
  NextFunction,
  Request,
  Response,
} from "express";
import type { UserRole } from "../generated/prisma/client.js";

export function authorizeRoles(...allowedRoles: UserRole[]) {
  return (
    req: Request,
    res: Response,
    next: NextFunction,
  ): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Authentication is required",
      });

      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: "You do not have permission to perform this action",
      });

      return;
    }

    next();
  };
}