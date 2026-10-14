import { provideRouter, Router } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MessageService } from 'primeng/api';
import { of, Subject, throwError } from 'rxjs';

import { MenuApiService } from '../../../data-access/menu-api.service';
import { OrdersApiService } from '../../../data-access/orders-api.service';
import { MenuItem } from '../../../models/menu-item.model';
import { CreateOrderRequest, Order } from '../../../models/order.model';
import { NewOrderComponent } from './new-order.component';

const menu: MenuItem[] = [
  { id: 'm2', name: 'Chicken Shawarma Plate', category: 'Mains', price: 165 },
  { id: 'm6', name: 'Fresh Mango Juice', category: 'Drinks', price: 60 },
];

const existing: Order = {
  id: '1045',
  number: 1045,
  type: 'dine-in',
  table: 4,
  phone: null,
  status: 'new',
  createdAt: '2026-09-27T10:00:00.000Z',
  items: [],
};

describe('NewOrderComponent', () => {
  const getMenu = vi.fn<() => ReturnType<MenuApiService['getMenu']>>(() => of(menu));
  const getOrders = vi.fn<() => ReturnType<OrdersApiService['getOrders']>>(() => of([existing]));
  const createOrder = vi.fn<(order: CreateOrderRequest) => ReturnType<OrdersApiService['createOrder']>>();

  let fixture: ComponentFixture<NewOrderComponent>;

  function create(): NewOrderComponent {
    fixture = TestBed.createComponent(NewOrderComponent);
    fixture.detectChanges();
    return fixture.componentInstance;
  }

  function text(): string {
    return fixture.nativeElement.textContent as string;
  }

  function fillValidOrder(): void {
    const form = fixture.componentInstance.form;
    form.controls.table.setValue(14);
    form.controls.items.at(0).controls.menuId.setValue('m2');
    form.controls.items.at(0).controls.qty.setValue(2);
    form.controls.items.at(0).controls.note.setValue('no garlic');
    fixture.detectChanges();
  }

  beforeEach(() => {
    getMenu.mockReset();
    getOrders.mockReset();
    createOrder.mockReset();
    getMenu.mockReturnValue(of(menu));
    getOrders.mockReturnValue(of([existing]));
    createOrder.mockImplementation((order) => of(order as Order));

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: MenuApiService, useValue: { getMenu } },
        { provide: OrdersApiService, useValue: { getOrders, createOrder } },
        MessageService,
      ],
    });
  });

  afterEach(() => {
    fixture?.destroy();
  });

  it('shows a loading state before the menu arrives', () => {
    getMenu.mockReturnValue(new Subject());
    create();

    expect(text()).toContain('Loading menu');
    expect(fixture.nativeElement.querySelector('form')).toBeNull();
  });

  it('renders menu choices, updates the total, and adds and removes rows', () => {
    create();

    expect(text()).toContain('Select a menu item');
    expect(text()).toContain('EGP 0.00');

    const form = fixture.componentInstance.form;
    form.controls.items.at(0).controls.menuId.setValue('m2');
    form.controls.items.at(0).controls.qty.setValue(2);
    fixture.detectChanges();
    expect(text()).toContain('Chicken Shawarma Plate — EGP 165.00');
    expect(text()).toContain('EGP 330.00');
    expect(text()).toContain('EGP 39.60');
    expect(text()).toContain('EGP 51.74');
    expect(text()).toContain('EGP 421.34');

    (
      [...fixture.nativeElement.querySelectorAll('button')].find((button) =>
        (button.textContent as string).includes('Add Item'),
      ) as HTMLButtonElement
    ).click();
    fixture.detectChanges();
    expect(form.controls.items).toHaveLength(2);

    const remove = fixture.nativeElement.querySelector('[aria-label="Remove item 2"]') as HTMLButtonElement;
    remove.click();
    fixture.detectChanges();
    expect(form.controls.items).toHaveLength(1);
  });

  it('switches conditional fields and does not submit an invalid form', () => {
    create();
    const submit = [...fixture.nativeElement.querySelectorAll('button')].find((button) =>
      (button.textContent as string).includes('Create Order'),
    ) as HTMLButtonElement;
    submit.click();
    fixture.detectChanges();

    expect(createOrder).not.toHaveBeenCalled();
    expect(text()).toContain('Please fix the highlighted errors before submitting.');
    expect(text()).toContain('Enter a table number.');

    const delivery = [...fixture.nativeElement.querySelectorAll('[role="button"]')].find((button) =>
      (button.textContent as string).includes('Delivery'),
    ) as HTMLElement;
    delivery.click();
    fixture.detectChanges();

    expect(text()).toContain('Egyptian Mobile Phone');
    expect(text()).not.toContain('Table Number');
    const phoneInput = fixture.nativeElement.querySelector('#mobile-number') as HTMLInputElement;
    phoneInput.value = '0101234567';
    phoneInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(fixture.componentInstance.form.controls.phone.errors).toEqual({ egyptianMobile: true });
    expect(text()).toContain('Use 01 followed by 0, 1, 2, or 5, then 8 digits.');
  });

  it('creates the next order and navigates to its details page', () => {
    create();
    fillValidOrder();
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

    const submit = [...fixture.nativeElement.querySelectorAll('button')].find((button) =>
      (button.textContent as string).includes('Create Order'),
    ) as HTMLButtonElement;
    submit.click();
    fixture.detectChanges();

    expect(createOrder).toHaveBeenCalledTimes(1);
    const payload = createOrder.mock.calls[0][0];
    expect(payload).toMatchObject({
      id: '1046',
      number: 1046,
      type: 'dine-in',
      table: 14,
      phone: null,
      status: 'new',
      items: [{ menuId: 'm2', qty: 2, note: 'no garlic' }],
    });
    expect(payload.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(navigate).toHaveBeenCalledWith(['/orders', '1046']);
  });

  it('ignores a second submit while the first request is in flight', () => {
    const created = new Subject<Order[]>();
    getOrders.mockReturnValue(created);
    create();
    fillValidOrder();

    const submit = () => (fixture.nativeElement.querySelector('button[type="submit"]') as HTMLButtonElement).click();

    submit();
    fixture.detectChanges();
    submit();

    expect(getOrders).toHaveBeenCalledTimes(1);
    expect(text()).toContain('Creating order…');
  });

  it('keeps the form available when creation fails', () => {
    getOrders.mockReturnValue(throwError(() => new Error('down')));
    create();
    fillValidOrder();
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const add = vi.spyOn(TestBed.inject(MessageService), 'add');

    (
      [...fixture.nativeElement.querySelectorAll('button')].find((button) =>
        (button.textContent as string).includes('Create Order'),
      ) as HTMLButtonElement
    ).click();
    fixture.detectChanges();

    expect(add).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: 'error',
        summary: 'Could not create order',
        detail: 'Could not create the order. Check that the API is running, then try again.',
      }),
    );
    expect(navigate).not.toHaveBeenCalled();
    expect((fixture.nativeElement.querySelector('button[type="submit"]') as HTMLButtonElement).disabled).toBe(false);
  });

  it('shows a menu failure and retries', () => {
    getMenu.mockReturnValueOnce(throwError(() => new Error('down'))).mockReturnValueOnce(of(menu));
    create();

    expect(text()).toContain('Unable to load the menu');
    expect(fixture.nativeElement.querySelector('form')).toBeNull();

    (
      [...fixture.nativeElement.querySelectorAll('button')].find((button) =>
        (button.textContent as string).includes('Retry Connection'),
      ) as HTMLButtonElement
    ).click();
    fixture.detectChanges();

    expect(text()).toContain('Create New Order');
    expect(text()).toContain('Select a menu item');
  });

  it('shows an empty menu without a submit form', () => {
    getMenu.mockReturnValue(of([]));
    create();

    expect(text()).toContain('No menu items are available');
    expect(fixture.nativeElement.querySelector('form')).toBeNull();
  });
});
