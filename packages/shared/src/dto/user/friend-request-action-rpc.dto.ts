import { IsMongoId } from "class-validator";

export class FriendRequestActionRpcDto {
  @IsMongoId()
  requestId: string;

  /** Must match the friend request receiver (from JWT on gateway). */
  @IsMongoId()
  actorId: string;
}
