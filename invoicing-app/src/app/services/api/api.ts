import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '../auth/auth';

@Injectable({
  providedIn: 'root',
})
export class Api {
  router = inject(Router);
  auth = inject(Auth);

  async Post(url: string, body: any) {
    const token = this.auth.getToken();

    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    }).then((res) => {
      if (res.status === 401 || res.status === 403) {
        //remove token
        this.auth.removeToken();
        this.router.navigate(['/login']);
        return;
      }

      return res.json();
    });

    return response;
  }
}
