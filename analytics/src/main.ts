import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { MicroserviceOptions, Transport } from "@nestjs/microservices";
import { ConfigService } from "@nestjs/config";
import { BookbuddyRpcExceptionFilter } from "@bookbuddy/nest-common";
import {
  createRmqDomainDlqSubscriberOptions,
  createRmqDomainEventSubscriberOptions,
  DOMAIN_EVENTS_DLQ,
  RmqQueue,
} from "@bookbuddy/shared";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get<ConfigService>(ConfigService);

  const rmqUrl =
    configService.get<string>("config.rabbitmq.url") ||
    "amqp://user:password@localhost:5672";

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: createRmqDomainEventSubscriberOptions(rmqUrl, RmqQueue.ANALYTICS_EVENTS),
  });

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: createRmqDomainDlqSubscriberOptions(rmqUrl, DOMAIN_EVENTS_DLQ),
  });

  app.useGlobalFilters(new BookbuddyRpcExceptionFilter());

  await app.init();
  await app.startAllMicroservices();

  console.log(`✅ Analytics domain events queue "${RmqQueue.ANALYTICS_EVENTS}"`);
  console.log(`✅ Analytics DLQ monitor queue "${DOMAIN_EVENTS_DLQ}"`);
}

void bootstrap();
