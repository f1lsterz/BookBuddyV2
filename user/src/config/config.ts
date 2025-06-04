import { registerAs } from "@nestjs/config";

export default registerAs("config", () => ({
  server: {
    port: process.env.SERVER_PORT || 3007,
    url: process.env.SERVER_URL || "http://localhost",
  },
  database: {
    url: process.env.DATABASE_URL || "mongodb://localhost:27017/userdb",
  },
  secret: process.env.JWT_SECRET || "bookbuddy",
  signOptions: {
    expiresIn: process.env.JWT_EXPIRES_IN || "3d",
  },
  refreshSignOptions: {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "30d",
  },
  client: {
    url: process.env.CLIENT_URL || "http://localhost:5173",
  },
  redis: {
    host: process.env.REDIS_HOST || "localhost",
    port: process.env.REDIS_PORT || 6379,
    cachePrefix: process.env.CACHE_PREFIX || "book-cache",
  },
}));
