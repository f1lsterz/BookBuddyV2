import { IsMongoId } from "class-validator";

export class SendFriendRequestBodyDto {
  @IsMongoId()
  receiverId: string;
}
