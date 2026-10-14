import { provideRouter, Router } from '@angular/router';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { TopNavigationComponent } from './top-navigation.component';

@Component({ template: '' })
class BlankPage {}

describe('TopNavigationComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideRouter([
          {
            path: 'orders',
            children: [
              { path: '', component: BlankPage },
              { path: 'new', component: BlankPage },
              { path: ':id', component: BlankPage },
            ],
          },
        ]),
      ],
    }).compileComponents();
  });

  async function open(url: string): Promise<HTMLElement> {
    const router = TestBed.inject(Router);
    await router.navigateByUrl(url);
    const fixture = TestBed.createComponent(TopNavigationComponent);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('shows Orders Board and New Order, with Orders Board current on the board and a ticket', async () => {
    const board = await open('/orders');
    expect(board.textContent).toContain('Orders Board');
    expect(board.textContent).toContain('New Order');
    expect(board.querySelector('a[href="/orders"]')?.getAttribute('aria-current')).toBe('page');

    const ticket = await open('/orders/1041');
    expect(ticket.querySelector('a[href="/orders"]')?.getAttribute('aria-current')).toBe('page');
    expect(ticket.querySelector('a[href="/orders/new"]')?.getAttribute('aria-current')).toBeNull();
  });

  it('marks New Order current and opens the mobile menu', async () => {
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/orders/new');
    const fixture = TestBed.createComponent(TopNavigationComponent);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('a[href="/orders/new"]')?.getAttribute('aria-current')).toBe('page');
    expect(element.querySelector('#primary-menu')).toBeNull();

    (element.querySelector('button') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(element.querySelector('#primary-menu')?.textContent).toContain('New Order');

    (element.querySelector('#primary-menu a') as HTMLAnchorElement).click();
    fixture.detectChanges();
    expect(element.querySelector('#primary-menu')).toBeNull();
  });
});
