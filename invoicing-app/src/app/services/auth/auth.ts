import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  router = inject(Router);
  private _isLoggedIn = signal(false);
  isLoggedIn = this._isLoggedIn;

  login(email: string, password: string) {
    return new Promise((resolve) => {
      setTimeout(() => {
        this._isLoggedIn.set(true);
        this.router.navigate(['/customers']);

        resolve(true);
      }, 3000);
    });
  }
}
