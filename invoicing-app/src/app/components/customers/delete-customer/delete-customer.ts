import { Component, inject, Input, signal } from '@angular/core';
import {
  MatDialog,
  MatDialogRef,
  MatDialogContent,
  MatDialogActions,
  MatDialogTitle,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { CustomerService } from '../../../services/customers/customer-service';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { Router } from '@angular/router';

@Component({
  selector: 'app-delete-customer',
  imports: [],
  templateUrl: './delete-customer.html',
  styleUrl: './delete-customer.scss',
})
export class DeleteCustomer {
  readonly dialog = inject(MatDialog);
  @Input() customerCode: string = '';

  openDialog(): void {
    this.dialog.open(DialogCustomer, { data: this.customerCode });
  }
}

@Component({
  selector: 'dialog-delete-customer',
  templateUrl: 'dialog-delete-customer.html',
  styleUrl: './dialog-delete-customer.scss',
  imports: [
    MatDialogContent,
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
  router = inject(Router);
  loading = signal(false);
  readonly data = inject<string>(MAT_DIALOG_DATA);

  onNoClick(): void {
    this.dialogRef.close();
  }

  deleteCustomer() {
    this.loading.set(true);

    this.customerService.DeleteCustomer(this.data);

    this.loading.set(false);

    this.router.navigate(['/customers']);

    this.dialogRef.close();
  }
}
