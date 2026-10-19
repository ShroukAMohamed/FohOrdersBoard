import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ButtonDirective } from 'primeng/button';

export type FeedbackVariant = 'error' | 'empty';

export type FeedbackActionTone = 'danger' | 'neutral';

export interface FeedbackAction {
  id: string;
  label: string;
  icon?: string;
  tone?: FeedbackActionTone;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-feedback-state',
  imports: [ButtonDirective],
  templateUrl: './feedback-state.component.html',
})
export class FeedbackStateComponent {
  readonly icon = input.required<string>();
  readonly title = input.required<string>();
  readonly message = input.required<string>();
  readonly variant = input.required<FeedbackVariant>();
  readonly highlight = input<string | undefined>(undefined);
  readonly actions = input<readonly FeedbackAction[]>([]);

  readonly action = output<string>();

  protected iconShellClass(): string {
    return this.variant() === 'error'
      ? 'mb-4 grid size-16 place-items-center rounded-full bg-error-container text-error'
      : 'mb-4 grid size-16 place-items-center rounded-full bg-surface-container-highest text-on-surface-variant';
  }

  protected actionsClass(): string {
    return this.variant() === 'error'
      ? 'mt-6 flex flex-wrap justify-center gap-2'
      : 'mt-4 flex flex-wrap justify-center gap-2';
  }

  protected actionStyleClass(action: FeedbackAction): string {
    if ((action.tone ?? 'neutral') === 'danger') {
      return '!inline-flex !min-h-11 !items-center !gap-2 !rounded-xs !border-0 !bg-error !px-5 !py-2.5 !text-sm !font-semibold !text-on-error !shadow-sm hover:!bg-error hover:!opacity-90';
    }

    return '!rounded-xs !border-0 !bg-surface-container-highest !px-4 !py-2 !text-sm !font-semibold !text-on-surface !shadow-none hover:!bg-surface-variant';
  }

  protected onAction(actionId: string): void {
    this.action.emit(actionId);
  }
}
