import { isLateOrder, LATE_AFTER_MS, nextOrderStatus } from './order-status';

describe('nextOrderStatus', () => {
  it('walks new → preparing → ready → served and stops at served', () => {
    expect(nextOrderStatus('new')).toBe('preparing');
    expect(nextOrderStatus('preparing')).toBe('ready');
    expect(nextOrderStatus('ready')).toBe('served');
    expect(nextOrderStatus('served')).toBeNull();
  });
});

describe('isLateOrder', () => {
  const createdAt = '2026-09-27T09:00:00.000Z';
  const createdMs = Date.parse(createdAt);

  it('marks new and preparing orders older than 20 minutes as late', () => {
    const now = createdMs + LATE_AFTER_MS + 1;
    expect(isLateOrder('new', createdAt, now)).toBe(true);
    expect(isLateOrder('preparing', createdAt, now)).toBe(true);
  });

  it('does not mark an order that is exactly 20 minutes old', () => {
    expect(isLateOrder('new', createdAt, createdMs + LATE_AFTER_MS)).toBe(false);
  });

  it('does not mark ready or served orders as late', () => {
    const now = createdMs + LATE_AFTER_MS + 1;
    expect(isLateOrder('ready', createdAt, now)).toBe(false);
    expect(isLateOrder('served', createdAt, now)).toBe(false);
  });
});
