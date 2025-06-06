import { IsMongoId } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class SendFriendRequestDto {
  @ApiProperty({ example: "6648bd14fdd295bb7f328fa1" })
  @IsMongoId()
  senderId: string;

  @ApiProperty({ example: "6648bd14fdd295bb7f328fa2" })
  @IsMongoId()
  receiverId: string;
}
