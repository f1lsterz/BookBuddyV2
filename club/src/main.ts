import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { setupMiddlewares } from "./config/middleware.config";
import { ConfigService } from "@nestjs/config";
import { AllExceptionsFilter } from "./common/filters/validation.filter";
import { validationConfig } from "./config/validation.config";
import { SwaggerModule } from "@nestjs/swagger";
import { swaggerConfig } from "./config/swagger.config";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  setupMiddlewares(app, configService);

  const port = configService.get<number>("config.server.port") || 3002;
  const url =
    configService.get<string>("config.server.url") || "http://localhost";

  app.useGlobalPipes(validationConfig);
  app.useGlobalFilters(new AllExceptionsFilter());

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup("api", app, document);

  await app.listen(port);
  console.log(`✅ Club Service started at ${url}:${port}`);
  console.log(`📄 Swagger docs: ${url}:${port}/api`);
}
bootstrap();
