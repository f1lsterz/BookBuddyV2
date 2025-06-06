import { Controller } from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/loginDto";
import { RegistrationDto } from "./dto/registrationDto";

@Controller()
export class AuthListener {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern({ cmd: "auth-login" })
  async login(@Payload() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @MessagePattern({ cmd: "auth-registration" })
  async registration(@Payload() registrationDto: RegistrationDto) {
    return this.authService.registration(registrationDto);
  }

  @MessagePattern({ cmd: "auth-validate-google-user" })
  async validateGoogleUser(@Payload() googleUser: any) {
    return this.authService.validateGoogleUser(googleUser);
  }

  @MessagePattern({ cmd: "auth-generate-tokens" })
  async generateTokens(@Payload() user: any) {
    return this.authService.generateTokens(user);
  }
}
