/** Dead-letter exchange for domain events and outbox poison messages. */
export const DOMAIN_EVENT_DLX = "bookbuddy.domain.dlx";

export const DOMAIN_EVENTS_DLQ = "domain_events_dlq";

/** Routing key when an outbox row is exhausted (publish retries). */
export const OUTBOX_DEAD_LETTER_ROUTING_KEY = "outbox.dead";

export type OutboxDeadLetterPayload = {
  source: "club-outbox" | "user-outbox";
  outboxId: string;
  eventId: string;
  pattern: string;
  payload: Record<string, unknown>;
  lastError: string;
  attempts: number;
};
