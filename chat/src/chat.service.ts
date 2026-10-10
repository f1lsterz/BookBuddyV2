import { Injectable } from "@nestjs/common";
import { SendMessageDto } from "@bookbuddy/shared";
import { AppError } from "@bookbuddy/shared";
import { InjectModel } from "@nestjs/mongoose";
import { ChatMessage, ChatMessageDocument } from "schemas/message.schema";
import { Model, Types } from "mongoose";
import { ChatMembershipPolicy } from "./domain/chat-membership.policy";
import { ClubRpcClient } from "./infrastructure/club-rpc.client";

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(ChatMessage.name)
    private readonly chatMessageModel: Model<ChatMessageDocument>,
    private readonly clubRpc: ClubRpcClient,
  ) {}

  async sendMessage(dto: SendMessageDto) {
    if (!dto.message?.trim()) {
      throw AppError.badRequest("Message cannot be empty");
    }

    const isMember = await this.clubRpc.isUserInClub(dto.userId, dto.clubId);
    ChatMembershipPolicy.assertIsClubMember(isMember);

    const message = new this.chatMessageModel({
      clubId: new Types.ObjectId(dto.clubId),
      userId: new Types.ObjectId(dto.userId),
      message: dto.message,
    });

    return message.save();
  }

  async getMessagesByClub(userId: string, clubId: string, limit = 50, skip = 0) {
    if (!Types.ObjectId.isValid(clubId)) {
      throw AppError.badRequest("Invalid club ID");
    }

    const isMember = await this.clubRpc.isUserInClub(userId, clubId);
    ChatMembershipPolicy.assertIsClubMember(isMember);

    return this.chatMessageModel
      .find({ clubId: new Types.ObjectId(clubId) })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()
      .exec();
  }

  async getMessagesByUser(userId: string, limit = 50, skip = 0) {
    if (!Types.ObjectId.isValid(userId)) {
      throw AppError.badRequest("Invalid user ID");
    }

    return this.chatMessageModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()
      .exec();
  }

  async deleteMessage(messageId: string, userId: string) {
    if (!Types.ObjectId.isValid(messageId)) {
      throw AppError.badRequest("Invalid message ID");
    }

    const message = await this.chatMessageModel.findById(messageId);
    if (!message) {
      throw AppError.notFound("Message not found");
    }

    if (!message.userId.equals(userId)) {
      throw AppError.forbidden("You can only delete your own messages");
    }

    await this.chatMessageModel.deleteOne({ _id: messageId });
    return { success: true };
  }

  async clearMessagesByClub(clubId: string, actorId: string) {
    if (!Types.ObjectId.isValid(clubId)) {
      throw AppError.badRequest("Invalid club ID");
    }

    const isAdmin = await this.clubRpc.isClubAdmin(actorId, clubId);
    ChatMembershipPolicy.assertIsClubAdmin(isAdmin);

    await this.chatMessageModel.deleteMany({
      clubId: new Types.ObjectId(clubId),
    });
    return { success: true };
  }
}
