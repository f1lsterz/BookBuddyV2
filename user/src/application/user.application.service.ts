import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject, Injectable } from "@nestjs/common";
import { Cache } from "cache-manager";
import { UserDocument } from "../../schemas/user.schema";
import { Status } from "../../schemas/friend.request.schema";
import {
  CreateUserDto,
  RemoveFriendDto,
  SendFriendRequestDto,
  UpdateUserDto,
} from "@bookbuddy/shared";
import {
  FriendInfo,
  FriendRequestInfo,
  MessageResponse,
  UserPublicInfo,
} from "../types/user.return.types";
import { CACHE_USERS } from "../config/cache.keys";
import { FriendRequestPolicy } from "../domain/friend-request.policy";
import { UserPolicy } from "../domain/user.policy";
import { FriendRequestRepository } from "../infrastructure/friend-request.repository";
import { LibraryRpcClient } from "../infrastructure/library-rpc.client";
import { UserRepository } from "../infrastructure/user.repository";
import { NotificationApplicationService } from "./notification.application.service";
import { DomainEventOutboxService } from "../infrastructure/domain-event-outbox.service";

@Injectable()
export class UserApplicationService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly userRepository: UserRepository,
    private readonly friendRequestRepository: FriendRequestRepository,
    private readonly libraryRpc: LibraryRpcClient,
    private readonly notificationApplication: NotificationApplicationService,
    private readonly domainEventOutbox: DomainEventOutboxService,
  ) {}

  async listNotifications(userId: string, unreadOnly?: boolean) {
    UserPolicy.assertValidObjectId(userId);
    return this.notificationApplication.listForUser(userId, unreadOnly);
  }

  async markNotificationRead(userId: string, notificationId: string) {
    UserPolicy.assertValidObjectId(userId);
    UserPolicy.assertValidObjectId(notificationId);
    return this.notificationApplication.markRead(userId, notificationId);
  }

  async markAllNotificationsRead(userId: string) {
    UserPolicy.assertValidObjectId(userId);
    return this.notificationApplication.markAllRead(userId);
  }

  async findUserById(id: string): Promise<UserDocument> {
    UserPolicy.assertValidObjectId(id);

    const cacheKey = CACHE_USERS.USER(id);
    const cached = await this.cacheManager.get<UserDocument>(cacheKey);
    if (cached) return cached;

    const user = await this.userRepository.findById(id);
    UserPolicy.assertUserExists(user, `User with ID ${id} not found`);

    await this.cacheManager.set(cacheKey, user, 3600);
    return user;
  }

  async findUserByEmail(email: string): Promise<UserDocument> {
    UserPolicy.assertEmailPresent(email);

    const cacheKey = CACHE_USERS.USER_BY_EMAIL(email);
    const cached = await this.cacheManager.get<UserDocument>(cacheKey);
    if (cached) return cached;

    const user = await this.userRepository.findByEmail(email);
    UserPolicy.assertUserExists(user, `User with email ${email} not found`);

    await this.cacheManager.set(cacheKey, user, 3600);
    return user;
  }

  async findAllUsers(): Promise<UserPublicInfo[]> {
    const cacheKey = CACHE_USERS.ALL_USERS;
    const cached = await this.cacheManager.get<UserPublicInfo[]>(cacheKey);
    if (cached) return cached;

    const users = await this.userRepository.findAllPublic();
    await this.cacheManager.set(cacheKey, users, 0);
    return users;
  }

  async createUser(createUserDto: CreateUserDto): Promise<UserDocument> {
    const existing = await this.userRepository.findByEmail(createUserDto.email);
    UserPolicy.assertEmailNotTaken(existing);

    const savedUser = await this.userRepository.create(createUserDto);

    await this.cacheManager.set(
      CACHE_USERS.USER(savedUser._id.toString()),
      savedUser,
      3600,
    );
    await this.cacheManager.set(
      CACHE_USERS.USER_BY_EMAIL(savedUser.email),
      savedUser,
      3600,
    );
    await this.cacheManager.del(CACHE_USERS.ALL_USERS);

    await this.libraryRpc.provisionDefaultLibraries(savedUser._id.toString());

    return savedUser;
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<UserDocument> {
    UserPolicy.assertValidObjectId(id);

    const updatedUser = await this.userRepository.updateById(id, updateUserDto);
    UserPolicy.assertUserExists(updatedUser);

    await this.cacheManager.set(CACHE_USERS.USER(id), updatedUser, 3600);
    await this.cacheManager.set(
      CACHE_USERS.USER_BY_EMAIL(updatedUser.email),
      updatedUser,
      3600,
    );
    await this.cacheManager.del(CACHE_USERS.ALL_USERS);

    return updatedUser;
  }

  async deleteUser(id: string): Promise<UserDocument> {
    UserPolicy.assertValidObjectId(id);

    const deletedUser = await this.userRepository.deleteById(id);
    UserPolicy.assertUserExists(deletedUser);

    await this.cacheManager.del(CACHE_USERS.USER(id));
    await this.cacheManager.del(CACHE_USERS.USER_BY_EMAIL(deletedUser.email));
    await this.cacheManager.del(CACHE_USERS.ALL_USERS);

    return deletedUser;
  }

  async sendFriendRequest(dto: SendFriendRequestDto) {
    FriendRequestPolicy.assertNotSelf(dto.senderId, dto.receiverId);
    const [sender, receiver] = await Promise.all([
      this.findUserById(dto.senderId),
      this.findUserById(dto.receiverId),
    ]);

    const existing = await this.friendRequestRepository.findPendingDuplicate(
      dto.senderId,
      dto.receiverId,
    );
    FriendRequestPolicy.assertNoPendingDuplicate(existing);
    FriendRequestPolicy.assertNotAlreadyFriends(sender.friends, receiver._id);

    const request = await this.userRepository.withTransaction(async (session) => {
      const created = await this.friendRequestRepository.createPending(dto, session);
      await this.domainEventOutbox.enqueueFriendRequestSent(
        {
          requestId: created._id.toString(),
          senderId: dto.senderId,
          senderName: sender.name || "",
          receiverId: dto.receiverId,
        },
        session,
      );
      return created;
    });

    return request;
  }

  async acceptFriendRequest(requestId: string, actorId: string) {
    const request = await this.friendRequestRepository.findById(requestId);
    FriendRequestPolicy.assertRequestExists(request);
    FriendRequestPolicy.assertActorIsReceiver(request.receiverId, actorId);
    FriendRequestPolicy.assertPending(request.status);

    const [sender, receiver] = await Promise.all([
      this.findUserById(String(request.senderId)),
      this.findUserById(String(request.receiverId)),
    ]);

    await this.userRepository.withTransaction(async (session) => {
      await this.userRepository.addFriendship(sender._id, receiver._id, session);

      request.status = Status.ACCEPTED;
      await this.friendRequestRepository.save(request, session);

      await this.domainEventOutbox.enqueueFriendRequestAccepted(
        {
          requestId: request._id.toString(),
          senderId: sender._id.toString(),
          receiverId: receiver._id.toString(),
          receiverName: receiver.name || "",
        },
        session,
      );
    });

    return { message: "Friend request accepted" };
  }

  async declineFriendRequest(
    requestId: string,
    actorId: string,
  ): Promise<MessageResponse> {
    const request = await this.friendRequestRepository.findById(requestId);
    FriendRequestPolicy.assertRequestExists(request);
    FriendRequestPolicy.assertActorIsReceiver(request.receiverId, actorId);
    FriendRequestPolicy.assertPending(request.status);

    request.status = Status.DECLINED;
    await this.friendRequestRepository.save(request);

    return { message: "Friend request declined" };
  }

  async getPendingFriendRequests(receiverId: string): Promise<FriendRequestInfo[]> {
    const cacheKey = CACHE_USERS.PENDING_REQUESTS(receiverId);
    const cached = await this.cacheManager.get<FriendRequestInfo[]>(cacheKey);
    if (cached) return cached;

    const requests =
      await this.friendRequestRepository.findPendingForReceiver(receiverId);

    const result = requests.map((r) => {
      const sender = r.senderId;
      return {
        id: r._id.toString(),
        senderId: sender._id.toString(),
        name: sender.name || "",
        profileImage: sender.photoUrl || "",
      };
    });

    await this.cacheManager.set(cacheKey, result, 3600);
    return result;
  }

  async areFriends(userId1: string, userId2: string): Promise<boolean> {
    if (userId1 === userId2) {
      return true;
    }
    const [user1, user2] = await Promise.all([
      this.findUserById(userId1),
      this.findUserById(userId2),
    ]);
    return FriendRequestPolicy.areMutualFriends(
      user1.friends,
      user2.friends,
      user1._id,
      user2._id,
    );
  }

  async getFriends(userId: string): Promise<FriendInfo[]> {
    const cacheKey = CACHE_USERS.FRIENDS(userId);
    const cached = await this.cacheManager.get<FriendInfo[]>(cacheKey);
    if (cached) return cached;

    const user = await this.userRepository.findByIdWithFriendsPopulated(userId);
    UserPolicy.assertUserExists(user);

    const result = user.friends.map((friend) => ({
      userId: friend._id.toString(),
      name: friend.name || "",
      profileImage: friend.photoUrl || "",
    }));

    await this.cacheManager.set(cacheKey, result, 3600);
    return result;
  }

  async removeFriend(dto: RemoveFriendDto): Promise<MessageResponse> {
    const [user1, user2] = await Promise.all([
      this.findUserById(dto.userId1),
      this.findUserById(dto.userId2),
    ]);

    const isFriend = FriendRequestPolicy.areMutualFriends(
      user1.friends,
      user2.friends,
      user1._id,
      user2._id,
    );

    if (!isFriend) {
      return { message: "You are not friends" };
    }

    await this.userRepository.removeFriendship(dto.userId1, user2._id, user1._id);

    return { message: "Friendship removed" };
  }
}
