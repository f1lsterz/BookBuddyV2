import { Controller } from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { UserService } from "./user.service";

@Controller()
export class UserListener {
  constructor(private readonly userService: UserService) {}

  @MessagePattern({ cmd: "get-user-by-id" })
  async getUserById(@Payload() id: string) {
    return this.userService.findUserById(id);
  }

  @MessagePattern({ cmd: "get-user-by-email" })
  async getUserByEmail(@Payload() email: string) {
    return this.userService.findUserByEmail(email);
  }

  @MessagePattern({ cmd: "create-user" })
  async createUser(@Payload() createUserDto: any) {
    return this.userService.createUser(createUserDto);
  }

  @MessagePattern({ cmd: "update-user" })
  async updateUser(@Payload() payload: { id: string; dto: any }) {
    return this.userService.updateUser(payload.id, payload.dto);
  }

  @MessagePattern({ cmd: "delete-user" })
  async deleteUser(@Payload() id: string) {
    return this.userService.deleteUser(id);
  }

  @MessagePattern({ cmd: "send-friend-request" })
  async sendFriendRequest(
    @Payload() payload: { senderId: string; receiverId: string }
  ) {
    return this.userService.sendFriendRequest(
      payload.senderId,
      payload.receiverId
    );
  }

  @MessagePattern({ cmd: "accept-friend-request" })
  async acceptFriendRequest(@Payload() requestId: string) {
    return this.userService.acceptFriendRequest(requestId);
  }

  @MessagePattern({ cmd: "decline-friend-request" })
  async declineFriendRequest(@Payload() requestId: string) {
    return this.userService.declineFriendRequest(requestId);
  }

  @MessagePattern({ cmd: "get-pending-friend-requests" })
  async getPendingFriendRequests(@Payload() receiverId: string) {
    return this.userService.getPendingFriendRequests(receiverId);
  }

  @MessagePattern({ cmd: "get-friends" })
  async getFriends(@Payload() userId: string) {
    return this.userService.getFriends(userId);
  }

  @MessagePattern({ cmd: "remove-friend" })
  async removeFriend(@Payload() payload: { userId1: string; userId2: string }) {
    return this.userService.removeFriend(payload.userId1, payload.userId2);
  }
}
