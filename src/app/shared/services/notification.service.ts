import { Injectable, inject } from '@angular/core';
import { MessageService } from 'primeng/api';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly messages = inject(MessageService);

  error(detail: string, summary = 'Something went wrong'): void {
    this.messages.add({ severity: 'error', summary, detail, life: 6000 });
  }

  warn(detail: string, summary = 'Warning'): void {
    this.messages.add({ severity: 'warn', summary, detail, life: 6000 });
  }
}
