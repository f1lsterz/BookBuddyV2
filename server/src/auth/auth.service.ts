import { Inject, Injectable } from "@nestjs/common";
import { ConfigType } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { GoogleUser } from "src/common/types/googleUser";
import * as bcrypt from "bcrypt";
import config from "src/config/config";
import { UserService } from "src/user/user.service";
import { LoginDto } from "./dto/loginDto";
import { RegistrationDto } from "./dto/registrationDto";
import { User } from "@prisma/client";
import { ApiError } from "src/common/errors/apiError";

@Injectable()
export class AuthService {
  constructor(
    @Inject(config.KEY) private configService: ConfigType<typeof config>,
    private readonly userService: UserService,
    private readonly jwtService: JwtService
  ) {}

  async validateGoogleUser(googleUser: GoogleUser): Promise<User> {
    const user = await this.userService.findUserByEmail(googleUser.email);

    if (user) return user;

    return this.userService.createUser({
      email: googleUser.email,
      name: googleUser.name,
      photoUrl: googleUser.photoURL,
      password: "",
    });
  }

  async login(
    loginDto: LoginDto
  ): Promise<{ accessToken: string; user: User }> {
    const { email, password } = loginDto;
    const user = await this.userService.findUserByEmail(email);

    if (!user || !(await this.validatePassword(password, user.password))) {
      throw ApiError.Unauthorized("Invalid email or password");
    }

    if (user && user.password === "") {
      throw ApiError.Unauthorized("Please login with Google");
    }

    const accessToken = await this.generateAccessToken(user);

    return { user, accessToken };
  }

  async registration(
    registrationDto: RegistrationDto
  ): Promise<{ accessToken: string; user: User }> {
    const { email, password, name } = registrationDto;

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.userService.createUser({
      email,
      password: hashedPassword,
      name,
    });

    const accessToken = await this.generateAccessToken(user);

    return { user, accessToken };
  }

  private async validatePassword(
    password: string,
    userPassword: string
  ): Promise<boolean> {
    return await bcrypt.compare(password, userPassword);
  }

  async generateAccessToken(user: any): Promise<string> {
    const payload = { email: user.email, sub: user.id };
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.secret,
      expiresIn: this.configService.signOptions.expiresIn,
    });
    return accessToken;
  }
}
