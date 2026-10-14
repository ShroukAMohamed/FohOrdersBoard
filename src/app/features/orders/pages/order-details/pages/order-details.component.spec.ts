import { HttpErrorResponse } from '@angular/common/http';
import { provideRouter, ActivatedRoute, convertToParamMap } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MessageService } from 'primeng/api';
import { BehaviorSubject, of, Subject, throwError } from 'rxjs';

import { MenuApiService } from '../../../data-access/menu-api.service';
import { OrdersApiService } from '../../../data-access/orders-api.service';
import { MenuItem } from '../../../models/menu-item.model';
import { Order } from '../../../models/order.model';
import { LATE_AFTER_MS } from '../../../utils/order-status';
import { OrderDetailsComponent } from './order-details.component';
import { OrderDetailsStore } from '../stores/order-details.store';

const menu: MenuItem[] = [
  { id: 'm2', name: 'Chicken Shawarma Plate', category: 'Mains', price: 165 },
  { id: 'm5', name: 'Om Ali', category: 'Desserts', price: 75 },
  { id: 'm6', name: 'Fresh Mango Juice', category: 'Drinks', price: 60 },
];

const dineIn: Order = {
  id: '1041',
  number: 1041,
  type: 'dine-in',
  table: 7,
  phone: null,
  status: 'preparing',
  createdAt: '2026-09-27T09:22:00.000Z',
  items: [
    { menuId: 'm2', qty: 2, note: 'no garlic sauce' },
    { menuId: 'm6', qty: 2, note: '' },
  ],
};

const delivery: Order = {
  id: '1044',
  number: 1044,
  type: 'delivery',
  table: null,
  phone: '01012345678',
  status: 'new',
  createdAt: '2026-09-27T09:48:00.000Z',
  items: [
    { menuId: 'm2', qty: 1, note: '' },
    { menuId: 'm5', qty: 1, note: 'warm' },
  ],
};

describe('OrderDetailsComponent', () => {
  const params = new BehaviorSubject(convertToParamMap({ id: '1041' }));
  const getOrder = vi.fn<() => ReturnType<OrdersApiService['getOrder']>>();
  const updateStatus = vi.fn<() => ReturnType<OrdersApiService['updateStatus']>>();
  const getMenu = vi.fn<() => ReturnType<MenuApiService['getMenu']>>(() => of(menu));

  let fixture: ComponentFixture<OrderDetailsComponent>;

  function create(): OrderDetailsComponent {
    fixture = TestBed.createComponent(OrderDetailsComponent);
    fixture.detectChanges();
    return fixture.componentInstance;
  }

  function text(): string {
    return fixture.nativeElement.textContent as string;
  }

  beforeEach(() => {
    params.next(convertToParamMap({ id: '1041' }));
    getOrder.mockReset();
    updateStatus.mockReset();
    getMenu.mockClear();
    getOrder.mockReturnValue(of(dineIn));
    updateStatus.mockReturnValue(of({ ...dineIn, status: 'ready' }));

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { paramMap: params.asObservable() } },
        { provide: OrdersApiService, useValue: { getOrder, updateStatus } },
        { provide: MenuApiService, useValue: { getMenu } },
        MessageService,
      ],
    });
  });

  afterEach(() => {
    fixture?.destroy();
  });

  it('renders the dine-in order, line totals, service, VAT, and grand total', () => {
    create();

    expect(text()).toContain('Order #1041');
    expect(text()).toContain('Preparing');
    expect(text()).toContain('Dine-in');
    expect(text()).toContain('Table 7');
    expect(text()).toContain('09:22:00');
    expect(text()).toContain('Chicken Shawarma Plate');
    expect(text()).toContain('no garlic sauce');
    expect(text()).toContain('EGP 165.00');
    expect(text()).toContain('EGP 330.00');
    expect(text()).toContain('EGP 450.00');
    expect(text()).toContain('EGP 54.00');
    expect(text()).toContain('EGP 70.56');
    expect(text()).toContain('EGP 574.56');
    expect(text()).toContain('4 items');
    expect(text()).toContain('Service Charge (12%)');
    expect(text()).toContain('12% Dine-in service rate');
    expect(text()).toContain('Mark Ready');
    expect(text()).not.toContain('Fresh Mango Juice note');
  });

  it('charges no service for a delivery order', () => {
    params.next(convertToParamMap({ id: '1044' }));
    getOrder.mockReturnValue(of(delivery));
    create();

    expect(text()).toContain('Order #1044');
    expect(text()).toContain('Delivery');
    expect(text()).not.toContain('Table Assignment');
    expect(text()).toContain('EGP 240.00');
    expect(text()).toContain('EGP 0.00');
    expect(text()).toContain('EGP 33.60');
    expect(text()).toContain('EGP 273.60');
    expect(text()).toContain('No service charge for this order type');
    expect(text()).not.toContain('Service Charge (12%)');
    expect(text()).toContain('Start Preparing');
    expect(text()).toContain('warm');
  });

  it('charges no service for a takeaway order', () => {
    getOrder.mockReturnValue(
      of({
        ...delivery,
        id: '1043',
        number: 1043,
        type: 'takeaway',
        status: 'ready',
        items: [{ menuId: 'm2', qty: 1, note: '' }],
      }),
    );
    create();

    expect(text()).toContain('Takeaway');
    expect(text()).toContain('EGP 165.00');
    expect(text()).toContain('EGP 0.00');
    expect(text()).toContain('EGP 23.10');
    expect(text()).toContain('EGP 188.10');
    expect(text()).toContain('Mark Served');
    expect(text()).not.toContain('Table Assignment');
  });

  it('shows Price unavailable when a menu price is missing', () => {
    getMenu.mockReturnValue(of([]));
    create();

    expect(text()).toContain('Unknown item');
    expect(text()).toContain('Price unavailable');
    expect(text()).not.toContain('EGP 574.56');
  });

  it('moves preparing to ready and then offers Mark Served', () => {
    const patch = new Subject<Order>();
    updateStatus.mockReturnValue(patch.asObservable());
    create();

    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    button.click();
    fixture.detectChanges();
    expect(text()).toContain('Ready');
    expect(updateStatus).toHaveBeenCalledWith('1041', 'ready');
    expect(updateStatus).toHaveBeenCalledTimes(1);

    button.click();
    expect(updateStatus).toHaveBeenCalledTimes(1);

    patch.next({ ...dineIn, status: 'ready' });
    fixture.detectChanges();
    expect(text()).toContain('Mark Served');
    expect(fixture.nativeElement.querySelector('button')?.textContent).toContain('Mark Served');
  });

  it('rolls back a failed status update', () => {
    updateStatus.mockReturnValue(throwError(() => new Error('down')));
    create();

    const add = vi.spyOn(TestBed.inject(MessageService), 'add');
    (fixture.nativeElement.querySelector('button') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(text()).toContain('Preparing');
    expect(add).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: 'error',
        summary: 'Update failed',
        detail: 'Could not move order 1041 to Ready.',
      }),
    );
    expect(fixture.nativeElement.querySelector('h1')?.textContent).toContain('Order #1041');
    expect(fixture.nativeElement.querySelector('button')?.textContent).toContain('Mark Ready');
  });

  it('shows no advance action for a served order', () => {
    getOrder.mockReturnValue(of({ ...dineIn, status: 'served' }));
    create();

    expect(fixture.nativeElement.querySelector('button')).toBeNull();
    expect(text()).toContain('Served');
    expect(text()).not.toContain('High Priority Delay');
  });

  it('marks a new order late only after 20 minutes', () => {
    getOrder.mockReturnValue(
      of({
        ...delivery,
        status: 'new',
        createdAt: new Date(Date.now() - LATE_AFTER_MS - 1000).toISOString(),
      }),
    );
    create();
    expect(text()).toContain('High Priority Delay');

    fixture.destroy();
    getOrder.mockReturnValue(
      of({
        ...delivery,
        status: 'new',
        createdAt: new Date(Date.now() - LATE_AFTER_MS + 60_000).toISOString(),
      }),
    );
    create();
    expect(text()).not.toContain('High Priority Delay');
  });

  it('shows a not-found state for a missing order and a retry for a network error', () => {
    getOrder.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 404, statusText: 'Not Found' })));
    create();
    expect(text()).toContain('Order Not Found');
    expect(text()).toContain('#1041');
    expect(fixture.nativeElement.querySelector('button')).toBeNull();

    fixture.destroy();
    getOrder.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 0, statusText: 'Unknown Error' })));
    create();
    expect(text()).toContain('Connection Interrupted');
    expect(text()).toContain('Retry Connection');

    getOrder.mockReturnValue(of(dineIn));
    (fixture.nativeElement.querySelector('button') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(text()).toContain('Order #1041');
  });

  it('does not show order data while the request is still loading', () => {
    getOrder.mockReturnValue(new Subject());
    create();

    expect(text()).toContain('Loading order');
    expect(text()).not.toContain('Order #1041');
    expect(text()).not.toContain('EGP 574.56');
  });

  it('does not let a late status response replace a different order', () => {
    const patch = new Subject<Order>();
    updateStatus.mockReturnValue(patch.asObservable());
    create();
    (fixture.nativeElement.querySelector('button') as HTMLButtonElement).click();

    getOrder.mockReturnValue(of(delivery));
    params.next(convertToParamMap({ id: '1044' }));
    patch.next({ ...dineIn, status: 'ready' });
    patch.complete();
    fixture.detectChanges();

    expect(text()).toContain('Order #1044');
    expect(text()).not.toContain('Order #1041');
  });

  it('ignores a status response after the page is destroyed', () => {
    const patch = new Subject<Order>();
    updateStatus.mockReturnValue(patch.asObservable());
    create();
    const store = fixture.debugElement.injector.get(OrderDetailsStore);
    (fixture.nativeElement.querySelector('button') as HTMLButtonElement).click();
    fixture.destroy();

    patch.next({ ...dineIn, status: 'served' });
    patch.complete();
    expect(store.detail()?.status).toBe('ready');
  });
});
