/** Max-Age in ms from env like `7d`, `24h`, or plain seconds number. */
export function parseRefreshExpiresMs(refreshExpiresIn?: string): number {
  const raw = refreshExpiresIn?.trim() || "7d";
  const match = /^(\d+)([dhms])?$/i.exec(raw);
  if (!match) {
    return 7 * 24 * 60 * 60 * 1000;
  }
  const value = Number(match[1]);
  const unit = (match[2] ?? "s").toLowerCase();
  const multipliers: Record<string, number> = {
    d: 24 * 60 * 60 * 1000,
    h: 60 * 60 * 1000,
    m: 60 * 1000,
    s: 1000,
  };
  return value * (multipliers[unit] ?? 1000);
}
