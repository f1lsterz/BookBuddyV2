import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Delete,
  Inject,
  HttpStatus,
  HttpCode,
} from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { firstValueFrom } from "rxjs";
import { SendMessageDto } from "../../../chat/src/dto/send.message.dto";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from "@nestjs/swagger";

@ApiTags("Chats (Proxy)")
@Controller("chats")
export class ChatController {
  constructor(
    @Inject("CHAT_SERVICE") private readonly chatClient: ClientProxy
  ) {}

  @Post("send-message")
  @ApiOperation({ summary: "Send a message to a club chat" })
  @ApiBody({ type: SendMessageDto })
  @ApiResponse({ status: HttpStatus.CREATED, description: "Message sent" })
  async sendMessage(@Body() dto: SendMessageDto) {
    return firstValueFrom(
      this.chatClient.send({ cmd: "chat.send-message" }, dto)
    );
  }

  @Get("club/:clubId/messages")
  @ApiOperation({ summary: "Get messages by club ID" })
  @ApiParam({ name: "clubId", required: true, description: "Club ID" })
  @ApiResponse({ status: HttpStatus.OK, description: "Messages retrieved" })
  async getMessagesByClub(
    @Param("clubId") clubId: string,
    @Query("limit") limit?: number,
    @Query("skip") skip?: number
  ) {
    return firstValueFrom(
      this.chatClient.send(
        { cmd: "chat.get-messages-by-club" },
        { clubId, limit: Number(limit), skip: Number(skip) }
      )
    );
  }

  @Get("user/:userId/messages")
  @ApiOperation({ summary: "Get messages by user ID" })
  @ApiParam({ name: "userId", required: true, description: "User ID" })
  @ApiResponse({ status: HttpStatus.OK, description: "Messages retrieved" })
  async getMessagesByUser(
    @Param("userId") userId: string,
    @Query("limit") limit?: number,
    @Query("skip") skip?: number
  ) {
    return firstValueFrom(
      this.chatClient.send(
        { cmd: "chat.get-messages-by-user" },
        { userId, limit: Number(limit), skip: Number(skip) }
      )
    );
  }

  @Delete("message/:messageId")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete a message by ID" })
  @ApiParam({ name: "messageId", required: true, description: "Message ID" })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        userId: { type: "string" },
      },
      required: ["userId"],
    },
  })
  async deleteMessage(
    @Param("messageId") messageId: string,
    @Body() body: { userId: string }
  ) {
    return firstValueFrom(
      this.chatClient.send(
        { cmd: "chat.delete-message" },
        { messageId, userId: body.userId }
      )
    );
  }

  @Delete("club/:clubId/clear")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Clear all messages from a club chat" })
  @ApiParam({ name: "clubId", required: true, description: "Club ID" })
  async clearMessagesByClub(@Param("clubId") clubId: string) {
    return firstValueFrom(
      this.chatClient.send({ cmd: "chat.clear-club-messages" }, clubId)
    );
  }
}
