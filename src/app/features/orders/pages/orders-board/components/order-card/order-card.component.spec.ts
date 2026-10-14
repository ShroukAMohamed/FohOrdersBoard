import { provideRouter } from '@angular/router';
import { TestBed } from '@angular/core/testing';

import { OrderCardModel } from '../../stores/orders-board.store';
import { OrderCardComponent } from './order-card.component';

function card(overrides: Partial<OrderCardModel> = {}): OrderCardModel {
  return {
    id: '1045',
    number: 1045,
    status: 'new',
    placeLabel: 'Table 4',
    itemCount: 4,
    subtotalLabel: 'EGP 320.00',
    elapsedLabel: '4m 12s ago',
    lateLabel: null,
    actionLabel: 'Start Preparing',
    advancing: false,
    ...overrides,
  };
}

describe('OrderCardComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderCardComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('emits one advance action for a new order', () => {
    const fixture = TestBed.createComponent(OrderCardComponent);
    const advance = vi.fn();
    fixture.componentInstance.advance.subscribe(advance);
    fixture.componentRef.setInput('card', card());
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(button.textContent).toContain('Start Preparing');
    button.click();
    expect(advance).toHaveBeenCalledTimes(1);
    expect(advance).toHaveBeenCalledWith('1045');
  });

  it('shows Completed and no advance button for a served order', () => {
    const fixture = TestBed.createComponent(OrderCardComponent);
    fixture.componentRef.setInput(
      'card',
      card({ status: 'served', actionLabel: null, placeLabel: 'Table 11' }),
    );
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('button')).toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Completed');
  });

  it('shows the late chip when the order is late', () => {
    const fixture = TestBed.createComponent(OrderCardComponent);
    fixture.componentRef.setInput('card', card({ status: 'preparing', lateLabel: 'Late (24m 15s ago)', actionLabel: 'Mark Ready' }));
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Late (24m 15s ago)');
  });
});
