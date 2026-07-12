import type { Request, Response } from "express";
import {
  authCookieName,
  authCookieOptions,
} from "../config/cookie.js";
import {
  getCurrentUser,
  loginUser,
} from "../services/auth.service.js";
import { loginSchema } from "../validators/auth.validator.js";

export async function login(
  req: Request,
  res: Response,
): Promise<void> {
  const validationResult = loginSchema.safeParse(req.body);

  if (!validationResult.success) {
    res.status(400).json({
      success: false,
      message: "Invalid login information",
      errors: validationResult.error.flatten().fieldErrors,
    });

    return;
  }

  try {
    const result = await loginUser(validationResult.data);

    res.cookie(
      authCookieName,
      result.token,
      authCookieOptions,
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: result.user,
      },
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "INVALID_CREDENTIALS"
    ) {
      res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });

      return;
    }

    if (
      error instanceof Error &&
      error.message === "ACCOUNT_INACTIVE"
    ) {
      res.status(403).json({
        success: false,
        message: "Your account has been deactivated",
      });

      return;
    }

    console.error("Login error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to log in at this time",
       debug:
          process.env.NODE_ENV === "development"
          ? error instanceof Error
            ? error.message
            : String(error)
          : undefined,
    });
  }
}

export async function me(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Authentication is required",
      });

      return;
    }

    const user = await getCurrentUser(req.user.id);

    res.status(200).json({
      success: true,
      data: {
        user,
      },
    });
  } catch (error) {
    console.error("Current user error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to retrieve the current user",
    });
  }
}

export function logout(
  _req: Request,
  res: Response,
): void {
  res.clearCookie(authCookieName, {
    httpOnly: authCookieOptions.httpOnly,
    secure: authCookieOptions.secure,
    sameSite: authCookieOptions.sameSite,
    path: authCookieOptions.path,
  });

  res.status(200).json({
    success: true,
    message: "Logout successful",
  });
}