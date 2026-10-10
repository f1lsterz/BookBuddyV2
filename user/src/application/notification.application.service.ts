import { Injectable } from "@nestjs/common";
import {
  ClubMemberJoinedPayload,
  ClubMemberLeftPayload,
  DomainEventEnvelope,
  DomainEventPattern,
  FriendRequestAcceptedPayload,
  FriendRequestSentPayload,
} from "@bookbuddy/shared";
import { NotificationRepository } from "../infrastructure/notification.repository";

@Injectable()
export class NotificationApplicationService {
  constructor(private readonly notificationRepository: NotificationRepository) {}

  async listForUser(userId: string, unreadOnly?: boolean) {
    return this.notificationRepository.listByUserId(userId, { unreadOnly });
  }

  async markRead(userId: string, notificationId: string) {
    const updated = await this.notificationRepository.markRead(userId, notificationId);
    if (!updated) {
      return { updated: false };
    }
    return { updated: true, notification: updated };
  }

  async markAllRead(userId: string) {
    const count = await this.notificationRepository.markAllRead(userId);
    return { marked: count };
  }

  async onClubMemberJoined(
    envelope: DomainEventEnvelope<ClubMemberJoinedPayload>,
  ): Promise<void> {
    const { payload, eventId } = envelope;
    const title = `Вітаємо в клубі «${payload.clubName}»`;
    const body = "Ви успішно приєднались до книжкового клубу.";

    await this.notificationRepository.createIdempotent({
      userId: payload.userId,
      type: DomainEventPattern.CLUB_MEMBER_JOINED,
      title,
      body,
      sourceEventId: eventId,
      data: {
        clubId: payload.clubId,
        actorId: payload.actorId,
      },
    });
  }

  async onClubMemberLeft(
    envelope: DomainEventEnvelope<ClubMemberLeftPayload>,
  ): Promise<void> {
    const { payload, eventId } = envelope;
    await this.notificationRepository.createIdempotent({
      userId: payload.userId,
      type: DomainEventPattern.CLUB_MEMBER_LEFT,
      title: `Ви вийшли з клубу «${payload.clubName}»`,
      body: "Ви більше не учасник цього книжкового клубу.",
      sourceEventId: eventId,
      data: { clubId: payload.clubId, actorId: payload.actorId },
    });
  }

  async onFriendRequestSent(
    envelope: DomainEventEnvelope<FriendRequestSentPayload>,
  ): Promise<void> {
    const { payload, eventId } = envelope;
    await this.notificationRepository.createIdempotent({
      userId: payload.receiverId,
      type: DomainEventPattern.FRIEND_REQUEST_SENT,
      title: "Новий запит у друзі",
      body: `${payload.senderName} хоче додати вас у друзі.`,
      sourceEventId: eventId,
      data: {
        requestId: payload.requestId,
        senderId: payload.senderId,
      },
    });
  }

  async onFriendRequestAccepted(
    envelope: DomainEventEnvelope<FriendRequestAcceptedPayload>,
  ): Promise<void> {
    const { payload, eventId } = envelope;
    await this.notificationRepository.createIdempotent({
      userId: payload.senderId,
      type: DomainEventPattern.FRIEND_REQUEST_ACCEPTED,
      title: "Запит у друзі прийнято",
      body: `${payload.receiverName} прийняв(ла) ваш запит у друзі.`,
      sourceEventId: eventId,
      data: {
        requestId: payload.requestId,
        receiverId: payload.receiverId,
      },
    });
  }
}
