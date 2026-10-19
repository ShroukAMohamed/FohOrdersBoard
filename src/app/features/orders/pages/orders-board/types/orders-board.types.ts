import { OrderStatus, OrderType } from '../../../models/order.model';

export type BoardTypeFilter = OrderType | 'all';

export interface OrderCardModel {
  id: string;
  number: number;
  status: OrderStatus;
  placeLabel: string;
  itemCount: number;
  subtotalLabel: string;
  elapsedLabel: string;
  lateLabel: string | null;
  actionLabel: string | null;
  advancing: boolean;
}

export interface OrderColumnModel {
  status: OrderStatus;
  title: string;
  count: number;
  emptyTitle: string;
  emptyBody: string;
  orders: OrderCardModel[];
}
