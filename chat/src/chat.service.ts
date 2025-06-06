import { Injectable } from "@nestjs/common";
import { SendMessageDto } from "./dto/send.message.dto";
import { ApiError } from "../../api-gateway/src/common/errors/apiError";
import { InjectModel } from "@nestjs/mongoose";
import { ChatMessage, ChatMessageDocument } from "schemas/message.schema";
import { Model, Types } from "mongoose";

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(ChatMessage.name)
    private readonly chatMessageModel: Model<ChatMessageDocument>
  ) {}

  async sendMessage(dto: SendMessageDto) {
    if (!dto.message?.trim()) {
      throw ApiError.BadRequest("Message cannot be empty");
    }

    const message = new this.chatMessageModel({
      clubId: new Types.ObjectId(dto.clubId),
      userId: new Types.ObjectId(dto.userId),
      message: dto.message,
    });

    return message.save();
  }

  async getMessagesByClub(clubId: string, limit = 50, skip = 0) {
    if (!Types.ObjectId.isValid(clubId)) {
      throw ApiError.BadRequest("Invalid club ID");
    }

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
      throw ApiError.BadRequest("Invalid user ID");
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
      throw ApiError.BadRequest("Invalid message ID");
    }

    const message = await this.chatMessageModel.findById(messageId);
    if (!message) {
      throw ApiError.NotFound("Message not found");
    }

    if (!message.userId.equals(userId)) {
      throw ApiError.Forbidden("You can only delete your own messages");
    }

    await this.chatMessageModel.deleteOne({ _id: messageId });
    return { success: true };
  }

  async clearMessagesByClub(clubId: string) {
    if (!Types.ObjectId.isValid(clubId)) {
      throw ApiError.BadRequest("Invalid club ID");
    }

    await this.chatMessageModel.deleteMany({
      clubId: new Types.ObjectId(clubId),
    });
    return { success: true };
  }
}
