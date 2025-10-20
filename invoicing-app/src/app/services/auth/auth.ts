import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  router = inject(Router);
  private _isLoggedIn = signal(this.hasToken());
  isLoggedIn = this._isLoggedIn;

  private hasToken(): boolean {
    return !!localStorage.getItem('token');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  setToken(token: string): void {
    localStorage.setItem('token', token);
    this._isLoggedIn.set(true);
  }

  removeToken(): void {
    localStorage.removeItem('token');
    this._isLoggedIn.set(false);
  }

  async login(email: string, password: string): Promise<{ token?: string }> {
    const apiUrl = environment.apiUrl;

    return await fetch(`${apiUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })
      .then((response) => {
        if (response.status === 401) {
          throw new Error('Invalid email or password');
        }

        if (!response.ok) {
          throw new Error('Login failed');
        }
        return response.json();
      })
      .then((data) => {
        this.setToken(data.token);
        return data;
      })
      .catch((error) => {
        console.error('Login error:', error);
        throw error;
      });
  }
}
