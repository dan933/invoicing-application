import {
  ChangeDetectionStrategy,
  Component,
  inject,
  model,
  signal,
  Output,
  EventEmitter,
  Input,
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
  selector: 'app-edit-customer',
  imports: [MatFormFieldModule, MatInputModule, FormsModule, MatButtonModule],
  templateUrl: './edit-customer.html',
  styleUrl: './edit-customer.scss',
})
export class EditCustomer {
  readonly dialog = inject(MatDialog);
  @Output() onCustomerEdit = new EventEmitter<void>();
  @Input() customerProp: Customer | null = null;

  customer = signal<Customer>({
    id: '',
    customerCode: '',
    firstName: '',
    lastName: '',
    company: '',
    email: '',
    activeStatus: true,
  });

  openDialog(): void {
    if (this.customerProp) {
      this.customer.set(this.customerProp);
    }

    const dialogRef = this.dialog.open(DialogCustomer, { data: this.customerProp });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.success) {
        this.onCustomerEdit.emit();
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
  selector: 'dialog-edit-customer',
  templateUrl: 'dialog-edit-customer.html',
  styleUrl: './dialog-edit-customer.scss',
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
  readonly data = inject<Customer | null>(MAT_DIALOG_DATA);

  readonly customer = signal<Customer>({
    id: this.data?.id || '',
    customerCode: this.data?.customerCode || '',
    firstName: this.data?.firstName || '',
    lastName: this.data?.lastName || '',
    company: this.data?.company || '',
    email: this.data?.email || '',
    activeStatus: this.data?.activeStatus || false,
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

    this.customerService.editCustomer(this.customer());

    this.dialogRef.close({ success: true, customer: this.customer() });

    this.loading.set(false);
  }
}
