import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import {
  MicroserviceOptions,
  RmqOptions,
  Transport,
} from "@nestjs/microservices";
import { ConfigService } from "@nestjs/config";
import { validationConfig } from "../../api-gateway/src/config/validation.config";

async function bootstrap() {
  const appContext = await NestFactory.createApplicationContext(AppModule);
  const configService = appContext.get<ConfigService>(ConfigService);

  const rmqUrl =
    configService.get<string>("config.rabbitmq.url") ||
    "amqp://user:password@localhost:5672";
  const rmqQueue =
    configService.get<string>("config.rabbitmq.queue") || "user_queue";

  const rmqOptions: RmqOptions = {
    transport: Transport.RMQ,
    options: {
      urls: [rmqUrl],
      queue: rmqQueue,
      queueOptions: {
        durable: false,
      },
    },
  };

  const microservice =
    await NestFactory.createMicroservice<MicroserviceOptions>(
      AppModule,
      rmqOptions
    );

  microservice.useGlobalPipes(validationConfig);

  await microservice.listen();
  console.log(
    `✅ Book Microservice is listening via RabbitMQ at queue "${rmqQueue}"`
  );
}

bootstrap();
