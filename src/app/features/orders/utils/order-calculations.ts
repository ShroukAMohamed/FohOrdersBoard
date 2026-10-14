import { MenuItem } from '../models/menu-item.model';
import { OrderLine, OrderType } from '../models/order.model';

export interface OrderTotals {
  subtotal: number;
  serviceCharge: number;
  vat: number;
  grandTotal: number;
}

export interface PricedOrderLine {
  menuId: string;
  name: string | null;
  qty: number;
  note: string;
  unitPrice: number | null;
  lineTotal: number | null;
}

const SERVICE_RATE_PERCENT = 12;
const VAT_RATE_PERCENT = 14;

/**
 * Money is kept in piasters (1 EGP = 100 piasters) and converted back to pounds
 * with two decimal places. Percentages use half-up rounding on the piaster amount,
 * which matches the task samples (#1041 → 574.56, #1044 → 273.60).
 */
function toPiasters(pounds: number): number {
  return Math.round(pounds * 100);
}

function toPounds(piasters: number): number {
  return piasters / 100;
}

export function formatEgp(amount: number): string {
  return `EGP ${amount.toFixed(2)}`;
}

export function priceOrderLines(items: readonly OrderLine[], menu: readonly MenuItem[]): PricedOrderLine[] {
  const menuById = new Map(menu.map((item) => [item.id, item]));

  return items.map((line) => {
    const menuItem = menuById.get(line.menuId);
    if (!menuItem) {
      return {
        menuId: line.menuId,
        name: null,
        qty: line.qty,
        note: line.note,
        unitPrice: null,
        lineTotal: null,
      };
    }

    return {
      menuId: line.menuId,
      name: menuItem.name,
      qty: line.qty,
      note: line.note,
      unitPrice: menuItem.price,
      lineTotal: toPounds(toPiasters(menuItem.price) * line.qty),
    };
  });
}

export function calculateOrderTotals(
  type: OrderType,
  lines: readonly { unitPrice: number; qty: number }[],
): OrderTotals {
  const subtotalPiasters = lines.reduce(
    (sum, line) => sum + toPiasters(line.unitPrice) * line.qty,
    0,
  );
  const servicePiasters =
    type === 'dine-in' ? Math.round((subtotalPiasters * SERVICE_RATE_PERCENT) / 100) : 0;
  const vatBasePiasters = subtotalPiasters + servicePiasters;
  const vatPiasters = Math.round((vatBasePiasters * VAT_RATE_PERCENT) / 100);

  return {
    subtotal: toPounds(subtotalPiasters),
    serviceCharge: toPounds(servicePiasters),
    vat: toPounds(vatPiasters),
    grandTotal: toPounds(vatBasePiasters + vatPiasters),
  };
}
