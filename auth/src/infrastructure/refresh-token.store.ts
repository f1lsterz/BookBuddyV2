import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject, Injectable } from "@nestjs/common";
import { ConfigType } from "@nestjs/config";
import { Cache } from "cache-manager";
import { parseRefreshExpiresMs } from "@bookbuddy/shared";
import config from "src/config/config";

const key = (jti: string) => `refresh:session:${jti}`;

@Injectable()
export class RefreshTokenStore {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
    @Inject(config.KEY) private readonly configService: ConfigType<typeof config>,
  ) {}

  private ttlMs(): number {
    return parseRefreshExpiresMs(this.configService.refreshSignOptions.expiresIn);
  }

  async register(jti: string, userId: string): Promise<void> {
    await this.cache.set(key(jti), userId, this.ttlMs());
  }

  async isActive(jti: string): Promise<boolean> {
    const userId = await this.cache.get<string>(key(jti));
    return Boolean(userId);
  }

  async revoke(jti: string): Promise<void> {
    await this.cache.del(key(jti));
  }
}
