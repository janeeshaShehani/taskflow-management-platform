import jwt, {
  type SignOptions,
  type VerifyErrors,
} from "jsonwebtoken";
import type { JwtPayload } from "../types/auth.types.js";

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not defined");
  }

  return secret;
}

export function generateAccessToken(payload: JwtPayload): string {
  const expiresIn =
    (process.env.JWT_EXPIRES_IN as SignOptions["expiresIn"]) ?? "1d";

  return jwt.sign(payload, getJwtSecret(), {
    expiresIn,
  });
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, getJwtSecret()) as JwtPayload;
}

export function isJwtError(error: unknown): error is VerifyErrors {
  return error instanceof Error && error.name.includes("Token");
}