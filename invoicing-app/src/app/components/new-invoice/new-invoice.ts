import { Component, HostListener, inject, signal, LOCALE_ID } from '@angular/core';
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
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { FormsModule } from '@angular/forms';
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
  ],
  providers: [provideNativeDateAdapter(), { provide: LOCALE_ID, useValue: 'en-GB' }],
  templateUrl: './new-invoice.html',
  styleUrl: './new-invoice.scss',
})
export class NewInvoice {
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

  constructor() {}

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
