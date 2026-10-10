import { Inject, Injectable } from "@nestjs/common";
import { ConfigType } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import config from "src/config/config";
import {
  AppError,
  ForgotPasswordDto,
  LoginDto,
  RefreshTokenDto,
  RegistrationDto,
  ResetPasswordDto,
} from "@bookbuddy/shared";
import { AuthPolicy } from "../domain/auth.policy";
import { UserRpcClient } from "../infrastructure/user-rpc.client";
import { RefreshTokenStore } from "../infrastructure/refresh-token.store";
import { PasswordResetStore } from "../infrastructure/password-reset.store";
import { randomUUID } from "crypto";
import type { AuthUserRecord } from "../types/auth-user.record";

type AccessJwtPayload = {
  sub: string;
  email: string;
  role: string;
};

type RefreshJwtPayload = AccessJwtPayload & {
  jti: string;
  typ: "refresh";
};

@Injectable()
export class AuthApplicationService {
  constructor(
    @Inject(config.KEY) private readonly configService: ConfigType<typeof config>,
    private readonly userRpc: UserRpcClient,
    private readonly jwtService: JwtService,
    private readonly refreshTokenStore: RefreshTokenStore,
    private readonly passwordResetStore: PasswordResetStore,
  ) {}

  async validateGoogleUser(googleUser: {
    email: string;
    name?: string;
    photoUrl?: string;
    photoURL?: string;
    password?: string;
  }) {
    const user = await this.userRpc.getByEmail(googleUser.email);
    if (user) return user;

    return this.userRpc.createUser({
      email: googleUser.email,
      name: googleUser.name,
      photoUrl: googleUser.photoUrl ?? googleUser.photoURL,
      password: "",
    });
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const user = await this.userRpc.getByEmail(email);
    AuthPolicy.assertUserFound(user);
    AuthPolicy.assertPasswordLoginAllowed(user.password);
    const passwordOk = await bcrypt.compare(password, user.password);
    AuthPolicy.assertCredentialsValid(passwordOk);

    const tokens = await this.generateTokens(user);
    return { ...tokens, user };
  }

  async registration(registrationDto: RegistrationDto) {
    const { email, password, name } = registrationDto;
    const existing = await this.userRpc.getByEmail(email);
    AuthPolicy.assertEmailAvailable(existing);

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.userRpc.createUser({ email, password: hashedPassword, name });
    const tokens = await this.generateTokens(user);
    return { ...tokens, user };
  }

  async refresh(dto: RefreshTokenDto) {
    const payload = await this.verifyRefreshToken(dto.refreshToken);
    const active = await this.refreshTokenStore.isActive(payload.jti);
    if (!active) {
      throw AppError.unauthorized("Invalid refresh token");
    }

    await this.refreshTokenStore.revoke(payload.jti);

    const user = await this.userRpc.getById(payload.sub);
    AuthPolicy.assertUserFound(user, "Invalid refresh token");

    return this.generateTokens(user);
  }

  async revokeRefresh(dto: RefreshTokenDto): Promise<{ ok: true }> {
    try {
      const payload = await this.verifyRefreshToken(dto.refreshToken);
      await this.refreshTokenStore.revoke(payload.jti);
    } catch {
      // cookie may already be expired — still ok
    }
    return { ok: true };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.userRpc.getByEmail(dto.email);
    const response: { message: string; devResetToken?: string } = {
      message: "If the email is registered, password reset instructions were sent.",
    };

    if (!user) {
      return response;
    }

    const token = randomUUID();
    await this.passwordResetStore.create(user._id.toString(), token);

    if (process.env.NODE_ENV !== "production" && process.env.NODE_ENV !== "prod") {
      response.devResetToken = token;
    }

    return response;
  }

  async resetPassword(dto: ResetPasswordDto) {
    const userId = await this.passwordResetStore.consume(dto.token);
    if (!userId) {
      throw AppError.badRequest("Invalid or expired reset token");
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    await this.userRpc.updateUser({ id: userId, dto: { password: hashedPassword } });

    return { message: "Password updated" };
  }

  async generateTokens(user: AuthUserRecord) {
    const base: AccessJwtPayload = {
      email: user.email,
      sub: user._id.toString(),
      role: user.role,
    };

    const accessToken = await this.jwtService.signAsync(base, {
      secret: this.configService.secret,
      expiresIn: this.configService.signOptions.expiresIn,
    });

    const jti = randomUUID();
    const refreshPayload: RefreshJwtPayload = { ...base, jti, typ: "refresh" };
    const refreshToken = await this.jwtService.signAsync(refreshPayload, {
      secret: this.configService.secret,
      expiresIn: this.configService.refreshSignOptions.expiresIn,
    });

    await this.refreshTokenStore.register(jti, base.sub);

    return { accessToken, refreshToken };
  }

  private async verifyRefreshToken(token: string): Promise<RefreshJwtPayload> {
    try {
      const payload = await this.jwtService.verifyAsync<RefreshJwtPayload>(token, {
        secret: this.configService.secret,
      });
      if (payload.typ !== "refresh" || !payload.jti) {
        throw AppError.unauthorized("Invalid refresh token");
      }
      return payload;
    } catch {
      throw AppError.unauthorized("Invalid refresh token");
    }
  }
}
