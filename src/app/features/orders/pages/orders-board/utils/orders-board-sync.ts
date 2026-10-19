import { Order, OrderStatus } from '../../../models/order.model';
import { statusRank } from './orders-board.view';

export interface PendingStatusUpdate {
  previousStatus: OrderStatus;
  nextStatus: OrderStatus;
}

/**
 * Merge a successful GET /orders response with local optimistic/confirmed status.
 * Keeps cards that are still PATCH-pending even when the poll omits them.
 */
export function mergeServerOrders(
  serverOrders: readonly Order[],
  localOrders: readonly Order[],
  pending: ReadonlyMap<string, PendingStatusUpdate>,
  confirmedStatus: Map<string, OrderStatus>,
): { orders: Order[]; serverOrderIds: Set<string> } {
  const serverOrderIds = new Set(serverOrders.map((order) => order.id));
  const merged = serverOrders.map((order) => withLocalStatus(order, pending, confirmedStatus));

  for (const [orderId, pendingUpdate] of pending) {
    if (serverOrderIds.has(orderId)) {
      continue;
    }
    const local = localOrders.find((order) => order.id === orderId);
    if (local) {
      merged.push({ ...local, status: pendingUpdate.nextStatus });
    }
  }

  return { orders: merged, serverOrderIds };
}

/** Prefer an in-flight or just-confirmed status over an older server status. */
export function withLocalStatus(
  order: Order,
  pending: ReadonlyMap<string, PendingStatusUpdate>,
  confirmedStatus: Map<string, OrderStatus>,
): Order {
  const pendingUpdate = pending.get(order.id);
  if (pendingUpdate) {
    return { ...order, status: pendingUpdate.nextStatus };
  }

  const confirmed = confirmedStatus.get(order.id);
  if (!confirmed) {
    return order;
  }

  if (statusRank(order.status) >= statusRank(confirmed)) {
    confirmedStatus.delete(order.id);
    return order;
  }

  return { ...order, status: confirmed };
}
