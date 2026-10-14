import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { switchMap } from 'rxjs';

import { MenuApiService } from '../../../data-access/menu-api.service';
import { OrdersApiService } from '../../../data-access/orders-api.service';
import { MenuItem } from '../../../models/menu-item.model';
import { NewOrderFinancialSummaryComponent } from '../components/new-order-financial-summary/new-order-financial-summary.component';
import { OrderItemsFormComponent } from '../components/order-items-form/order-items-form.component';
import { OrderTypeSectionComponent } from '../components/order-type-section/order-type-section.component';
import { applyOrderType, createItemGroup, createNewOrderForm, summarizeOrder, toCreateOrderRequest } from '../forms/new-order.form';

@Component({
  selector: 'app-new-order',
  imports: [RouterLink, ReactiveFormsModule, OrderTypeSectionComponent, OrderItemsFormComponent, NewOrderFinancialSummaryComponent],
  templateUrl: './new-order.component.html',
})
export class NewOrderComponent {
  private readonly menuApi = inject(MenuApiService);
  private readonly ordersApi = inject(OrdersApiService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly form = createNewOrderForm();
  protected readonly menu = signal<MenuItem[]>([]);
  protected readonly menuLoading = signal(true);
  protected readonly menuError = signal<string | null>(null);
  protected readonly submitting = signal(false);
  protected readonly submitError = signal<string | null>(null);
  protected readonly showValidation = signal(false);
  private readonly snapshot = signal(this.form.getRawValue());

  protected readonly totals = computed(() => summarizeOrder(this.snapshot().type, this.snapshot().items, this.menu()));

  constructor() {
    this.form.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => {
      this.snapshot.set(this.form.getRawValue());
    });
    this.form.controls.type.valueChanges.pipe(takeUntilDestroyed()).subscribe((type) => {
      applyOrderType(this.form, type);
    });
    this.loadMenu();
  }

  protected loadMenu(): void {
    this.menuLoading.set(true);
    this.menuError.set(null);
    this.menuApi
      .getMenu()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (menu) => {
          this.menu.set(menu);
          this.menuLoading.set(false);
        },
        error: () => {
          this.menu.set([]);
          this.menuLoading.set(false);
          this.menuError.set('Unable to load the menu. Check that the API is running, then retry.');
        },
      });
  }

  protected addItem(): void {
    this.form.controls.items.push(createItemGroup());
  }

  protected removeItem(index: number): void {
    this.form.controls.items.removeAt(index);
    this.form.controls.items.markAsTouched();
  }

  protected dismissValidation(): void {
    this.showValidation.set(false);
  }

  protected submit(): void {
    this.submitError.set(null);
    if (this.submitting() || this.menuLoading() || this.menu().length === 0) {
      return;
    }
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.showValidation.set(true);
      return;
    }

    this.submitting.set(true);
    this.showValidation.set(false);
    const createdAt = new Date();
    this.ordersApi
      .getOrders()
      .pipe(
        switchMap((orders) => this.ordersApi.createOrder(toCreateOrderRequest(this.form, orders, createdAt))),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (saved) => {
          void this.router.navigate(['/orders', saved.id]);
        },
        error: () => {
          this.submitting.set(false);
          this.submitError.set('Could not create the order. Check that the API is running, then try again.');
        },
      });
  }
}
