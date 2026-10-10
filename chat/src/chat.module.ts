import { Module } from "@nestjs/common";
import { ChatService } from "./chat.service";
import { ChatGateway } from "./chat.gateway";
import { ChatListener } from "./chat.listener";
import { MongooseModule } from "@nestjs/mongoose";
import { ChatMessage, ChatMessageSchema } from "schemas/message.schema";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import config from "./config/config";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { AppError, createRmqTransportOptions, RmqQueue } from "@bookbuddy/shared";
import { ClubRpcClient } from "./infrastructure/club-rpc.client";
import { HealthListener } from "./transport/health.listener";
import { MongoHealthService } from "@bookbuddy/nest-common";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ChatMessage.name, schema: ChatMessageSchema }]),
    ConfigModule,
    JwtModule.registerAsync(config.asProvider()),
    ClientsModule.registerAsync([
      {
        name: "CLUB_SERVICE",
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => {
          const rabbitUrl = configService.get<string>("config.rabbitmq.url");
          if (!rabbitUrl) {
            throw AppError.internal("RabbitMQ URL is not defined in configuration");
          }
          return {
            transport: Transport.RMQ,
            options: createRmqTransportOptions(rabbitUrl, RmqQueue.CLUB),
          };
        },
      },
    ]),
  ],
  controllers: [ChatListener, HealthListener],
  providers: [ChatGateway, ChatService, ClubRpcClient, MongoHealthService],
})
export class ChatModule {}
