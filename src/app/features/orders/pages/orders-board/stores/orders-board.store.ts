import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, debounceTime, distinctUntilChanged, exhaustMap, forkJoin, fromEvent, interval, map, of, Subject, Subscription, timer } from 'rxjs';

import { MenuItem } from '../../../models/menu-item.model';
import { ORDER_STATUSES, ORDER_TYPES, Order, OrderStatus, OrderType } from '../../../models/order.model';
import { MenuApiService } from '../../../data-access/menu-api.service';
import { OrdersApiService } from '../../../data-access/orders-api.service';
import { formatElapsed } from '../../../utils/elapsed-time';
import { orderBoardSubtotal, orderItemCount, orderMatchesSearch, orderPlaceLabel } from '../../../utils/order-board';
import { formatEgp } from '../../../utils/order-calculations';
import { ACTION_LABEL, isLateOrder, nextOrderStatus, STATUS_LABEL } from '../../../utils/order-status';
import { NotificationService } from '../../../../../shared/services/notification.service';

const POLL_INTERVAL_MS = 15_000;
const SEARCH_DEBOUNCE_MS = 300;

const EMPTY_COPY: Record<OrderStatus, { title: string; body: string }> = {
  new: { title: 'No new orders', body: 'Waiting for incoming tickets' },
  preparing: { title: 'No orders in prep', body: 'Kitchen stations are clear' },
  ready: { title: 'No orders ready', body: 'Pickup pass is empty' },
  served: { title: 'No served orders', body: 'Shift tickets will record here' },
};

export type BoardTypeFilter = OrderType | 'all';

export interface OrderCardModel {
  id: string;
  number: number;
  status: OrderStatus;
  placeLabel: string;
  itemCount: number;
  subtotalLabel: string;
  elapsedLabel: string;
  lateLabel: string | null;
  actionLabel: string | null;
  advancing: boolean;
}

export interface OrderColumnModel {
  status: OrderStatus;
  title: string;
  count: number;
  emptyTitle: string;
  emptyBody: string;
  orders: OrderCardModel[];
}

interface PendingStatusUpdate {
  previousStatus: OrderStatus;
  nextStatus: OrderStatus;
}

@Injectable()
export class OrdersBoardStore {
  private readonly ordersApi = inject(OrdersApiService);
  private readonly menuApi = inject(MenuApiService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly notifications = inject(NotificationService);

  private readonly orders = signal<Order[]>([]);
  private readonly menu = signal<MenuItem[]>([]);
  private readonly nowMs = signal(Date.now());
  /** PATCH in flight. Blocks a second click and keeps a poll from restoring the old status. */
  private readonly pending = new Map<string, PendingStatusUpdate>();
  /** PATCH already succeeded. A poll that started earlier must not move this status backwards. */
  private readonly confirmedStatus = new Map<string, OrderStatus>();
  /** Ids returned by the last successful order list. A failed PATCH for any other id drops the card. */
  private serverOrderIds = new Set<string>();
  private loadInFlight = false;
  private loadedOnce = false;
  private pollTimer: Subscription | null = null;
  private readonly searchChanges = new Subject<string>();
  /** Shared by the interval and the tab-visible refresh so those requests cannot overlap. */
  private readonly pollTicks = new Subject<void>();

  readonly loading = signal(true);
  readonly loadError = signal<string | null>(null);
  readonly refreshWarning = signal<string | null>(null);
  readonly actionError = signal<string | null>(null);
  readonly searchDraft = signal('');
  readonly appliedSearch = signal('');
  readonly typeFilter = signal<BoardTypeFilter>('all');

  readonly columns = computed(() => {
    const query = this.appliedSearch();
    const type = this.typeFilter();
    const visible = this.orders().filter(
      (order) => (type === 'all' || order.type === type) && orderMatchesSearch(order, query),
    );

    return ORDER_STATUSES.map((status) => {
      const orders = visible.filter((order) => order.status === status).map((order) => this.toCard(order));
      return {
        status,
        title: STATUS_LABEL[status],
        count: orders.length,
        emptyTitle: EMPTY_COPY[status].title,
        emptyBody: EMPTY_COPY[status].body,
        orders,
      };
    });
  });

  readonly hasAnyOrders = computed(() => this.orders().length > 0);
  readonly visibleCount = computed(() => this.columns().reduce((sum, column) => sum + column.count, 0));

  constructor() {
    this.bindUrl();
    this.bindSearch();
    this.bindClock();
    this.bindVisibility();
    this.bindPollLoop();
    this.load();
    this.destroyRef.onDestroy(() => this.stopPolling());
  }

  load(): void {
    if (this.loadInFlight) {
      return;
    }

    this.loadInFlight = true;
    this.loading.set(true);
    this.loadError.set(null);

    forkJoin({
      orders: this.ordersApi.getOrders(),
      menu: this.menuApi.getMenu(),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ orders, menu }) => {
          this.loadInFlight = false;
          this.loadedOnce = true;
          this.menu.set(menu);
          this.applyServerOrders(orders);
          this.loading.set(false);
          this.loadError.set(null);
          this.refreshWarning.set(null);
          this.startPolling();
        },
        error: () => this.failInitialLoad(),
      });
  }

  setSearchDraft(value: string): void {
    this.searchDraft.set(value);
    this.searchChanges.next(value);
  }

  setType(type: BoardTypeFilter): void {
    this.updateQuery({ type: type === 'all' ? null : type });
  }

  clearSearch(): void {
    this.setSearchDraft('');
    this.updateQuery({ q: null });
  }

  advance(orderId: string): void {
    if (this.pending.has(orderId)) {
      return;
    }

    const current = this.orders().find((order) => order.id === orderId);
    const nextStatus = current ? nextOrderStatus(current.status) : null;
    if (!current || !nextStatus) {
      return;
    }

    this.pending.set(orderId, { previousStatus: current.status, nextStatus });
    this.replaceOrder(orderId, { status: nextStatus });
    this.actionError.set(null);

    this.ordersApi
      .updateStatus(orderId, nextStatus)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (saved) => {
          this.pending.delete(orderId);
          this.confirmedStatus.set(orderId, saved.status);
          this.serverOrderIds.add(orderId);
          this.orders.update((orders) => orders.map((order) => (order.id === orderId ? saved : order)));
        },
        error: () => this.revertAdvance(orderId, current.number, nextStatus),
      });
  }

  private failInitialLoad(): void {
    this.loadInFlight = false;
    this.loading.set(false);
    this.stopPolling();
    if (this.loadedOnce) {
      return;
    }

    this.orders.set([]);
    const message = 'Unable to connect to the orders service. Check that the API is running, then retry.';
    this.loadError.set(message);
    this.notifications.error(message, 'Connection interrupted');
  }

  private revertAdvance(orderId: string, orderNumber: number, nextStatus: OrderStatus): void {
    const pendingUpdate = this.pending.get(orderId);
    this.pending.delete(orderId);
    if (!pendingUpdate) {
      return;
    }

    if (this.serverOrderIds.has(orderId)) {
      this.replaceOrder(orderId, { status: pendingUpdate.previousStatus });
    } else {
      this.orders.update((orders) => orders.filter((order) => order.id !== orderId));
    }

    const message = `Could not move order ${orderNumber} to ${STATUS_LABEL[nextStatus]}.`;
    this.actionError.set(message);
    this.notifications.error(message, 'Update failed');
  }

  private replaceOrder(orderId: string, patch: Partial<Order>): void {
    this.orders.update((orders) => orders.map((order) => (order.id === orderId ? { ...order, ...patch } : order)));
  }

  private updateQuery(queryParams: Record<string, string | null>): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge',
    });
  }

  private bindUrl(): void {
    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const type = params.get('type');
      this.typeFilter.set(isOrderType(type) ? type : 'all');

      const query = params.get('q') ?? '';
      this.appliedSearch.set(query);
      if (query !== this.searchDraft()) {
        this.setSearchDraft(query);
      }
    });
  }

  private bindSearch(): void {
    this.searchChanges
      .pipe(
        debounceTime(SEARCH_DEBOUNCE_MS),
        map((value) => value.trim()),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((query) => {
        const current = this.route.snapshot.queryParamMap.get('q') ?? '';
        if (query === current) {
          return;
        }
        this.updateQuery({ q: query.length === 0 ? null : query });
      });
  }

  private bindClock(): void {
    interval(1000)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.nowMs.set(Date.now()));
  }

  private bindVisibility(): void {
    fromEvent(document, 'visibilitychange')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        if (document.visibilityState === 'hidden') {
          this.stopPolling();
          return;
        }
        if (this.loadedOnce && this.loadError() === null) {
          this.pollTicks.next();
          this.startPolling();
        }
      });
  }

  private bindPollLoop(): void {
    this.pollTicks
      .pipe(
        exhaustMap(() =>
          this.ordersApi.getOrders().pipe(
            catchError(() => {
              const message = 'Could not refresh orders. Showing the last successful update.';
              if (this.refreshWarning() === null) {
                this.notifications.warn(message, 'Refresh failed');
              }
              this.refreshWarning.set(message);
              return of(null);
            }),
          ),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((orders) => {
        if (!orders) {
          return;
        }
        this.applyServerOrders(orders);
        this.refreshWarning.set(null);
      });
  }

  private startPolling(): void {
    this.stopPolling();
    if (document.visibilityState === 'hidden') {
      return;
    }

    this.pollTimer = timer(POLL_INTERVAL_MS, POLL_INTERVAL_MS)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.pollTicks.next());
  }

  private stopPolling(): void {
    this.pollTimer?.unsubscribe();
    this.pollTimer = null;
  }

  private applyServerOrders(serverOrders: Order[]): void {
    this.serverOrderIds = new Set(serverOrders.map((order) => order.id));
    const merged = serverOrders.map((order) => this.withLocalStatus(order));

    for (const [orderId, pendingUpdate] of this.pending) {
      if (this.serverOrderIds.has(orderId)) {
        continue;
      }
      const local = this.orders().find((order) => order.id === orderId);
      if (local) {
        merged.push({ ...local, status: pendingUpdate.nextStatus });
      }
    }

    this.orders.set(merged);
  }

  /** Prefer an in-flight or just-confirmed status over an older server status. */
  private withLocalStatus(order: Order): Order {
    const pendingUpdate = this.pending.get(order.id);
    if (pendingUpdate) {
      return { ...order, status: pendingUpdate.nextStatus };
    }

    const confirmed = this.confirmedStatus.get(order.id);
    if (!confirmed) {
      return order;
    }

    if (statusRank(order.status) >= statusRank(confirmed)) {
      this.confirmedStatus.delete(order.id);
      return order;
    }

    return { ...order, status: confirmed };
  }

  private toCard(order: Order): OrderCardModel {
    const subtotal = orderBoardSubtotal(order, this.menu());
    const elapsedLabel = formatElapsed(order.createdAt, this.nowMs());
    const late = isLateOrder(order.status, order.createdAt, this.nowMs());

    return {
      id: order.id,
      number: order.number,
      status: order.status,
      placeLabel: orderPlaceLabel(order),
      itemCount: orderItemCount(order.items),
      subtotalLabel: subtotal === null ? 'Price unavailable' : formatEgp(subtotal),
      elapsedLabel,
      lateLabel: late ? `Late (${elapsedLabel})` : null,
      actionLabel: ACTION_LABEL[order.status],
      advancing: this.pending.has(order.id),
    };
  }
}

function statusRank(status: OrderStatus): number {
  return ORDER_STATUSES.indexOf(status);
}

function isOrderType(value: string | null): value is OrderType {
  return ORDER_TYPES.some((type) => type === value);
}
