# Kitchen Orders Board

## 1. Project Overview

Kitchen Orders Board is a front-of-house screen for a restaurant kitchen. Staff watch tickets move from the moment they are placed until they are served, open a ticket for its full breakdown, and create the next order.

The assignment asks for three workflows:

- **Orders Board (`/orders`)**: four columns, New → Preparing → Ready → Served, with search, type filters, live elapsed time, and late tickets.
- **Order Details (`/orders/:id`)**: line items, notes, service charge, VAT, grand total, and the next status action.
- **Create New Order (`/orders/new`)**: a validated form for dine-in, takeaway, and delivery, with a live price summary.

Live build: https://shroukamohamed.github.io/FohOrdersBoard/

The live build still calls `http://localhost:3000`. Start the mock API (section 14) before opening it, or the board shows Connection Interrupted.

---

## 2. Architecture Overview

The app is Angular 22 with standalone components, strict TypeScript, and a feature folder for orders.

- **`core/`**: the API base URL and the PrimeNG theme preset.
- **`layout/`**: the app shell and the top navigation shared by every page.
- **`shared/`**: skeleton loaders and the toast service.
- **`features/orders/`**: models, HTTP services, pure business rules, and the three pages.

Pages are lazy-loaded. `OrdersRoutingModule` registers `''`, `'new'`, and `':id'` in that order, so Create New Order is not captured by the details route. Each page provides its own store, so timers and subscriptions exist only while that page is open.

---

## 3. Folder Structure

```text
src/app/
├── core/
│   ├── config/                 # API_BASE_URL (http://localhost:3000)
│   └── theme/                  # Aura preset for the PrimeNG components in use
├── layout/
│   ├── app-shell/              # Header plus router outlet
│   └── top-navigation/         # Orders Board and New Order links
├── shared/
│   ├── components/loading-state/  # Board, details, and form skeletons
│   └── services/               # NotificationService (PrimeNG Toast)
└── features/orders/
    ├── data-access/            # OrdersApiService, MenuApiService
    ├── models/                 # Order, OrderLine, MenuItem
    ├── utils/                  # Pricing, status, search, elapsed time
    ├── orders-routing.module.ts
    └── pages/
        ├── orders-board/       # Page, store, column, card
        ├── order-details/      # Page, store, overview, items, summary
        └── new-order/          # Page, reactive form, type and item sections
```

---

## 4. Feature Architecture

### Orders Board

Matches the board requirements from the task:

- Four columns in status order, each with a count.
- A card shows the order number, table number or order type, item count (sum of quantities), subtotal in EGP, and elapsed time.
- Elapsed time updates every second.
- An order is late when its status is New or Preparing and it is older than 20 minutes. Ready and Served are never late.
- Search matches the order number or the table number. Phone numbers and item names are ignored. The query is debounced and stored in `?q=`.
- Type filters (All, Dine-in, Takeaway, Delivery) are stored in `?type=`, so a refresh keeps them.
- One action per card: Start Preparing, Mark Ready, or Mark Served. Served cards show Completed and do not advance.
- The list refreshes every 15 seconds. A request still in flight is not started again. Polling pauses while the browser tab is hidden and runs once when the tab becomes visible.
- Empty, no-results, loading, and connection-error states each have their own screen.

### Order Details

- Loads one order and the menu together.
- Shows each line's name, quantity, note, unit price, and line total, plus the item count.
- Service charge is 12% of the subtotal for dine-in and EGP 0.00 for takeaway and delivery.
- VAT is 14% of subtotal plus service charge.
- The same status action as the board. A failed update restores the previous status.
- An unknown id shows Order Not Found. A network failure shows Connection Interrupted with Retry.

### Create New Order

A reactive form with a `FormArray` of item rows:

- Order type is required. Dine-in asks for a whole table number from 1 to 40. Delivery asks for an Egyptian mobile: `01`, then `0`, `1`, `2`, or `5`, then eight digits (`^01[0125]\d{8}$`). Takeaway asks for neither.
- At least one item. Each row needs a menu item and a whole quantity from 1 to 20. Notes are optional.
- Totals update as the form changes and follow the same service and VAT rules as Order Details.
- Submit is ignored while a create request is in flight. A failed POST keeps the form values and shows a toast.
- The next order id is one past the highest existing order number or numeric id. json-server stores the id the client sends.

---

## 5. State Management

There is no NgRx store.

- **Signals** hold orders, the menu, loading and error flags, and the current clock.
- **`computed()`** derives the board columns, the details view, and the new-order totals. Templates do not filter or price orders themselves.
- **Feature stores** (`OrdersBoardStore`, `OrderDetailsStore`) are provided on the page component, not in `root`, so leaving the page destroys them.
- **RxJS** is limited to HTTP, the search debounce, the one-second clock, and the 15-second poll. Subscriptions use `takeUntilDestroyed()`.
- **Create New Order** keeps its state in the reactive form. A signal snapshot of `getRawValue()` feeds the totals `computed()`, because form values are not signals.

The menu is not stored on an order. Prices always come from `GET /menu` at read time, which is what the task specifies.

---

## 6. Refresh and Optimistic Updates

json-server has no push channel, so the board polls `GET /orders` every 15 seconds.

1. Staff press Start Preparing, Mark Ready, or Mark Served.
2. The card moves immediately.
3. `PATCH /orders/:id` sends `{ "status": "<next>" }`.
4. On success, the saved order replaces the local one.
5. On failure, the card returns to its previous status and an error toast appears.
6. A poll that started before the PATCH finished cannot move that card backwards. `exhaustMap` drops a new poll while the previous one is still running.

Order Details uses the same optimistic update and rollback for its single order.

---

## 7. Pricing

Money is calculated in piasters (1 EGP = 100 piasters) and converted back to two decimal places. Percentages use half-up rounding. Totals are displayed, never written back to `db.json`.

| Order | Type | Subtotal | Service 12% | VAT 14% | Total |
|---|---|---:|---:|---:|---:|
| #1041 | dine-in | 450.00 | 54.00 | 70.56 | 574.56 |
| #1044 | delivery | 240.00 | 0.00 | 33.60 | 273.60 |

A line whose menu id is missing is shown as "Price unavailable". The card and the details summary then show no partial total.

Seed orders were created on 2026-09-27, so every New and Preparing seed ticket is late when you open the app today.

---

## 8. Design Decisions

- **Standalone components** for every page and section. The only NgModule is `OrdersRoutingModule`, so the feature can lazy-load through `RouterModule.forChild`.
- **Signals instead of a state library.** The board and details state fits in two page-scoped stores.
- **Tailwind CSS 4** for layout, using the Kitchen Orders Board color tokens (primary `#004ac6`, surfaces, error, and status colors).
- **PrimeNG** for Toast, Skeleton, Select, SelectButton, and the `[pButton]` directive. The theme preset includes those component token sets (button, select, selectbutton, skeleton, toast, and togglebutton), not the full Aura catalog.
- **Reactive forms** for Create New Order, including one custom validator (`egyptianMobileValidator`) and a whole-number validator for table and quantity.

---

## 9. Performance

- **OnPush** is the default change-detection strategy in this Angular version, so views update from signals and input changes.
- **`computed()`** rebuilds a column or a price summary only when its inputs change.
- **`@for` with `track`** keeps cards and item rows stable across refreshes.
- **Lazy routes** keep the board, details, and new-order code out of the first download.
- **`takeUntilDestroyed()`** ends the clock, the poll, and in-flight requests when the page is destroyed.
- The production build stays under the 500 kB initial-bundle budget. PrimeIcons is not loaded, because the UI uses Material Symbols.

---

## 10. Assumptions

- `db.json` plus json-server is the backend. There is no authentication.
- The client chooses the next order id. A real API would assign it.
- "Average Prep" in the board footer and "Station 1 • Main Kitchen" are labels from the design. They are not calculated.
- Menu prices in `db.json` are EGP pounds. Orders do not store prices.

---

## 11. Known Limitations

- Two creates that read the order list at the same moment can choose the same id.
- The GitHub Pages build cannot reach json-server. Reviewers need the local API from section 14.
- Polling is per browser tab. Tabs do not share a socket, but they do share `db.json`, so the next poll picks up another tab's change.
- A missing menu price hides the whole total rather than showing a partial one.

---

## 12. Error Handling

- The first load of the board, details, or menu shows a full-page Connection Interrupted panel with Retry, plus an error toast.
- A failed status change rolls back and shows an error toast.
- A failed background refresh keeps the last successful list and shows one warning toast per outage, not one every 15 seconds.
- A failed create keeps the form and shows an error toast.
- Field errors stay inline ("Enter a table number.", "Select a menu item.", and the Egyptian mobile hint).

---

## 13. API

Base URL: `http://localhost:3000`

```text
GET    /menu
GET    /orders
GET    /orders?status=new
GET    /orders/:id
PATCH  /orders/:id     { "status": "ready" }
POST   /orders          the CreateOrderRequest body
```

json-server writes PATCH and POST results back into `db.json`.

---

## 14. Running the Project

**Installation:**

```bash
npm install
```

**Mock API** (required, port 3000):

```bash
npx json-server@1.0.0-beta.3 db.json --port 3000
```

**Development server:**

```bash
npm start
```

Open http://localhost:4200/. The app redirects to `/orders`.

**Tests:**

```bash
npm test
```

**Production build:**

```bash
npm run build
```

Output goes to `dist/foh-orders-task`. A push to `main` publishes that build to GitHub Pages through `.github/workflows/deploy.yml`.

To reset orders you created or moved, run `git checkout db.json` while json-server is stopped.
