import { TestBed } from '@angular/core/testing';

import { OrderDetailsLine } from '../../stores/order-details.store';
import { OrderItemsComponent } from './order-items.component';

const lines: OrderDetailsLine[] = [
  {
    name: 'Chicken Shawarma Plate',
    qty: 2,
    note: 'no garlic sauce',
    unitPriceLabel: 'EGP 165.00',
    lineTotalLabel: 'EGP 330.00',
  },
  {
    name: 'Fresh Mango Juice',
    qty: 2,
    note: null,
    unitPriceLabel: 'EGP 60.00',
    lineTotalLabel: 'EGP 120.00',
  },
];

describe('OrderItemsComponent', () => {
  it('keeps the mobile cards and desktop table mutually exclusive and shows notes only when present', () => {
    const fixture = TestBed.createComponent(OrderItemsComponent);
    fixture.componentRef.setInput('lines', lines);
    fixture.componentRef.setInput('lineCount', lines.length);
    fixture.detectChanges();

    const list = fixture.nativeElement.querySelector('ul') as HTMLElement;
    const table = fixture.nativeElement.querySelector('table') as HTMLElement;
    const tableWrap = table.parentElement as HTMLElement;

    expect(list.className).toContain('md:hidden');
    expect(list.className).not.toContain('md:block');
    expect(tableWrap.className).toContain('hidden');
    expect(tableWrap.className).toContain('md:block');
    expect(fixture.nativeElement.textContent).toContain('2 items');
    expect(fixture.nativeElement.textContent).toContain('no garlic sauce');
    expect(fixture.nativeElement.textContent).toContain('EGP 330.00');
    expect(list.textContent).not.toContain('Fresh Mango Juice note');
    expect(list.querySelectorAll('li')).toHaveLength(2);
    expect(table.querySelectorAll('tbody tr')).toHaveLength(2);
  });
});
