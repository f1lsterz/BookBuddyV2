import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { MicroserviceOptions, RmqOptions, Transport } from "@nestjs/microservices";
import { ConfigService } from "@nestjs/config";
import { BookbuddyRpcExceptionFilter, validationConfig } from "@bookbuddy/nest-common";
import { createRmqTransportOptions, resolveRmqQueue, RmqQueue } from "@bookbuddy/shared";

async function bootstrap() {
  const appContext = await NestFactory.createApplicationContext(AppModule);
  const configService = appContext.get<ConfigService>(ConfigService);

  const rmqUrl =
    configService.get<string>("config.rabbitmq.url") ||
    "amqp://user:password@localhost:5672";
  const rmqQueue = resolveRmqQueue(
    configService.get<string>("config.rabbitmq.queue"),
    RmqQueue.BOOK,
  );

  const rmqOptions: RmqOptions = {
    transport: Transport.RMQ,
    options: createRmqTransportOptions(rmqUrl, rmqQueue),
  };

  const microservice = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    rmqOptions,
  );

  microservice.useGlobalPipes(validationConfig);
  microservice.useGlobalFilters(new BookbuddyRpcExceptionFilter());

  await microservice.listen();
  console.log(`✅ Book Microservice is listening via RabbitMQ at queue "${rmqQueue}"`);
}

void bootstrap();
