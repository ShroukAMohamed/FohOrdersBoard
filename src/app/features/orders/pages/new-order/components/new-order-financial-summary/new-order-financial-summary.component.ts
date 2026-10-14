import { Component, input } from '@angular/core';

import { NewOrderTotalsView } from '../../forms/new-order.form';

@Component({
  selector: 'app-new-order-financial-summary',
  templateUrl: './new-order-financial-summary.component.html',
})
export class NewOrderFinancialSummaryComponent {
  readonly totals = input.required<NewOrderTotalsView>();
}
