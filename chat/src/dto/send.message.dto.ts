import { IsMongoId, IsNotEmpty, IsString } from "class-validator";

export class SendMessageDto {
  @IsMongoId()
  clubId: string;

  @IsMongoId()
  userId: string;

  @IsString()
  @IsNotEmpty()
  message: string;
}
