import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject, Injectable } from "@nestjs/common";
import { Cache } from "cache-manager";
import type { ServiceHealthResponse } from "@bookbuddy/shared";

@Injectable()
export class RedisCacheHealthService {
  constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}

  async ping(serviceName: string): Promise<ServiceHealthResponse> {
    try {
      const probe = `health:${Date.now()}`;
      await this.cache.set(probe, "1", 1000);
      const value = await this.cache.get(probe);
      await this.cache.del(probe);
      if (value !== "1") {
        return { ok: false, service: serviceName, reason: "Redis cache probe failed" };
      }
      return { ok: true, service: serviceName };
    } catch {
      return { ok: false, service: serviceName, reason: "Redis cache unreachable" };
    }
  }
}
