import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { ConfigModule, ConfigService } from "@nestjs/config";
import config from "./config/config";
import { UserController } from "./controllers/user.controller";
import { AuthController } from "./controllers/auth.controller";
import { BookController } from "./controllers/book.controller";
import { LibraryController } from "./controllers/library.controller";
import { ClubController } from "./controllers/club.controller";
import { ChatController } from "./controllers/chat.controller";
import { HealthController } from "./controllers/health.controller";
import { AdminOutboxController } from "./controllers/admin-outbox.controller";
import { AuthOAuthController } from "./controllers/auth-oauth.controller";
import { GoogleStrategy } from "./common/strategies/google.strategy";
import { RabbitHealthService } from "./infrastructure/rabbit-health.service";
import { MicroservicesHealthService } from "./infrastructure/microservices-health.service";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import {
  AppError,
  createRmqTransportOptions,
  queueForClientName,
} from "@bookbuddy/shared";
import { JwtStrategy } from "./common/strategies/jwt.strategy";
import { JwtAuthGuard } from "./common/guards/jwt-auth.guard";

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
            throw AppError.internal("RabbitMQ URL is not defined in configuration");
          }
          const queue = queueForClientName(serviceName);
          return {
            transport: Transport.RMQ,
            options: createRmqTransportOptions(rabbitUrl, queue),
          };
        },
      })),
    ),
  ],
  controllers: [
    UserController,
    AuthController,
    BookController,
    LibraryController,
    ClubController,
    ChatController,
    HealthController,
    AdminOutboxController,
    ...(process.env.GOOGLE_CLIENT_ID ? [AuthOAuthController] : []),
  ],
  providers: [
    JwtStrategy,
    RabbitHealthService,
    MicroservicesHealthService,
    ...(process.env.GOOGLE_CLIENT_ID ? [GoogleStrategy] : []),
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
