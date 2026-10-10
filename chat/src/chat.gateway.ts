import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from "@nestjs/websockets";
import { Inject } from "@nestjs/common";
import { ConfigType } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { ChatService } from "./chat.service";
import { Server } from "socket.io";
import { SendMessageWsDto } from "@bookbuddy/shared";
import { ClubRpcClient } from "./infrastructure/club-rpc.client";
import { ChatMembershipPolicy } from "./domain/chat-membership.policy";
import { createWsJwtMiddleware } from "./infrastructure/ws-jwt.middleware";
import config from "./config/config";
import type { AuthedSocket } from "./types/authed-socket";

@WebSocketGateway({ cors: true })
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private readonly chatService: ChatService,
    private readonly jwtService: JwtService,
    private readonly clubRpc: ClubRpcClient,
    @Inject(config.KEY) private readonly configService: ConfigType<typeof config>,
  ) {}

  @WebSocketServer()
  server: Server;

  afterInit(server: Server) {
    const secret = this.configService.secret;
    if (!secret) {
      throw new Error("JWT_SECRET is required for WebSocket chat");
    }
    const jwtMiddleware = createWsJwtMiddleware(this.jwtService, secret);
    server.use((socket, next) => {
      void jwtMiddleware(socket as AuthedSocket, next);
    });
  }

  handleConnection(client: AuthedSocket) {
    if (!client.data.userId) {
      client.disconnect(true);
    }
  }

  handleDisconnect(_client: AuthedSocket) {
    return;
  }

  @SubscribeMessage("joinChat")
  async handleJoinChat(
    @MessageBody() clubId: string,
    @ConnectedSocket() client: AuthedSocket,
  ) {
    const isMember = await this.clubRpc.isUserInClub(client.data.userId, clubId);
    ChatMembershipPolicy.assertIsClubMember(isMember);
    await client.join(`chat_${clubId}`);
  }

  @SubscribeMessage("leaveChat")
  handleLeaveChat(
    @MessageBody() clubId: string,
    @ConnectedSocket() client: AuthedSocket,
  ) {
    void client.leave(`chat_${clubId}`);
  }

  @SubscribeMessage("sendMessage")
  async handleSendMessage(
    @MessageBody() body: SendMessageWsDto,
    @ConnectedSocket() client: AuthedSocket,
  ) {
    try {
      const message = await this.chatService.sendMessage({
        clubId: body.clubId,
        userId: client.data.userId,
        message: body.message,
      });

      this.server.to(`chat_${body.clubId}`).emit("newMessage", message);
    } catch (error) {
      const err = error as Error;
      client.emit("errorMessage", {
        message: err.message || "Unknown error",
      });
    }
  }
}
