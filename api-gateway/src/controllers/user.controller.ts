import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
} from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { UpdateUserDto } from "../../../user/src/dto/updateUserDto";
import { CreateUserDto } from "../../../user/src/dto/createUserDto";
import { firstValueFrom } from "rxjs";
import { Access } from "src/common/decorators/access.decorator";

@Controller("user")
export class UserController {
  constructor(
    @Inject("USER_SERVICE") private readonly userClient: ClientProxy
  ) {}

  @Get(":id")
  @Access()
  async getUserById(@Param("id") id: string) {
    return firstValueFrom(this.userClient.send({ cmd: "get-user-by-id" }, id));
  }

  @Get("/email/:email")
  @Access()
  async getUserByEmail(@Param("email") email: string) {
    return firstValueFrom(
      this.userClient.send({ cmd: "get-user-by-email" }, email)
    );
  }

  @Post()
  @Access()
  async createUser(@Body() dto: CreateUserDto) {
    return firstValueFrom(this.userClient.send({ cmd: "create-user" }, dto));
  }

  @Patch(":id")
  @Access()
  async updateUser(@Param("id") id: string, @Body() dto: UpdateUserDto) {
    return firstValueFrom(
      this.userClient.send({ cmd: "update-user" }, { id, dto })
    );
  }

  @Delete(":id")
  @Access()
  async deleteUser(@Param("id") id: string) {
    return firstValueFrom(this.userClient.send({ cmd: "delete-user" }, id));
  }

  @Get(":id/friends")
  @Access()
  async getFriends(@Param("id") id: string) {
    return firstValueFrom(this.userClient.send({ cmd: "get-friends" }, id));
  }

  @Post("friend-request")
  @Access()
  async sendFriendRequest(
    @Body() payload: { senderId: string; receiverId: string }
  ) {
    return firstValueFrom(
      this.userClient.send({ cmd: "send-friend-request" }, payload)
    );
  }

  @Post("friend-request/:id/accept")
  @Access()
  async acceptFriendRequest(@Param("id") requestId: string) {
    return firstValueFrom(
      this.userClient.send({ cmd: "accept-friend-request" }, requestId)
    );
  }

  @Post("friend-request/:id/decline")
  @Access()
  async declineFriendRequest(@Param("id") requestId: string) {
    return firstValueFrom(
      this.userClient.send({ cmd: "decline-friend-request" }, requestId)
    );
  }

  @Get(":id/friend-requests")
  @Access()
  async getPendingFriendRequests(@Param("id") receiverId: string) {
    return firstValueFrom(
      this.userClient.send({ cmd: "get-pending-friend-requests" }, receiverId)
    );
  }

  @Delete("friend")
  @Access()
  async removeFriend(@Body() payload: { userId1: string; userId2: string }) {
    return firstValueFrom(
      this.userClient.send({ cmd: "remove-friend" }, payload)
    );
  }
}
