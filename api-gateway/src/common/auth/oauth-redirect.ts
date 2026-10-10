import type { Response } from "express";
import { setRefreshTokenCookie } from "./refresh-cookie";

type TokenPair = {
  accessToken: string;
  refreshToken: string;
};

/**
 * Sets refresh httpOnly cookie on API host, redirects browser to SPA with access token in hash.
 * Hash avoids sending the access token to the frontend origin's server logs.
 */
export function redirectOAuthSuccess(
  res: Response,
  clientBaseUrl: string,
  callbackPath: string,
  tokens: TokenPair,
  refreshExpiresIn: string,
): void {
  setRefreshTokenCookie(res, tokens.refreshToken, refreshExpiresIn);

  const base = clientBaseUrl.replace(/\/$/, "");
  const path = callbackPath.startsWith("/") ? callbackPath : `/${callbackPath}`;
  const hash = new URLSearchParams({
    accessToken: tokens.accessToken,
  }).toString();

  res.redirect(302, `${base}${path}#${hash}`);
}
