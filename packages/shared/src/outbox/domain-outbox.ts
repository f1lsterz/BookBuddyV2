/** Max publish attempts before an outbox row is marked dead (failed). */
export const DOMAIN_OUTBOX_MAX_ATTEMPTS = 5;

export const DOMAIN_OUTBOX_FLUSH_INTERVAL_MS = 2000;

export const DOMAIN_OUTBOX_BATCH_SIZE = 20;

/** Exponential backoff capped at 60s (attempts counted after a failed publish). */
export function computeDomainOutboxNextRetryAt(attemptsAfterFailure: number): Date {
  const exponent = Math.max(0, attemptsAfterFailure - 1);
  const delayMs = Math.min(60_000, 2_000 * 2 ** exponent);
  return new Date(Date.now() + delayMs);
}
