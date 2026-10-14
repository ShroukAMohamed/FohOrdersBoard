import { Component, computed, input, output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ButtonDirective } from 'primeng/button';
import { Select } from 'primeng/select';

import { MenuItem } from '../../../../models/menu-item.model';
import { NewOrderItemForm } from '../../forms/new-order.form';

@Component({
  selector: 'app-order-item-row',
  imports: [ButtonDirective, ReactiveFormsModule, Select],
  templateUrl: './order-item-row.component.html',
})
export class OrderItemRowComponent {
  readonly index = input.required<number>();
  readonly item = input.required<FormGroup<NewOrderItemForm>>();
  readonly menu = input.required<readonly MenuItem[]>();
  readonly remove = output<void>();

  protected readonly menuOptions = computed(() =>
    this.menu().map((entry) => ({
      id: entry.id,
      label: `${entry.name} — EGP ${entry.price.toFixed(2)}`,
    })),
  );

  protected menuId(): string {
    return `menu-item-${this.index()}`;
  }

  protected qtyId(): string {
    return `item-qty-${this.index()}`;
  }

  protected noteId(): string {
    return `item-note-${this.index()}`;
  }

  protected errorId(): string {
    return `item-error-${this.index()}`;
  }

  protected showMenuError(): boolean {
    const menuId = this.item().controls.menuId;
    return menuId.invalid && menuId.touched;
  }

  protected showQtyError(): boolean {
    const qty = this.item().controls.qty;
    return qty.invalid && qty.touched;
  }

  protected adjustQty(delta: number): void {
    const qty = this.item().controls.qty;
    const current = qty.value;
    const base = current !== null && Number.isInteger(current) ? current : 1;
    qty.setValue(Math.min(20, Math.max(1, base + delta)));
    qty.markAsTouched();
  }
}
