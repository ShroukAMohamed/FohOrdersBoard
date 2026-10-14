import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { OrderColumnModel } from '../../stores/orders-board.store';
import { OrderCardComponent } from '../order-card/order-card.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-order-column',
  imports: [OrderCardComponent],
  templateUrl: './order-column.component.html',
})
export class OrderColumnComponent {
  readonly column = input.required<OrderColumnModel>();
  readonly advance = output<string>();

  protected dotClass(): string {
    const tone = {
      new: 'bg-primary-container',
      preparing: 'bg-tertiary',
      ready: 'bg-secondary',
      served: 'bg-outline',
    }[this.column().status];

    return `size-2.5 rounded-full ${tone}`;
  }

  protected countClass(): string {
    const statusTone = {
      new: 'bg-primary-container text-on-primary-container',
      preparing: 'bg-tertiary-fixed text-on-tertiary-fixed',
      ready: 'bg-secondary-container text-on-secondary-container',
      served: 'bg-surface-container-highest text-on-surface-variant',
    }[this.column().status];
    const tone = this.column().count === 0 ? 'bg-surface-variant text-on-surface-variant' : statusTone;

    return `rounded-xs px-2 py-0.5 font-mono text-xs font-bold tabular-nums ${tone}`;
  }

  protected emptyIcon(): string {
    return {
      new: 'inbox',
      preparing: 'skillet',
      ready: 'notifications_active',
      served: 'done_all',
    }[this.column().status];
  }
}
