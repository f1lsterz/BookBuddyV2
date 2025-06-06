import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  HttpStatus,
  HttpCode,
} from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { UpdateUserDto } from "../../../user/src/dto/updateUserDto";
import { CreateUserDto } from "../../../user/src/dto/createUserDto";
import { firstValueFrom } from "rxjs";
import { Access } from "src/common/decorators/access.decorator";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
} from "@nestjs/swagger";

//@ApiBearerAuth("jwt")
@ApiTags("Users (Proxy)")
@Controller("user")
export class UserController {
  constructor(
    @Inject("USER_SERVICE") private readonly userClient: ClientProxy
  ) {}

  @Get(":id")
  //@Access()
  @ApiOperation({ summary: "Get user by ID" })
  @ApiParam({ name: "id", required: true, description: "User ID" })
  @ApiResponse({ status: HttpStatus.OK, description: "User found" })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: "User not found" })
  async getUserById(@Param("id") id: string) {
    return firstValueFrom(this.userClient.send({ cmd: "get-user-by-id" }, id));
  }

  @Get("/email/:email")
  @Access()
  @ApiOperation({ summary: "Get user by email" })
  @ApiParam({ name: "email", required: true, description: "User email" })
  @ApiResponse({ status: HttpStatus.OK, description: "User found" })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: "User not found" })
  async getUserByEmail(@Param("email") email: string) {
    return firstValueFrom(
      this.userClient.send({ cmd: "get-user-by-email" }, email)
    );
  }

  @Post()
  @ApiOperation({ summary: "Create user" })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: HttpStatus.CREATED, description: "User created" })
  async createUser(@Body() dto: CreateUserDto) {
    return firstValueFrom(this.userClient.send({ cmd: "create-user" }, dto));
  }

  @Patch(":id")
  @Access()
  @ApiOperation({ summary: "Update user" })
  @ApiParam({ name: "id", required: true, description: "User ID" })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({ status: HttpStatus.OK, description: "User updated" })
  async updateUser(@Param("id") id: string, @Body() dto: UpdateUserDto) {
    return firstValueFrom(
      this.userClient.send({ cmd: "update-user" }, { id, dto })
    );
  }

  @Delete(":id")
  @Access()
  @ApiOperation({ summary: "Delete user" })
  @ApiParam({ name: "id", required: true, description: "User ID" })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: "User deleted" })
  async deleteUser(@Param("id") id: string) {
    return firstValueFrom(this.userClient.send({ cmd: "delete-user" }, id));
  }

  @Get(":id/friends")
  @Access()
  @ApiOperation({ summary: "Get user's friends" })
  @ApiParam({ name: "id", required: true, description: "User ID" })
  @ApiResponse({ status: HttpStatus.OK, description: "List of friends" })
  async getFriends(@Param("id") id: string) {
    return firstValueFrom(this.userClient.send({ cmd: "get-friends" }, id));
  }

  @Post("friend-request")
  @Access()
  @ApiOperation({ summary: "Send friend request" })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        senderId: { type: "string" },
        receiverId: { type: "string" },
      },
      required: ["senderId", "receiverId"],
    },
  })
  @ApiResponse({ status: HttpStatus.CREATED, description: "Request sent" })
  async sendFriendRequest(
    @Body() payload: { senderId: string; receiverId: string }
  ) {
    return firstValueFrom(
      this.userClient.send({ cmd: "send-friend-request" }, payload)
    );
  }

  @Post("friend-request/:id/accept")
  @Access()
  @ApiOperation({ summary: "Accept friend request" })
  @ApiParam({ name: "id", description: "Friend request ID" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Friend request accepted",
  })
  async acceptFriendRequest(@Param("id") requestId: string) {
    return firstValueFrom(
      this.userClient.send({ cmd: "accept-friend-request" }, requestId)
    );
  }

  @Post("friend-request/:id/decline")
  @Access()
  @ApiOperation({ summary: "Decline friend request" })
  @ApiParam({ name: "id", description: "Friend request ID" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Friend request declined",
  })
  async declineFriendRequest(@Param("id") requestId: string) {
    return firstValueFrom(
      this.userClient.send({ cmd: "decline-friend-request" }, requestId)
    );
  }

  @Get(":id/friend-requests")
  @Access()
  @ApiOperation({ summary: "Get pending friend requests" })
  @ApiParam({ name: "id", description: "User ID" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "List of friend requests",
  })
  async getPendingFriendRequests(@Param("id") receiverId: string) {
    return firstValueFrom(
      this.userClient.send({ cmd: "get-pending-friend-requests" }, receiverId)
    );
  }

  @Delete("friend")
  @Access()
  @ApiOperation({ summary: "Remove a friend" })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        userId1: { type: "string" },
        userId2: { type: "string" },
      },
      required: ["userId1", "userId2"],
    },
  })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: "Friend removed" })
  async removeFriend(@Body() payload: { userId1: string; userId2: string }) {
    return firstValueFrom(
      this.userClient.send({ cmd: "remove-friend" }, payload)
    );
  }
}
