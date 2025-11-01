import { inject, Injectable, signal } from '@angular/core';
import { SortDirection } from '@angular/material/sort';
import { Observable, of as observableOf } from 'rxjs';
import { Api } from '../api/api';
import { environment } from '../../../environments/environment';

export interface CreateInvoiceRequest {
  customerId: string;
  invoiceDate: string | null | undefined;
  dueDate: string | null | undefined;
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

export interface InvoiceSummary {
  id: string;
  invoiceReference: string;
  customerId: string;
  customerCode: string;
  invoiceDate: string;
  subTotal: number;
  paid: boolean;
  gst: boolean;
}

export interface InvoiceSummaryResposne {
  items: InvoiceSummary[];
  total_count: number;
}

export interface InvoiceDetails {
  id: string;
  invoiceReference: string;
  customerCode: string;
  customerId: string;
  customerName: string;
  companyName: string;
  email: string;
  invoiceDate: string;
  dueDate: string;
  subTotal: number;
  paid: boolean;
  gst: boolean;
  lineItems: {
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }[];
}

@Injectable({
  providedIn: 'root',
})
export class InvoiceService {
  api = inject(Api);

  async listInvoices(
    sort: string,
    order: SortDirection,
    page: number,
    search?: string,
    customerId?: string,
    invoiceDateFrom?: string,
    invoiceDateTo?: string
  ): Promise<InvoiceSummaryResposne> {
    return await this.api
      .Post(`${environment.apiUrl}/invoices/list`, {
        sortColumn: sort,
        sortDirection: order,
        pageNumber: page + 1,
        pageSize: 30,
        ...(customerId && {
          customerId: customerId,
        }),
        ...(invoiceDateFrom && {
          invoiceDateFrom: invoiceDateFrom,
        }),
        ...(invoiceDateTo && {
          invoiceDateTo: invoiceDateTo,
        }),
        ...(search && {
          search: search,
        }),
      })
      .then((response) => {
        if (response?.data?.[0]?.id) {
          const invoices = response.data.map(
            (item: {
              company: string;
              customerCode: string;
              customerId: string;
              dueDate: string;
              email: string;
              firstName: string;
              gst: boolean;
              id: string;
              invoiceDate: string;
              invoiceReference: number;
              lastName: string;
              paid: boolean;
              status: 'Active';
              totalPrice: number;
            }) => {
              return {
                id: item.id,
                invoiceReference: `${item.customerCode}-${item.invoiceReference
                  .toString()
                  .padStart(3, '0')}`,
                customerId: item.customerId,
                customerCode: item.customerCode,
                invoiceDate: new Date(item.invoiceDate).toLocaleDateString('en-GB'),
                subTotal: (item.totalPrice / 100).toLocaleString('en-US', {
                  style: 'currency',
                  currency: 'USD',
                }),
                paid: item.paid,
                gst: item.gst,
              };
            }
          );

          const total_count = response.pagination?.totalPages || 0;

          return {
            items: invoices,
            total_count: total_count,
          };
        }

        return {
          items: [],
          total_count: 0,
        };
      });
  }

  async createInvoice(request: CreateInvoiceRequest): Promise<{ invoice: { id: string } }> {
    const createResponse = await this.api.Post(`${environment.apiUrl}/invoices/create`, request);

    return createResponse;
  }

  async getInvoiceById(invoiceId: string): Promise<InvoiceDetails | null> {
    const invoice = this.api.Get(`${environment.apiUrl}/invoices/${invoiceId}`).then((resp) => {
      if (resp?.id) {
        return {
          ...resp,
          invoiceReference: `${resp.customerCode}-${resp.invoiceReference
            .toString()
            .padStart(3, '0')}`,
          amount: resp.subTotal / 100,
          lineItems: resp.lineItems.map((lineItem: any) => {
            return {
              ...lineItem,
              unitPrice: lineItem.unitPrice / 100,
              totalPrice: lineItem.totalPrice / 100,
            };
          }),
        };
      } else {
        return resp;
      }
    });

    console.log('invoice', invoice);

    if (invoice) {
      return invoice;
    }

    return null;
  }

  updateInvoice(invoiceDetails: InvoiceDetails) {
    return this.api.Post(
      `${environment.apiUrl}/invoices/update/${invoiceDetails.id}`,
      invoiceDetails
    );
  }
}
