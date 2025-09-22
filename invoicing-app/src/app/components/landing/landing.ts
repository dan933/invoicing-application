import { Component, HostListener, signal } from '@angular/core';

@Component({
  selector: 'app-landing',
  imports: [],
  templateUrl: './landing.html',
  styleUrl: './landing.scss',
})
export class Landing {
  // 753 px and above desktop 145px padding top 195px padding bottom
  screenWidth = signal(window.innerWidth);

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    // console.log('window.innerWidth', window.innerWidth);

    this.screenWidth.set(window.innerWidth);
  }
}
