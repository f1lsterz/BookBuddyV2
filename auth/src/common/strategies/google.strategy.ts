import { Inject, Injectable } from "@nestjs/common";
import { ConfigType } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Profile, Strategy, VerifyCallback } from "passport-google-oauth20";
import { AuthService } from "src/auth.service";
import config from "src/config/config";
import { ApiError } from "../../../../api-gateway/src/common/errors/apiError";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, "google") {
  constructor(
    @Inject(config.KEY) private configService: ConfigType<typeof config>,
    private readonly authService: AuthService
  ) {
    const { clientID, clientSecret, callbackURL } = configService.google;

    if (!clientID || !clientSecret || !callbackURL) {
      throw ApiError.BadRequest("Google OAuth config is incomplete");
    }

    super({
      clientID,
      clientSecret,
      callbackURL,
      scope: ["email", "profile"],
      passReqToCallback: false,
    });
  }
  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: VerifyCallback
  ): Promise<any> {
    const email = profile.emails?.[0]?.value;
    const name = profile.displayName;
    const photoUrl = profile.photos?.[0]?.value;

    if (!email) {
      return done(
        ApiError.BadRequest("Google account does not have an email."),
        false
      );
    }

    const user = await this.authService.validateGoogleUser({
      email,
      name,
      photoUrl,
      password: "",
    });

    done(null, user);
  }
}
