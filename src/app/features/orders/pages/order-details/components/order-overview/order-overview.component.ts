import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ButtonDirective } from 'primeng/button';

import { OrderStatus } from '../../../../models/order.model';
import { OrderDetailsView } from '../../stores/order-details.store';

export type OrderOverviewDetail = Pick<
  OrderDetailsView,
  | 'number'
  | 'status'
  | 'statusLabel'
  | 'late'
  | 'elapsedLabel'
  | 'actionLabel'
  | 'typeIcon'
  | 'typeLabel'
  | 'tableLabel'
  | 'createdLabel'
>;

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-order-overview',
  imports: [ButtonDirective],
  host: { class: 'contents' },
  templateUrl: './order-overview.component.html',
})
export class OrderOverviewComponent {
  readonly detail = input.required<OrderOverviewDetail>();
  readonly advancing = input.required<boolean>();
  readonly advance = output<void>();

  protected statusBadge(status: OrderStatus): string {
    const tone = {
      new: 'bg-primary-container text-on-primary-container',
      preparing: 'bg-tertiary-fixed text-on-tertiary-fixed',
      ready: 'bg-secondary-container text-on-secondary-container',
      served: 'bg-surface-container-highest text-on-surface-variant',
    }[status];

    return `inline-flex items-center gap-1 rounded-[0.125rem] px-3 py-1 text-[11px] leading-[14px] font-bold tracking-[0.05em] uppercase ${tone}`;
  }

  protected statusDot(status: OrderStatus): string {
    const tone = {
      new: 'bg-on-primary-container',
      preparing: 'bg-tertiary',
      ready: 'bg-secondary',
      served: 'bg-outline',
    }[status];

    return `size-2 rounded-full ${tone}`;
  }

  protected actionClass(status: OrderStatus): string {
    const tone = {
      new: '!bg-primary !text-on-primary hover:!bg-primary-container',
      preparing: '!bg-tertiary !text-on-tertiary hover:!bg-tertiary-container',
      ready: '!bg-secondary !text-on-secondary hover:!bg-on-secondary-container',
      served: '!bg-surface-container !text-on-surface-variant',
    }[status];

    return `!inline-flex !min-h-11 !items-center !justify-center !gap-2 !rounded-sm !border-0 !px-6 !py-2 !text-lg !leading-6 !font-semibold !shadow-md transition active:!scale-95 disabled:!opacity-60 ${tone}`;
  }
}
