import { registerAs } from "@nestjs/config";

export default registerAs("config", () => ({
  server: {
    port: process.env.SERVER_PORT || 3000,
    url: process.env.SERVER_URL || "http://localhost",
  },
  database: {
    url:
      process.env.DATABASE_URL ||
      "mysql://root:123456@localhost:3306/bookbuddy",
  },
  secret: process.env.JWT_SECRET || "bookbuddy",
  signOptions: {
    expiresIn: process.env.JWT_EXPIRES_IN || "1d",
  },
  refreshSignOptions: {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  },
  socket: {
    chatPort: process.env.SOCKET_CHAT_PORT || 3001,
  },
  client: {
    url: process.env.CLIENT_URL || "http://localhost:5173",
  },
  redis: {
    host: process.env.REDIS_HOST || "localhost",
    port: process.env.REDIS_PORT || 6379,
    cachePrefix: process.env.CACHE_PREFIX || "book-cache",
  },
  google: {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
  },
}));
