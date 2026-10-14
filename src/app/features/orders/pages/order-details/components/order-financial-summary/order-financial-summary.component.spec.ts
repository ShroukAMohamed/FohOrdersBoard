import { TestBed } from '@angular/core/testing';

import { OrderDetailsTotals } from '../../stores/order-details.store';
import { OrderFinancialSummaryComponent } from './order-financial-summary.component';

const totals: OrderDetailsTotals = {
  subtotal: 'EGP 450.00',
  serviceCharge: 'EGP 54.00',
  vat: 'EGP 70.56',
  grandTotal: 'EGP 574.56',
  serviceLabel: 'Service Charge (12%)',
  serviceCaption: '12% Dine-in service rate',
  vatCaption: '14% VAT on EGP 504.00 (Subtotal + Service)',
};

describe('OrderFinancialSummaryComponent', () => {
  function text(value: OrderDetailsTotals | null): string {
    const fixture = TestBed.createComponent(OrderFinancialSummaryComponent);
    fixture.componentRef.setInput('totals', value);
    fixture.detectChanges();
    return fixture.nativeElement.textContent as string;
  }

  it('renders the priced summary', () => {
    const rendered = text(totals);

    expect(rendered).toContain('EGP 450.00');
    expect(rendered).toContain('EGP 54.00');
    expect(rendered).toContain('12% Dine-in service rate');
    expect(rendered).toContain('EGP 70.56');
    expect(rendered).toContain('14% VAT on EGP 504.00 (Subtotal + Service)');
    expect(rendered).toContain('EGP 574.56');
  });

  it('shows the unavailable-price fallback', () => {
    const rendered = text(null);

    expect(rendered).toContain('Price unavailable');
    expect(rendered).not.toContain('EGP 574.56');
  });
});
