import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
  IsArray,
} from "class-validator";
import { Transform } from "class-transformer";
import { Role } from "../../schemas/user.schema";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateUserDto {
  @ApiProperty({
    example: "goodday@gmail.com",
    description: "User email",
  })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ example: "filsterz", description: "User name" })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    example: "securePass123",
    description: "Password for the user account",
  })
  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @ApiPropertyOptional({
    example: "https://example.com/avatar.jpg",
    description: "User photo",
  })
  @IsOptional()
  @IsString()
  photoUrl?: string;

  @ApiPropertyOptional({
    example: "Like fantasy",
    description: "User bio",
  })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({
    enum: Role,
    example: Role.USER,
    description: "User role",
  })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @ApiPropertyOptional({
    example: ["Fantasy", "Adventure"],
    description: "Favourite genres",
    isArray: true,
    type: String,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  favouriteGenres?: string[];
}
