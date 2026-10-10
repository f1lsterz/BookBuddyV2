import { DomainEventPattern } from "@bookbuddy/shared";
import { NotificationApplicationService } from "./notification.application.service";
import { NotificationRepository } from "../infrastructure/notification.repository";

describe("NotificationApplicationService", () => {
  const envelope = {
    eventId: "evt-1",
    pattern: DomainEventPattern.CLUB_MEMBER_JOINED,
    occurredAt: new Date().toISOString(),
    payload: {
      clubId: "507f1f77bcf86cd799439011",
      clubName: "Sci-Fi Readers",
      userId: "507f1f77bcf86cd799439012",
      actorId: "507f1f77bcf86cd799439013",
    },
  };

  it("onClubMemberJoined persists notification for joined user", async () => {
    const createIdempotent = jest.fn().mockResolvedValue({});
    const repo = { createIdempotent } as unknown as NotificationRepository;
    const service = new NotificationApplicationService(repo);

    await service.onClubMemberJoined(envelope);

    expect(createIdempotent).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "507f1f77bcf86cd799439012",
        type: DomainEventPattern.CLUB_MEMBER_JOINED,
        sourceEventId: "evt-1",
      }),
    );
  });
});
