import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import { AuthService } from "../../../auth/src/auth.service";
import { Response, Request } from "express";
import { LoginDto } from "../../../auth/src/dto/loginDto";
import { RegistrationDto } from "../../../auth/src/dto/registrationDto";
import { GoogleOAuthGuard } from "src/common/guards/googleOAuth.guard";
import { JwtAuthGuard } from "src/common/guards/jwtAuth.guard";
import { User } from "@prisma/client";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

@ApiTags("Authentication")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  @HttpCode(200)
  @ApiOperation({ summary: "User login" })
  @ApiResponse({ status: 200, description: "User successfully logged in" })
  @ApiResponse({ status: 401, description: "Invalid credentials" })
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response
  ): Promise<{ user: User }> {
    const { user, accessToken } = await this.authService.login(loginDto);

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return { user };
  }

  @Post("registration")
  @HttpCode(201)
  @ApiOperation({ summary: "User registration" })
  @ApiResponse({ status: 201, description: "User successfully registered" })
  @ApiResponse({ status: 400, description: "Validation error" })
  async registration(
    @Body() registrationDto: RegistrationDto,
    @Res({ passthrough: true }) res: Response
  ): Promise<{ user: User }> {
    const { user, accessToken } =
      await this.authService.registration(registrationDto);

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });
    return { user };
  }

  @Get("google")
  @UseGuards(GoogleOAuthGuard)
  googleLogin(): void {}

  @Get("google/callback")
  @UseGuards(GoogleOAuthGuard)
  async googleCallBack(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ): Promise<void> {
    const user = req.user;
    const accessToken = await this.authService.generateAccessToken(user);
    console.log(accessToken);

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.redirect(`${process.env.CLIENT_URL}/home`);
  }

  @Post("logout")
  @UseGuards(JwtAuthGuard)
  async logout(
    @Res({ passthrough: true }) res: Response
  ): Promise<{ message: string }> {
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });

    return { message: "Logout successful" };
  }
}
