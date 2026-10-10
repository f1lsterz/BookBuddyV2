import { Controller } from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";
import {
  AuthCmd,
  ForgotPasswordDto,
  LoginDto,
  RefreshTokenDto,
  RegistrationDto,
  ResetPasswordDto,
} from "@bookbuddy/shared";
import { AuthApplicationService } from "../application/auth.application.service";
import type { AuthUserRecord } from "../types/auth-user.record";

@Controller()
export class AuthListener {
  constructor(private readonly authApplication: AuthApplicationService) {}

  @MessagePattern({ cmd: AuthCmd.LOGIN })
  async login(@Payload() loginDto: LoginDto) {
    return this.authApplication.login(loginDto);
  }

  @MessagePattern({ cmd: AuthCmd.REGISTRATION })
  async registration(@Payload() registrationDto: RegistrationDto) {
    return this.authApplication.registration(registrationDto);
  }

  @MessagePattern({ cmd: AuthCmd.REFRESH })
  async refresh(@Payload() dto: RefreshTokenDto) {
    return this.authApplication.refresh(dto);
  }

  @MessagePattern({ cmd: AuthCmd.REVOKE_REFRESH })
  async revokeRefresh(@Payload() dto: RefreshTokenDto) {
    return this.authApplication.revokeRefresh(dto);
  }

  @MessagePattern({ cmd: AuthCmd.FORGOT_PASSWORD })
  async forgotPassword(@Payload() dto: ForgotPasswordDto) {
    return this.authApplication.forgotPassword(dto);
  }

  @MessagePattern({ cmd: AuthCmd.RESET_PASSWORD })
  async resetPassword(@Payload() dto: ResetPasswordDto) {
    return this.authApplication.resetPassword(dto);
  }

  @MessagePattern({ cmd: AuthCmd.VALIDATE_GOOGLE_USER })
  async validateGoogleUser(@Payload() googleUser: unknown) {
    return this.authApplication.validateGoogleUser(
      googleUser as {
        email: string;
        name?: string;
        photoUrl?: string;
        photoURL?: string;
      },
    );
  }

  @MessagePattern({ cmd: AuthCmd.GENERATE_TOKENS })
  async generateTokens(@Payload() user: unknown) {
    return this.authApplication.generateTokens(user as AuthUserRecord);
  }
}
