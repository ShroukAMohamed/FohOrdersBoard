/** A row from `GET /menu`. Prices are EGP pounds and are not stored on orders. */
export interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
}
