import type { CookieOptions, Request, Response } from "express";

export const REFRESH_TOKEN_COOKIE = "refreshToken";

type TokenPair = {
  accessToken: string;
  refreshToken: string;
};

/** Max-Age in ms from env like `7d`, `24h`, or plain seconds number. */
export function refreshCookieMaxAgeMs(refreshExpiresIn?: string): number {
  const raw = refreshExpiresIn?.trim() || "7d";
  const match = /^(\d+)([dhms])?$/i.exec(raw);
  if (!match) {
    return 7 * 24 * 60 * 60 * 1000;
  }
  const value = Number(match[1]);
  const unit = (match[2] ?? "s").toLowerCase();
  const multipliers: Record<string, number> = {
    d: 24 * 60 * 60 * 1000,
    h: 60 * 60 * 1000,
    m: 60 * 1000,
    s: 1000,
  };
  return value * (multipliers[unit] ?? 1000);
}

export function refreshCookieOptions(refreshExpiresIn?: string): CookieOptions {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/auth",
    maxAge: refreshCookieMaxAgeMs(refreshExpiresIn),
  };
}

export function setRefreshTokenCookie(
  res: Response,
  refreshToken: string,
  refreshExpiresIn?: string,
): void {
  res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, refreshCookieOptions(refreshExpiresIn));
}

export function clearRefreshTokenCookie(res: Response): void {
  res.clearCookie(REFRESH_TOKEN_COOKIE, {
    httpOnly: true,
    path: "/auth",
  });
}

export function readRefreshTokenFromRequest(
  req: Request,
  bodyToken?: string,
): string | undefined {
  const fromCookie = req.cookies?.[REFRESH_TOKEN_COOKIE] as string | undefined;
  const trimmedBody = bodyToken?.trim();
  return fromCookie?.trim() || trimmedBody || undefined;
}

export type AuthTokensResponse = TokenPair & {
  user?: unknown;
};

/** Sets httpOnly refresh cookie; JSON omits refreshToken. */
export function toAuthResponse(
  res: Response,
  payload: AuthTokensResponse,
  refreshExpiresIn?: string,
): { accessToken: string; user?: unknown } {
  setRefreshTokenCookie(res, payload.refreshToken, refreshExpiresIn);
  return {
    accessToken: payload.accessToken,
    user: payload.user,
  };
}
