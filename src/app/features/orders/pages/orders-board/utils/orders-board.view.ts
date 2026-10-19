import { MenuItem } from '../../../models/menu-item.model';
import { ORDER_STATUSES, ORDER_TYPES, Order, OrderStatus, OrderType } from '../../../models/order.model';
import { formatElapsed } from '../../../utils/elapsed-time';
import { orderBoardSubtotal, orderItemCount, orderMatchesSearch, orderPlaceLabel } from '../../../utils/order-board';
import { formatEgp } from '../../../utils/order-calculations';
import { ACTION_LABEL, isLateOrder, STATUS_LABEL } from '../../../utils/order-status';
import { BoardTypeFilter, OrderCardModel, OrderColumnModel } from '../types/orders-board.types';

const EMPTY_COPY: Record<OrderStatus, { title: string; body: string }> = {
  new: { title: 'No new orders', body: 'Waiting for incoming tickets' },
  preparing: { title: 'No orders in prep', body: 'Kitchen stations are clear' },
  ready: { title: 'No orders ready', body: 'Pickup pass is empty' },
  served: { title: 'No served orders', body: 'Shift tickets will record here' },
};

export function isBoardTypeFilter(value: string | null): value is OrderType {
  return ORDER_TYPES.some((type) => type === value);
}

export function statusRank(status: OrderStatus): number {
  return ORDER_STATUSES.indexOf(status);
}

export function toOrderCard(
  order: Order,
  menu: readonly MenuItem[],
  nowMs: number,
  advancing: boolean,
): OrderCardModel {
  const subtotal = orderBoardSubtotal(order, menu);
  const elapsedLabel = formatElapsed(order.createdAt, nowMs);
  const late = isLateOrder(order.status, order.createdAt, nowMs);

  return {
    id: order.id,
    number: order.number,
    status: order.status,
    placeLabel: orderPlaceLabel(order),
    itemCount: orderItemCount(order.items),
    subtotalLabel: subtotal === null ? 'Price unavailable' : formatEgp(subtotal),
    elapsedLabel,
    lateLabel: late ? `Late (${elapsedLabel})` : null,
    actionLabel: ACTION_LABEL[order.status],
    advancing,
  };
}

export function buildOrderColumns(
  orders: readonly Order[],
  menu: readonly MenuItem[],
  query: string,
  type: BoardTypeFilter,
  nowMs: number,
  pendingIds: { readonly has: (id: string) => boolean },
): OrderColumnModel[] {
  const visible = orders.filter(
    (order) => (type === 'all' || order.type === type) && orderMatchesSearch(order, query),
  );

  return ORDER_STATUSES.map((status) => {
    const columnOrders = visible
      .filter((order) => order.status === status)
      .map((order) => toOrderCard(order, menu, nowMs, pendingIds.has(order.id)));

    return {
      status,
      title: STATUS_LABEL[status],
      count: columnOrders.length,
      emptyTitle: EMPTY_COPY[status].title,
      emptyBody: EMPTY_COPY[status].body,
      orders: columnOrders,
    };
  });
}
