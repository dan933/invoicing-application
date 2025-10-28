import {
  Component,
  HostListener,
  inject,
  signal,
  LOCALE_ID,
  OnInit,
  computed,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  Invoice,
  InvoiceService,
  InvoiceDetails as InvoiceDetailsType,
} from '../../services/invoices/invoice-service';
import { provideNativeDateAdapter } from '@angular/material/core';

import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSlideToggle, MatSlideToggleModule } from '@angular/material/slide-toggle';
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
import { map, Observable, startWith, switchMap } from 'rxjs';
import { AsyncPipe } from '@angular/common';
@Component({
  selector: 'app-invoice-details',
  imports: [
    MatIconModule,
    MatInputModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatNativeDateModule,
    // MatSlideToggle,
    ReactiveFormsModule,
    FormsModule,
    MatAutocompleteModule,
    AsyncPipe,
    MatSlideToggleModule,
  ],
  providers: [provideNativeDateAdapter(), { provide: LOCALE_ID, useValue: 'en-GB' }],
  templateUrl: './new-invoice.html',
  styleUrl: './new-invoice.scss',
})
export class NewInvoice implements OnInit {
  screenWidth = signal(window.innerWidth);

  route = inject(ActivatedRoute);

  invoiceService = inject(InvoiceService);
  customerService = inject(CustomerService);

  fb = inject(FormBuilder);

  selectedCustomer = new FormControl<Customer | null>(null);
  customerFilterOptions: Observable<Customer[]> = new Observable<Customer[]>();
  customerId = this.route.snapshot.paramMap.get('customerId');

  invoice = this.fb.group({
    invoiceDate: [new Date(), Validators.required],
    dueDate: [new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), Validators.required],
    invoiceReference: ['', Validators.required],
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
        quantity: this.fb.control(0, [Validators.required, Validators.min(1)]),
        unitPrice: this.fb.control(0, [Validators.required, Validators.min(0.01)]),
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
      const customer = await this.customerService.getCustomerById(this.customerId).catch((err) => {
        return null;
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
        quantity: this.fb.control(0, [Validators.required, Validators.min(1)]),
        unitPrice: this.fb.control(0, [Validators.required, Validators.min(0.01)]),
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

  createInvoice() {
    if (!this.isValidForm || !this.selectedCustomer.value?.id) return;
    console.log(this.invoice.value);

    const payload = {
      customerId: this.selectedCustomer.value.id,
      invoiceReferenceNumber: this.invoice.value.invoiceReference?.toUpperCase(),
      invoiceDate: this.invoice.value.invoiceDate,
      dueDate: this.invoice.value.dueDate,
      paid: this.invoice.value.paid,
      gst: this.invoice.value.gst,
      lineItems: this.invoice.value.lineItems?.map((item) => {
        return {
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        };
      }),
    };

    console.log('payload', payload);
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    // console.log('window.innerWidth', window.innerWidth);

    this.screenWidth.set(window.innerWidth);
  }
}
