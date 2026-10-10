import { IsMongoId } from "class-validator";

export class RemoveFriendDto {
  @IsMongoId()
  userId1: string;

  @IsMongoId()
  userId2: string;
}
