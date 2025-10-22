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
    pageSize: number
  ): Promise<{
    items: Customer[];
    total_count: number;
  }> {
    const customersResponse = await this.api.Post(`${environment.apiUrl}/customers/list`, {
      sortColumn: sort,
      sortDirection: order,
      page: page + 1,
      pageSize,
    });

    const customers = customersResponse?.data || [];
    const total_count = customersResponse?.total_count || 0;

    this._customers.set(customers);
    this._total_count.set(total_count);

    return customersResponse;
  }

  addCustomer(newCustomer: Customer) {
    this._customers.update((customers) => [...customers, newCustomer]);
  }

  getCustomerById(id: string) {
    return this.customers().find((customer) => customer.id === id) || null;
  }

  editCustomer(customer: Customer) {
    this._customers.update((customers) =>
      customers.map((c) => (c.id === customer.id ? customer : c))
    );
  }

  DeleteCustomer(customerCode: string) {
    this._customers.update((customers) => customers.filter((c) => c.customerCode !== customerCode));
  }
}
