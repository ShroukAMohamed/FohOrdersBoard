import { Component, input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

import { OrderType } from '../../../../models/order.model';
import { NewOrderForm } from '../../forms/new-order.form';

@Component({
  selector: 'app-order-type-section',
  imports: [ReactiveFormsModule],
  templateUrl: './order-type-section.component.html',
})
export class OrderTypeSectionComponent {
  readonly form = input.required<FormGroup<NewOrderForm>>();

  protected readonly types: { id: OrderType; label: string; icon: string }[] = [
    { id: 'dine-in', label: 'Dine-in', icon: 'restaurant' },
    { id: 'takeaway', label: 'Takeaway', icon: 'shopping_bag' },
    { id: 'delivery', label: 'Delivery', icon: 'moped' },
  ];

  protected selectType(type: OrderType): void {
    this.form().controls.type.setValue(type);
    this.form().controls.type.markAsTouched();
  }

  protected typeClass(type: OrderType): string {
    const selected = this.form().controls.type.value === type;
    const tone = selected
      ? 'bg-primary text-on-primary shadow-sm'
      : 'font-medium text-on-surface-variant hover:bg-surface-container-high';
    return `flex min-h-11 flex-col items-center justify-center gap-0.5 rounded-[0.25rem] px-1 py-1 text-xs font-semibold transition sm:flex-row sm:gap-1.5 sm:px-2 sm:py-2 sm:text-sm ${tone}`;
  }

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
