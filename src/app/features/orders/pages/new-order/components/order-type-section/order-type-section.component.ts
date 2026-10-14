import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { SelectButton } from 'primeng/selectbutton';

import { OrderType } from '../../../../models/order.model';
import { NewOrderForm } from '../../forms/new-order.form';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-order-type-section',
  imports: [ReactiveFormsModule, SelectButton],
  templateUrl: './order-type-section.component.html',
})
export class OrderTypeSectionComponent {
  readonly form = input.required<FormGroup<NewOrderForm>>();

  protected readonly types: { id: OrderType; label: string; icon: string }[] = [
    { id: 'dine-in', label: 'Dine-in', icon: 'restaurant' },
    { id: 'takeaway', label: 'Takeaway', icon: 'shopping_bag' },
    { id: 'delivery', label: 'Delivery', icon: 'moped' },
  ];

  protected showTableError(): boolean {
    const table = this.form().controls.table;
    return table.invalid && table.touched;
  }

  protected showPhoneError(): boolean {
    const phone = this.form().controls.phone;
    return phone.invalid && phone.touched;
  }

  protected tableMessage(): string {
    const errors = this.form().controls.table.errors;
    if (errors?.['required']) {
      return 'Enter a table number.';
    }
    return 'Enter a whole number from 1 to 40.';
  }

  protected phoneMessage(): string {
    const errors = this.form().controls.phone.errors;
    if (errors?.['required']) {
      return 'Enter an Egyptian mobile number.';
    }
    return 'Use 01 followed by 0, 1, 2, or 5, then 8 digits.';
  }
}
