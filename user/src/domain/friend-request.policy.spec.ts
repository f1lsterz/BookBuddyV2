import { AppError } from "@bookbuddy/shared";
import { Types } from "mongoose";
import { Status } from "../../schemas/friend.request.schema";
import { FriendRequestPolicy } from "./friend-request.policy";

describe("FriendRequestPolicy", () => {
  const userA = new Types.ObjectId();
  const userB = new Types.ObjectId();

  it("detects mutual friendship", () => {
    const mutual = FriendRequestPolicy.areMutualFriends([userB], [userA], userA, userB);
    expect(mutual).toBe(true);
  });

  it("rejects duplicate pending request", () => {
    expect(() => FriendRequestPolicy.assertNoPendingDuplicate({})).toThrow(AppError);
  });

  it("rejects when already friends", () => {
    expect(() => FriendRequestPolicy.assertNotAlreadyFriends([userB], userB)).toThrow(
      /already friends/,
    );
  });

  it("assertPending only allows PENDING status", () => {
    expect(() => FriendRequestPolicy.assertPending(Status.ACCEPTED)).toThrow(AppError);
    expect(() => FriendRequestPolicy.assertPending(Status.PENDING)).not.toThrow();
  });

  it("assertNotSelf rejects self friend request", () => {
    expect(() =>
      FriendRequestPolicy.assertNotSelf(userA.toString(), userA.toString()),
    ).toThrow(/yourself/);
  });

  it("assertActorIsReceiver rejects wrong actor", () => {
    expect(() =>
      FriendRequestPolicy.assertActorIsReceiver(userB, userA.toString()),
    ).toThrow(AppError);
    expect(() =>
      FriendRequestPolicy.assertActorIsReceiver(userB, userB.toString()),
    ).not.toThrow();
  });
});
