const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

/** Elapsed label from a creation timestamp. Callers pass `now` so the board clock stays testable. */
export function formatElapsed(createdAt: string, nowMs: number): string {
  const createdMs = Date.parse(createdAt);
  if (Number.isNaN(createdMs)) {
    return 'Unknown time';
  }

  const elapsedMs = Math.max(0, nowMs - createdMs);
  const days = Math.floor(elapsedMs / DAY_MS);
  const hours = Math.floor((elapsedMs % DAY_MS) / HOUR_MS);
  const minutes = Math.floor((elapsedMs % HOUR_MS) / MINUTE_MS);
  const seconds = Math.floor((elapsedMs % MINUTE_MS) / 1000);

  if (days > 0) {
    return `${days}d ${hours}h ago`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes}m ago`;
  }
  return `${minutes}m ${seconds}s ago`;
}
