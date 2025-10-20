import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../services/auth/auth';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  let isLoggedIn = !!localStorage.getItem('token');

  if (isLoggedIn && route?.routeConfig?.path === 'login') {
    return router.createUrlTree(['/customers']);
  }

  if (route?.routeConfig?.path === 'login') {
    return true;
  }

  if (isLoggedIn) {
    return true;
  }

  return router.createUrlTree(['/login']);
};
