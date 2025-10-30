import { Component, HostListener, inject, signal, LOCALE_ID, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  InvoiceService,
  InvoiceDetails as InvoiceDetailsType,
} from '../../services/invoices/invoice-service';
import { DateAdapter, provideNativeDateAdapter } from '@angular/material/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';

import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { FormsModule } from '@angular/forms';

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
    MatSlideToggle,
    FormsModule,
    ReactiveFormsModule,
  ],
  providers: [provideNativeDateAdapter(), { provide: LOCALE_ID, useValue: 'en-GB' }],
  templateUrl: './invoice-details.html',
  styleUrl: './invoice-details.scss',
})
export class InvoiceDetails implements OnInit {
  constructor(private dateAdapter: DateAdapter<Date>) {
    this.dateAdapter.setLocale('en-GB');
  }

  fb = inject(FormBuilder);

  form = this.fb.group({
    invoiceDate: [new Date(), Validators.required],
    customerCode: ['', Validators.required],
    customerName: ['', Validators.required],
    companyName: ['', Validators.required],
    email: ['', Validators.required],
    invoiceReference: ['', Validators.required],
    subTotal: [0, Validators.required],
    gst: [false],
    paid: [false],
    lineItems: this.fb.array([]),
  });

  get lineItems() {
    return this.form.get('lineItems') as FormArray;
  }

  createLineItem(): FormGroup {
    return this.fb.group({
      description: ['', Validators.required],
      quantity: ['', Validators.required],
      unitPrice: ['', Validators.required],
      total: ['', Validators.required],
    });
  }

  setGst(event: any) {
    const checked = event?.checked;
    console.log('checked', checked);

    this.invoice.update((invoice) => {
      if (invoice) {
        return {
          ...invoice,
          gst: checked,
        };
      } else {
        return null;
      }
    });
  }
  screenWidth = signal(window.innerWidth);
  route = inject(ActivatedRoute);
  invoiceService = inject(InvoiceService);
  invoiceId = this.route.snapshot.paramMap.get('id');
  invoice = signal<InvoiceDetailsType | null>(null);
  newLineItem = signal<InvoiceDetailsType['lineItems'][0]>({
    description: '',
    quantity: 0,
    unitPrice: 0,
    total: 0,
  });

  ngOnInit(): void {
    if (this.invoiceId) {
      const invoice = this.invoiceService.getInvoiceById(this.invoiceId);
      if (invoice) {
        console.log('invoice', invoice);

        this.form.patchValue({
          invoiceDate: invoice?.invoiceDate ? new Date(invoice?.invoiceDate) : new Date(),
          customerCode: invoice.customerCode,
          customerName: invoice.customerName,
          companyName: invoice.companyName,
          subTotal: invoice.subTotal,
          invoiceReference: invoice.invoiceReference,
          email: invoice.email,
          gst: invoice.gst,
          paid: invoice.paid,
          lineItems: invoice.lineItems,
        });

        // this.invoice.set(invoice);
      }
    }
  }

  updateInvoiceDate(event: any) {
    const date = event.value;
    console.log(date);
    this.invoice.update((invoice) => {
      if (invoice) {
        invoice.invoiceDate = date;
      }
      return invoice;
    });
  }

  removeLineItem(index: number) {
    this.invoice.update((invoice) => {
      if (!invoice) return null;
      let lineItems = invoice?.lineItems || [];

      lineItems = lineItems.filter((item, itemIndex) => {
        if (index !== itemIndex) {
          return true;
        }

        return false;
      });

      return {
        ...invoice,
        lineItems: lineItems,
      };
    });
  }

  updateLineItem(index: number, field: string, event: any) {
    const value = event.target.value;

    this.invoice.update((invoice) => {
      if (!invoice) return null;
      let lineItems = invoice?.lineItems || [];

      lineItems = lineItems.map((item, itemIndex) => {
        if (itemIndex === index) {
          if (field === 'unitPrice') {
            item.total = item.quantity * +value;
          }

          return { ...item, [field]: value };
          // return item;
        } else {
          return item;
        }
      });

      return {
        ...invoice,
        lineItems: lineItems,
      };
    });
  }

  updateNewLineItem(field: string, event: any) {
    const value = event.target.value;

    this.newLineItem.update((lineItem) => {
      return {
        ...lineItem,
        [field]: value,
      };
    });
  }

  addLineItem() {
    this.invoice.update((invoice) => {
      if (!invoice) return null;
      let lineItems = invoice?.lineItems || [];

      lineItems = [
        ...lineItems,
        {
          ...this.newLineItem(),
          total: this.newLineItem().quantity * this.newLineItem().unitPrice,
        },
      ];

      return {
        ...invoice,
        lineItems: lineItems,
      };
    });

    this.newLineItem.set({
      description: '',
      quantity: 0,
      unitPrice: 0,
      total: 0,
    });
  }

  saveInvoice() {
    const invoiceData = this.invoice();
    if (invoiceData) {
      this.invoiceService.updateInvoice(invoiceData).subscribe(() => {
        console.log('Invoice saved successfully');
      });
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    // console.log('window.innerWidth', window.innerWidth);

    this.screenWidth.set(window.innerWidth);
  }
}
