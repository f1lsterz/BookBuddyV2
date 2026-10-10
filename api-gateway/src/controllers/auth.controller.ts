import {
  Body,
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  Inject,
  Req,
  Res,
} from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import {
  AppError,
  AuthCmd,
  LoginDto,
  RefreshTokenBodyDto,
  RegistrationDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from "@bookbuddy/shared";
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from "@nestjs/swagger";
import { LoginApiDto, RegistrationApiDto } from "../dto/swagger/auth.swagger";
import { Public } from "../common/decorators/public.decorator";
import type { Request, Response } from "express";
import { ConfigService } from "@nestjs/config";
import {
  clearRefreshTokenCookie,
  readRefreshTokenFromRequest,
  toAuthResponse,
  type AuthTokensResponse,
} from "../common/auth/refresh-cookie";
import { sendRpc } from "../common/rpc/send-rpc";

@Public()
@ApiTags("Authentication (Proxy)")
@Controller("auth")
export class AuthController {
  constructor(
    @Inject("AUTH_SERVICE") private readonly authClient: ClientProxy,
    private readonly configService: ConfigService,
  ) {}

  private get refreshExpiresIn(): string {
    return this.configService.get<string>("config.refreshSignOptions.expiresIn") ?? "7d";
  }

  @Post("login")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "User login" })
  @ApiBody({ type: LoginApiDto })
  @ApiResponse({ status: HttpStatus.OK, description: "Login successful" })
  async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const payload = await sendRpc<AuthTokensResponse>(
      this.authClient,
      { cmd: AuthCmd.LOGIN },
      loginDto,
    );
    return toAuthResponse(res, payload, this.refreshExpiresIn);
  }

  @Post("registration")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "User registration" })
  @ApiBody({ type: RegistrationApiDto })
  async registration(
    @Body() registrationDto: RegistrationDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const payload = await sendRpc<AuthTokensResponse>(
      this.authClient,
      { cmd: AuthCmd.REGISTRATION },
      registrationDto,
    );
    return toAuthResponse(res, payload, this.refreshExpiresIn);
  }

  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Refresh access token (refresh in httpOnly cookie or body)" })
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body() body: RefreshTokenBodyDto,
  ) {
    const refreshToken = readRefreshTokenFromRequest(req, body.refreshToken);
    if (!refreshToken) {
      throw AppError.badRequest("Refresh token is required");
    }

    const payload = await sendRpc<AuthTokensResponse>(
      this.authClient,
      { cmd: AuthCmd.REFRESH },
      { refreshToken },
    );
    return toAuthResponse(res, payload, this.refreshExpiresIn);
  }

  @Post("logout")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Revoke refresh session and clear cookie" })
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = readRefreshTokenFromRequest(req);
    if (refreshToken) {
      await sendRpc<{ ok: true }>(
        this.authClient,
        { cmd: AuthCmd.REVOKE_REFRESH },
        { refreshToken },
      );
    }
    clearRefreshTokenCookie(res);
    return { ok: true };
  }

  @Post("forgot-password")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Request password reset (dev: devResetToken in non-production)",
  })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return sendRpc<{ message: string; devResetToken?: string }>(
      this.authClient,
      { cmd: AuthCmd.FORGOT_PASSWORD },
      dto,
    );
  }

  @Post("reset-password")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Reset password with token from forgot-password" })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return sendRpc<{ message: string }>(
      this.authClient,
      { cmd: AuthCmd.RESET_PASSWORD },
      dto,
    );
  }
}
