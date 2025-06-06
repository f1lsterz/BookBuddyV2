import { INestApplication } from "@nestjs/common";
import helmet from "helmet";
import * as compression from "compression";
import rateLimit from "express-rate-limit";
import * as hpp from "hpp";
import * as cors from "cors";
import * as cookieParser from "cookie-parser";
import { ConfigService } from "@nestjs/config";

export function setupMiddlewares(
  app: INestApplication,
  configService: ConfigService
) {
  const clientUrl = configService.get<string>("config.client.url");

  app.use(cookieParser());

  app.use(
    cors({
      origin: clientUrl,
      credentials: true,
    })
  );

  app.use(
    helmet({
      contentSecurityPolicy: false,
    })
  );
  app.use(hpp());

  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 100,
      message: "Too many requests from this IP, please try again later",
    })
  );

  app.use(
    compression({
      level: 6,
      threshold: 1024,
    })
  );
}
