import { Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/landing/landing').then((m) => m.Landing),
  },
  {
    path: 'login',
    loadComponent: () => import('./components/login/login').then((m) => m.Login),
    canActivate: [authGuard],
  },
  {
    path: 'customers',
    loadComponent: () => import('./components/customers/customers').then((m) => m.Customers),
    canActivate: [authGuard],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
