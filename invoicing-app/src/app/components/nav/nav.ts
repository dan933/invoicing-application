import { Component, HostListener, inject, OnInit, signal } from '@angular/core';
import { NavService } from '../../services/nav/nav';

@Component({
  selector: 'app-nav',
  imports: [],
  templateUrl: './nav.html',
  styleUrl: './nav.scss',
})
export class Nav implements OnInit {
  navService = inject(NavService);
  screenWidth = signal(window.innerWidth);
  scrollY = signal<number>(0);

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
