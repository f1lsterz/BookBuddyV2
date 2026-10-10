import type { INestApplication } from "@nestjs/common";
import { createProxyMiddleware } from "http-proxy-middleware";
import type { Server } from "http";
import type { Socket } from "net";

/**
 * Proxies Socket.IO to chat microservice so clients use gateway :3000 only.
 * Horizontal scale: run multiple chat replicas with Redis Socket.IO adapter (see chat service).
 * Put a load balancer with cookie/ip affinity in front of gateway when running multiple gateway pods.
 */
export function setupChatWebSocketProxy(app: INestApplication, chatPort: number): void {
  const target = `http://127.0.0.1:${chatPort}`;
  const proxy = createProxyMiddleware({
    target,
    changeOrigin: true,
    ws: true,
    xfwd: true,
  });

  app.use("/socket.io", proxy);

  const server = app.getHttpServer() as Server;
  server.on("upgrade", (req, socket, head) => {
    if (req.url?.startsWith("/socket.io")) {
      proxy.upgrade(req, socket as Socket, head);
    }
  });
}
