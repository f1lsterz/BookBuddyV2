import { Inject, Injectable } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import {
  DomainEventEnvelope,
  DomainEventPattern,
  FriendRequestAcceptedPayload,
  FriendRequestSentPayload,
} from "@bookbuddy/shared";

export type DomainEventPublishMeta = {
  eventId: string;
  occurredAt: string;
};

@Injectable()
export class DomainEventPublisher {
  constructor(@Inject("DOMAIN_EVENT_BUS") private readonly eventBus: ClientProxy) {}

  emitFriendRequestSent(
    payload: FriendRequestSentPayload,
    meta: DomainEventPublishMeta,
  ): void {
    const envelope: DomainEventEnvelope<FriendRequestSentPayload> = {
      eventId: meta.eventId,
      pattern: DomainEventPattern.FRIEND_REQUEST_SENT,
      occurredAt: meta.occurredAt,
      payload,
    };
    this.eventBus.emit(DomainEventPattern.FRIEND_REQUEST_SENT, envelope);
  }

  emitFriendRequestAccepted(
    payload: FriendRequestAcceptedPayload,
    meta: DomainEventPublishMeta,
  ): void {
    const envelope: DomainEventEnvelope<FriendRequestAcceptedPayload> = {
      eventId: meta.eventId,
      pattern: DomainEventPattern.FRIEND_REQUEST_ACCEPTED,
      occurredAt: meta.occurredAt,
      payload,
    };
    this.eventBus.emit(DomainEventPattern.FRIEND_REQUEST_ACCEPTED, envelope);
  }
}
