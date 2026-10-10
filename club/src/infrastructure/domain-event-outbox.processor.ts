import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import {
  ClubMemberJoinedPayload,
  ClubMemberLeftPayload,
  DOMAIN_OUTBOX_FLUSH_INTERVAL_MS,
  DomainEventPattern,
} from "@bookbuddy/shared";
import { randomUUID } from "crypto";
import { DomainEventDlqPublisher } from "./domain-event-dlq.publisher";
import { DomainEventOutboxRepository } from "./domain-event-outbox.repository";
import { DomainEventPublisher } from "./domain-event.publisher";

@Injectable()
export class DomainEventOutboxProcessor implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DomainEventOutboxProcessor.name);
  private timer?: NodeJS.Timeout;
  private flushing = false;

  constructor(
    private readonly outboxRepository: DomainEventOutboxRepository,
    private readonly publisher: DomainEventPublisher,
    private readonly dlqPublisher: DomainEventDlqPublisher,
  ) {}

  onModuleInit(): void {
    this.timer = setInterval(() => {
      void this.flushPending();
    }, DOMAIN_OUTBOX_FLUSH_INTERVAL_MS);
  }

  onModuleDestroy(): void {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  async flushPending(): Promise<void> {
    if (this.flushing) {
      return;
    }
    this.flushing = true;
    try {
      const batch = await this.outboxRepository.findPending();
      for (const entry of batch) {
        try {
          const eventId = entry.eventId ?? randomUUID();
          const occurredAt = entry.occurredAt ?? new Date().toISOString();
          this.dispatch(entry.pattern, entry.payload, { eventId, occurredAt });
          await this.outboxRepository.markSent(entry._id.toString());
        } catch (err) {
          const message = err instanceof Error ? err.message : "Unknown outbox error";
          this.logger.warn(
            `Outbox publish failed for ${entry._id.toString()}: ${message}`,
          );
          const failure = await this.outboxRepository.recordPublishFailure(
            entry._id.toString(),
            message,
          );
          if (failure.dead && failure.entry) {
            const dead = failure.entry;
            this.dlqPublisher.publishOutboxDeadLetter({
              source: "club-outbox",
              outboxId: dead._id.toString(),
              eventId: dead.eventId,
              pattern: dead.pattern,
              payload: dead.payload,
              lastError: message,
              attempts: dead.attempts,
            });
          }
        }
      }
    } finally {
      this.flushing = false;
    }
  }

  private dispatch(
    pattern: string,
    payload: Record<string, unknown>,
    meta: { eventId: string; occurredAt: string },
  ): void {
    switch (pattern) {
      case DomainEventPattern.CLUB_MEMBER_JOINED:
        this.publisher.emitClubMemberJoined(payload as ClubMemberJoinedPayload, meta);
        return;
      case DomainEventPattern.CLUB_MEMBER_LEFT:
        this.publisher.emitClubMemberLeft(payload as ClubMemberLeftPayload, meta);
        return;
      default:
        throw new Error(`Unsupported outbox pattern: ${pattern}`);
    }
  }
}
