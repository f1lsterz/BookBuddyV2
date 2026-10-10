import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { MicroserviceOptions, Transport } from "@nestjs/microservices";
import { ConfigService } from "@nestjs/config";
import { BookbuddyRpcExceptionFilter, validationConfig } from "@bookbuddy/nest-common";
import {
  createRmqDomainEventSubscriberOptions,
  createRmqTransportOptions,
  resolveRmqQueue,
  RmqQueue,
} from "@bookbuddy/shared";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get<ConfigService>(ConfigService);

  const rmqUrl =
    configService.get<string>("config.rabbitmq.url") ||
    "amqp://user:password@localhost:5672";
  const rmqQueue = resolveRmqQueue(
    configService.get<string>("config.rabbitmq.queue"),
    RmqQueue.USER,
  );

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: createRmqTransportOptions(rmqUrl, rmqQueue),
  });

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: createRmqDomainEventSubscriberOptions(rmqUrl, RmqQueue.USER_EVENTS),
  });

  app.useGlobalPipes(validationConfig);
  app.useGlobalFilters(new BookbuddyRpcExceptionFilter());

  await app.init();
  await app.startAllMicroservices();

  console.log(`✅ User Microservice RPC queue "${rmqQueue}"`);
  console.log(`✅ User domain events queue "${RmqQueue.USER_EVENTS}"`);
}

void bootstrap();
