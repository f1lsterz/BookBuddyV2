import { Injectable } from "@nestjs/common";
import {
  DomainEventPattern,
  type FailedOutboxEntryDto,
  type ListFailedOutboxRpcDto,
  type ReplayFailedOutboxRpcDto,
  type ReplayFailedOutboxResult,
} from "@bookbuddy/shared";
import type { ClubMemberJoinedPayload, ClubMemberLeftPayload } from "@bookbuddy/shared";
import { ClientSession } from "mongoose";
import { DomainEventOutboxProcessor } from "./domain-event-outbox.processor";
import { DomainEventOutboxRepository } from "./domain-event-outbox.repository";

@Injectable()
export class DomainEventOutboxService {
  constructor(
    private readonly outboxRepository: DomainEventOutboxRepository,
    private readonly outboxProcessor: DomainEventOutboxProcessor,
  ) {}

  async enqueueClubMemberJoined(
    payload: ClubMemberJoinedPayload,
    session?: ClientSession,
  ): Promise<void> {
    await this.outboxRepository.enqueue(
      DomainEventPattern.CLUB_MEMBER_JOINED,
      payload,
      session,
    );
  }

  async enqueueClubMemberLeft(
    payload: ClubMemberLeftPayload,
    session?: ClientSession,
  ): Promise<void> {
    await this.outboxRepository.enqueue(
      DomainEventPattern.CLUB_MEMBER_LEFT,
      payload,
      session,
    );
  }

  async listFailed(dto: ListFailedOutboxRpcDto): Promise<FailedOutboxEntryDto[]> {
    const limit = dto.limit ?? 50;
    const rows = await this.outboxRepository.findFailed(limit);
    return rows.map((row) => {
      const createdAt = row.get("createdAt") as Date | undefined;
      return {
        id: row._id.toString(),
        eventId: row.eventId,
        pattern: row.pattern,
        attempts: row.attempts,
        lastError: row.lastError,
        createdAt: createdAt?.toISOString() ?? new Date().toISOString(),
      };
    });
  }

  async replayFailed(dto: ReplayFailedOutboxRpcDto): Promise<ReplayFailedOutboxResult> {
    const requeued = await this.outboxRepository.requeueFailed(dto.ids);
    if (requeued > 0) {
      await this.outboxProcessor.flushPending();
    }
    return { requeued };
  }
}
