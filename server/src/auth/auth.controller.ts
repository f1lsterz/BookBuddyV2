import { Body, Controller, Get, Post, Req, Res } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { Response, Request } from "express";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
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
