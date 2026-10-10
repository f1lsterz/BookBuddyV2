import { Types } from "mongoose";
import { UserApplicationService } from "./user.application.service";
import { UserRepository } from "../infrastructure/user.repository";
import { FriendRequestRepository } from "../infrastructure/friend-request.repository";
import { LibraryRpcClient } from "../infrastructure/library-rpc.client";
import { NotificationApplicationService } from "./notification.application.service";
import { DomainEventOutboxService } from "../infrastructure/domain-event-outbox.service";
import { Cache } from "cache-manager";

describe("UserApplicationService", () => {
  const userA = new Types.ObjectId();
  const userB = new Types.ObjectId();

  let service: UserApplicationService;
  let userRepository: jest.Mocked<Pick<UserRepository, "findById">>;

  beforeEach(() => {
    userRepository = {
      findById: jest.fn(),
    };

    service = new UserApplicationService(
      { get: jest.fn(), set: jest.fn(), del: jest.fn() } as unknown as Cache,
      userRepository as unknown as UserRepository,
      {} as unknown as FriendRequestRepository,
      {} as unknown as LibraryRpcClient,
      { listForUser: jest.fn() } as unknown as NotificationApplicationService,
      {
        enqueueFriendRequestSent: jest.fn(),
        enqueueFriendRequestAccepted: jest.fn(),
      } as unknown as DomainEventOutboxService,
    );
  });

  it("areFriends returns true for same user", async () => {
    await expect(service.areFriends(userA.toString(), userA.toString())).resolves.toBe(
      true,
    );
    expect(userRepository.findById).not.toHaveBeenCalled();
  });

  it("areFriends uses mutual friendship in repository data", async () => {
    userRepository.findById.mockImplementation((id: string) => {
      if (id === userA.toString()) {
        return { _id: userA, friends: [userB] } as never;
      }
      return { _id: userB, friends: [userA] } as never;
    });

    await expect(service.areFriends(userA.toString(), userB.toString())).resolves.toBe(
      true,
    );
  });
});
