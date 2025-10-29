import { inject, Injectable, signal } from '@angular/core';
import { SortDirection } from '@angular/material/sort';
import { Observable, of as observableOf } from 'rxjs';
import { Api } from '../api/api';
import { environment } from '../../../environments/environment';

export interface CreateInvoiceRequest {
  customerId: string;
  invoiceDate: Date | null | undefined;
  dueDate: Date | null | undefined;
  paid: boolean | null | undefined;
  gst: boolean | null | undefined;
  lineItems:
    | {
        description: string | null | undefined;
        quantity: number | null | undefined;
        unitPrice: number | null | undefined;
        totalPrice: number | null | undefined;
      }[]
    | undefined;
}

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
  api = inject(Api);
  private readonly _invoices = signal<Invoice[]>([]);
  invoices = this._invoices.asReadonly();

  getInvoices(sort: string, order: SortDirection, page: number) {}

  async createInvoice(request: CreateInvoiceRequest): Promise<{ invoice: { id: string } }> {
    const createResponse = await this.api.Post(`${environment.apiUrl}/invoices/create`, request);

    return createResponse;
  }

  getInvoiceById(invoiceId: string): InvoiceDetails | null {
    return null;
  }

  updateInvoice(invoiceDetails: InvoiceDetails) {
    console.log('invoiceDetails', invoiceDetails);
    return observableOf(null);
  }
}
