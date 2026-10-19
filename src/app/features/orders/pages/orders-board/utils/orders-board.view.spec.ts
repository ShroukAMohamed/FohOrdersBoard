import { MenuItem } from '../../../models/menu-item.model';
import { Order } from '../../../models/order.model';
import { buildOrderColumns, isBoardTypeFilter, toOrderCard } from './orders-board.view';

const menu: MenuItem[] = [{ id: 'm2', name: 'Chicken Shawarma Plate', category: 'Mains', price: 165 }];

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

describe('orders-board.view', () => {
  it('builds a card with place, count, subtotal, and advancing flag', () => {
    const card = toOrderCard(preparing, menu, Date.parse('2026-09-27T09:23:00.000Z'), true);

    expect(card.placeLabel).toBe('Table 7');
    expect(card.itemCount).toBe(2);
    expect(card.subtotalLabel).toBe('EGP 330.00');
    expect(card.actionLabel).toBe('Mark Ready');
    expect(card.advancing).toBe(true);
  });

  it('filters columns by type and search while preserving status order', () => {
    const ready: Order = { ...preparing, id: '1042', number: 1042, status: 'ready', table: 2 };
    const columns = buildOrderColumns([preparing, ready], menu, '1041', 'dine-in', Date.now(), new Set());

    expect(columns.map((column) => column.status)).toEqual(['new', 'preparing', 'ready', 'served']);
    expect(columns.find((column) => column.status === 'preparing')?.count).toBe(1);
    expect(columns.find((column) => column.status === 'ready')?.count).toBe(0);
  });

  it('accepts known order types for the board filter', () => {
    expect(isBoardTypeFilter('takeaway')).toBe(true);
    expect(isBoardTypeFilter('catering')).toBe(false);
    expect(isBoardTypeFilter(null)).toBe(false);
  });
});
