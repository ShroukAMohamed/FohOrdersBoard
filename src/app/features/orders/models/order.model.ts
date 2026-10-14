export const ORDER_TYPES = ['dine-in', 'takeaway', 'delivery'] as const;
export type OrderType = (typeof ORDER_TYPES)[number];

export const ORDER_STATUSES = ['new', 'preparing', 'ready', 'served'] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

/** A line as stored by json-server. `note` is an empty string when the guest has none. */
export interface OrderLine {
  menuId: string;
  qty: number;
  note: string;
}

/** An order as returned by `GET /orders` and `GET /orders/:id`. Totals are not part of this contract. */
export interface Order {
  id: string;
  number: number;
  type: OrderType;
  table: number | null;
  phone: string | null;
  status: OrderStatus;
  createdAt: string;
  items: OrderLine[];
}

/** Body for `POST /orders`. json-server stores this object as the new resource. */
export interface CreateOrderRequest {
  id: string;
  number: number;
  type: OrderType;
  table: number | null;
  phone: string | null;
  status: 'new';
  createdAt: string;
  items: OrderLine[];
}

/** Body for `PATCH /orders/:id` when staff move an order forward. */
export interface UpdateOrderStatusRequest {
  status: OrderStatus;
}
