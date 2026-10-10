import { Controller } from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";
import {
  CreateUserDto,
  RemoveFriendDto,
  FriendRequestActionRpcDto,
  SendFriendRequestDto,
  UpdateUserRpcDto,
  UserCmd,
  UserPairRpcDto,
  ListNotificationsRpcDto,
  MarkNotificationReadRpcDto,
} from "@bookbuddy/shared";
import { UserApplicationService } from "../application/user.application.service";

@Controller()
export class UserListener {
  constructor(private readonly userApplication: UserApplicationService) {}

  @MessagePattern({ cmd: UserCmd.GET_BY_ID })
  async getUserById(@Payload() id: string) {
    return this.userApplication.findUserById(id);
  }

  @MessagePattern({ cmd: UserCmd.GET_BY_EMAIL })
  async getUserByEmail(@Payload() email: string) {
    return this.userApplication.findUserByEmail(email);
  }

  @MessagePattern({ cmd: UserCmd.CREATE })
  async createUser(@Payload() createUserDto: CreateUserDto) {
    return this.userApplication.createUser(createUserDto);
  }

  @MessagePattern({ cmd: UserCmd.UPDATE })
  async updateUser(@Payload() payload: UpdateUserRpcDto) {
    return this.userApplication.updateUser(payload.id, payload.dto);
  }

  @MessagePattern({ cmd: UserCmd.DELETE })
  async deleteUser(@Payload() id: string) {
    return this.userApplication.deleteUser(id);
  }

  @MessagePattern({ cmd: UserCmd.SEND_FRIEND_REQUEST })
  async sendFriendRequest(@Payload() dto: SendFriendRequestDto) {
    return this.userApplication.sendFriendRequest(dto);
  }

  @MessagePattern({ cmd: UserCmd.ACCEPT_FRIEND_REQUEST })
  async acceptFriendRequest(@Payload() payload: FriendRequestActionRpcDto) {
    return this.userApplication.acceptFriendRequest(payload.requestId, payload.actorId);
  }

  @MessagePattern({ cmd: UserCmd.DECLINE_FRIEND_REQUEST })
  async declineFriendRequest(@Payload() payload: FriendRequestActionRpcDto) {
    return this.userApplication.declineFriendRequest(payload.requestId, payload.actorId);
  }

  @MessagePattern({ cmd: UserCmd.GET_PENDING_FRIEND_REQUESTS })
  async getPendingFriendRequests(@Payload() receiverId: string) {
    return this.userApplication.getPendingFriendRequests(receiverId);
  }

  @MessagePattern({ cmd: UserCmd.GET_FRIENDS })
  async getFriends(@Payload() userId: string) {
    return this.userApplication.getFriends(userId);
  }

  @MessagePattern({ cmd: UserCmd.ARE_FRIENDS })
  async areFriends(@Payload() payload: UserPairRpcDto) {
    return this.userApplication.areFriends(payload.userId1, payload.userId2);
  }

  @MessagePattern({ cmd: UserCmd.REMOVE_FRIEND })
  async removeFriend(@Payload() dto: RemoveFriendDto) {
    return this.userApplication.removeFriend(dto);
  }

  @MessagePattern({ cmd: UserCmd.LIST_NOTIFICATIONS })
  async listNotifications(@Payload() payload: ListNotificationsRpcDto) {
    return this.userApplication.listNotifications(payload.userId, payload.unreadOnly);
  }

  @MessagePattern({ cmd: UserCmd.MARK_NOTIFICATION_READ })
  async markNotificationRead(@Payload() payload: MarkNotificationReadRpcDto) {
    return this.userApplication.markNotificationRead(
      payload.userId,
      payload.notificationId,
    );
  }

  @MessagePattern({ cmd: UserCmd.MARK_ALL_NOTIFICATIONS_READ })
  async markAllNotificationsRead(@Payload() userId: string) {
    return this.userApplication.markAllNotificationsRead(userId);
  }
}
