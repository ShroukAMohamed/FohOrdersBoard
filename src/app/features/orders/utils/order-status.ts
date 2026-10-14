import { ORDER_STATUSES, OrderStatus } from '../models/order.model';

/** An order is late when it has not reached `ready` and is older than 20 minutes. */
export const LATE_AFTER_MS = 20 * 60 * 1000;

export const STATUS_LABEL: Record<OrderStatus, string> = {
  new: 'New',
  preparing: 'Preparing',
  ready: 'Ready',
  served: 'Served',
};

/** Button text for moving an order to its next status. Served orders have no next step. */
export const ACTION_LABEL: Record<OrderStatus, string | null> = {
  new: 'Start Preparing',
  preparing: 'Mark Ready',
  ready: 'Mark Served',
  served: null,
};

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
