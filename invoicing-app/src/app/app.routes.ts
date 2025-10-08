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
    path: 'customers-details/:id',
    loadComponent: () =>
      import('./components/customers/customer-details/customer-details').then(
        (m) => m.CustomerDetails
      ),
    canActivate: [authGuard],
  },
  {
    path: 'invoices/new',
    loadComponent: () => import('./components/new-invoice/new-invoice').then((m) => m.NewInvoice),
    canActivate: [authGuard],
  },
  {
    path: 'invoices/:id',
    loadComponent: () =>
      import('./components/invoice-details/invoice-details').then((m) => m.InvoiceDetails),
    canActivate: [authGuard],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
