import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/landing/landing').then((m) => m.Landing),
  },
];
