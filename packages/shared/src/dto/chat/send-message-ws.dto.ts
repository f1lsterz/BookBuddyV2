import { IsMongoId, IsString, MinLength } from "class-validator";

/** WebSocket payload: user id comes from JWT on the socket. */
export class SendMessageWsDto {
  @IsMongoId()
  clubId: string;

  @IsString()
  @MinLength(1)
  message: string;
}
