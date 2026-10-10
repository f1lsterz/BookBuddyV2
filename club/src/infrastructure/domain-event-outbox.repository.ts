import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import {
  DOMAIN_OUTBOX_BATCH_SIZE,
  DOMAIN_OUTBOX_MAX_ATTEMPTS,
  computeDomainOutboxNextRetryAt,
} from "@bookbuddy/shared";
import { ClientSession, Model } from "mongoose";
import { randomUUID } from "crypto";
import {
  DomainEventOutbox,
  DomainEventOutboxDocument,
  OutboxStatus,
} from "schemas/domain-event-outbox.schema";

export type OutboxPublishFailureResult = {
  dead: boolean;
  entry?: DomainEventOutboxDocument;
};

@Injectable()
export class DomainEventOutboxRepository {
  constructor(
    @InjectModel(DomainEventOutbox.name)
    private readonly outboxModel: Model<DomainEventOutboxDocument>,
  ) {}

  async enqueue(
    pattern: string,
    payload: Record<string, unknown>,
    session?: ClientSession,
  ): Promise<DomainEventOutboxDocument> {
    const doc = new this.outboxModel({
      eventId: randomUUID(),
      occurredAt: new Date().toISOString(),
      pattern,
      payload,
      status: OutboxStatus.PENDING,
      attempts: 0,
    });
    return doc.save({ session });
  }

  async findPending(
    limit = DOMAIN_OUTBOX_BATCH_SIZE,
  ): Promise<DomainEventOutboxDocument[]> {
    const now = new Date();
    return this.outboxModel
      .find({
        status: OutboxStatus.PENDING,
        $or: [
          { nextRetryAt: { $exists: false } },
          { nextRetryAt: null },
          { nextRetryAt: { $lte: now } },
        ],
      })
      .sort({ createdAt: 1 })
      .limit(limit)
      .exec();
  }

  async markSent(id: string): Promise<void> {
    await this.outboxModel
      .findByIdAndUpdate(id, {
        status: OutboxStatus.SENT,
        lastError: undefined,
        nextRetryAt: undefined,
      })
      .exec();
  }

  async recordPublishFailure(
    id: string,
    error: string,
  ): Promise<OutboxPublishFailureResult> {
    const entry = await this.outboxModel.findById(id).exec();
    if (!entry) {
      return { dead: false };
    }

    const attempts = entry.attempts + 1;
    if (attempts >= DOMAIN_OUTBOX_MAX_ATTEMPTS) {
      await this.outboxModel
        .findByIdAndUpdate(id, {
          status: OutboxStatus.FAILED,
          attempts,
          lastError: error,
          nextRetryAt: undefined,
        })
        .exec();
      entry.attempts = attempts;
      entry.status = OutboxStatus.FAILED;
      entry.lastError = error;
      return { dead: true, entry };
    }

    await this.outboxModel
      .findByIdAndUpdate(id, {
        status: OutboxStatus.PENDING,
        attempts,
        lastError: error,
        nextRetryAt: computeDomainOutboxNextRetryAt(attempts),
      })
      .exec();
    return { dead: false };
  }

  async findFailed(limit = 50): Promise<DomainEventOutboxDocument[]> {
    return this.outboxModel
      .find({ status: OutboxStatus.FAILED })
      .sort({ updatedAt: -1 })
      .limit(limit)
      .exec();
  }

  async requeueFailed(ids?: string[]): Promise<number> {
    const filter: { status: string; _id?: { $in: string[] } } = {
      status: OutboxStatus.FAILED,
    };
    if (ids && ids.length > 0) {
      filter._id = { $in: ids };
    }
    const result = await this.outboxModel
      .updateMany(filter, {
        $set: { status: OutboxStatus.PENDING, attempts: 0 },
        $unset: { lastError: "", nextRetryAt: "" },
      })
      .exec();
    return result.modifiedCount ?? 0;
  }
}
