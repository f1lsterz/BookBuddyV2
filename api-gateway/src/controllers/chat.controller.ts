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
import { sendRpc } from "src/common/rpc/send-rpc";
import {
  ChatCmd,
  ClubMessagesRpcDto,
  ClearClubChatRpcDto,
  DeleteChatMessageRpcDto,
  SendMessageBodyDto,
  SendMessageDto,
} from "@bookbuddy/shared";
import { ApiTags, ApiOperation, ApiParam, ApiBody, ApiBearerAuth } from "@nestjs/swagger";
import { CurrentUser } from "../common/decorators/current.user.decorator";
import { RequestUser } from "../common/types/request-user";
import { SendMessageApiDto } from "../dto/swagger/chat.swagger";

@ApiBearerAuth()
@ApiTags("Chats (Proxy)")
@Controller("chats")
export class ChatController {
  constructor(@Inject("CHAT_SERVICE") private readonly chatClient: ClientProxy) {}

  @Post("send-message")
  @ApiOperation({ summary: "Send a message to a club chat" })
  @ApiBody({ type: SendMessageApiDto })
  async sendMessage(@Body() body: SendMessageBodyDto, @CurrentUser() user: RequestUser) {
    const dto: SendMessageDto = {
      clubId: body.clubId,
      userId: user.userId,
      message: body.message,
    };
    return sendRpc<unknown>(this.chatClient, { cmd: ChatCmd.SEND_MESSAGE }, dto);
  }

  @Get("club/:clubId/messages")
  @ApiOperation({ summary: "Get messages by club ID" })
  @ApiParam({ name: "clubId", required: true, description: "Club ID" })
  async getMessagesByClub(
    @Param("clubId") clubId: string,
    @CurrentUser() user: RequestUser,
    @Query("limit") limit?: number,
    @Query("skip") skip?: number,
  ) {
    const payload: ClubMessagesRpcDto = {
      userId: user.userId,
      clubId,
      limit: limit !== undefined ? Number(limit) : undefined,
      skip: skip !== undefined ? Number(skip) : undefined,
    };
    return sendRpc<unknown>(this.chatClient, { cmd: ChatCmd.GET_BY_CLUB }, payload);
  }

  @Delete("message/:messageId")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete a message by ID" })
  async deleteMessage(
    @Param("messageId") messageId: string,
    @CurrentUser() user: RequestUser,
  ) {
    const payload: DeleteChatMessageRpcDto = { messageId, userId: user.userId };
    return sendRpc<unknown>(this.chatClient, { cmd: ChatCmd.DELETE_MESSAGE }, payload);
  }

  @Delete("club/:clubId/clear")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Clear all messages from a club chat" })
  async clearMessagesByClub(
    @Param("clubId") clubId: string,
    @CurrentUser() user: RequestUser,
  ) {
    const payload: ClearClubChatRpcDto = { clubId, actorId: user.userId };
    return sendRpc<unknown>(this.chatClient, { cmd: ChatCmd.CLEAR_CLUB }, payload);
  }
}
