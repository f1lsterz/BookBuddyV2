import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { SendMessageDto } from "./dto/send.message.dto";
import { CreateChatDto } from "./dto/create.chat.dto";
import { ApiError } from "../common/errors/apiError";

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

  async createChat(createChatDto: CreateChatDto) {
    return this.prisma.chat.create({
      data: {
        orderId: createChatDto.orderId,
        type: createChatDto.type,
        participants: {
          create: createChatDto.participants.map((userId) => ({ userId })),
        },
      },
    });
  }

  async sendMessage(sendMessageDto: SendMessageDto) {
    if (!sendMessageDto.content && !sendMessageDto.imageUrl) {
      throw ApiError.BadRequest(
        "Повідомлення має містити текст або зображення"
      );
    }
    return this.prisma.message.create({
      data: {
        chatId: sendMessageDto.chatId,
        userId: sendMessageDto.userId,
        content: sendMessageDto.content,
        imageUrl: sendMessageDto.imageUrl,
      },
      include: { user: true },
    });
  }

  async getMessages(chatId: number, page = 1, limit = 20) {
    return this.prisma.message.findMany({
      where: { chatId },
      include: { user: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async getUserChats(userId: number) {
    return this.prisma.chat.findMany({
      where: { participants: { some: { userId } } },
      include: {
        messages: {
          take: 1,
          orderBy: { createdAt: "desc" },
          include: { user: true },
        },
        participants: true,
      },
    });
  }
}
