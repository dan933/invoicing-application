import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class Utils {
  emailCheck(email: string) {
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
  }

  wholeNumberValidator(control: any) {
    const value = control.value;
    if (value !== null && value % 1 !== 0) {
      return { notWholeNumber: true };
    }
    return null;
  }
}
