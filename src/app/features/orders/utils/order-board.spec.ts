import { MenuItem } from '../models/menu-item.model';
import { Order } from '../models/order.model';
import { orderBoardSubtotal, orderItemCount, orderMatchesSearch, orderPlaceLabel } from './order-board';

const menu: MenuItem[] = [
  { id: 'm3', name: 'Molokhia with Rice', category: 'Mains', price: 120 },
  { id: 'm4', name: 'Fattoush', category: 'Salads', price: 70 },
  { id: 'm6', name: 'Fresh Mango Juice', category: 'Drinks', price: 60 },
];

const order1045: Order = {
  id: '1045',
  number: 1045,
  type: 'dine-in',
  table: 4,
  phone: '01012345678',
  status: 'new',
  createdAt: '2026-09-27T09:52:00.000Z',
  items: [
    { menuId: 'm3', qty: 1, note: '' },
    { menuId: 'm4', qty: 2, note: 'no onions' },
    { menuId: 'm6', qty: 1, note: '' },
  ],
};

describe('orderPlaceLabel', () => {
  it('shows the table for dine-in and the type name otherwise', () => {
    expect(orderPlaceLabel(order1045)).toBe('Table 4');
    expect(orderPlaceLabel({ ...order1045, type: 'takeaway', table: null })).toBe('Takeaway');
    expect(orderPlaceLabel({ ...order1045, type: 'delivery', table: null })).toBe('Delivery');
  });
});

describe('orderItemCount', () => {
  it('sums quantities rather than counting lines', () => {
    expect(orderItemCount(order1045.items)).toBe(4);
  });
});

describe('orderMatchesSearch', () => {
  it('matches an order number or table number substring', () => {
    expect(orderMatchesSearch(order1045, '104')).toBe(true);
    expect(orderMatchesSearch(order1045, '4')).toBe(true);
    expect(orderMatchesSearch(order1045, ' 1045 ')).toBe(true);
  });

  it('does not match the phone number', () => {
    expect(orderMatchesSearch(order1045, '01012345678')).toBe(false);
  });

  it('treats an empty query as no filter', () => {
    expect(orderMatchesSearch(order1045, '   ')).toBe(true);
  });
});

describe('orderBoardSubtotal', () => {
  it('returns the subtotal for order 1045', () => {
    expect(orderBoardSubtotal(order1045, menu)).toBe(320);
  });

  it('returns null when a menu price is missing', () => {
    expect(orderBoardSubtotal(order1045, menu.filter((item) => item.id !== 'm6'))).toBeNull();
  });
});
