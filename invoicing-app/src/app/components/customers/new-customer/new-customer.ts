import {
  ChangeDetectionStrategy,
  Component,
  inject,
  model,
  signal,
  Output,
  EventEmitter,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { Utils } from '../../../services/utils/utils';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CustomerService } from '../../../services/customers/customer-service';

@Component({
  selector: 'app-new-customer',
  imports: [MatFormFieldModule, MatInputModule, FormsModule, MatButtonModule],
  templateUrl: './new-customer.html',
  styleUrl: './new-customer.scss',
})
export class NewCustomer {
  readonly dialog = inject(MatDialog);
  @Output() customerCreated = new EventEmitter<void>();

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
    const dialogRef = this.dialog.open(DialogCustomer, {});

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.success) {
        this.customerCreated.emit();
      }
    });
  }
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
    MatSlideToggleModule,
    MatProgressSpinnerModule,
  ],
})
export class DialogCustomer {
  readonly dialogRef = inject(MatDialogRef<DialogCustomer>);
  readonly dialog = inject(MatDialog);
  customerService = inject(CustomerService);
  utils = inject(Utils);
  readonly data = inject<Customer>(MAT_DIALOG_DATA);

  readonly customer = signal<Customer>({
    id: '',
    customerCode: '',
    firstName: '',
    lastName: '',
    company: '',
    email: '',
    activeStatus: true,
  });

  onNoClick(): void {
    this.dialogRef.close();
  }

  formErrorMessage = signal('');
  loading = signal(false);

  async saveCustomer() {
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

    this.customerService.addCustomer({ ...this.customer(), id: crypto.randomUUID() });

    this.dialogRef.close({ success: true, customer: this.customer() });

    this.loading.set(false);
  }
}
