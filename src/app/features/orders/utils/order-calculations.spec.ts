import { MenuItem } from '../models/menu-item.model';
import { calculateOrderTotals, priceOrderLines } from './order-calculations';

const menu: MenuItem[] = [
  { id: 'm2', name: 'Chicken Shawarma Plate', category: 'Mains', price: 165 },
  { id: 'm5', name: 'Om Ali', category: 'Desserts', price: 75 },
  { id: 'm6', name: 'Fresh Mango Juice', category: 'Drinks', price: 60 },
];

describe('calculateOrderTotals', () => {
  it('matches the dine-in sample for order 1041', () => {
    expect(
      calculateOrderTotals('dine-in', [
        { unitPrice: 165, qty: 2 },
        { unitPrice: 60, qty: 2 },
      ]),
    ).toEqual({
      subtotal: 450,
      serviceCharge: 54,
      vat: 70.56,
      grandTotal: 574.56,
    });
  });

  it('matches the delivery sample for order 1044 and charges no service', () => {
    expect(
      calculateOrderTotals('delivery', [
        { unitPrice: 165, qty: 1 },
        { unitPrice: 75, qty: 1 },
      ]),
    ).toEqual({
      subtotal: 240,
      serviceCharge: 0,
      vat: 33.6,
      grandTotal: 273.6,
    });
  });

  it('charges no service for takeaway', () => {
    expect(calculateOrderTotals('takeaway', [{ unitPrice: 85, qty: 1 }])).toEqual({
      subtotal: 85,
      serviceCharge: 0,
      vat: 11.9,
      grandTotal: 96.9,
    });
  });
});

describe('priceOrderLines', () => {
  it('joins menu names and line totals, and leaves unknown items unpriced', () => {
    expect(
      priceOrderLines(
        [
          { menuId: 'm2', qty: 2, note: 'no garlic sauce' },
          { menuId: 'missing', qty: 1, note: '' },
        ],
        menu,
      ),
    ).toEqual([
      {
        menuId: 'm2',
        name: 'Chicken Shawarma Plate',
        qty: 2,
        note: 'no garlic sauce',
        unitPrice: 165,
        lineTotal: 330,
      },
      {
        menuId: 'missing',
        name: null,
        qty: 1,
        note: '',
        unitPrice: null,
        lineTotal: null,
      },
    ]);
  });
});
