import { Controller } from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { ChatService } from "./chat.service";
import { SendMessageDto } from "./dto/send.message.dto";

@Controller()
export class ChatListener {
  constructor(private readonly chatService: ChatService) {}

  @MessagePattern({ cmd: "chat.send-message" })
  async sendMessage(@Payload() dto: SendMessageDto) {
    return this.chatService.sendMessage(dto);
  }

  @MessagePattern({ cmd: "chat.get-messages-by-club" })
  async getMessagesByClub(
    @Payload()
    payload: {
      clubId: string;
      limit?: number;
      skip?: number;
    }
  ) {
    return this.chatService.getMessagesByClub(
      payload.clubId,
      payload.limit,
      payload.skip
    );
  }

  @MessagePattern({ cmd: "chat.get-messages-by-user" })
  async getMessagesByUser(
    @Payload()
    payload: {
      userId: string;
      limit?: number;
      skip?: number;
    }
  ) {
    return this.chatService.getMessagesByUser(
      payload.userId,
      payload.limit,
      payload.skip
    );
  }

  @MessagePattern({ cmd: "chat.delete-message" })
  async deleteMessage(
    @Payload()
    payload: {
      messageId: string;
      userId: string;
    }
  ) {
    return this.chatService.deleteMessage(payload.messageId, payload.userId);
  }

  @MessagePattern({ cmd: "chat.clear-club-messages" })
  async clearMessagesByClub(@Payload() clubId: string) {
    return this.chatService.clearMessagesByClub(clubId);
  }
}
