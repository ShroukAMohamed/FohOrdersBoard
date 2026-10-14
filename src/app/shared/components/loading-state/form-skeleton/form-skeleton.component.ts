import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Skeleton } from 'primeng/skeleton';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-form-skeleton',
  imports: [Skeleton],
  templateUrl: './form-skeleton.component.html',
})
export class FormSkeletonComponent {}
