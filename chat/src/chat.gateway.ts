import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from "@nestjs/websockets";
import { ChatService } from "./chat.service";
import { Server, Socket } from "socket.io";
import { SendMessageDto } from "./dto/send.message.dto";

@WebSocketGateway({ cors: true })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private readonly chatService: ChatService) {}

  @WebSocketServer()
  server: Server;

  async handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  async handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage("joinChat")
  handleJoinChat(
    @MessageBody() clubId: string,
    @ConnectedSocket() client: Socket
  ) {
    client.join(`chat_${clubId}`);
    console.log(`Client ${client.id} joined chat_${clubId}`);
  }

  @SubscribeMessage("leaveChat")
  handleLeaveChat(
    @MessageBody() clubId: string,
    @ConnectedSocket() client: Socket
  ) {
    client.leave(`chat_${clubId}`);
    console.log(`Client ${client.id} left chat_${clubId}`);
  }

  @SubscribeMessage("sendMessage")
  async handleSendMessage(
    @MessageBody() sendMessageDto: SendMessageDto,
    @ConnectedSocket() client: Socket
  ) {
    try {
      const message = await this.chatService.sendMessage(sendMessageDto);

      this.server
        .to(`chat_${sendMessageDto.clubId}`)
        .emit("newMessage", message);
    } catch (error) {
      client.emit("errorMessage", {
        message: error.message || "Unknown error",
      });
    }
  }
}
