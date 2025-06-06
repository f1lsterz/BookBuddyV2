import { Body, Controller, Post, HttpCode, HttpStatus } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { Inject } from "@nestjs/common";
import { firstValueFrom } from "rxjs";
import { LoginDto } from "../../../auth/src/dto/loginDto";
import { RegistrationDto } from "../../../auth/src/dto/registrationDto";
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from "@nestjs/swagger";

@ApiTags("Authentication (Proxy)")
@Controller("auth")
export class AuthController {
  constructor(
    @Inject("AUTH_SERVICE") private readonly authClient: ClientProxy
  ) {}

  @Post("login")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "User login" })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: HttpStatus.OK, description: "Login successful" })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: "Invalid credentials",
  })
  async login(@Body() loginDto: LoginDto) {
    return firstValueFrom(
      this.authClient.send({ cmd: "auth-login" }, loginDto)
    );
  }

  @Post("registration")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "User registration" })
  @ApiBody({ type: RegistrationDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: "Registration successful",
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "Invalid registration data",
  })
  async registration(@Body() registrationDto: RegistrationDto) {
    return firstValueFrom(
      this.authClient.send({ cmd: "auth-registration" }, registrationDto)
    );
  }

  @Post("validate-google-user")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Validate Google OAuth user" })
  async validateGoogleUser(@Body() googleUser: any) {
    return firstValueFrom(
      this.authClient.send({ cmd: "auth-validate-google-user" }, googleUser)
    );
  }

  @Post("generate-tokens")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Generate auth tokens for user" })
  async generateTokens(@Body() user: any) {
    return firstValueFrom(
      this.authClient.send({ cmd: "auth-generate-tokens" }, user)
    );
  }
}
