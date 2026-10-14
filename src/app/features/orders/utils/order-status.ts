import { ORDER_STATUSES, OrderStatus } from '../models/order.model';

/** An order is late when it has not reached `ready` and is older than 20 minutes. */
export const LATE_AFTER_MS = 20 * 60 * 1000;

export function nextOrderStatus(status: OrderStatus): OrderStatus | null {
  const index = ORDER_STATUSES.indexOf(status);
  return ORDER_STATUSES[index + 1] ?? null;
}

export function isLateOrder(status: OrderStatus, createdAt: string, nowMs: number): boolean {
  if (status === 'ready' || status === 'served') {
    return false;
  }

  const createdMs = Date.parse(createdAt);
  if (Number.isNaN(createdMs)) {
    return false;
  }

  return nowMs - createdMs > LATE_AFTER_MS;
}

/** Seed ids are the order number as a string, so the next id follows the same rule. */
export function nextOrderIdentity(orderNumbers: readonly number[]): { id: string; number: number } {
  const number = orderNumbers.reduce((max, current) => Math.max(max, current), 0) + 1;
  return { id: String(number), number };
}
