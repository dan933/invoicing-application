import { Component, HostListener, inject, signal, LOCALE_ID, OnInit } from '@angular/core';
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
        total: FormControl<number | null>;
      }>
    >([
      this.fb.group({
        description: this.fb.control(''),
        quantity: this.fb.control(0),
        unitPrice: this.fb.control(0),
        total: this.fb.control(0),
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
      total: FormControl<number | null>;
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
        description: this.fb.control(''),
        quantity: this.fb.control(0),
        unitPrice: this.fb.control(0),
        total: this.fb.control(0),
      })
    );
  }

  createInvoice() {
    console.log(this.invoice.value);
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    // console.log('window.innerWidth', window.innerWidth);

    this.screenWidth.set(window.innerWidth);
  }
}
