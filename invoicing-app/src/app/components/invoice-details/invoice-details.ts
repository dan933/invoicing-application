import {
  Component,
  HostListener,
  inject,
  signal,
  LOCALE_ID,
  OnInit,
  ChangeDetectionStrategy,
  model,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  InvoiceService,
  InvoiceDetails as InvoiceDetailsType,
} from '../../services/invoices/invoice-service';
import { provideNativeDateAdapter, MatOption } from '@angular/material/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormControl,
} from '@angular/forms';

import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormsModule } from '@angular/forms';
import { Utils } from '../../services/utils/utils';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { Customer, CustomerService } from '../../services/customers/customer-service';
import { Observable, startWith, switchMap } from 'rxjs';
import { SnackbarService } from '../../services/snackbar/snack-bar';
import { AsyncPipe } from '@angular/common';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

export const DD_MM_YYYY_FORMAT = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-invoice-details',
  imports: [
    MatIconModule,
    MatInputModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatNativeDateModule,
    ReactiveFormsModule,
    FormsModule,
    MatAutocompleteModule,
    AsyncPipe,
    MatSlideToggleModule,
    MatProgressSpinner,
  ],
  providers: [provideNativeDateAdapter(), { provide: LOCALE_ID, useValue: 'en-GB' }],
  templateUrl: './invoice-details.html',
  styleUrl: './invoice-details.scss',
})
export class InvoiceDetails implements OnInit {
  loading = signal(false);
  screenWidth = signal(window.innerWidth);

  route = inject(ActivatedRoute);
  router = inject(Router);
  utils = inject(Utils);

  snackbar = inject(SnackbarService);
  invoiceService = inject(InvoiceService);
  customerService = inject(CustomerService);

  fb = inject(FormBuilder);

  selectedCustomer = new FormControl<Customer | null>(null);
  customerFilterOptions: Observable<Customer[]> = new Observable<Customer[]>();
  invoiceId = this.route.snapshot.paramMap.get('invoiceId');
  customerId: string | null = null;
  invoiceReference = signal<string>('');

  readonly deleteDialog = inject(MatDialog);

  invoice = this.fb.group({
    invoiceDate: [new Date(), Validators.required],
    dueDate: [new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), Validators.required],
    subTotal: [0, Validators.required],
    gst: [false],
    paid: [false],
    lineItems: this.fb.array<
      FormGroup<{
        id: FormControl<string | null>;
        description: FormControl<string | null>;
        quantity: FormControl<number | null>;
        unitPrice: FormControl<number | null>;
      }>
    >([
      this.fb.group({
        description: this.fb.control('', Validators.required),
        quantity: this.fb.control(0, [
          Validators.required,
          Validators.min(1),
          this.utils.wholeNumberValidator,
        ]),
        unitPrice: this.fb.control(0, [
          Validators.required,
          Validators.min(0.01),
          this.maxDecimalPlacesValidator(2),
        ]),
        id: this.fb.control(''),
      }),
    ]),
  });

  async getInvoice() {
    if (this.invoiceId) {
      this.loading.set(true);
      const invoice = await this.invoiceService
        .getInvoiceById(this.invoiceId)
        .catch((err) => {
          return null;
        })
        .finally(() => {
          this.loading.set(false);
        });

      console.log(invoice?.lineItems);

      if (invoice) {
        this.invoiceReference.set(invoice.invoiceReference);
        this.customerId = invoice.customerId;
        this.invoice.patchValue({
          invoiceDate: this.utils.convertUtcToLocal(invoice.invoiceDate),
          dueDate: this.utils.convertUtcToLocal(invoice.dueDate),
          subTotal: invoice.subTotal / 100,
          gst: invoice.gst,
          paid: invoice.paid,
        });

        this.invoice.controls.lineItems.clear();

        if (invoice?.lineItems?.length) {
          this.invoice.controls.lineItems.push(
            invoice.lineItems.map((item) => {
              return this.fb.group({
                id: this.fb.control(item.id || null),
                description: this.fb.control(item.description, Validators.required),
                quantity: this.fb.control(item.quantity, [
                  Validators.required,
                  Validators.min(1),
                  this.utils.wholeNumberValidator,
                ]),
                unitPrice: this.fb.control(item.unitPrice, [
                  Validators.required,
                  Validators.min(0.01),
                  this.maxDecimalPlacesValidator(2),
                ]),
              });
            })
          );
        }
      }
    }
  }

  async onPageLoad() {
    await this.getInvoice();
    await this.getCustomer();
  }

  constructor() {
    this.onPageLoad();
  }

  ngOnInit(): void {
    this.customerFilterOptions = this.selectedCustomer.valueChanges.pipe(
      startWith(''),
      switchMap((value) => {
        const searchTerm = typeof value === 'string' ? value : value?.customerCode || '';
        return this.customerService.searchCustomers(searchTerm);
      })
    );
  }

  customerCodeDisplayFn(value: Customer) {
    return value?.customerCode || '';
  }

  async getCustomer() {
    if (this.customerId) {
      this.loading.set(true);
      const customer = await this.customerService
        .getCustomerById(this.customerId)
        .catch((err) => {
          return null;
        })
        .finally(() => {
          this.loading.set(false);
        });

      this.selectedCustomer.setValue(customer);
    }
  }

  removeLineItem(
    item: FormGroup<{
      id: FormControl<string | null>;
      description: FormControl<string | null>;
      quantity: FormControl<number | null>;
      unitPrice: FormControl<number | null>;
    }>
  ) {
    const index = this.invoice.controls.lineItems.controls.indexOf(item);
    if (index > -1) {
      this.invoice.controls.lineItems.removeAt(index);
    }
  }

  addLineItem() {
    this.invoice.controls.lineItems.push(
      this.fb.group({
        id: this.fb.control(''),
        description: this.fb.control('', Validators.required),
        quantity: this.fb.control(0, [
          Validators.required,
          Validators.min(1),
          this.utils.wholeNumberValidator,
        ]),
        unitPrice: this.fb.control(0, [
          Validators.required,
          Validators.min(0.01),
          this.maxDecimalPlacesValidator(2),
        ]),
      })
    );
  }

  get isValidForm() {
    const validInvoice = this.invoice.valid && this.selectedCustomer.value !== null;
    const validLineItems = this.invoice.controls.lineItems.controls.every((lineItem) => {
      return lineItem.valid;
    });
    const validDates = this.invoice.value.dueDate! > this.invoice.value.invoiceDate!;

    return validInvoice && validLineItems && validDates;
  }

  get subTotal() {
    return this.invoice.controls.lineItems.controls.reduce((acc, lineItem) => {
      return acc + (lineItem.value.unitPrice || 0) * (lineItem.value.quantity || 0);
    }, 0);
  }

  get gst() {
    return this.invoice.value.gst ? this.subTotal * 0.1 : 0;
  }

  get total() {
    return this.subTotal + this.gst;
  }

  maxDecimalPlacesValidator(maxDecimals: number) {
    return (control: any) => {
      const value = control.value;
      if (value !== null) {
        const decimalPlaces = (value.toString().split('.')[1] || '').length;
        if (decimalPlaces > maxDecimals) {
          return { tooManyDecimals: true };
        }
      }
      return null;
    };
  }

  async updateInvoice() {
    if (!this.isValidForm || !this.selectedCustomer.value?.id) return;

    const payload: InvoiceDetailsType = {
      id: this.invoiceId!,
      //Not needed for update
      invoiceReference: '',
      customerCode: this.selectedCustomer.value.customerCode,
      customerId: this.selectedCustomer.value.id,
      customerName: '',
      companyName: '',
      email: '',
      invoiceDate: this.utils
        .convertUtcToLocal(this.invoice.value.invoiceDate?.toISOString() || '')
        .toISOString(),
      subTotal: this.subTotal * 100,
      dueDate: this.utils
        .convertUtcToLocal(this.invoice.value.dueDate?.toISOString() || '')
        .toISOString(),
      paid: this.invoice.value.paid || false,
      gst: this.invoice.value.gst || false,
      lineItems: (this.invoice.value.lineItems || [])?.map((item) => {
        return {
          ...(item.id && { id: item.id }),
          description: item.description!,
          quantity: item.quantity!,
          unitPrice: item.unitPrice! * 100,
          totalPrice: item.unitPrice! * 100 * item.quantity!,
        };
      }),
    };

    console.log({ payload });

    this.loading.set(true);

    const updateInvoiceResponse = await this.invoiceService.updateInvoice(payload).catch((err) => {
      this.snackbar.error('Failed to update invoice');
      this.loading.set(false);
      return;
    });

    this.loading.set(false);

    if (updateInvoiceResponse?.invoice?.id) {
      this.snackbar.success('Invoice updated successfully!');
      this.router.navigate(['/customers-details', this.selectedCustomer.value.id]);
      return;
    }

    this.snackbar.error('Failed to update invoice');
  }

  openDeleteDialog() {
    this.deleteDialog
      .open(DialogDeleteInvoice, {
        width: '300px',
      })
      .afterClosed()
      .subscribe((result) => {
        console.log(result);
        if (result) {
          this.deleteInvoice();
        }
      });
  }

  async deleteInvoice() {
    if (!this.invoiceId) return;

    this.loading.set(true);

    const deleteInvoiceResponse = await this.invoiceService
      .deleteInvoice(this.invoiceId)
      .catch((err) => {
        this.snackbar.error('Failed to delete invoice');
        this.loading.set(false);
        return;
      });

    this.loading.set(false);

    if (deleteInvoiceResponse?.id) {
      this.snackbar.success('Invoice deleted successfully!');
      this.router.navigate(['/customers-details', this.customerId]);
      return;
    }

    this.snackbar.error('Failed to delete invoice');
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    // console.log('window.innerWidth', window.innerWidth);

    this.screenWidth.set(window.innerWidth);
  }
}

@Component({
  selector: 'dialog-delete-invoice',
  templateUrl: 'dialog-delete-invoice.html',
  imports: [MatButtonModule, MatDialogActions, MatDialogClose, MatDialogTitle, MatDialogContent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogDeleteInvoice {
  readonly dialogRef = inject(MatDialogRef<DialogDeleteInvoice>);
  readonly data = inject<any>(MAT_DIALOG_DATA);

  cancel() {
    this.dialogRef.close();
  }

  confirm() {
    this.dialogRef.close(true);
  }
}
