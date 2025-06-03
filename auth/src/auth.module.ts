import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { UserModule } from "src/user/user.module";
import config from "src/config/config";
import { GoogleStrategy } from "src/common/strategies/google.strategy";
import { JwtStrategy } from "src/common/strategies/jwt.strategy";
import { ClientsModule, Transport } from "@nestjs/microservices";

@Module({
  imports: [
    JwtModule.registerAsync(config.asProvider()),
    UserModule,
    PassportModule,
    ClientsModule.register([
      {
        name: "AUTH_SERVICE",
        transport: Transport.RMQ,
        options: {
          urls: ["amqp://localhost:5672"],
          queue: "auth_queue",
          queueOptions: { durable: false },
        },
      },
    ]),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, GoogleStrategy],
})
export class AuthModule {}
