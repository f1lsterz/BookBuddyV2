/** Topic exchange for fire-and-forget domain events (pub/sub). */
export const DOMAIN_EVENT_EXCHANGE = "bookbuddy.domain";

export const DomainEventPattern = {
  CLUB_MEMBER_JOINED: "club.member.joined",
  CLUB_MEMBER_LEFT: "club.member.left",
  FRIEND_REQUEST_SENT: "user.friend.request.sent",
  FRIEND_REQUEST_ACCEPTED: "user.friend.request.accepted",
} as const;

export type DomainEventPatternName =
  (typeof DomainEventPattern)[keyof typeof DomainEventPattern];

export type DomainEventEnvelope<TPayload> = {
  eventId: string;
  pattern: DomainEventPatternName;
  occurredAt: string;
  payload: TPayload;
};
