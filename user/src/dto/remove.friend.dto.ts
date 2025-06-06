import { IsMongoId } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class RemoveFriendDto {
  @ApiProperty({ example: "6648bd14fdd295bb7f328fa1" })
  @IsMongoId()
  userId1: string;

  @ApiProperty({ example: "6648bd14fdd295bb7f328fa2" })
  @IsMongoId()
  userId2: string;
}
