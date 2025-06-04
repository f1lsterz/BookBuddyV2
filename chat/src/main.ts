import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { MicroserviceOptions, Transport } from "@nestjs/microservices";
import { ConfigService } from "@nestjs/config";

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: [process.env.RABBITMQ_URL || "amqp://localhost:5672"],
        queue: "chat_queue",
        queueOptions: {
          durable: false,
        },
      },
    }
  );

  await app.listen();
  console.log(`✅ Chat Microservice is listening via RabbitMQ`);
}

bootstrap();
