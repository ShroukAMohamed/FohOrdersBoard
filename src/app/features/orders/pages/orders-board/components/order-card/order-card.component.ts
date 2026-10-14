import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';

import { OrderCardModel } from '../../stores/orders-board.store';

@Component({
  selector: 'app-order-card',
  imports: [RouterLink],
  templateUrl: './order-card.component.html',
})
export class OrderCardComponent {
  readonly card = input.required<OrderCardModel>();
  readonly advance = output<string>();

  protected articleClass(): string {
    const card = this.card();
    if (card.lateLabel) {
      return 'group flex flex-col justify-between gap-3 rounded-[0.125rem] border border-error/30 bg-gradient-to-r from-error/5 to-white p-3 shadow-md';
    }
    if (card.status === 'served') {
      return 'group flex flex-col justify-between gap-3 rounded-[0.125rem] border border-outline-variant/30 bg-surface-container-lowest/80 p-3 opacity-90 shadow-sm transition hover:bg-surface-container-lowest hover:opacity-100';
    }
    return 'group flex flex-col justify-between gap-3 rounded-[0.125rem] border border-outline-variant/30 bg-surface-container-lowest p-3 shadow-sm transition hover:shadow-md';
  }

  protected numberClass(): string {
    const tone = {
      new: 'text-on-surface group-hover:text-primary',
      preparing: 'text-on-surface group-hover:text-primary',
      ready: 'text-on-surface group-hover:text-secondary',
      served: 'text-on-surface-variant group-hover:text-on-surface',
    }[this.card().status];

    return `font-mono text-lg leading-6 font-bold transition-colors ${tone}`;
  }

  protected placeClass(): string {
    const label = this.card().placeLabel;
    const fill = label === 'Takeaway' || label === 'Delivery' ? 'bg-surface-variant' : 'bg-surface-container';
    return `rounded-[0.125rem] px-2 py-0.5 text-[11px] leading-[14px] font-bold tracking-[0.05em] text-on-surface-variant uppercase ${fill}`;
  }

  protected actionClass(): string {
    const tone = {
      new: 'bg-primary text-on-primary hover:bg-primary-container',
      preparing: 'bg-tertiary text-on-tertiary hover:bg-tertiary-container',
      ready: 'bg-secondary text-on-secondary hover:bg-on-secondary-container',
      served: 'bg-surface-container text-on-surface-variant',
    }[this.card().status];

    return `flex h-10 w-full items-center justify-center gap-1.5 rounded-[0.125rem] text-sm font-semibold transition active:scale-[0.98] disabled:opacity-60 ${tone}`;
  }

  protected actionIcon(): string {
    return this.card().status === 'new' ? 'arrow_forward' : 'done';
  }

  protected onAdvance(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.advance.emit(this.card().id);
  }
}
