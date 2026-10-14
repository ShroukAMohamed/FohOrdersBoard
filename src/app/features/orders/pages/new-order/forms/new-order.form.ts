import { AbstractControl, FormArray, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';

import { MenuItem } from '../../../models/menu-item.model';
import { CreateOrderRequest, Order, OrderLine, OrderType } from '../../../models/order.model';
import { calculateOrderTotals } from '../../../utils/order-calculations';
import { egyptianMobileValidator } from '../../../utils/egyptian-mobile.validator';

export interface NewOrderItemForm {
  menuId: FormControl<string>;
  qty: FormControl<number | null>;
  note: FormControl<string>;
}

export interface NewOrderForm {
  type: FormControl<OrderType>;
  table: FormControl<number | null>;
  phone: FormControl<string>;
  items: FormArray<FormGroup<NewOrderItemForm>>;
}

export interface NewOrderTotalsView {
  subtotal: string;
  serviceCharge: string;
  vat: string;
  grandTotal: string;
  serviceCaption: string;
  showServiceRate: boolean;
}

const TABLE_VALIDATORS = [Validators.required, Validators.min(1), Validators.max(40), wholeNumberValidator()];
const PHONE_VALIDATORS = [Validators.required, egyptianMobileValidator()];
const QTY_VALIDATORS = [Validators.required, Validators.min(1), Validators.max(20), wholeNumberValidator()];

function atLeastOneItem(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  return Array.isArray(value) && value.length > 0 ? null : { minItems: true };
}

export function wholeNumberValidator(): ValidatorFn {
  return (control: AbstractControl<number | null>): ValidationErrors | null => {
    const value = control.value;
    if (value === null || value === undefined) {
      return null;
    }
    return Number.isInteger(value) ? null : { wholeNumber: true };
  };
}

export function createItemGroup(): FormGroup<NewOrderItemForm> {
  return new FormGroup<NewOrderItemForm>({
    menuId: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    qty: new FormControl<number | null>(1, { validators: QTY_VALIDATORS }),
    note: new FormControl('', { nonNullable: true }),
  });
}

export function createNewOrderForm(): FormGroup<NewOrderForm> {
  return new FormGroup<NewOrderForm>({
    type: new FormControl<OrderType>('dine-in', { nonNullable: true, validators: [Validators.required] }),
    table: new FormControl<number | null>(null, { validators: TABLE_VALIDATORS }),
    phone: new FormControl('', { nonNullable: true }),
    items: new FormArray<FormGroup<NewOrderItemForm>>([createItemGroup()], [atLeastOneItem]),
  });
}

export function applyOrderType(form: FormGroup<NewOrderForm>, type: OrderType): void {
  const table = form.controls.table;
  const phone = form.controls.phone;

  if (type === 'dine-in') {
    table.setValidators(TABLE_VALIDATORS);
    phone.clearValidators();
    phone.setValue('');
  } else if (type === 'delivery') {
    phone.setValidators(PHONE_VALIDATORS);
    table.clearValidators();
    table.setValue(null);
  } else {
    table.clearValidators();
    phone.clearValidators();
    table.setValue(null);
    phone.setValue('');
  }

  table.updateValueAndValidity();
  phone.updateValueAndValidity();
}

/**
 * json-server stores the id and number we send. The next identity is one past the
 * highest existing number or numeric id, so a gap or a deleted row cannot be reused.
 * Two creates that read the list at the same time can still choose the same number.
 */
export function nextOrderIdentity(orders: readonly Pick<Order, 'id' | 'number'>[]): { id: string; number: number } {
  const highest = orders.reduce((max, order) => {
    const parsedId = Number(order.id);
    const idValue = Number.isInteger(parsedId) ? parsedId : 0;
    return Math.max(max, order.number, idValue);
  }, 0);
  const number = highest + 1;
  return { id: String(number), number };
}

export function toCreateOrderRequest(
  form: FormGroup<NewOrderForm>,
  orders: readonly Pick<Order, 'id' | 'number'>[],
  createdAt: Date,
): CreateOrderRequest {
  const value = form.getRawValue();
  const identity = nextOrderIdentity(orders);
  const items: OrderLine[] = value.items
    .filter((item) => item.menuId.length > 0 && item.qty !== null)
    .map((item) => ({
      menuId: item.menuId,
      qty: item.qty ?? 0,
      note: item.note.trim(),
    }));

  return {
    ...identity,
    type: value.type,
    table: value.type === 'dine-in' ? value.table : null,
    phone: value.type === 'delivery' ? value.phone.trim() : null,
    status: 'new',
    createdAt: createdAt.toISOString(),
    items,
  };
}

export function summarizeOrder(
  type: OrderType,
  items: readonly { menuId: string; qty: number | null }[],
  menu: readonly MenuItem[],
): NewOrderTotalsView {
  const menuById = new Map(menu.map((item) => [item.id, item]));
  const priced: { unitPrice: number; qty: number }[] = [];

  for (const item of items) {
    const menuItem = menuById.get(item.menuId);
    if (!menuItem || item.qty === null || !Number.isInteger(item.qty) || item.qty < 1 || item.qty > 20) {
      continue;
    }
    priced.push({ unitPrice: menuItem.price, qty: item.qty });
  }

  const totals = calculateOrderTotals(type, priced);
  return {
    subtotal: formatEgp(totals.subtotal),
    serviceCharge: formatEgp(totals.serviceCharge),
    vat: formatEgp(totals.vat),
    grandTotal: formatEgp(totals.grandTotal),
    serviceCaption: serviceCaption(type),
    showServiceRate: type === 'dine-in',
  };
}

function serviceCaption(type: OrderType): string {
  if (type === 'dine-in') {
    return 'Service charge (12%) applies to Dine-in orders only.';
  }
  if (type === 'takeaway') {
    return 'Takeaway order: Service charge (0%) waived.';
  }
  return 'Delivery order: Service charge (0%) waived. Mobile required.';
}

function formatEgp(amount: number): string {
  return `EGP ${amount.toFixed(2)}`;
}
