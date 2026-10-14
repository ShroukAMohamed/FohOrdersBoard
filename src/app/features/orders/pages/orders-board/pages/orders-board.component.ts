import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ButtonDirective } from 'primeng/button';

import { BoardColumnSkeletonComponent } from '../../../../../shared/components/loading-state/board-column-skeleton/board-column-skeleton.component';
import { OrderColumnComponent } from '../components/order-column/order-column.component';
import { BoardTypeFilter, OrdersBoardStore } from '../stores/orders-board.store';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-orders-board',
  imports: [ButtonDirective, OrderColumnComponent, BoardColumnSkeletonComponent],
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

  protected onSearch(event: Event): void {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) {
      return;
    }
    this.store.setSearchDraft(target.value);
  }
}
