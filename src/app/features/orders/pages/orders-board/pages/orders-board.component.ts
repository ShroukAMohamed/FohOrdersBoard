import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ButtonDirective } from 'primeng/button';

import {
  FeedbackAction,
  FeedbackStateComponent,
} from '../../../../../shared/components/feedback-state/feedback-state.component';
import { BoardColumnSkeletonComponent } from '../../../../../shared/components/loading-state/board-column-skeleton/board-column-skeleton.component';
import { OrderColumnComponent } from '../components/order-column/order-column.component';
import { BoardTypeFilter, OrdersBoardStore } from '../stores/orders-board.store';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-orders-board',
  imports: [ButtonDirective, FeedbackStateComponent, OrderColumnComponent, BoardColumnSkeletonComponent],
  providers: [OrdersBoardStore],
  templateUrl: './orders-board.component.html',
})
export class OrdersBoardComponent {
  protected readonly store: OrdersBoardStore = inject(OrdersBoardStore);
  protected readonly skeletonColumns = [0, 1, 2, 3];
  protected readonly typeFilters: { id: BoardTypeFilter; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'dine-in', label: 'Dine-in' },
    { id: 'takeaway', label: 'Takeaway' },
    { id: 'delivery', label: 'Delivery' },
  ];
  protected readonly errorActions: readonly FeedbackAction[] = [
    { id: 'retry', label: 'Retry Connection', icon: 'refresh', tone: 'danger' },
  ];
  protected readonly emptyActions = computed((): FeedbackAction[] => {
    const actions: FeedbackAction[] = [];
    if (this.store.appliedSearch()) {
      actions.push({ id: 'clear-search', label: 'Clear search query', tone: 'neutral' });
    }
    if (this.store.typeFilter() !== 'all') {
      actions.push({ id: 'show-all', label: 'Show all types', tone: 'neutral' });
    }
    return actions;
  });

  protected onSearch(event: Event): void {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) {
      return;
    }
    this.store.setSearchDraft(target.value);
  }

  protected onFeedbackAction(actionId: string): void {
    switch (actionId) {
      case 'retry':
        this.store.load();
        break;
      case 'clear-search':
        this.store.clearSearch();
        break;
      case 'show-all':
        this.store.setType('all');
        break;
    }
  }
}
