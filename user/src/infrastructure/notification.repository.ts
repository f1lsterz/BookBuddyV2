import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Notification, NotificationDocument } from "schemas/notification.schema";

export type CreateNotificationInput = {
  userId: string;
  type: string;
  title: string;
  body?: string;
  data?: Record<string, unknown>;
  sourceEventId?: string;
};

@Injectable()
export class NotificationRepository {
  constructor(
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<NotificationDocument>,
  ) {}

  async findBySourceEventId(sourceEventId: string): Promise<NotificationDocument | null> {
    return this.notificationModel.findOne({ sourceEventId }).exec();
  }

  /** Idempotent when sourceEventId is set (unique index). */
  async createIdempotent(input: CreateNotificationInput): Promise<NotificationDocument> {
    if (input.sourceEventId) {
      const existing = await this.findBySourceEventId(input.sourceEventId);
      if (existing) {
        return existing;
      }
    }

    const doc = new this.notificationModel({
      userId: new Types.ObjectId(input.userId),
      type: input.type,
      title: input.title,
      body: input.body,
      data: input.data,
      sourceEventId: input.sourceEventId,
      read: false,
    });

    try {
      return await doc.save();
    } catch (err: unknown) {
      const code = (err as { code?: number }).code;
      if (code === 11000 && input.sourceEventId) {
        const existing = await this.findBySourceEventId(input.sourceEventId);
        if (existing) {
          return existing;
        }
      }
      throw err;
    }
  }

  async listByUserId(
    userId: string,
    options?: { unreadOnly?: boolean; limit?: number },
  ): Promise<NotificationDocument[]> {
    const filter: { userId: Types.ObjectId; read?: boolean } = {
      userId: new Types.ObjectId(userId),
    };
    if (options?.unreadOnly) {
      filter.read = false;
    }

    return this.notificationModel
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(options?.limit ?? 50)
      .exec();
  }

  async markRead(
    userId: string,
    notificationId: string,
  ): Promise<NotificationDocument | null> {
    return this.notificationModel
      .findOneAndUpdate(
        {
          _id: new Types.ObjectId(notificationId),
          userId: new Types.ObjectId(userId),
        },
        { read: true },
        { new: true },
      )
      .exec();
  }

  async markAllRead(userId: string): Promise<number> {
    const result = await this.notificationModel
      .updateMany({ userId: new Types.ObjectId(userId), read: false }, { read: true })
      .exec();
    return result.modifiedCount ?? 0;
  }
}
