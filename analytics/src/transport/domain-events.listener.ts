import { Controller, Logger } from "@nestjs/common";
import { EventPattern, Payload } from "@nestjs/microservices";
import { DomainEventEnvelope, DomainEventPattern } from "@bookbuddy/shared";

@Controller()
export class DomainEventsListener {
  private readonly logger = new Logger(DomainEventsListener.name);

  private record(envelope: DomainEventEnvelope<unknown>): void {
    this.logger.log(
      JSON.stringify({
        analytics: true,
        pattern: envelope.pattern,
        eventId: envelope.eventId,
        occurredAt: envelope.occurredAt,
        payload: envelope.payload,
      }),
    );
  }

  @EventPattern(DomainEventPattern.CLUB_MEMBER_JOINED)
  onClubMemberJoined(@Payload() envelope: DomainEventEnvelope<unknown>): void {
    this.record(envelope);
  }

  @EventPattern(DomainEventPattern.CLUB_MEMBER_LEFT)
  onClubMemberLeft(@Payload() envelope: DomainEventEnvelope<unknown>): void {
    this.record(envelope);
  }

  @EventPattern(DomainEventPattern.FRIEND_REQUEST_SENT)
  onFriendRequestSent(@Payload() envelope: DomainEventEnvelope<unknown>): void {
    this.record(envelope);
  }

  @EventPattern(DomainEventPattern.FRIEND_REQUEST_ACCEPTED)
  onFriendRequestAccepted(@Payload() envelope: DomainEventEnvelope<unknown>): void {
    this.record(envelope);
  }
}
