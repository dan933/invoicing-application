import { Component, HostListener, inject, signal, LOCALE_ID, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { InvoiceService } from '../../services/invoices/invoice-service';
import { provideNativeDateAdapter } from '@angular/material/core';

import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import {
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  FormGroup,
} from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { Customer, CustomerService } from '../../services/customers/customer-service';
import { Observable, startWith, switchMap } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { SnackbarService } from '../../services/snackbar/snack-bar';
import { Utils } from '../../services/utils/utils';
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
  templateUrl: './new-invoice.html',
  styleUrl: './new-invoice.scss',
})
export class NewInvoice implements OnInit {
  loading = signal(false);
  screenWidth = signal(window.innerWidth);

  route = inject(ActivatedRoute);
  router = inject(Router);

  snackbar = inject(SnackbarService);
  invoiceService = inject(InvoiceService);
  customerService = inject(CustomerService);
  utils = inject(Utils);

  fb = inject(FormBuilder);

  selectedCustomer = new FormControl<Customer | null>(null);
  customerFilterOptions: Observable<Customer[]> = new Observable<Customer[]>();
  customerId = this.route.snapshot.paramMap.get('customerId');

  invoice = this.fb.group({
    invoiceDate: [new Date(), Validators.required],
    dueDate: [new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), Validators.required],
    subTotal: [0, Validators.required],
    gst: [false],
    paid: [false],
    lineItems: this.fb.array<
      FormGroup<{
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
      }),
    ]),
  });

  constructor() {
    this.getCustomer();
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

  async createInvoice() {
    if (!this.isValidForm || !this.selectedCustomer.value?.id) return;

    const payload = {
      customerId: this.selectedCustomer.value.id,
      invoiceDate: this.utils
        .convertUtcToLocal(this.invoice.value.invoiceDate?.toISOString() || '')
        .toISOString(),
      dueDate: this.utils
        .convertUtcToLocal(this.invoice.value.dueDate?.toISOString() || '')
        .toISOString(),
      paid: this.invoice.value.paid,
      gst: this.invoice.value.gst,
      lineItems: this.invoice.value.lineItems?.map((item) => {
        return {
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice! * 100,
          totalPrice: item.unitPrice! * 100 * item.quantity!,
        };
      }),
    };

    this.loading.set(true);

    const createInvoiceResponse = await this.invoiceService
      .createInvoice(payload)
      .catch((err) => {})
      .finally(() => {
        this.loading.set(false);
      });

    if (createInvoiceResponse?.invoice?.id) {
      this.snackbar.success('Invoice created successfully!');
      this.router.navigate(['/customers-details', this.selectedCustomer.value.id]);
      return;
    }

    this.snackbar.error('Failed to create invoice');
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    // console.log('window.innerWidth', window.innerWidth);

    this.screenWidth.set(window.innerWidth);
  }
}
