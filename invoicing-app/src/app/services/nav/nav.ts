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
  siteTitle = 'Invoice Pro';
  menuItems = this._menuItems.asReadonly();

  setMenuItems(items: MenuItem[]) {
    this._menuItems.set(items);
  }
}
