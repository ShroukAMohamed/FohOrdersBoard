import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../../../core/config/api-url';
import { CreateOrderRequest, Order, OrderStatus, UpdateOrderStatusRequest } from '../models/order.model';

@Injectable({ providedIn: 'root' })
export class OrdersApiService {
  private readonly http = inject(HttpClient);
  private readonly ordersUrl = `${API_BASE_URL}/orders`;

  getOrders(status?: OrderStatus): Observable<Order[]> {
    const params = status ? new HttpParams().set('status', status) : undefined;
    return this.http.get<Order[]>(this.ordersUrl, { params });
  }

  getOrder(id: string): Observable<Order> {
    return this.http.get<Order>(`${this.ordersUrl}/${encodeURIComponent(id)}`);
  }

  createOrder(order: CreateOrderRequest): Observable<Order> {
    return this.http.post<Order>(this.ordersUrl, order);
  }

  updateStatus(id: string, status: OrderStatus): Observable<Order> {
    const body: UpdateOrderStatusRequest = { status };
    return this.http.patch<Order>(`${this.ordersUrl}/${encodeURIComponent(id)}`, body);
  }
}
