import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { OrderDetailsLine } from '../../stores/order-details.store';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-order-items',
  host: { class: 'contents' },
  templateUrl: './order-items.component.html',
})
export class OrderItemsComponent {
  readonly lines = input.required<readonly OrderDetailsLine[]>();
  readonly itemCount = input.required<number>();
}
