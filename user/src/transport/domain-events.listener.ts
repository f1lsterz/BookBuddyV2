import { Controller } from "@nestjs/common";
import { EventPattern, Payload } from "@nestjs/microservices";
import {
  ClubMemberJoinedPayload,
  ClubMemberLeftPayload,
  DomainEventEnvelope,
  DomainEventPattern,
  FriendRequestAcceptedPayload,
  FriendRequestSentPayload,
} from "@bookbuddy/shared";
import { NotificationApplicationService } from "../application/notification.application.service";

@Controller()
export class DomainEventsListener {
  constructor(private readonly notifications: NotificationApplicationService) {}

  @EventPattern(DomainEventPattern.CLUB_MEMBER_JOINED)
  async onClubMemberJoined(
    @Payload() envelope: DomainEventEnvelope<ClubMemberJoinedPayload>,
  ): Promise<void> {
    await this.notifications.onClubMemberJoined(envelope);
  }

  @EventPattern(DomainEventPattern.CLUB_MEMBER_LEFT)
  async onClubMemberLeft(
    @Payload() envelope: DomainEventEnvelope<ClubMemberLeftPayload>,
  ): Promise<void> {
    await this.notifications.onClubMemberLeft(envelope);
  }

  @EventPattern(DomainEventPattern.FRIEND_REQUEST_SENT)
  async onFriendRequestSent(
    @Payload() envelope: DomainEventEnvelope<FriendRequestSentPayload>,
  ): Promise<void> {
    await this.notifications.onFriendRequestSent(envelope);
  }

  @EventPattern(DomainEventPattern.FRIEND_REQUEST_ACCEPTED)
  async onFriendRequestAccepted(
    @Payload() envelope: DomainEventEnvelope<FriendRequestAcceptedPayload>,
  ): Promise<void> {
    await this.notifications.onFriendRequestAccepted(envelope);
  }
}
