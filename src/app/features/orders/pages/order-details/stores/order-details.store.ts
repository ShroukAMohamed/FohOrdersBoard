import { HttpErrorResponse } from '@angular/common/http';
import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { catchError, distinctUntilChanged, EMPTY, interval, map, of, startWith, Subject, switchMap } from 'rxjs';

import { MenuApiService } from '../../../data-access/menu-api.service';
import { OrdersApiService } from '../../../data-access/orders-api.service';
import { MenuItem } from '../../../models/menu-item.model';
import { Order, OrderStatus, OrderType } from '../../../models/order.model';
import { calculateOrderTotals, PricedOrderLine, priceOrderLines } from '../../../utils/order-calculations';
import { formatElapsed } from '../../../utils/elapsed-time';
import { orderItemCount } from '../../../utils/order-board';
import { isLateOrder, nextOrderStatus } from '../../../utils/order-status';

const STATUS_LABEL: Record<OrderStatus, string> = {
  new: 'New',
  preparing: 'Preparing',
  ready: 'Ready',
  served: 'Served',
};

const ACTION_LABEL: Record<OrderStatus, string | null> = {
  new: 'Start Preparing',
  preparing: 'Mark Ready',
  ready: 'Mark Served',
  served: null,
};

const TYPE_LABEL: Record<OrderType, string> = {
  'dine-in': 'Dine-in',
  takeaway: 'Takeaway',
  delivery: 'Delivery',
};

export interface OrderDetailsLine {
  name: string;
  qty: number;
  note: string | null;
  unitPriceLabel: string;
  lineTotalLabel: string;
}

export interface OrderDetailsTotals {
  subtotal: string;
  serviceCharge: string;
  vat: string;
  grandTotal: string;
  serviceCaption: string;
  vatCaption: string;
}

export interface OrderDetailsView {
  id: string;
  number: number;
  status: OrderStatus;
  statusLabel: string;
  typeLabel: string;
  typeIcon: string;
  tableLabel: string | null;
  createdLabel: string;
  elapsedLabel: string;
  late: boolean;
  lines: OrderDetailsLine[];
  lineCount: number;
  itemCount: number;
  totals: OrderDetailsTotals | null;
  actionLabel: string | null;
}

@Injectable()
export class OrderDetailsStore {
  private readonly ordersApi = inject(OrdersApiService);
  private readonly menuApi = inject(MenuApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly reload = new Subject<void>();

  private readonly order = signal<Order | null>(null);
  private readonly menu = signal<MenuItem[]>([]);
  private readonly nowMs = signal(Date.now());

  readonly loading = signal(true);
  readonly notFound = signal(false);
  readonly requestedId = signal('');
  readonly loadError = signal<string | null>(null);
  readonly actionError = signal<string | null>(null);
  readonly advancing = signal(false);

  readonly detail = computed(() => this.toView(this.order(), this.menu(), this.nowMs()));

  constructor() {
    this.route.paramMap
      .pipe(
        map((params) => params.get('id') ?? ''),
        distinctUntilChanged(),
        switchMap((id) => this.reload.pipe(startWith(undefined), switchMap(() => this.fetch(id)))),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();

    interval(1000)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.nowMs.set(Date.now()));
  }

  retry(): void {
    this.reload.next();
  }

  advance(): void {
    const current = this.order();
    if (!current || this.advancing()) {
      return;
    }

    const nextStatus = nextOrderStatus(current.status);
    if (!nextStatus) {
      return;
    }

    const previousStatus = current.status;
    this.advancing.set(true);
    this.actionError.set(null);
    this.order.set({ ...current, status: nextStatus });

    this.ordersApi
      .updateStatus(current.id, nextStatus)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (saved) => {
          this.advancing.set(false);
          this.order.set(saved);
        },
        error: () => {
          this.advancing.set(false);
          const latest = this.order();
          if (latest?.id === current.id) {
            this.order.set({ ...latest, status: previousStatus });
          }
          this.actionError.set(`Could not move order ${current.number} to ${STATUS_LABEL[nextStatus]}.`);
        },
      });
  }

  private fetch(id: string) {
    this.requestedId.set(id);
    this.loading.set(true);
    this.notFound.set(false);
    this.loadError.set(null);
    this.actionError.set(null);
    this.advancing.set(false);
    this.order.set(null);

    if (id.length === 0) {
      this.loading.set(false);
      this.notFound.set(true);
      return of(undefined);
    }

    return this.ordersApi.getOrder(id).pipe(
      switchMap((order) => this.menuApi.getMenu().pipe(map((menu) => ({ order, menu })))),
      map(({ order, menu }) => {
        this.order.set(order);
        this.menu.set(menu);
        this.loading.set(false);
        return undefined;
      }),
      catchError((error: unknown) => {
        this.loading.set(false);
        this.order.set(null);
        if (error instanceof HttpErrorResponse && error.status === 404) {
          this.notFound.set(true);
          return EMPTY;
        }
        this.loadError.set('Unable to connect to the orders service. Check that the API is running, then retry.');
        return EMPTY;
      }),
    );
  }

  private toView(order: Order | null, menu: readonly MenuItem[], nowMs: number): OrderDetailsView | null {
    if (!order) {
      return null;
    }

    const priced = priceOrderLines(order.items, menu);
    const totalsInput = completePrices(priced);
    const totals = totalsInput ? calculateOrderTotals(order.type, totalsInput) : null;
    const elapsedLabel = formatElapsed(order.createdAt, nowMs);

    return {
      id: order.id,
      number: order.number,
      status: order.status,
      statusLabel: STATUS_LABEL[order.status],
      typeLabel: TYPE_LABEL[order.type],
      typeIcon: typeIcon(order.type),
      tableLabel: order.table === null ? null : `Table ${order.table}`,
      createdLabel: formatCreatedAt(order.createdAt),
      elapsedLabel,
      late: isLateOrder(order.status, order.createdAt, nowMs),
      lines: priced.map((line) => ({
        name: line.name ?? 'Unknown item',
        qty: line.qty,
        note: line.note.trim().length > 0 ? line.note : null,
        unitPriceLabel: line.unitPrice === null ? 'Price unavailable' : formatEgp(line.unitPrice),
        lineTotalLabel: line.lineTotal === null ? 'Price unavailable' : formatEgp(line.lineTotal),
      })),
      lineCount: priced.length,
      itemCount: orderItemCount(order.items),
      totals: totals ? formatTotals(order.type, totals) : null,
      actionLabel: ACTION_LABEL[order.status],
    };
  }
}

function completePrices(lines: readonly PricedOrderLine[]): { unitPrice: number; qty: number }[] | null {
  const priced: { unitPrice: number; qty: number }[] = [];
  for (const line of lines) {
    if (line.unitPrice === null) {
      return null;
    }
    priced.push({ unitPrice: line.unitPrice, qty: line.qty });
  }
  return priced;
}

function formatTotals(type: OrderType, totals: ReturnType<typeof calculateOrderTotals>): OrderDetailsTotals {
  const vatBase = totals.subtotal + totals.serviceCharge;
  return {
    subtotal: formatEgp(totals.subtotal),
    serviceCharge: formatEgp(totals.serviceCharge),
    vat: formatEgp(totals.vat),
    grandTotal: formatEgp(totals.grandTotal),
    serviceCaption: type === 'dine-in' ? '12% Dine-in service rate' : 'No service charge for this order type',
    vatCaption: `14% VAT on ${formatEgp(vatBase)} (Subtotal + Service)`,
  };
}

function formatEgp(amount: number): string {
  return `EGP ${amount.toFixed(2)}`;
}

function formatCreatedAt(createdAt: string): string {
  const createdMs = Date.parse(createdAt);
  if (Number.isNaN(createdMs)) {
    return 'Unknown time';
  }

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
    timeZone: 'UTC',
  }).format(createdMs);
}

function typeIcon(type: OrderType): string {
  if (type === 'dine-in') {
    return 'restaurant';
  }
  if (type === 'takeaway') {
    return 'takeout_dining';
  }
  return 'delivery_dining';
}
