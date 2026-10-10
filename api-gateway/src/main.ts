import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { setupMiddlewares } from "./config/middleware.config";
import { ConfigService } from "@nestjs/config";
import {
  BookbuddyHttpExceptionFilter,
  RpcErrorInterceptor,
  validationConfig,
} from "@bookbuddy/nest-common";
import { SwaggerModule } from "@nestjs/swagger";
import { swaggerConfig } from "./config/swagger.config";
import { join } from "path";
import { NestExpressApplication } from "@nestjs/platform-express";
import { setupChatWebSocketProxy } from "./config/chat-ws-proxy.config";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useStaticAssets(join(__dirname, "..", "uploads"), {
    prefix: "/uploads/",
  });

  const configService = app.get(ConfigService);

  setupMiddlewares(app, configService);
  app.useGlobalPipes(validationConfig);
  app.useGlobalFilters(new BookbuddyHttpExceptionFilter());
  app.useGlobalInterceptors(new RpcErrorInterceptor());

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup("api", app, document);

  const port = configService.get<number>("config.server.port") || 3000;
  const chatPort = Number(configService.get<string>("config.socket.chatPort")) || 3001;
  const url = configService.get<string>("config.server.url") || "http://localhost";

  setupChatWebSocketProxy(app, chatPort);

  await app.listen(port);
  console.log(`✅ API Gateway started at ${url}:${port}`);
  console.log(`📄 Swagger docs: ${url}:${port}/api`);
  console.log(`🔌 Chat WebSocket proxied: ${url}:${port}/socket.io → chat:${chatPort}`);
}
void bootstrap();
