import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ConfigService } from "@nestjs/config";
import { setupMiddlewares } from "./config/middleware.config";
import { validationConfig } from "./config/validation.config";
import { SwaggerModule } from "@nestjs/swagger";
import { swaggerConfig } from "./config/swagger.config";
import { AllExceptionsFilter } from "./common/filters/validation.filter";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>("config.server.port") || 3000;

  setupMiddlewares(app, configService);

  app.useGlobalPipes(validationConfig);
  app.useGlobalFilters(new AllExceptionsFilter());

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup("api", app, document);

  await app.listen(port);
  console.log(`Started server on localhost:${port}`);
  console.log(`📄 Swagger documentation: http://localhost:${port}/api`);
}
bootstrap();
