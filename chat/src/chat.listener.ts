import { Controller } from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";
import {
  ChatCmd,
  ClubMessagesRpcDto,
  ClearClubChatRpcDto,
  DeleteChatMessageRpcDto,
  SendMessageDto,
  UserMessagesQueryDto,
} from "@bookbuddy/shared";
import { ChatService } from "./chat.service";

@Controller()
export class ChatListener {
  constructor(private readonly chatService: ChatService) {}

  @MessagePattern({ cmd: ChatCmd.SEND_MESSAGE })
  async sendMessage(@Payload() dto: SendMessageDto) {
    return this.chatService.sendMessage(dto);
  }

  @MessagePattern({ cmd: ChatCmd.GET_BY_CLUB })
  async getMessagesByClub(@Payload() payload: ClubMessagesRpcDto) {
    return this.chatService.getMessagesByClub(
      payload.userId,
      payload.clubId,
      payload.limit,
      payload.skip,
    );
  }

  @MessagePattern({ cmd: ChatCmd.GET_BY_USER })
  async getMessagesByUser(@Payload() payload: UserMessagesQueryDto) {
    return this.chatService.getMessagesByUser(
      payload.userId,
      payload.limit,
      payload.skip,
    );
  }

  @MessagePattern({ cmd: ChatCmd.DELETE_MESSAGE })
  async deleteMessage(@Payload() payload: DeleteChatMessageRpcDto) {
    return this.chatService.deleteMessage(payload.messageId, payload.userId);
  }

  @MessagePattern({ cmd: ChatCmd.CLEAR_CLUB })
  async clearMessagesByClub(@Payload() payload: ClearClubChatRpcDto) {
    return this.chatService.clearMessagesByClub(payload.clubId, payload.actorId);
  }
}
