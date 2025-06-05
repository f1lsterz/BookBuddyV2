import { Module } from "@nestjs/common";
import { LibraryService } from "./library.service";
import { LibraryListener } from "./library.listener";
import { MongooseModule } from "@nestjs/mongoose";
import {
  Library,
  LibraryBook,
  LibraryBookSchema,
  LibrarySchema,
} from "schemas/library.schema";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ClientsModule, Transport } from "@nestjs/microservices";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Library.name, schema: LibrarySchema },
      { name: LibraryBook.name, schema: LibraryBookSchema },
    ]),
    ConfigModule,
    ClientsModule.registerAsync([
      {
        name: "BOOK_SERVICE",
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: async (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get<string>("config.rabbitmq.url")!],
            queue: configService.get<string>("config.rabbitmq.queue")!,
            queueOptions: {
              durable: false,
            },
          },
        }),
      },
    ]),
  ],
  providers: [LibraryService],
  controllers: [LibraryListener],
})
export class LibraryModule {}
