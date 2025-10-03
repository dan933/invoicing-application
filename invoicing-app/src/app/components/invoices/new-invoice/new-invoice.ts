import { Component, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Invoice, InvoiceService } from '../../../services/invoices/invoice-service';
import { Utils } from '../../../services/utils/utils';

@Component({
  selector: 'app-new-invoice',
  imports: [],
  templateUrl: './new-invoice.html',
  styleUrl: './new-invoice.scss',
})
export class NewInvoice {
  readonly dialog = inject(MatDialog);
  openDialog() {
    const dialogRef = this.dialog.open(DialogNewInvoice, {});
  }
}

export class DialogNewInvoice {
  readonly dialogRef = inject(MatDialogRef<DialogNewInvoice>);
  readonly dialog = inject(MatDialog);
  customerService = inject(InvoiceService);
  utils = inject(Utils);
  readonly data = inject<Invoice>(MAT_DIALOG_DATA);

  readonly Invoice = signal<Invoice>({
    id: '',
    invoiceReference: '',
    invoiceDate: '',
    subTotal: '',
    paid: false,
    gst: false,
  });

  onNoClick(): void {
    this.dialogRef.close();
  }

  formErrorMessage = signal('');
  loading = signal(false);

  async createInvoice() {
    // if (false) {
    //   this.formErrorMessage.set('Customer Code is required.');
    //   return;
    // }

    this.loading.set(true);

    this.dialogRef.close({ success: true });

    this.loading.set(false);
  }
}
