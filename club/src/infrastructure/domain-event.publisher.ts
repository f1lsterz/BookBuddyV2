import { Inject, Injectable } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import {
  ClubMemberJoinedPayload,
  ClubMemberLeftPayload,
  DomainEventEnvelope,
  DomainEventPattern,
} from "@bookbuddy/shared";

export type DomainEventPublishMeta = {
  eventId: string;
  occurredAt: string;
};

@Injectable()
export class DomainEventPublisher {
  constructor(@Inject("DOMAIN_EVENT_BUS") private readonly eventBus: ClientProxy) {}

  emitClubMemberJoined(
    payload: ClubMemberJoinedPayload,
    meta: DomainEventPublishMeta,
  ): void {
    const envelope: DomainEventEnvelope<ClubMemberJoinedPayload> = {
      eventId: meta.eventId,
      pattern: DomainEventPattern.CLUB_MEMBER_JOINED,
      occurredAt: meta.occurredAt,
      payload,
    };

    this.eventBus.emit(DomainEventPattern.CLUB_MEMBER_JOINED, envelope);
  }

  emitClubMemberLeft(payload: ClubMemberLeftPayload, meta: DomainEventPublishMeta): void {
    const envelope: DomainEventEnvelope<ClubMemberLeftPayload> = {
      eventId: meta.eventId,
      pattern: DomainEventPattern.CLUB_MEMBER_LEFT,
      occurredAt: meta.occurredAt,
      payload,
    };

    this.eventBus.emit(DomainEventPattern.CLUB_MEMBER_LEFT, envelope);
  }
}
