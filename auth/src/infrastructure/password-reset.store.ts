import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject, Injectable } from "@nestjs/common";
import { Cache } from "cache-manager";

const RESET_TTL_MS = 60 * 60 * 1000;
const key = (token: string) => `pwd-reset:${token}`;

@Injectable()
export class PasswordResetStore {
  constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}

  async create(userId: string, token: string): Promise<void> {
    await this.cache.set(key(token), userId, RESET_TTL_MS);
  }

  async consume(token: string): Promise<string | undefined> {
    const userId = await this.cache.get<string>(key(token));
    if (!userId) {
      return undefined;
    }
    await this.cache.del(key(token));
    return userId;
  }
}
