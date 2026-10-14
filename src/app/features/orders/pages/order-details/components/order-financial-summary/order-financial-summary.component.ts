import { Component, input } from '@angular/core';

import { OrderDetailsTotals } from '../../stores/order-details.store';

@Component({
  selector: 'app-order-financial-summary',
  host: { class: 'contents' },
  templateUrl: './order-financial-summary.component.html',
})
export class OrderFinancialSummaryComponent {
  readonly totals = input.required<OrderDetailsTotals | null>();
}
