import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { UserModule } from "src/user/user.module";
import config from "src/config/config";
import { GoogleStrategy } from "src/common/strategies/google.strategy";
import { JwtStrategy } from "src/common/strategies/jwt.strategy";

@Module({
  imports: [
    JwtModule.registerAsync(config.asProvider()),
    UserModule,
    PassportModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, GoogleStrategy],
})
export class AuthModule {}
