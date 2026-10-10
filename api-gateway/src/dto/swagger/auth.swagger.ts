import { ApiProperty } from "@nestjs/swagger";
import { LoginDto, RegistrationDto } from "@bookbuddy/shared";

export class LoginApiDto extends LoginDto {
  @ApiProperty({ example: "user@example.com" })
  declare email: string;

  @ApiProperty({ example: "secret123" })
  declare password: string;
}

export class RegistrationApiDto extends RegistrationDto {
  @ApiProperty({ example: "user@example.com" })
  declare email: string;

  @ApiProperty({ example: "secret123" })
  declare password: string;

  @ApiProperty({ example: "Jane Doe" })
  declare name: string;
}
