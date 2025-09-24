import { Component, HostListener, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-landing',
  imports: [],
  templateUrl: './landing.html',
  styleUrl: './landing.scss',
})
export class Landing {
  router: Router = inject(Router);
  // 753 px and above desktop 145px padding top 195px padding bottom
  screenWidth = signal(window.innerWidth);

  tryDemo() {
    this.router.navigate(['/customers']);
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    // console.log('window.innerWidth', window.innerWidth);

    this.screenWidth.set(window.innerWidth);
  }
}
