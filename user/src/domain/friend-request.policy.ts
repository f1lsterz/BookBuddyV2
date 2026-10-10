import { AppError } from "@bookbuddy/shared";
import { Status } from "../../schemas/friend.request.schema";
import { Types } from "mongoose";

export class FriendRequestPolicy {
  static assertRequestExists<T>(request: T | null | undefined): asserts request is T {
    if (!request) {
      throw AppError.notFound("Friend request not found");
    }
  }

  static assertNoPendingDuplicate(existing: unknown): void {
    if (existing) {
      throw AppError.badRequest("Friend request already sent");
    }
  }

  static assertNotAlreadyFriends(
    senderFriends: Types.ObjectId[] | undefined,
    receiverId: Types.ObjectId,
  ): void {
    if (senderFriends?.some((id) => id.equals(receiverId))) {
      throw AppError.badRequest("You are already friends");
    }
  }

  static assertPending(status: Status): void {
    if (status !== Status.PENDING) {
      throw AppError.badRequest("Friend request is already processed");
    }
  }

  static assertNotSelf(senderId: string, receiverId: string): void {
    if (senderId === receiverId) {
      throw AppError.badRequest("You cannot send a friend request to yourself");
    }
  }

  static assertActorIsReceiver(
    receiverId: Types.ObjectId | string,
    actorId: string,
  ): void {
    if (String(receiverId) !== actorId) {
      throw AppError.forbidden("Only the recipient can respond to this friend request");
    }
  }

  static areMutualFriends(
    user1Friends: Types.ObjectId[] | undefined,
    user2Friends: Types.ObjectId[] | undefined,
    user1Id: Types.ObjectId,
    user2Id: Types.ObjectId,
  ): boolean {
    return (
      !!user1Friends?.some((id) => id.equals(user2Id)) &&
      !!user2Friends?.some((id) => id.equals(user1Id))
    );
  }
}
