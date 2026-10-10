import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import {
  AppError,
  RemoveFriendDto,
  Role,
  FriendRequestActionRpcDto,
  SendFriendRequestDto,
  SendFriendRequestBodyDto,
  UpdateUserDto,
  UserCmd,
  ListNotificationsQueryDto,
} from "@bookbuddy/shared";
import { sendRpc } from "src/common/rpc/send-rpc";
import { Access } from "src/common/decorators/access.decorator";
import { CurrentUser } from "src/common/decorators/current.user.decorator";
import { SelfOrAdminGuard } from "src/common/guards/self-or-admin.guard";
import { RequestUser } from "src/common/types/request-user";
import { ApiTags, ApiOperation, ApiParam, ApiBody, ApiBearerAuth } from "@nestjs/swagger";
import {
  RemoveFriendApiDto,
  SendFriendRequestApiDto,
  UpdateUserApiDto,
} from "../dto/swagger/user.swagger";

@ApiBearerAuth()
@ApiTags("Users (Proxy)")
@Controller("user")
export class UserController {
  constructor(@Inject("USER_SERVICE") private readonly userClient: ClientProxy) {}

  @Get("me/friends")
  @ApiOperation({ summary: "Get my friends" })
  async getMyFriends(@CurrentUser() user: RequestUser) {
    return sendRpc<unknown>(this.userClient, { cmd: UserCmd.GET_FRIENDS }, user.userId);
  }

  @Get("me/notifications")
  @ApiOperation({ summary: "In-app notifications (from domain events)" })
  async getMyNotifications(
    @CurrentUser() user: RequestUser,
    @Query() query: ListNotificationsQueryDto,
  ) {
    return sendRpc<unknown>(
      this.userClient,
      { cmd: UserCmd.LIST_NOTIFICATIONS },
      { userId: user.userId, unreadOnly: query.unreadOnly },
    );
  }

  @Patch("me/notifications/read-all")
  @ApiOperation({ summary: "Mark all notifications as read" })
  async markAllNotificationsRead(@CurrentUser() user: RequestUser) {
    return sendRpc<unknown>(
      this.userClient,
      { cmd: UserCmd.MARK_ALL_NOTIFICATIONS_READ },
      user.userId,
    );
  }

  @Patch("me/notifications/:id/read")
  @ApiOperation({ summary: "Mark one notification as read" })
  async markNotificationRead(
    @CurrentUser() user: RequestUser,
    @Param("id") notificationId: string,
  ) {
    return sendRpc<unknown>(
      this.userClient,
      { cmd: UserCmd.MARK_NOTIFICATION_READ },
      { userId: user.userId, notificationId },
    );
  }

  @Get("me/friend-requests")
  @ApiOperation({ summary: "Get my pending friend requests" })
  async getMyPendingFriendRequests(@CurrentUser() user: RequestUser) {
    return sendRpc<unknown>(
      this.userClient,
      { cmd: UserCmd.GET_PENDING_FRIEND_REQUESTS },
      user.userId,
    );
  }

  @Post("friend-request")
  @ApiOperation({ summary: "Send friend request" })
  @ApiBody({ type: SendFriendRequestApiDto })
  async sendFriendRequest(
    @Body() body: SendFriendRequestBodyDto,
    @CurrentUser() user: RequestUser,
  ) {
    const payload: SendFriendRequestDto = {
      senderId: user.userId,
      receiverId: body.receiverId,
    };
    return sendRpc<unknown>(
      this.userClient,
      { cmd: UserCmd.SEND_FRIEND_REQUEST },
      payload,
    );
  }

  @Post("friend-request/:id/accept")
  @ApiOperation({ summary: "Accept friend request" })
  async acceptFriendRequest(
    @Param("id") requestId: string,
    @CurrentUser() user: RequestUser,
  ) {
    const payload: FriendRequestActionRpcDto = { requestId, actorId: user.userId };
    return sendRpc<unknown>(
      this.userClient,
      { cmd: UserCmd.ACCEPT_FRIEND_REQUEST },
      payload,
    );
  }

  @Post("friend-request/:id/decline")
  @ApiOperation({ summary: "Decline friend request" })
  async declineFriendRequest(
    @Param("id") requestId: string,
    @CurrentUser() user: RequestUser,
  ) {
    const payload: FriendRequestActionRpcDto = { requestId, actorId: user.userId };
    return sendRpc<unknown>(
      this.userClient,
      { cmd: UserCmd.DECLINE_FRIEND_REQUEST },
      payload,
    );
  }

  @Delete("friend")
  @ApiOperation({ summary: "Remove a friend" })
  @ApiBody({ type: RemoveFriendApiDto })
  async removeFriend(@Body() payload: RemoveFriendDto, @CurrentUser() user: RequestUser) {
    const isParticipant =
      payload.userId1 === user.userId || payload.userId2 === user.userId;
    if (!isParticipant && user.role !== Role.ADMIN) {
      throw AppError.forbidden("You can only remove your own friendships");
    }
    return sendRpc<unknown>(this.userClient, { cmd: UserCmd.REMOVE_FRIEND }, payload);
  }

  @Get(":id")
  @UseGuards(SelfOrAdminGuard)
  @ApiOperation({ summary: "Get user by ID (self or admin)" })
  @ApiParam({ name: "id", required: true, description: "User ID" })
  async getUserById(@Param("id") id: string) {
    return sendRpc<unknown>(this.userClient, { cmd: UserCmd.GET_BY_ID }, id);
  }

  @Patch(":id")
  @UseGuards(SelfOrAdminGuard)
  @ApiOperation({ summary: "Update user (self or admin)" })
  @ApiBody({ type: UpdateUserApiDto })
  async updateUser(@Param("id") id: string, @Body() dto: UpdateUserDto) {
    return sendRpc<unknown>(this.userClient, { cmd: UserCmd.UPDATE }, { id, dto });
  }

  @Delete(":id")
  @Access(Role.ADMIN)
  @ApiOperation({ summary: "Delete user (admin)" })
  async deleteUser(@Param("id") id: string) {
    return sendRpc<unknown>(this.userClient, { cmd: UserCmd.DELETE }, id);
  }
}
