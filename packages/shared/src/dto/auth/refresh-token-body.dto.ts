import { IsOptional, IsString } from "class-validator";

/** Gateway HTTP body: refresh may come from httpOnly cookie instead. */
export class RefreshTokenBodyDto {
  @IsOptional()
  @IsString()
  refreshToken?: string;
}
