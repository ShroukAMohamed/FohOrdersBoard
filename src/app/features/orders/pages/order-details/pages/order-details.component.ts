import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { OrderFinancialSummaryComponent } from '../components/order-financial-summary/order-financial-summary.component';
import { OrderItemsComponent } from '../components/order-items/order-items.component';
import { OrderOverviewComponent } from '../components/order-overview/order-overview.component';
import { OrderDetailsStore } from '../stores/order-details.store';

@Component({
  selector: 'app-order-details',
  imports: [RouterLink, OrderOverviewComponent, OrderItemsComponent, OrderFinancialSummaryComponent],
  providers: [OrderDetailsStore],
  templateUrl: './order-details.component.html',
})
export class OrderDetailsComponent {
  protected readonly store = inject(OrderDetailsStore);
}
