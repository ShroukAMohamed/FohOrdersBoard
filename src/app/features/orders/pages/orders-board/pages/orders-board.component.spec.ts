import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { BoardTypeFilter, OrderColumnModel, OrdersBoardStore } from '../stores/orders-board.store';
import { OrdersBoardComponent } from './orders-board.component';

describe('OrdersBoardComponent', () => {
  const loading = signal(false);
  const loadError = signal<string | null>(null);
  const hasAnyOrders = signal(true);
  const visibleCount = signal(2);
  const appliedSearch = signal('');
  const typeFilter = signal<BoardTypeFilter>('all');
  const searchDraft = signal('');
  const columns = signal<OrderColumnModel[]>([]);
  const load = vi.fn();
  const clearSearch = vi.fn();
  const setType = vi.fn();
  const setSearchDraft = vi.fn();
  const advance = vi.fn();

  const store = {
    loading,
    loadError,
    hasAnyOrders,
    visibleCount,
    appliedSearch,
    typeFilter,
    searchDraft,
    columns,
    load,
    clearSearch,
    setType,
    setSearchDraft,
    advance,
  };

  function create() {
    const fixture = TestBed.createComponent(OrdersBoardComponent);
    fixture.detectChanges();
    return fixture;
  }

  beforeEach(() => {
    loading.set(false);
    loadError.set(null);
    hasAnyOrders.set(true);
    visibleCount.set(2);
    appliedSearch.set('');
    typeFilter.set('all');
    searchDraft.set('');
    columns.set([]);
    load.mockClear();
    clearSearch.mockClear();
    setType.mockClear();
    setSearchDraft.mockClear();
    advance.mockClear();

    TestBed.configureTestingModule({
      imports: [OrdersBoardComponent],
      providers: [provideRouter([])],
    }).overrideComponent(OrdersBoardComponent, {
      set: {
        providers: [{ provide: OrdersBoardStore, useValue: store }],
      },
    });
  });

  it('shows the current error message and retries through the store once', () => {
    loadError.set('Unable to reach the kitchen API.');
    const fixture = create();
    const root = fixture.nativeElement as HTMLElement;

    expect(root.textContent).toContain('Connection Interrupted');
    expect(root.textContent).toContain('Unable to reach the kitchen API.');
    expect(root.querySelector('[role="alert"]')).not.toBeNull();

    const retry = root.querySelector('app-feedback-state button') as HTMLButtonElement;
    expect(retry.textContent).toContain('Retry Connection');
    retry.click();
    expect(load).toHaveBeenCalledTimes(1);
  });

  it('keeps the filtered empty message and only the relevant actions', () => {
    hasAnyOrders.set(true);
    visibleCount.set(0);
    appliedSearch.set('1045');
    typeFilter.set('all');
    const searchOnly = create();
    const feedback = searchOnly.nativeElement.querySelector('app-feedback-state') as HTMLElement;

    expect(feedback.textContent).toContain("No orders found matching '1045'.");
    expect(feedback.textContent).toContain('Clear search query');
    expect(feedback.textContent).not.toContain('Show all types');

    (feedback.querySelector('button') as HTMLButtonElement).click();
    expect(clearSearch).toHaveBeenCalledTimes(1);
  });

  it('shows Show all types only when a type filter is active', () => {
    hasAnyOrders.set(true);
    visibleCount.set(0);
    appliedSearch.set('');
    typeFilter.set('delivery');
    const fixture = create();
    const feedback = fixture.nativeElement.querySelector('app-feedback-state') as HTMLElement;

    expect(feedback.textContent).toContain("No orders found matching 'delivery'.");
    expect(feedback.textContent).toContain('Show all types');
    expect(feedback.textContent).not.toContain('Clear search query');

    (feedback.querySelector('button') as HTMLButtonElement).click();
    expect(setType).toHaveBeenCalledTimes(1);
    expect(setType).toHaveBeenCalledWith('all');
  });

  it('shows both empty actions when search and type filters are active', () => {
    hasAnyOrders.set(true);
    visibleCount.set(0);
    appliedSearch.set('104');
    typeFilter.set('dine-in');
    const fixture = create();
    const buttons = [...fixture.nativeElement.querySelectorAll('app-feedback-state button')] as HTMLButtonElement[];

    expect(buttons).toHaveLength(2);
    expect(buttons[0].textContent).toContain('Clear search query');
    expect(buttons[1].textContent).toContain('Show all types');

    buttons[0].click();
    buttons[1].click();
    expect(clearSearch).toHaveBeenCalledTimes(1);
    expect(setType).toHaveBeenCalledWith('all');
  });

  it('shows empty columns when there are no orders at all', () => {
    hasAnyOrders.set(false);
    visibleCount.set(0);
    columns.set([
      {
        status: 'new',
        title: 'New',
        count: 0,
        emptyTitle: 'No new orders',
        emptyBody: 'Waiting for incoming tickets',
        orders: [],
      },
    ]);
    const emptyBoard = create();

    expect(emptyBoard.nativeElement.querySelector('app-feedback-state')).toBeNull();
    expect(emptyBoard.nativeElement.querySelector('app-order-column')).not.toBeNull();
    expect(emptyBoard.nativeElement.textContent).not.toContain('All Caught Up');
    emptyBoard.destroy();

    loading.set(true);
    loadError.set(null);
    hasAnyOrders.set(true);
    const loadingBoard = create();
    expect(loadingBoard.nativeElement.querySelector('[aria-label="Loading orders"]')).not.toBeNull();
    expect(loadingBoard.nativeElement.querySelector('app-feedback-state')).toBeNull();
  });
});
