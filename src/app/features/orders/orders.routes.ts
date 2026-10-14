import { Routes } from '@angular/router';

export const ordersRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/orders-board/pages/orders-board.component').then((module) => module.OrdersBoardComponent),
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./pages/new-order/new-order.component').then((module) => module.NewOrderComponent),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/order-details/order-details.component').then((module) => module.OrderDetailsComponent),
  },
];
