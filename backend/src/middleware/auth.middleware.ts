import type {
  NextFunction,
  Request,
  Response,
} from "express";
import prisma from "../config/prisma.js";
import { authCookieName } from "../config/cookie.js";
import { verifyAccessToken } from "../utils/jwt.js";

function getRequestToken(req: Request): string | null {
  const cookieToken = req.cookies?.[authCookieName];

  if (typeof cookieToken === "string" && cookieToken.length > 0) {
    return cookieToken;
  }

  const authorizationHeader = req.headers.authorization;

  if (
    authorizationHeader &&
    authorizationHeader.startsWith("Bearer ")
  ) {
    return authorizationHeader.substring(7);
  }

  return null;
}

export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const token = getRequestToken(req);

    if (!token) {
      res.status(401).json({
        success: false,
        message: "Authentication is required",
      });

      return;
    }

    const payload = verifyAccessToken(token);

    const user = await prisma.user.findUnique({
      where: {
        id: payload.userId,
      },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
      },
    });

    if (!user) {
      res.status(401).json({
        success: false,
        message: "The authenticated user no longer exists",
      });

      return;
    }

    if (!user.isActive) {
      res.status(403).json({
        success: false,
        message: "Your account has been deactivated",
      });

      return;
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    next();
  } catch {
    res.status(401).json({
      success: false,
      message: "Invalid or expired authentication token",
    });
  }
}