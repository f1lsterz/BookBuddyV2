import { Controller } from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { UserService } from "./user.service";
import { CreateUserDto } from "./dto/createUserDto";
import { UpdateUserDto } from "./dto/updateUserDto";
import { SendFriendRequestDto } from "./dto/send.friend.dto";
import { RemoveFriendDto } from "./dto/remove.friend.dto";

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
  async createUser(@Payload() createUserDto: CreateUserDto) {
    return this.userService.createUser(createUserDto);
  }

  @MessagePattern({ cmd: "update-user" })
  async updateUser(@Payload() payload: { id: string; dto: UpdateUserDto }) {
    return this.userService.updateUser(payload.id, payload.dto);
  }

  @MessagePattern({ cmd: "delete-user" })
  async deleteUser(@Payload() id: string) {
    return this.userService.deleteUser(id);
  }

  @MessagePattern({ cmd: "send-friend-request" })
  async sendFriendRequest(@Payload() dto: SendFriendRequestDto) {
    return this.userService.sendFriendRequest(dto);
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
  async removeFriend(@Payload() dto: RemoveFriendDto) {
    return this.userService.removeFriend(dto);
  }
}
