import type { CookieOptions } from "express";

const isProduction = process.env.NODE_ENV === "production";

export const authCookieName = "taskflow_access_token";

export const authCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  maxAge: 24 * 60 * 60 * 1000,
  path: "/",
};