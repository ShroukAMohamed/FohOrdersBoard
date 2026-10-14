import { Component, input, output } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { ButtonDirective } from 'primeng/button';

import { MenuItem } from '../../../../models/menu-item.model';
import { NewOrderItemForm } from '../../forms/new-order.form';
import { OrderItemRowComponent } from '../order-item-row/order-item-row.component';

@Component({
  selector: 'app-order-items-form',
  imports: [ButtonDirective, OrderItemRowComponent],
  templateUrl: './order-items-form.component.html',
})
export class OrderItemsFormComponent {
  readonly items = input.required<FormArray<FormGroup<NewOrderItemForm>>>();
  readonly menu = input.required<readonly MenuItem[]>();
  readonly add = output<void>();
  readonly remove = output<number>();
}
