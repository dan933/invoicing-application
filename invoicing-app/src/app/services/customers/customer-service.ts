import { inject, Injectable, signal } from '@angular/core';
import { SortDirection } from '@angular/material/sort';
import { Auth } from '../auth/auth';
import { environment } from '../../../environments/environment';
import { Api } from '../api/api';

export interface Customer {
  id: string;
  customerCode: string;
  firstName: string;
  lastName: string;
  company: string;
  email: string;
  outstandingCount?: number;
  overdueCount?: number;
  activeStatus: boolean;
}

export interface CustomersResponse {
  items: Customer[];
  total_count: number;
}

@Injectable({
  providedIn: 'root',
})
export class CustomerService {
  auth = inject(Auth);
  api = inject(Api);
  private readonly _customers = signal<Customer[]>([]);
  private readonly _total_count = signal<number>(0);

  customers = this._customers.asReadonly();
  total_count = this._total_count.asReadonly();

  customerData = {
    items: this._customers.asReadonly(),
    total_count: this._total_count.asReadonly(),
  };

  async getCustomers(
    sort: string,
    order: SortDirection,
    page: number,
    pageSize: number,
    filter?: string | null,
    showActiveCustomers?: boolean | null
  ): Promise<{
    items: Customer[];
    total_count: number;
  }> {
    const customersResponse = await this.api.Post(`${environment.apiUrl}/customers/summary/list`, {
      sortColumn: sort,
      sortDirection: order,
      page: page + 1,
      pageSize,
      ...(filter && {
        search: filter,
      }),
      activeStatus: showActiveCustomers,
    });

    const customers = customersResponse?.data || [];
    const total_count = customersResponse?.pagination?.totalPages || 0;

    this._customers.set(customers);
    this._total_count.set(total_count);

    return customersResponse;
  }

  async searchCustomers(
    filter?: string | null,
    showActiveCustomers?: boolean | null
  ): Promise<Customer[]> {
    const customersResponse = await this.api.Post(`${environment.apiUrl}/customers/summary/list`, {
      sortColumn: 'customerCode',
      sortDirection: 'desc',
      page: 1,
      pageSize: 30,
      ...(filter && {
        search: filter,
      }),
      activeStatus: showActiveCustomers,
    });

    const customers = customersResponse?.data || [];

    return customers;
  }

  async addCustomer(newCustomer: {
    customerCode: string;
    firstName: string;
    lastName: string;
    company: string;
    email: string;
    activeStatus: boolean;
  }) {
    return await this.api.Post(`${environment.apiUrl}/customers/create`, {
      ...newCustomer,
    });
  }

  async getCustomerById(id: string): Promise<Customer> {
    return await this.api.Get(`${environment.apiUrl}/customers/get/${id}`).catch((error) => {
      console.log(error);
      return null;
    });
  }

  async editCustomer(customer: Customer) {
    return await this.api.Post(`${environment.apiUrl}/customers/update/${customer.id}`, {
      ...customer,
    });
  }

  async DeleteCustomer(customerId: string) {
    await this.api.Delete(`${environment.apiUrl}/customers/delete/${customerId}`);

    this._customers.update((customers) => customers.filter((c) => c.id !== customerId));
  }
}
