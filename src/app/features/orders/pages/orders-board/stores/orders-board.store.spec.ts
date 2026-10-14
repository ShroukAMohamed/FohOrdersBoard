import { Component, inject } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { convertToParamMap, Router, ActivatedRoute } from '@angular/router';
import { BehaviorSubject, of, Subject, throwError } from 'rxjs';
import { vi } from 'vitest';

import { MenuApiService } from '../../../data-access/menu-api.service';
import { OrdersApiService } from '../../../data-access/orders-api.service';
import { Order } from '../../../models/order.model';
import { OrdersBoardStore } from './orders-board.store';

const preparing: Order = {
  id: '1041',
  number: 1041,
  type: 'dine-in',
  table: 7,
  phone: null,
  status: 'preparing',
  createdAt: '2026-09-27T09:22:00.000Z',
  items: [{ menuId: 'm2', qty: 2, note: '' }],
};

const readyOrder: Order = {
  ...preparing,
  id: '1042',
  number: 1042,
  status: 'ready',
  table: 2,
};

@Component({
  template: '',
  providers: [OrdersBoardStore],
})
class BoardHost {
  readonly store = inject(OrdersBoardStore);
}

describe('OrdersBoardStore', () => {
  const params = new BehaviorSubject(convertToParamMap({}));
  const route = {
    queryParamMap: params.asObservable(),
    snapshot: { queryParamMap: convertToParamMap({}) },
  };
  const navigate = vi.fn((_: unknown[], extras: { queryParams?: Record<string, string | null> }) => {
    const current = route.snapshot.queryParamMap;
    const next: Record<string, string> = {};
    for (const key of current.keys) {
      const value = current.get(key);
      if (value !== null) {
        next[key] = value;
      }
    }
    for (const [key, value] of Object.entries(extras.queryParams ?? {})) {
      if (value === null) {
        delete next[key];
      } else {
        next[key] = value;
      }
    }
    const map = convertToParamMap(next);
    route.snapshot.queryParamMap = map;
    params.next(map);
    return Promise.resolve(true);
  });

  const getOrders = vi.fn<() => ReturnType<OrdersApiService['getOrders']>>();
  const updateStatus = vi.fn<() => ReturnType<OrdersApiService['updateStatus']>>();
  const getMenu = vi.fn<() => ReturnType<MenuApiService['getMenu']>>(() => of([]));

  let fixture: ComponentFixture<BoardHost>;

  function emitUrl(query: Record<string, string>): void {
    const map = convertToParamMap(query);
    route.snapshot.queryParamMap = map;
    params.next(map);
  }

  function createStore(): OrdersBoardStore {
    fixture = TestBed.createComponent(BoardHost);
    return fixture.componentInstance.store;
  }

  beforeEach(() => {
    navigate.mockClear();
    getOrders.mockReset();
    updateStatus.mockReset();
    getMenu.mockClear();
    getOrders.mockReturnValue(of([preparing, readyOrder]));
    updateStatus.mockReturnValue(of({ ...preparing, status: 'ready' }));
    emitUrl({});

    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: { navigate } },
        { provide: ActivatedRoute, useValue: route },
        {
          provide: OrdersApiService,
          useValue: { getOrders, updateStatus, getOrder: vi.fn(), createOrder: vi.fn() },
        },
        { provide: MenuApiService, useValue: { getMenu } },
      ],
    });
  });

  afterEach(() => {
    fixture?.destroy();
  });

  function statusOf(store: OrdersBoardStore, id: string): string | undefined {
    return store.columns().flatMap((column) => column.orders).find((order) => order.id === id)?.status;
  }

  it('restores search and type from the URL, and Back clears both', () => {
    emitUrl({ q: '104', type: 'dine-in' });
    const store = createStore();

    expect(store.searchDraft()).toBe('104');
    expect(store.appliedSearch()).toBe('104');
    expect(store.typeFilter()).toBe('dine-in');

    emitUrl({});
    expect(store.searchDraft()).toBe('');
    expect(store.appliedSearch()).toBe('');
    expect(store.typeFilter()).toBe('all');
  });

  it('updates type immediately and preserves q', () => {
    emitUrl({ q: '104' });
    const store = createStore();
    store.setType('takeaway');

    expect(navigate).toHaveBeenCalledWith([], {
      relativeTo: route,
      queryParams: { type: 'takeaway' },
      queryParamsHandling: 'merge',
    });
    expect(store.typeFilter()).toBe('takeaway');
    expect(store.appliedSearch()).toBe('104');
  });

  it('removes q when search is cleared and does not write type=all', () => {
    emitUrl({ q: '104', type: 'dine-in' });
    const store = createStore();
    store.clearSearch();
    store.setType('all');

    expect(navigate).toHaveBeenCalledWith([], {
      relativeTo: route,
      queryParams: { q: null },
      queryParamsHandling: 'merge',
    });
    expect(navigate).toHaveBeenCalledWith([], {
      relativeTo: route,
      queryParams: { type: null },
      queryParamsHandling: 'merge',
    });
    expect(store.appliedSearch()).toBe('');
    expect(store.typeFilter()).toBe('all');
  });

  it('treats an unknown type as All without rewriting the URL', () => {
    emitUrl({ type: 'catering' });
    const store = createStore();

    expect(store.typeFilter()).toBe('all');
    expect(navigate).not.toHaveBeenCalled();
  });

  it('debounces search by 300ms and keeps the current type', async () => {
    vi.useFakeTimers();
    emitUrl({ type: 'delivery' });
    const store = createStore();
    store.setSearchDraft('7');

    await vi.advanceTimersByTimeAsync(299);
    expect(navigate).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(1);
    expect(navigate).toHaveBeenCalledWith([], {
      relativeTo: route,
      queryParams: { q: '7' },
      queryParamsHandling: 'merge',
    });
    expect(store.appliedSearch()).toBe('7');
    expect(store.typeFilter()).toBe('delivery');
    vi.useRealTimers();
  });

  it('does not start a second poll while one is still in flight', async () => {
    vi.useFakeTimers();
    const hanging = new Subject<Order[]>();
    getOrders.mockReturnValueOnce(of([preparing])).mockReturnValue(hanging.asObservable());
    createStore();

    await vi.advanceTimersByTimeAsync(15_000);
    await vi.advanceTimersByTimeAsync(15_000);

    expect(getOrders).toHaveBeenCalledTimes(2);
    hanging.next([preparing]);
    hanging.complete();
    await vi.advanceTimersByTimeAsync(15_000);
    expect(getOrders).toHaveBeenCalledTimes(3);
    vi.useRealTimers();
  });

  it('loads the board and clears the initial loading state', () => {
    const store = createStore();

    expect(store.loading()).toBe(false);
    expect(store.loadError()).toBeNull();
    expect(store.refreshWarning()).toBeNull();
    expect(statusOf(store, preparing.id)).toBe('preparing');
    expect(statusOf(store, readyOrder.id)).toBe('ready');
    expect(getMenu).toHaveBeenCalledTimes(1);
  });

  it('keeps an in-flight status when a poll returns the old status', async () => {
    vi.useFakeTimers();
    const poll = new Subject<Order[]>();
    const patch = new Subject<Order>();
    getOrders.mockReturnValueOnce(of([preparing])).mockReturnValue(poll.asObservable());
    updateStatus.mockReturnValue(patch.asObservable());
    const store = createStore();

    await vi.advanceTimersByTimeAsync(15_000);
    store.advance(preparing.id);
    expect(statusOf(store, preparing.id)).toBe('ready');

    poll.next([{ ...preparing, status: 'preparing' }]);
    poll.complete();
    expect(statusOf(store, preparing.id)).toBe('ready');
    expect(updateStatus).toHaveBeenCalledTimes(1);

    store.advance(preparing.id);
    expect(updateStatus).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });

  it('does not let a stale poll move a confirmed status backwards', async () => {
    vi.useFakeTimers();
    const poll = new Subject<Order[]>();
    getOrders.mockReturnValueOnce(of([preparing])).mockReturnValue(poll.asObservable());
    updateStatus.mockReturnValue(of({ ...preparing, status: 'ready' }));
    const store = createStore();

    store.advance(preparing.id);
    expect(statusOf(store, preparing.id)).toBe('ready');

    await vi.advanceTimersByTimeAsync(15_000);
    poll.next([{ ...preparing, status: 'preparing' }]);
    expect(statusOf(store, preparing.id)).toBe('ready');

    poll.next([{ ...preparing, status: 'ready' }]);
    expect(statusOf(store, preparing.id)).toBe('ready');

    poll.next([{ ...preparing, status: 'served' }]);
    expect(statusOf(store, preparing.id)).toBe('served');
    vi.useRealTimers();
  });

  it('rolls back only the failed order', () => {
    updateStatus.mockReturnValue(throwError(() => new Error('down')));
    const store = createStore();
    store.advance(preparing.id);

    expect(statusOf(store, preparing.id)).toBe('preparing');
    expect(statusOf(store, readyOrder.id)).toBe('ready');
    expect(store.actionError()).toBe('Could not move order 1041 to Ready.');
  });

  it('ignores a status response after the page is destroyed', () => {
    const patch = new Subject<Order>();
    updateStatus.mockReturnValue(patch.asObservable());
    const store = createStore();
    store.advance(preparing.id);
    fixture.destroy();

    patch.next({ ...preparing, status: 'served' });
    patch.complete();
    expect(statusOf(store, preparing.id)).toBe('ready');
  });

  it('ignores a poll response after the page is destroyed', async () => {
    vi.useFakeTimers();
    const poll = new Subject<Order[]>();
    getOrders.mockReturnValueOnce(of([preparing])).mockReturnValue(poll.asObservable());
    const store = createStore();
    await vi.advanceTimersByTimeAsync(15_000);
    fixture.destroy();

    poll.next([{ ...preparing, status: 'served' }]);
    poll.complete();
    expect(statusOf(store, preparing.id)).toBe('preparing');
    vi.useRealTimers();
  });

  it('shows a full-page error without polling, and Retry starts one loop', async () => {
    vi.useFakeTimers();
    getOrders
      .mockReturnValueOnce(throwError(() => new Error('down')))
      .mockReturnValue(of([preparing]));
    const store = createStore();

    expect(store.loading()).toBe(false);
    expect(store.loadError()).toContain('Unable to connect');
    await vi.advanceTimersByTimeAsync(15_000);
    expect(getOrders).toHaveBeenCalledTimes(1);

    store.load();
    expect(store.loadError()).toBeNull();
    expect(store.loading()).toBe(false);
    await vi.advanceTimersByTimeAsync(15_000);
    expect(getOrders).toHaveBeenCalledTimes(3);
    vi.useRealTimers();
  });

  it('keeps the board and shows a warning when a refresh fails', async () => {
    vi.useFakeTimers();
    getOrders.mockReturnValueOnce(of([preparing])).mockReturnValue(throwError(() => new Error('down')));
    const store = createStore();

    await vi.advanceTimersByTimeAsync(15_000);
    expect(statusOf(store, preparing.id)).toBe('preparing');
    expect(store.refreshWarning()).toContain('Could not refresh');
    expect(store.loadError()).toBeNull();
    vi.useRealTimers();
  });
});
