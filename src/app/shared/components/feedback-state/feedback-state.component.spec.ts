import { TestBed } from '@angular/core/testing';

import { FeedbackAction, FeedbackStateComponent, FeedbackVariant } from './feedback-state.component';

describe('FeedbackStateComponent', () => {
  function create(
    overrides: {
      icon?: string;
      title?: string;
      message?: string;
      variant?: FeedbackVariant;
      highlight?: string;
      actions?: readonly FeedbackAction[];
    } = {},
  ) {
    const fixture = TestBed.createComponent(FeedbackStateComponent);
    const action = vi.fn();
    fixture.componentInstance.action.subscribe(action);
    fixture.componentRef.setInput('icon', overrides.icon ?? 'sync_problem');
    fixture.componentRef.setInput('title', overrides.title ?? 'Connection Interrupted');
    fixture.componentRef.setInput('message', overrides.message ?? 'Unable to reach the kitchen API.');
    fixture.componentRef.setInput('variant', overrides.variant ?? 'error');
    if (overrides.highlight !== undefined) {
      fixture.componentRef.setInput('highlight', overrides.highlight);
    }
    if (overrides.actions !== undefined) {
      fixture.componentRef.setInput('actions', overrides.actions);
    }
    fixture.detectChanges();
    return { fixture, action };
  }

  it('renders the title, message, and icon', () => {
    const { fixture } = create();
    const root = fixture.nativeElement as HTMLElement;

    expect(root.textContent).toContain('Connection Interrupted');
    expect(root.textContent).toContain('Unable to reach the kitchen API.');
    expect(root.querySelector('.material-symbols-outlined')?.textContent?.trim()).toBe('sync_problem');
  });

  it('uses alert semantics and error icon styling for the error variant', () => {
    const { fixture } = create({ variant: 'error' });
    const section = fixture.nativeElement.querySelector('section') as HTMLElement;
    const shell = section.querySelector('div') as HTMLElement;

    expect(section.getAttribute('role')).toBe('alert');
    expect(shell.className).toContain('bg-error-container');
    expect(shell.className).toContain('text-error');
  });

  it('uses empty icon styling and no alert role for the empty variant', () => {
    const { fixture } = create({
      variant: 'empty',
      icon: 'search_off',
      title: 'No orders found',
      message: 'No orders found matching',
      highlight: '1045',
    });
    const section = fixture.nativeElement.querySelector('section') as HTMLElement;
    const shell = section.querySelector('div') as HTMLElement;

    expect(section.getAttribute('role')).toBeNull();
    expect(shell.className).toContain('bg-surface-container-highest');
    expect(fixture.nativeElement.textContent).toContain("No orders found matching '1045'.");
  });

  it('renders no action buttons when actions are omitted or empty', () => {
    const omitted = create();
    expect(omitted.fixture.nativeElement.querySelectorAll('button')).toHaveLength(0);

    const empty = create({ actions: [] });
    expect(empty.fixture.nativeElement.querySelectorAll('button')).toHaveLength(0);
  });

  it('renders one or multiple actions and emits their identifiers', () => {
    const { fixture, action } = create({
      actions: [
        { id: 'clear-search', label: 'Clear search query', tone: 'neutral' },
        { id: 'show-all', label: 'Show all types', tone: 'neutral' },
      ],
    });
    const buttons = [...fixture.nativeElement.querySelectorAll('button')] as HTMLButtonElement[];

    expect(buttons).toHaveLength(2);
    expect(buttons[0].textContent).toContain('Clear search query');
    expect(buttons[1].textContent).toContain('Show all types');

    buttons[0].click();
    buttons[1].click();
    expect(action).toHaveBeenCalledTimes(2);
    expect(action).toHaveBeenNthCalledWith(1, 'clear-search');
    expect(action).toHaveBeenNthCalledWith(2, 'show-all');
  });
});
