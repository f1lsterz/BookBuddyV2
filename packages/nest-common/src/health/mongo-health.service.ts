import { Injectable } from "@nestjs/common";
import { InjectConnection } from "@nestjs/mongoose";
import { Connection } from "mongoose";
import type { ServiceHealthResponse } from "@bookbuddy/shared";

@Injectable()
export class MongoHealthService {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  async ping(serviceName: string): Promise<ServiceHealthResponse> {
    try {
      if (this.connection.readyState !== 1) {
        return { ok: false, service: serviceName, reason: "MongoDB not connected" };
      }
      await this.connection.db?.admin().command({ ping: 1 });
      return { ok: true, service: serviceName };
    } catch {
      return { ok: false, service: serviceName, reason: "MongoDB ping failed" };
    }
  }
}
