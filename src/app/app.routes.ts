import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'orders',
  },
  {
    path: 'orders',
    loadChildren: () => import('./features/orders/orders.routes').then((module) => module.ordersRoutes),
  },
];
