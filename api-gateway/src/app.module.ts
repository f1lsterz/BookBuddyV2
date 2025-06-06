import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import config from "./config/config";
import { UserController } from "./controllers/user.controller";
import { AuthController } from "./controllers/auth.controller";
import { BookController } from "./controllers/book.controller";
import { LibraryController } from "./controllers/library.controller";
import { ClubController } from "./controllers/club.controller";
import { ChatController } from "./controllers/chat.controller";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { ApiError } from "./common/errors/apiError";
import { JwtStrategy } from "./common/strategies/jwt.strategy";

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [config],
      isGlobal: true,
    }),
    JwtModule.registerAsync(config.asProvider()),
    PassportModule,
    ClientsModule.registerAsync(
      [
        "AUTH_SERVICE",
        "USER_SERVICE",
        "BOOK_SERVICE",
        "LIBRARY_SERVICE",
        "CHAT_SERVICE",
        "CLUB_SERVICE",
      ].map((serviceName) => ({
        name: serviceName,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => {
          const rabbitUrl = configService.get<string>("config.rabbitmq.url");
          if (!rabbitUrl) {
            throw ApiError.InternalServerError(
              "RabbitMQ URL is not defined in configuration"
            );
          }
          const queueName = `${serviceName.toLowerCase().replace("_service", "")}_queue`;
          return {
            transport: Transport.RMQ,
            options: {
              urls: [rabbitUrl],
              queue: queueName,
              queueOptions: { durable: false },
            },
          };
        },
      }))
    ),
  ],
  controllers: [
    UserController,
    AuthController,
    BookController,
    LibraryController,
    ClubController,
    ChatController,
  ],
  providers: [JwtStrategy],
})
export class AppModule {}
