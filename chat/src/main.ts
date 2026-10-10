import type { WebSocketAdapter } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { MicroserviceOptions, RmqOptions, Transport } from "@nestjs/microservices";
import { ConfigService } from "@nestjs/config";
import { BookbuddyRpcExceptionFilter, validationConfig } from "@bookbuddy/nest-common";
import { createRmqTransportOptions, resolveRmqQueue, RmqQueue } from "@bookbuddy/shared";
import { RedisIoAdapter } from "./infrastructure/redis-io.adapter";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get<ConfigService>(ConfigService);

  const redisHost = configService.get<string>("config.redis.host") ?? "localhost";
  const redisPort = configService.get<string>("config.redis.port") ?? "6379";
  const redisAdapter = new RedisIoAdapter(app);
  await redisAdapter.connectToRedis(redisHost, redisPort);
  // Nest IoAdapter vs WebSocketAdapter typings diverge across @nestjs/* minors.
  app.useWebSocketAdapter(redisAdapter as unknown as WebSocketAdapter);

  const rmqUrl =
    configService.get<string>("config.rabbitmq.url") ||
    "amqp://user:password@localhost:5672";
  const rmqQueue = resolveRmqQueue(
    configService.get<string>("config.rabbitmq.queue"),
    RmqQueue.CHAT,
  );

  const rmqOptions: RmqOptions = {
    transport: Transport.RMQ,
    options: createRmqTransportOptions(rmqUrl, rmqQueue),
  };

  app.connectMicroservice<MicroserviceOptions>(rmqOptions);
  app.useGlobalPipes(validationConfig);
  app.useGlobalFilters(new BookbuddyRpcExceptionFilter());

  await app.startAllMicroservices();

  const chatPort = Number(configService.get<string>("config.socket.chatPort")) || 3001;
  await app.listen(chatPort);

  console.log(`✅ Chat Microservice is listening via RabbitMQ at queue "${rmqQueue}"`);
  console.log(`✅ Chat WebSocket (Socket.IO) on port ${chatPort}`);
}

void bootstrap();
