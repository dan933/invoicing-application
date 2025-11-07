import { Component, HostListener, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { NavService } from '../../services/nav/nav';
import {
  Event as RouterEvent,
  NavigationEnd,
  NavigationStart,
  Router,
  RouterModule,
} from '@angular/router';
import { Subscription } from 'rxjs';
import { Auth } from '../../services/auth/auth';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-nav',
  imports: [MatIcon, RouterModule],
  templateUrl: './nav.html',
  styleUrl: './nav.scss',
})
export class Nav implements OnInit, OnDestroy {
  router = inject(Router);
  navService = inject(NavService);
  auth = inject(Auth);
  screenWidth = signal(window.innerWidth);
  scrollY = signal<number>(0);
  isFloatingNav = signal<boolean>(false);
  currentUrl = signal<string>('');

  activeMenu: boolean = false;

  routerSubscription: Subscription;

  tryDemo() {
    this.router.navigate(['/customers']);
  }

  onLinkClick(route: string) {
    this.router.navigate([route]);
  }

  constructor() {
    this.routerSubscription = this.router.events.subscribe((event: RouterEvent) => {
      if (event instanceof NavigationEnd) {
        const url = event?.urlAfterRedirects || event.url;
        this.currentUrl.set(url);

        this.navService.setShowTryDemoButton(url === '/' ? true : false);

        if (url === '/' || url === '/login') {
          this.isFloatingNav.set(true);
        } else {
          this.isFloatingNav.set(false);
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.routerSubscription.unsubscribe();
  }

  ngOnInit(): void {}

  logout() {
    this.auth.removeToken();
    this.router.navigate(['/login']);
  }

  navLanding() {
    this.router.navigate(['/']);
  }

  toggleMenu() {
    this.activeMenu = !this.activeMenu;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    // console.log('window.innerWidth', window.innerWidth);

    this.screenWidth.set(window.innerWidth);
  }

  @HostListener('window:scroll', [])
  onScroll() {
    this.scrollY.set(window.scrollY);
  }
}
