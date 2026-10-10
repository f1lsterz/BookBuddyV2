import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import {
  Library,
  LibraryBook,
  LibraryBookSchema,
  LibrarySchema,
} from "schemas/library.schema";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { AppError, createRmqTransportOptions, RmqQueue } from "@bookbuddy/shared";
import { LibraryApplicationService } from "./application/library.application.service";
import { BookCatalogClient } from "./infrastructure/book-catalog.client";
import { LibraryRepository } from "./infrastructure/library.repository";
import { LibraryListener } from "./transport/library.listener";
import { HealthListener } from "./transport/health.listener";
import { MongoHealthService } from "@bookbuddy/nest-common";
import { UserRpcClient } from "./infrastructure/user-rpc.client";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Library.name, schema: LibrarySchema },
      { name: LibraryBook.name, schema: LibraryBookSchema },
    ]),
    ConfigModule,
    ClientsModule.registerAsync([
      {
        name: "USER_SERVICE",
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => {
          const rabbitUrl = configService.get<string>("config.rabbitmq.url");
          if (!rabbitUrl) {
            throw AppError.internal("RabbitMQ URL is not defined in configuration");
          }
          return {
            transport: Transport.RMQ,
            options: createRmqTransportOptions(rabbitUrl, RmqQueue.USER),
          };
        },
      },
      {
        name: "BOOK_SERVICE",
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => {
          const rabbitUrl = configService.get<string>("config.rabbitmq.url");
          if (!rabbitUrl) {
            throw AppError.internal("RabbitMQ URL is not defined in configuration");
          }
          return {
            transport: Transport.RMQ,
            options: createRmqTransportOptions(rabbitUrl, RmqQueue.BOOK),
          };
        },
      },
    ]),
  ],
  providers: [
    LibraryRepository,
    BookCatalogClient,
    UserRpcClient,
    LibraryApplicationService,
    MongoHealthService,
  ],
  controllers: [LibraryListener, HealthListener],
})
export class LibraryModule {}
