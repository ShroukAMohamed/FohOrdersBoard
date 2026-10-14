import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { OrderColumnComponent } from '../components/order-column/order-column.component';
import { BoardTypeFilter, OrdersBoardStore } from '../stores/orders-board.store';

@Component({
  selector: 'app-orders-board',
  imports: [OrderColumnComponent, RouterLink],
  providers: [OrdersBoardStore],
  templateUrl: './orders-board.component.html',
})
export class OrdersBoardComponent {
  protected readonly store = inject(OrdersBoardStore);
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
