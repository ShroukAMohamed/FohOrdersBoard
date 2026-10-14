import { TestBed } from '@angular/core/testing';

import { OrderOverviewComponent, OrderOverviewDetail } from './order-overview.component';

function detail(overrides: Partial<OrderOverviewDetail> = {}): OrderOverviewDetail {
  return {
    number: 1041,
    status: 'preparing',
    statusLabel: 'Preparing',
    late: true,
    elapsedLabel: '21m 0s ago',
    actionLabel: 'Mark Ready',
    typeIcon: 'restaurant',
    typeLabel: 'Dine-in',
    tableLabel: 'Table 7',
    createdLabel: '27 Sept 2026, 09:22:00',
    ...overrides,
  };
}

describe('OrderOverviewComponent', () => {
  function create(value: OrderOverviewDetail, advancing = false) {
    const fixture = TestBed.createComponent(OrderOverviewComponent);
    const advance = vi.fn();
    fixture.componentInstance.advance.subscribe(advance);
    fixture.componentRef.setInput('detail', value);
    fixture.componentRef.setInput('advancing', advancing);
    fixture.detectChanges();
    return { fixture, advance };
  }

  it('renders the order identity, late chip, and table', () => {
    const { fixture } = create(detail());
    const text = fixture.nativeElement.textContent as string;

    expect(text).toContain('Order #1041');
    expect(text).toContain('Preparing');
    expect(text).toContain('21m 0s ago late (> 20m threshold)');
    expect(text).toContain('Table 7');
    expect(text).toContain('27 Sept 2026, 09:22:00');
    expect(text).toContain('Mark Ready');
  });

  it('emits one advance and disables the action while it is pending', () => {
    const pending = create(detail(), true);
    const button = pending.fixture.nativeElement.querySelector('button') as HTMLButtonElement;

    expect(button.disabled).toBe(true);
    button.click();
    expect(pending.advance).not.toHaveBeenCalled();

    const ready = create(detail({ status: 'ready', statusLabel: 'Ready', actionLabel: 'Mark Served', late: false }));
    (ready.fixture.nativeElement.querySelector('button') as HTMLButtonElement).click();
    expect(ready.advance).toHaveBeenCalledTimes(1);
  });

  it('hides the action and table when the order is served or has no table', () => {
    const { fixture } = create(
      detail({
        status: 'served',
        statusLabel: 'Served',
        actionLabel: null,
        late: false,
        tableLabel: null,
        typeLabel: 'Delivery',
      }),
    );
    const text = fixture.nativeElement.textContent as string;

    expect(fixture.nativeElement.querySelector('button')).toBeNull();
    expect(text).toContain('Served');
    expect(text).not.toContain('Table Assignment');
    expect(text).not.toContain('late (> 20m threshold)');
  });
});
