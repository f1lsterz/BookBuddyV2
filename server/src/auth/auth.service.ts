import { Inject, Injectable } from "@nestjs/common";
import { ConfigType } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { GoogleUser } from "src/common/types/googleUser";
import * as bcrypt from "bcrypt";
import config from "src/config/config";
import { UserService } from "src/user/user.service";
import { LoginDto } from "./dto/loginDto";
import { RegistrationDto } from "./dto/registrationDto";

@Injectable()
export class AuthService {
  constructor(
    @Inject(config.KEY) private configService: ConfigType<typeof config>,
    private readonly userService: UserService,
    private readonly jwtService: JwtService
  ) {}

  async validateGoogleUser(googleUser: GoogleUser): Promise<User> {
    const user = await this.userService.findByEmailOrId({
      email: googleUser.email,
    });

    if (user) return user;

    return this.userService.createUser({
      email: googleUser.email,
      name: googleUser.name,
      photoUrl: googleUser.photoURL,
      password: "",
      role: "USER",
    });
  }

  async login(
    loginDto: LoginDto
  ): Promise<{ accessToken: string; user: User }> {
    const { email, password } = loginDto;
    const user = await this.userService.findByEmailOrId({ email });

    if (!user || !(await this.validatePassword(password, user.password))) {
      throw new UnauthorizedException("Invalid email or password");
    }

    const accessToken = await this.generateAccessToken(user);

    return { user, accessToken };
  }

  async registration(
    registrationDto: RegistrationDto
  ): Promise<{ accessToken: string; user: User }> {
    console.log(registrationDto);
    const { email, password, name, role } = registrationDto;

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.userService.createUser({
      email,
      password: hashedPassword,
      name,
      role: role || "USER",
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
