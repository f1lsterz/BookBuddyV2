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
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

@ApiTags("Authentication")
@Controller("auth")
export class AuthController {
  constructor() {}
}
