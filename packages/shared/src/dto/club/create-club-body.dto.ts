import { IsNotEmpty, IsString } from "class-validator";

export class CreateClubBodyDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;
}
