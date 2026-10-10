import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ClientsModule, Transport } from "@nestjs/microservices";
import {
  AppError,
  createRmqDomainDlqPublisherOptions,
  createRmqDomainEventPublisherOptions,
} from "@bookbuddy/shared";
import { Club, ClubMember, ClubMemberSchema, ClubSchema } from "schemas/club.schema";
import {
  DomainEventOutbox,
  DomainEventOutboxSchema,
} from "schemas/domain-event-outbox.schema";
import { ClubApplicationService } from "./application/club.application.service";
import { ClubRepository } from "./infrastructure/club.repository";
import { DomainEventPublisher } from "./infrastructure/domain-event.publisher";
import { DomainEventOutboxRepository } from "./infrastructure/domain-event-outbox.repository";
import { DomainEventOutboxService } from "./infrastructure/domain-event-outbox.service";
import { DomainEventOutboxProcessor } from "./infrastructure/domain-event-outbox.processor";
import { DomainEventDlqPublisher } from "./infrastructure/domain-event-dlq.publisher";
import { ClubListener } from "./transport/club.listener";
import { OutboxAdminListener } from "./transport/outbox-admin.listener";
import { HealthListener } from "./transport/health.listener";
import { MongoHealthService } from "@bookbuddy/nest-common";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Club.name, schema: ClubSchema },
      { name: ClubMember.name, schema: ClubMemberSchema },
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
    ]),
  ],
  controllers: [ClubListener, OutboxAdminListener, HealthListener],
  providers: [
    ClubRepository,
    ClubApplicationService,
    DomainEventPublisher,
    DomainEventDlqPublisher,
    DomainEventOutboxRepository,
    DomainEventOutboxService,
    DomainEventOutboxProcessor,
    MongoHealthService,
  ],
})
export class ClubModule {}
