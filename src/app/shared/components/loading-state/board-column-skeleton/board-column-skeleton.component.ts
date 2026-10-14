import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Skeleton } from 'primeng/skeleton';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-board-column-skeleton',
  imports: [Skeleton],
  templateUrl: './board-column-skeleton.component.html',
})
export class BoardColumnSkeletonComponent {}
