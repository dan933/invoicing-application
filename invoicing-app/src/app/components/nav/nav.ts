import { Component, HostListener, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { NavService } from '../../services/nav/nav';
import { Event as RouterEvent, NavigationEnd, NavigationStart, Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-nav',
  imports: [],
  templateUrl: './nav.html',
  styleUrl: './nav.scss',
})
export class Nav implements OnInit, OnDestroy {
  router = inject(Router);
  navService = inject(NavService);
  screenWidth = signal(window.innerWidth);
  scrollY = signal<number>(0);
  isLanding = signal<boolean>(false);

  routerSubscription: Subscription;

  tryDemo() {
    this.router.navigate(['/customers']);
  }

  constructor() {
    this.routerSubscription = this.router.events.subscribe((event: RouterEvent) => {
      if (event instanceof NavigationEnd) {
        const url = event?.urlAfterRedirects || event.url;
        console.log('url', url);
        this.navService.setShowTryDemoButton(url === '/' ? true : false);

        if (url === '/') {
          this.isLanding.set(true);
        } else {
          this.isLanding.set(false);
        }
      }
    });
  }
  ngOnDestroy(): void {
    this.routerSubscription.unsubscribe();
  }

  ngOnInit(): void {}

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
