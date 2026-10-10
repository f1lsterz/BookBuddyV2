import { IoAdapter } from "@nestjs/platform-socket.io";
import { INestApplicationContext, Logger } from "@nestjs/common";
import { createAdapter } from "@socket.io/redis-adapter";
import { createClient } from "redis";
import type { Server, ServerOptions } from "socket.io";

function redisClientErrorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

export class RedisIoAdapter extends IoAdapter {
  private readonly logger = new Logger(RedisIoAdapter.name);
  private adapterConstructor?: ReturnType<typeof createAdapter>;

  constructor(app: INestApplicationContext) {
    super(app);
  }

  async connectToRedis(host: string, port: string): Promise<void> {
    const url = `redis://${host}:${port}`;
    const pubClient = createClient({ url });
    const subClient = pubClient.duplicate();

    pubClient.on("error", (err: unknown) => {
      this.logger.error(`Redis pub client error: ${redisClientErrorMessage(err)}`);
    });
    subClient.on("error", (err: unknown) => {
      this.logger.error(`Redis sub client error: ${redisClientErrorMessage(err)}`);
    });

    await Promise.all([pubClient.connect(), subClient.connect()]);
    this.adapterConstructor = createAdapter(pubClient, subClient);
    this.logger.log(`Socket.IO Redis adapter connected (${url})`);
  }

  createIOServer(port: number, options?: ServerOptions): Server {
    const server = super.createIOServer(port, options) as Server;
    if (!this.adapterConstructor) {
      throw new Error(
        "RedisIoAdapter: call connectToRedis() before accepting connections",
      );
    }
    server.adapter(this.adapterConstructor);
    return server;
  }
}
