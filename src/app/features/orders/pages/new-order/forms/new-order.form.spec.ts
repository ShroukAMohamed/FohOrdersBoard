import { MenuItem } from '../../../models/menu-item.model';
import { Order } from '../../../models/order.model';
import {
  applyOrderType,
  createItemGroup,
  createNewOrderForm,
  nextOrderIdentity,
  summarizeOrder,
  toCreateOrderRequest,
} from './new-order.form';

const menu: MenuItem[] = [
  { id: 'm2', name: 'Chicken Shawarma Plate', category: 'Mains', price: 165 },
  { id: 'm6', name: 'Fresh Mango Juice', category: 'Drinks', price: 60 },
];

const orders: Order[] = [
  {
    id: '1044',
    number: 1044,
    type: 'delivery',
    table: null,
    phone: '01012345678',
    status: 'new',
    createdAt: '2026-09-27T09:48:00.000Z',
    items: [],
  },
  {
    id: '1041',
    number: 1041,
    type: 'dine-in',
    table: 7,
    phone: null,
    status: 'preparing',
    createdAt: '2026-09-27T09:22:00.000Z',
    items: [],
  },
];

describe('new order form', () => {
  it('starts with one item row and requires a dine-in table', () => {
    const form = createNewOrderForm();

    expect(form.controls.items).toHaveLength(1);
    expect(form.controls.type.value).toBe('dine-in');
    expect(form.controls.table.valid).toBe(false);
    expect(form.valid).toBe(false);
  });

  it('adds and removes item rows and rejects an empty order', () => {
    const form = createNewOrderForm();
    form.controls.items.push(createItemGroup());
    expect(form.controls.items).toHaveLength(2);

    form.controls.items.removeAt(0);
    form.controls.items.removeAt(0);
    expect(form.controls.items.valid).toBe(false);
  });

  it('accepts quantities 1 and 20 and rejects 0, 21, and fractions', () => {
    const qty = createItemGroup().controls.qty;

    for (const value of [1, 20]) {
      qty.setValue(value);
      expect(qty.valid).toBe(true);
    }
    for (const value of [0, 21, 1.5, null]) {
      qty.setValue(value);
      expect(qty.valid).toBe(false);
    }
  });

  it('accepts tables 1 and 40 and rejects values outside that range', () => {
    const table = createNewOrderForm().controls.table;

    for (const value of [1, 40]) {
      table.setValue(value);
      expect(table.valid).toBe(true);
    }
    for (const value of [0, 41, 1.5, null]) {
      table.setValue(value);
      expect(table.valid).toBe(false);
    }
  });

  it('requires a valid Egyptian mobile number only for delivery', () => {
    const form = createNewOrderForm();
    applyOrderType(form, 'delivery');
    const phone = form.controls.phone;

    expect(phone.valid).toBe(false);
    phone.setValue('01312345678');
    expect(phone.hasError('egyptianMobile')).toBe(true);
    phone.setValue('01012345678');
    expect(phone.valid).toBe(true);

    applyOrderType(form, 'takeaway');
    expect(form.controls.table.value).toBeNull();
    expect(form.controls.phone.value).toBe('');
    expect(form.controls.phone.valid).toBe(true);
    expect(form.controls.table.valid).toBe(true);

    applyOrderType(form, 'dine-in');
    expect(form.controls.table.valid).toBe(false);
    expect(form.controls.phone.validator).toBeNull();
  });

  it('prices only complete rows and waives service except for dine-in', () => {
    const items = [
      { menuId: 'm2', qty: 2 },
      { menuId: 'm6', qty: 2 },
      { menuId: '', qty: 1 },
      { menuId: 'm2', qty: 21 },
    ];

    const dineIn = summarizeOrder('dine-in', items, menu);
    expect(dineIn.subtotal).toBe('EGP 450.00');
    expect(dineIn.serviceCharge).toBe('EGP 54.00');
    expect(dineIn.vat).toBe('EGP 70.56');
    expect(dineIn.grandTotal).toBe('EGP 574.56');
    expect(dineIn.showServiceRate).toBe(true);

    const pricedMenu = [...menu, { id: 'm5', name: 'Om Ali', category: 'Desserts', price: 75 }];
    const delivery = summarizeOrder(
      'delivery',
      [
        { menuId: 'm2', qty: 1 },
        { menuId: 'm5', qty: 1 },
      ],
      pricedMenu,
    );
    expect(delivery.subtotal).toBe('EGP 240.00');
    expect(delivery.serviceCharge).toBe('EGP 0.00');
    expect(delivery.vat).toBe('EGP 33.60');
    expect(delivery.grandTotal).toBe('EGP 273.60');
    expect(delivery.showServiceRate).toBe(false);
    expect(summarizeOrder('takeaway', [{ menuId: 'm2', qty: 1 }], menu).serviceCharge).toBe('EGP 0.00');
    expect(summarizeOrder('dine-in', [], menu).grandTotal).toBe('EGP 0.00');
  });

  it('maps the next order number and the API payload', () => {
    expect(nextOrderIdentity(orders)).toEqual({ id: '1045', number: 1045 });
    expect(nextOrderIdentity([])).toEqual({ id: '1', number: 1 });

    const form = createNewOrderForm();
    form.controls.table.setValue(14);
    form.controls.items.at(0).setValue({ menuId: 'm2', qty: 2, note: ' no garlic ' });
    form.controls.items.push(createItemGroup());
    form.controls.items.at(1).setValue({ menuId: 'm2', qty: 1, note: '' });

    const createdAt = new Date('2026-10-14T18:00:00.000Z');
    expect(toCreateOrderRequest(form, orders, createdAt)).toEqual({
      id: '1045',
      number: 1045,
      type: 'dine-in',
      table: 14,
      phone: null,
      status: 'new',
      createdAt: '2026-10-14T18:00:00.000Z',
      items: [
        { menuId: 'm2', qty: 2, note: 'no garlic' },
        { menuId: 'm2', qty: 1, note: '' },
      ],
    });

    form.controls.type.setValue('delivery');
    applyOrderType(form, 'delivery');
    form.controls.phone.setValue('01012345678');
    expect(toCreateOrderRequest(form, orders, createdAt).table).toBeNull();
    expect(toCreateOrderRequest(form, orders, createdAt).phone).toBe('01012345678');
  });
});
