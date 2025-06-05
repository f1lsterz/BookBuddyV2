import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthListener } from "./auth.listener";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import config from "src/config/config";
import { ClientsModule, Transport } from "@nestjs/microservices";

@Module({
  imports: [
    JwtModule.registerAsync(config.asProvider()),
    PassportModule,
    ClientsModule.register([
      {
        name: "USER_SERVICE",
        transport: Transport.RMQ,
        options: {
          urls: ["amqp://localhost:5672"],
          queue: "user_queue",
          queueOptions: { durable: false },
        },
      },
    ]),
  ],
  controllers: [AuthListener],
  providers: [AuthService],
})
export class AuthModule {}
