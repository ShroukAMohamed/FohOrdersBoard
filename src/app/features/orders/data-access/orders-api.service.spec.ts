import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { Order } from '../models/order.model';
import { OrdersApiService } from './orders-api.service';

const order: Order = {
  id: '1041',
  number: 1041,
  type: 'dine-in',
  table: 7,
  phone: null,
  status: 'preparing',
  createdAt: '2026-09-27T09:22:00.000Z',
  items: [{ menuId: 'm2', qty: 2, note: 'no garlic sauce' }],
};

describe('OrdersApiService', () => {
  let service: OrdersApiService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(OrdersApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  it('loads every order', () => {
    service.getOrders().subscribe((orders) => expect(orders).toEqual([order]));

    const request = http.expectOne('http://localhost:3000/orders');
    expect(request.request.method).toBe('GET');
    request.flush([order]);
  });

  it('loads one order by id', () => {
    service.getOrder('1041').subscribe((result) => expect(result).toEqual(order));

    const request = http.expectOne('http://localhost:3000/orders/1041');
    expect(request.request.method).toBe('GET');
    request.flush(order);
  });

  it('creates an order with the stored shape', () => {
    const created = { ...order, id: '1046', number: 1046, status: 'new' as const };
    service.createOrder(created).subscribe();

    const request = http.expectOne('http://localhost:3000/orders');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(created);
    request.flush(created);
  });

  it('patches only the status', () => {
    service.updateStatus('1041', 'ready').subscribe();

    const request = http.expectOne('http://localhost:3000/orders/1041');
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual({ status: 'ready' });
    request.flush({ ...order, status: 'ready' });
  });
});
