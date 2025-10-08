import { Injectable, signal } from '@angular/core';
import { SortDirection } from '@angular/material/sort';
import { Observable, of as observableOf } from 'rxjs';

export interface Invoice {
  id: string;
  invoiceReference: string;
  invoiceDate: string;
  subTotal: string;
  paid: boolean;
  gst: boolean;
  lineItems?: {
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
}

export interface InvoiceApi {
  items: Invoice[];
  total_count: number;
}

export interface InvoiceDetails {
  id: string;
  invoiceReference: string;
  customerCode: string;
  customerName: string;
  companyName: string;
  email: string;
  invoiceDate: string;
  subTotal: number;
  paid: boolean;
  gst: boolean;
  lineItems: {
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
}

@Injectable({
  providedIn: 'root',
})
export class InvoiceService {
  private readonly _invoices = signal<Invoice[]>([]);
  invoices = this._invoices.asReadonly();

  getInvoices(sort: string, order: SortDirection, page: number) {
    // const href = 'https://api.github.com/search/issues';
    // const requestUrl = `${href}?q=repo:angular/components&sort=${sort}&order=${order}&page=${
    //   page + 1
    // }`;

    if (!this.invoices()?.length) {
      let invoiceData: InvoiceApi = {
        items: [
          {
            id: '1',
            invoiceReference: 'INV0037',
            invoiceDate: new Date().toLocaleDateString('en-GB', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            }),
            subTotal: (1250.5).toLocaleString('en-US', {
              style: 'currency',
              currency: 'USD',
            }),
            paid: false,
            gst: true,
          },
          {
            id: '2',
            invoiceReference: 'INV0038',
            invoiceDate: new Date().toLocaleDateString('en-GB', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            }),
            subTotal: (1250.5).toLocaleString('en-US', {
              style: 'currency',
              currency: 'USD',
            }),
            paid: true,
            gst: false,
          },
        ],
        total_count: 2,
      };

      this._invoices.set(invoiceData.items);

      return observableOf({ items: invoiceData.items, total_count: 2 });
    }

    return observableOf({ items: this.invoices(), total_count: this.invoices().length });
  }

  createInvoice(invoice: Invoice) {
    this._invoices.update((invoices) => [...invoices, invoice]);
  }

  getInvoiceById(invoiceId: string): InvoiceDetails | null {
    const invoice = this.invoices().find((inv) => inv.id === invoiceId);

    if (invoice) {
      return {
        id: invoice?.id,
        customerCode: 'CUST0001',
        customerName: 'John Doe',
        companyName: 'Acme Corp',
        email: 'john.doe@example.com',
        invoiceReference: invoice?.invoiceReference,
        invoiceDate: invoice?.invoiceDate,
        subTotal: 1250.5,
        paid: invoice?.paid,
        gst: invoice?.gst,
        lineItems: [
          {
            description: 'Software Development',
            quantity: 1,
            unitPrice: 1250.5,
            total: 1250.5,
          },
        ],
      };
    } else {
      return null;
    }
  }

  updateInvoice(invoiceDetails: InvoiceDetails) {
    console.log('invoiceDetails', invoiceDetails);
    return observableOf(null);
  }
}
