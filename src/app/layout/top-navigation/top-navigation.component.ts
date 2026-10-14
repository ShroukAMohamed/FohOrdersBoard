import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter, map } from 'rxjs';

@Component({
  selector: 'app-top-navigation',
  imports: [RouterLink],
  templateUrl: './top-navigation.component.html',
})
export class TopNavigationComponent {
  private readonly router = inject(Router);
  protected readonly menuOpen = signal(false);

  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );

  protected readonly ordersActive = computed(() => this.isOrdersBoard(this.currentUrl()));
  protected readonly newOrderActive = computed(() => this.isNewOrder(this.currentUrl()));

  protected toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  protected closeMenu(): void {
    this.menuOpen.set(false);
  }

  protected linkClass(active: boolean): string {
    const tone = active
      ? 'font-semibold text-primary after:absolute after:right-0 after:bottom-0 after:left-0 after:h-0.5 after:rounded-full after:bg-primary'
      : 'text-on-surface-variant hover:text-on-surface';
    return `relative inline-flex min-h-11 items-center gap-1.5 text-sm no-underline transition-colors ${tone}`;
  }

  protected mobileLinkClass(active: boolean): string {
    const tone = active
      ? 'border-primary bg-surface-container-low font-semibold text-primary'
      : 'border-transparent text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface';
    return `flex min-h-11 items-center gap-3 border-l-4 px-6 py-3 text-sm no-underline ${tone}`;
  }

  private isNewOrder(url: string): boolean {
    const path = url.split(/[?#]/)[0];
    return path === '/orders/new' || path.startsWith('/orders/new/');
  }

  private isOrdersBoard(url: string): boolean {
    const path = url.split(/[?#]/)[0];
    return path === '/orders' || (path.startsWith('/orders/') && !this.isNewOrder(path));
  }
}
