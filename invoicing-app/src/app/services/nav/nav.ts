import { inject, Injectable, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

interface MenuItem {
  link: string;
  label: string;
}

@Injectable({
  providedIn: 'root',
})
export class NavService {
  private _menuItems = signal<MenuItem[]>([]);
  private _activeLink = signal<string>('');
  private _showTryDemoButton = signal<boolean>(false);
  router = inject(Router);

  siteTitle = 'Invoice Pro';
  menuItems = this._menuItems.asReadonly();
  showTryDemoButton = this._showTryDemoButton.asReadonly();

  constructor() {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        if (event.url === '/') {
          this._menuItems.set([]);
        } else {
          this.setDefaultMenuItems();
        }
      });
  }

  private setDefaultMenuItems() {
    this._menuItems.set([{ link: '/customers', label: 'Customers' }]);
  }

  setShowTryDemoButton(value: boolean) {
    this._showTryDemoButton.set(value);
  }
}
