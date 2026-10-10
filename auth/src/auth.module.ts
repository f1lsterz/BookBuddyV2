import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import config from "src/config/config";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { AppError, createRmqTransportOptions, RmqQueue } from "@bookbuddy/shared";
import { AuthApplicationService } from "./application/auth.application.service";
import { UserRpcClient } from "./infrastructure/user-rpc.client";
import { AuthListener } from "./transport/auth.listener";
import { HealthListener } from "./transport/health.listener";
import { RedisCacheHealthService } from "@bookbuddy/nest-common";
import { RefreshTokenStore } from "./infrastructure/refresh-token.store";
import { PasswordResetStore } from "./infrastructure/password-reset.store";

@Module({
  imports: [
    JwtModule.registerAsync(config.asProvider()),
    PassportModule,
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
    ]),
  ],
  controllers: [AuthListener, HealthListener],
  providers: [
    UserRpcClient,
    AuthApplicationService,
    RefreshTokenStore,
    PasswordResetStore,
    RedisCacheHealthService,
  ],
  exports: [AuthApplicationService],
})
export class AuthModule {}
