import { JwtService } from "@nestjs/jwt";
import type { AuthedSocket } from "../types/authed-socket";

type JwtPayload = {
  sub: string;
};

export function createWsJwtMiddleware(jwtService: JwtService, secret: string) {
  return async (socket: AuthedSocket, next: (err?: Error) => void) => {
    const raw =
      (socket.handshake.auth?.token as string | undefined) ??
      socket.handshake.headers.authorization;

    const token = raw?.replace(/^Bearer\s+/i, "").trim();
    if (!token) {
      return next(new Error("Unauthorized"));
    }

    try {
      const payload = await jwtService.verifyAsync<JwtPayload>(token, { secret });
      socket.data.userId = payload.sub;
      next();
    } catch {
      next(new Error("Unauthorized"));
    }
  };
}
