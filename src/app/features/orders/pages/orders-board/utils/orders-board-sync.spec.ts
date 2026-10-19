import { Order, OrderStatus } from '../../../models/order.model';
import { mergeServerOrders, PendingStatusUpdate } from './orders-board-sync';

const preparing: Order = {
  id: '1041',
  number: 1041,
  type: 'dine-in',
  table: 7,
  phone: null,
  status: 'preparing',
  createdAt: '2026-09-27T09:22:00.000Z',
  items: [{ menuId: 'm2', qty: 2, note: '' }],
};

describe('orders-board-sync', () => {
  it('keeps a pending optimistic status when the poll returns the older status', () => {
    const pending = new Map<string, PendingStatusUpdate>([
      [preparing.id, { previousStatus: 'preparing', nextStatus: 'ready' }],
    ]);
    const confirmed = new Map<string, OrderStatus>();
    const { orders } = mergeServerOrders([{ ...preparing, status: 'preparing' }], [preparing], pending, confirmed);

    expect(orders.find((order) => order.id === preparing.id)?.status).toBe('ready');
  });

  it('keeps a pending order that disappeared from the poll response', () => {
    const local = { ...preparing, status: 'ready' as const };
    const pending = new Map<string, PendingStatusUpdate>([
      [preparing.id, { previousStatus: 'preparing', nextStatus: 'ready' }],
    ]);
    const confirmed = new Map<string, OrderStatus>();
    const { orders, serverOrderIds } = mergeServerOrders([], [local], pending, confirmed);

    expect(serverOrderIds.has(preparing.id)).toBe(false);
    expect(orders).toEqual([local]);
  });

  it('does not let a stale poll move a confirmed status backwards', () => {
    const pending = new Map<string, PendingStatusUpdate>();
    const confirmed = new Map<string, OrderStatus>([[preparing.id, 'ready']]);
    const stale = mergeServerOrders([{ ...preparing, status: 'preparing' }], [preparing], pending, confirmed);
    expect(stale.orders[0]?.status).toBe('ready');
    expect(confirmed.has(preparing.id)).toBe(true);

    const caughtUp = mergeServerOrders([{ ...preparing, status: 'ready' }], stale.orders, pending, confirmed);
    expect(caughtUp.orders[0]?.status).toBe('ready');
    expect(confirmed.has(preparing.id)).toBe(false);
  });
});
