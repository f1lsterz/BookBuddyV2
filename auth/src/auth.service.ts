import { Inject, Injectable } from "@nestjs/common";
import { ConfigType } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import config from "src/config/config";
import { LoginDto } from "./dto/loginDto";
import { RegistrationDto } from "./dto/registrationDto";
import { ApiError } from "../../api-gateway/src/common/errors/apiError";
import { ClientProxy } from "@nestjs/microservices";
import { lastValueFrom } from "rxjs";

@Injectable()
export class AuthService {
  constructor(
    @Inject(config.KEY) private configService: ConfigType<typeof config>,
    @Inject("USER_SERVICE") private readonly userClient: ClientProxy,
    private readonly jwtService: JwtService
  ) {}

  async validateGoogleUser(googleUser) {
    const user = await lastValueFrom(
      this.userClient.send({ cmd: "get-user-by-email" }, googleUser.email)
    );

    if (user) return user;

    return await lastValueFrom(
      this.userClient.send(
        { cmd: "create-user" },
        {
          email: googleUser.email,
          name: googleUser.name,
          photoUrl: googleUser.photoURL,
          password: "",
        }
      )
    );
  }

  async login(loginDto: LoginDto): Promise<{ accessToken: string; user: any }> {
    const { email, password } = loginDto;

    const user = await lastValueFrom(
      this.userClient.send({ cmd: "get-user-by-email" }, email)
    );

    if (!user || !(await this.validatePassword(password, user.password))) {
      throw ApiError.Unauthorized("Invalid email or password");
    }

    if (user.password === "") {
      throw ApiError.Unauthorized("Please login with Google");
    }

    const tokens = await this.generateTokens(user);
    return { accessToken: tokens.accessToken, user };
  }

  async registration(
    registrationDto: RegistrationDto
  ): Promise<{ accessToken: string; user: any }> {
    const { email, password, name } = registrationDto;

    const existing = await lastValueFrom(
      this.userClient.send({ cmd: "get-user-by-email" }, email)
    );

    if (existing) {
      throw ApiError.BadRequest("User with this email already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await lastValueFrom(
      this.userClient.send(
        { cmd: "create-user" },
        { email, password: hashedPassword, name }
      )
    );

    const tokens = await this.generateTokens(user);
    return { accessToken: tokens.accessToken, user };
  }

  private async validatePassword(
    password: string,
    userPassword: string
  ): Promise<boolean> {
    return await bcrypt.compare(password, userPassword);
  }

  async generateTokens(user: any) {
    const payload = {
      email: user.email,
      sub: user._id.toString(),
      role: user.role,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.secret,
      expiresIn: this.configService.signOptions.expiresIn,
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.secret,
      expiresIn: this.configService.refreshSignOptions.expiresIn,
    });

    return { accessToken, refreshToken };
  }
}
