import { TestBed } from '@angular/core/testing';
import { MessageService } from 'primeng/api';

import { NotificationService } from './notification.service';

describe('NotificationService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [MessageService] });
  });

  it('sends error and warning toasts', () => {
    const add = vi.spyOn(TestBed.inject(MessageService), 'add');
    const notifications = TestBed.inject(NotificationService);

    notifications.error('Could not save the order.', 'Update failed');
    notifications.warn('Could not refresh orders.', 'Refresh failed');

    expect(add).toHaveBeenNthCalledWith(1, {
      severity: 'error',
      summary: 'Update failed',
      detail: 'Could not save the order.',
      life: 6000,
    });
    expect(add).toHaveBeenNthCalledWith(2, {
      severity: 'warn',
      summary: 'Refresh failed',
      detail: 'Could not refresh orders.',
      life: 6000,
    });
  });
});
