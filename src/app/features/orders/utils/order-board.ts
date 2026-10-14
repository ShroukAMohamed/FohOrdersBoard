import { MenuItem } from '../models/menu-item.model';
import { Order } from '../models/order.model';
import { calculateOrderTotals, priceOrderLines } from './order-calculations';

export function orderPlaceLabel(order: Pick<Order, 'type' | 'table'>): string {
  if (order.type === 'dine-in') {
    return order.table === null ? 'Dine-in' : `Table ${order.table}`;
  }
  if (order.type === 'takeaway') {
    return 'Takeaway';
  }
  return 'Delivery';
}

export function orderItemCount(items: readonly { qty: number }[]): number {
  return items.reduce((sum, item) => sum + item.qty, 0);
}

/** Substring match on the order number or the table number. Phone and item names are ignored. */
export function orderMatchesSearch(order: Pick<Order, 'number' | 'table'>, query: string): boolean {
  const normalized = query.trim().toLowerCase();
  if (normalized.length === 0) {
    return true;
  }

  if (String(order.number).toLowerCase().includes(normalized)) {
    return true;
  }

  return order.table !== null && String(order.table).includes(normalized);
}

/**
 * Board cards show the subtotal only. A missing menu price returns null so the card
 * does not display a partial total.
 */
export function orderBoardSubtotal(order: Order, menu: readonly MenuItem[]): number | null {
  const lines = priceOrderLines(order.items, menu);
  if (lines.some((line) => line.unitPrice === null)) {
    return null;
  }

  return calculateOrderTotals(
    order.type,
    lines.map((line) => ({ unitPrice: line.unitPrice as number, qty: line.qty })),
  ).subtotal;
}
