import { ApiProperty } from "@nestjs/swagger";
import {
  RemoveFriendDto,
  SendFriendRequestBodyDto,
  UpdateUserDto,
} from "@bookbuddy/shared";

export class UpdateUserApiDto extends UpdateUserDto {}

export class SendFriendRequestApiDto extends SendFriendRequestBodyDto {
  @ApiProperty({ example: "6648bd14fdd295bb7f328fa2" })
  declare receiverId: string;
}

export class RemoveFriendApiDto extends RemoveFriendDto {
  @ApiProperty({ example: "6648bd14fdd295bb7f328fa1" })
  declare userId1: string;

  @ApiProperty({ example: "6648bd14fdd295bb7f328fa2" })
  declare userId2: string;
}
