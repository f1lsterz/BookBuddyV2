import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ClientsModule, Transport } from "@nestjs/microservices";
import {
  AppError,
  createRmqDomainDlqPublisherOptions,
  createRmqDomainEventPublisherOptions,
  createRmqTransportOptions,
  RmqQueue,
} from "@bookbuddy/shared";
import { User, UserSchema } from "schemas/user.schema";
import { FriendRequest, FriendRequestSchema } from "schemas/friend.request.schema";
import { Notification, NotificationSchema } from "schemas/notification.schema";
import {
  DomainEventOutbox,
  DomainEventOutboxSchema,
} from "schemas/domain-event-outbox.schema";
import { UserApplicationService } from "./application/user.application.service";
import { FriendRequestRepository } from "./infrastructure/friend-request.repository";
import { LibraryRpcClient } from "./infrastructure/library-rpc.client";
import { UserRepository } from "./infrastructure/user.repository";
import { UserListener } from "./transport/user.listener";
import { DomainEventsListener } from "./transport/domain-events.listener";
import { HealthListener } from "./transport/health.listener";
import { MongoHealthService } from "@bookbuddy/nest-common";
import { NotificationRepository } from "./infrastructure/notification.repository";
import { NotificationApplicationService } from "./application/notification.application.service";
import { DomainEventPublisher } from "./infrastructure/domain-event.publisher";
import { DomainEventOutboxRepository } from "./infrastructure/domain-event-outbox.repository";
import { DomainEventOutboxService } from "./infrastructure/domain-event-outbox.service";
import { DomainEventOutboxProcessor } from "./infrastructure/domain-event-outbox.processor";
import { DomainEventDlqPublisher } from "./infrastructure/domain-event-dlq.publisher";
import { OutboxAdminListener } from "./transport/outbox-admin.listener";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: FriendRequest.name, schema: FriendRequestSchema },
      { name: Notification.name, schema: NotificationSchema },
      { name: DomainEventOutbox.name, schema: DomainEventOutboxSchema },
    ]),
    ClientsModule.registerAsync([
      {
        name: "DOMAIN_EVENT_BUS",
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => {
          const rabbitUrl = configService.get<string>("config.rabbitmq.url");
          if (!rabbitUrl) {
            throw AppError.internal("RabbitMQ URL is not defined in configuration");
          }
          return {
            transport: Transport.RMQ,
            options: createRmqDomainEventPublisherOptions(rabbitUrl),
          };
        },
      },
      {
        name: "DOMAIN_DLQ_BUS",
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => {
          const rabbitUrl = configService.get<string>("config.rabbitmq.url");
          if (!rabbitUrl) {
            throw AppError.internal("RabbitMQ URL is not defined in configuration");
          }
          return {
            transport: Transport.RMQ,
            options: createRmqDomainDlqPublisherOptions(rabbitUrl),
          };
        },
      },
      {
        name: "LIBRARY_SERVICE",
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => {
          const rabbitUrl = configService.get<string>("config.rabbitmq.url");
          if (!rabbitUrl) {
            throw AppError.internal("RabbitMQ URL is not defined in configuration");
          }
          return {
            transport: Transport.RMQ,
            options: createRmqTransportOptions(rabbitUrl, RmqQueue.LIBRARY),
          };
        },
      },
    ]),
  ],
  controllers: [UserListener, DomainEventsListener, OutboxAdminListener, HealthListener],
  providers: [
    UserRepository,
    FriendRequestRepository,
    LibraryRpcClient,
    UserApplicationService,
    NotificationRepository,
    NotificationApplicationService,
    DomainEventPublisher,
    DomainEventDlqPublisher,
    DomainEventOutboxRepository,
    DomainEventOutboxService,
    DomainEventOutboxProcessor,
    MongoHealthService,
  ],
})
export class UserModule {}
