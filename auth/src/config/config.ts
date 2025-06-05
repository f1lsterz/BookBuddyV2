import { registerAs } from "@nestjs/config";

export default registerAs("config", () => ({
  secret: process.env.JWT_SECRET,
  signOptions: {
    expiresIn: process.env.JWT_EXPIRES_IN,
  },
  refreshSignOptions: {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
  },
  client: {
    url: process.env.CLIENT_URL,
  },
  redis: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    cachePrefix: process.env.CACHE_PREFIX,
  },
  rabbitmq: {
    url: process.env.RABBITMQ_URL,
    queue: process.env.RABBITMQ_QUEUE,
  },
  google: {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
  },
}));
