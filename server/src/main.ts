import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ConfigService } from "@nestjs/config";
import { ValidationPipe } from "@nestjs/common";
import * as cookieParser from "cookie-parser";
import { ValidationFilter } from "./common/filters/validation.filter";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: { origin: true, credentials: true, exposedHeaders: ["Set-Cookie"] },
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>("config.server.port") || 3000;

  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    })
  );
  app.useGlobalFilters(new ValidationFilter());

  await app.listen(port);
  console.log(`Started server on localhost:${port}`);
}
bootstrap();
