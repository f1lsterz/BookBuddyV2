import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type DomainEventOutboxDocument = HydratedDocument<DomainEventOutbox>;

export const OutboxStatus = {
  PENDING: "pending",
  SENT: "sent",
  FAILED: "failed",
} as const;

export type OutboxStatusValue = (typeof OutboxStatus)[keyof typeof OutboxStatus];

@Schema({ timestamps: true, collection: "domain_event_outbox" })
export class DomainEventOutbox {
  @Prop({ required: true })
  eventId: string;

  @Prop({ required: true })
  occurredAt: string;

  @Prop({ required: true })
  pattern: string;

  @Prop({ type: Object, required: true })
  payload: Record<string, unknown>;

  @Prop({ required: true, default: OutboxStatus.PENDING })
  status: OutboxStatusValue;

  @Prop({ required: true, default: 0 })
  attempts: number;

  @Prop()
  nextRetryAt?: Date;

  @Prop()
  lastError?: string;
}

export const DomainEventOutboxSchema = SchemaFactory.createForClass(DomainEventOutbox);

DomainEventOutboxSchema.index({ status: 1, nextRetryAt: 1, createdAt: 1 });
