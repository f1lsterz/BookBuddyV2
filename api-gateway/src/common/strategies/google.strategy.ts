import { Inject, Injectable } from "@nestjs/common";
import { ConfigType } from "@nestjs/config";
import { ClientProxy } from "@nestjs/microservices";
import { PassportStrategy } from "@nestjs/passport";
import { Profile, Strategy, VerifyCallback } from "passport-google-oauth20";
import { AuthCmd, AppError } from "@bookbuddy/shared";
import { lastValueFrom } from "rxjs";
import config from "src/config/config";
import type { AuthUserRecord } from "src/common/types/auth-user.record";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, "google") {
  constructor(
    @Inject(config.KEY) configService: ConfigType<typeof config>,
    @Inject("AUTH_SERVICE") private readonly authClient: ClientProxy,
  ) {
    const { clientID, clientSecret, callbackURL } = configService.google;
    if (!clientID || !clientSecret || !callbackURL) {
      throw new Error(
        "Google OAuth is not configured (GOOGLE_CLIENT_ID / SECRET / CALLBACK)",
      );
    }

    super({
      clientID,
      clientSecret,
      callbackURL,
      scope: ["email", "profile"],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): Promise<void> {
    const email = profile.emails?.[0]?.value;
    const name = profile.displayName;
    const photoUrl = profile.photos?.[0]?.value;

    if (!email) {
      return done(AppError.badRequest("Google account does not have an email."), false);
    }

    try {
      const user = await lastValueFrom(
        this.authClient.send<AuthUserRecord>(
          { cmd: AuthCmd.VALIDATE_GOOGLE_USER },
          { email, name, photoUrl },
        ),
      );
      done(null, user);
    } catch (err) {
      done(err as Error, false);
    }
  }
}
