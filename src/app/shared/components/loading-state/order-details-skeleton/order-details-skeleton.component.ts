import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Skeleton } from 'primeng/skeleton';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-order-details-skeleton',
  imports: [Skeleton],
  templateUrl: './order-details-skeleton.component.html',
})
export class OrderDetailsSkeletonComponent {}
