import { ChangeDetectionStrategy, Component, inject, model, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { Utils } from '../../../services/utils/utils';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-new-customer',
  imports: [MatFormFieldModule, MatInputModule, FormsModule, MatButtonModule],
  templateUrl: './new-customer.html',
  styleUrl: './new-customer.scss',
})
export class NewCustomer {
  readonly dialog = inject(MatDialog);

  openDialog(): void {
    const dialogRef = this.dialog.open(DialogCustomer, {});
  }
}

export interface DialogData {
  animal: string;
  name: string;
}

interface Customer {
  id: string;
  customerCode: string;
  firstName: string;
  lastName: string;
  company: string;
  email: string;
  activeStatus: boolean;
}

@Component({
  selector: 'dialog-new-customer',
  templateUrl: 'dialog-new-customer.html',
  styleUrl: './dialog-new-customer.scss',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatSlideToggleModule,
    MatProgressSpinnerModule,
  ],
})
export class DialogCustomer {
  readonly dialogRef = inject(MatDialogRef<DialogCustomer>);
  readonly dialog = inject(MatDialog);
  utils = inject(Utils);
  readonly customer = signal<Customer>({
    id: '',
    customerCode: '',
    firstName: '',
    lastName: '',
    company: '',
    email: '',
    activeStatus: true,
  });

  openDialog(): void {
    const dialogRef = this.dialog.open(DialogCustomer, {
      data: {},
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log('The dialog was closed');
      if (result !== undefined) {
        this.customer.set(result);
      }
    });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  formErrorMessage = signal('');
  loading = signal(false);

  saveCustomer() {
    console.log(
      'this.utils.emailCheck(this.customer().email)',
      this.utils.emailCheck(this.customer().email)
    );
    if (!this.utils.emailCheck(this.customer().email)) {
      this.formErrorMessage.set('Please enter a valid email address.');
      return;
    } else {
      this.formErrorMessage.set('');
    }

    if (!this.customer().customerCode) {
      this.formErrorMessage.set('Customer Code is required.');
      return;
    }

    this.loading.set(true);
  }
}
