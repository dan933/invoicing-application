import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class SnackbarService {
  private snackBar = inject(MatSnackBar);

  success(message: string, duration = 3000) {
    this.snackBar.open(message, 'Close', {
      duration,
      panelClass: ['success-snackbar'],
    });
  }

  error(message: string, duration = 5000) {
    this.snackBar.open(message, 'Close', {
      duration,
      panelClass: ['error-snackbar'],
    });
  }

  info(message: string, duration = 3000) {
    this.snackBar.open(message, 'Close', {
      duration,
      panelClass: ['info-snackbar'],
    });
  }
}
