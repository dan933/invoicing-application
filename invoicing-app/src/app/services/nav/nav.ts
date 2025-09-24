import { Injectable, signal } from '@angular/core';

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

  siteTitle = 'Invoice Pro';
  menuItems = this._menuItems.asReadonly();
  showTryDemoButton = this._showTryDemoButton.asReadonly();

  setMenuItems(items: MenuItem[]) {
    this._menuItems.set(items);
  }

  setShowTryDemoButton(value: boolean) {
    this._showTryDemoButton.set(value);
  }
}
