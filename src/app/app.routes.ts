import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./layout/app-shell/app-shell.component').then((module) => module.AppShellComponent),
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'orders',
      },
      {
        path: 'orders',
        loadChildren: () =>
          import('./features/orders/orders-routing.module').then((module) => module.OrdersRoutingModule),
      },
    ],
  },
];
