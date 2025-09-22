import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private _isLoggedIn = signal(false);
  isLoggedIn = this._isLoggedIn;
}
