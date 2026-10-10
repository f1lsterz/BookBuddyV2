import { IsMongoId } from "class-validator";

export class SendFriendRequestDto {
  @IsMongoId()
  senderId: string;

  @IsMongoId()
  receiverId: string;
}
