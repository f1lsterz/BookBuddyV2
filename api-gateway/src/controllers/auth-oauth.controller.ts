import { Controller, Get, Inject, Req, Res, UseGuards } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { AuthCmd } from "@bookbuddy/shared";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { sendRpc } from "../common/rpc/send-rpc";
import { Public } from "../common/decorators/public.decorator";
import { GoogleOAuthGuard } from "../common/guards/googleOAuth.guard";
import { ConfigService } from "@nestjs/config";
import type { Response } from "express";
import { redirectOAuthSuccess } from "../common/auth/oauth-redirect";

type GoogleUserPayload = {
  email: string;
  _id: { toString(): string };
  role: string;
};

@Public()
@ApiTags("Authentication (Proxy)")
@Controller("auth")
export class AuthOAuthController {
  constructor(
    @Inject("AUTH_SERVICE") private readonly authClient: ClientProxy,
    private readonly configService: ConfigService,
  ) {}

  @Get("google")
  @UseGuards(GoogleOAuthGuard)
  @ApiOperation({ summary: "Start Google OAuth" })
  googleAuth(): void {
    return;
  }

  @Get("google/callback")
  @UseGuards(GoogleOAuthGuard)
  @ApiOperation({
    summary: "Google OAuth callback — redirect to CLIENT_URL with #accessToken=…",
  })
  async googleCallback(@Req() req: { user: GoogleUserPayload }, @Res() res: Response) {
    const payload = await sendRpc<{ accessToken: string; refreshToken: string }>(
      this.authClient,
      { cmd: AuthCmd.GENERATE_TOKENS },
      req.user,
    );

    const clientUrl =
      this.configService.get<string>("config.client.url") ?? "http://localhost:5173";
    const callbackPath =
      this.configService.get<string>("config.client.oauthCallbackPath") ??
      "/auth/callback";
    const refreshExpiresIn =
      this.configService.get<string>("config.refreshSignOptions.expiresIn") ?? "7d";

    redirectOAuthSuccess(res, clientUrl, callbackPath, payload, refreshExpiresIn);
  }
}
