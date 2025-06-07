import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { setupMiddlewares } from "./config/middleware.config";
import { ConfigService } from "@nestjs/config";
import { AllExceptionsFilter } from "../../api-gateway/src/common/filters/validation.filter";
import { validationConfig } from "../../api-gateway/src/config/validation.config";
import { SwaggerModule } from "@nestjs/swagger";
import { swaggerConfig } from "./config/swagger.config";
import { MicroserviceOptions, Transport } from "@nestjs/microservices";
import { join } from "path";
import { NestExpressApplication } from "@nestjs/platform-express";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useStaticAssets(join(__dirname, "..", "uploads"), {
    prefix: "/uploads/",
  });

  const configService = app.get(ConfigService);

  setupMiddlewares(app, configService);
  app.useGlobalPipes(validationConfig);
  app.useGlobalFilters(new AllExceptionsFilter());

  const rabbitUrl =
    configService.get<string>("config.rabbitmq.url") ||
    "amqp://user:password@localhost:5672";

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [rabbitUrl],
      queue: "auth_queue",
      queueOptions: { durable: false },
    },
  });

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [rabbitUrl],
      queue: "user_queue",
      queueOptions: { durable: false },
    },
  });

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [rabbitUrl],
      queue: "book_queue",
      queueOptions: { durable: false },
    },
  });

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [rabbitUrl],
      queue: "library_queue",
      queueOptions: { durable: false },
    },
  });

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [rabbitUrl],
      queue: "club_queue",
      queueOptions: { durable: false },
    },
  });

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [rabbitUrl],
      queue: "chat_queue",
      queueOptions: { durable: false },
    },
  });

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup("api", app, document);

  await app.startAllMicroservices();
  const port = configService.get<number>("config.server.port") || 3000;
  const url =
    configService.get<string>("config.server.url") || "http://localhost";
  await app.listen(port);
  console.log(`✅ Book Service started at ${url}:${port}`);
  console.log(`📄 Swagger docs: ${url}:${port}/api`);
}
bootstrap();
