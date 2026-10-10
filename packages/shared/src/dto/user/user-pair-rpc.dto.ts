import { IsMongoId } from "class-validator";

export class UserPairRpcDto {
  @IsMongoId()
  userId1: string;

  @IsMongoId()
  userId2: string;
}
