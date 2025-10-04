import { Injectable, signal } from '@angular/core';
import { SortDirection } from '@angular/material/sort';

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
  private readonly _customers = signal<Customer[]>([]);
  customers = this._customers.asReadonly();

  customerData = {
    items: this._customers.asReadonly(),
    total_count: this._customers().length,
  };

  getCustomers(sort: string, order: SortDirection, page: number): void {
    // const href = 'https://api.github.com/search/issues';
    // const requestUrl = `${href}?q=repo:angular/components&sort=${sort}&order=${order}&page=${
    //   page + 1
    // }`;

    if (!this.customers()?.length) {
      let customers: Customer[] = [
        {
          id: '1',
          customerCode: 'CUST001',
          firstName: 'John',
          lastName: 'Doe',
          company: 'Acme Corp',
          email: 'john.doe@acme.com',
          activeStatus: true,
        },
        {
          id: '2',
          customerCode: 'CUST002',
          firstName: 'Jane',
          lastName: 'Smith',
          company: 'Tech Solutions',
          email: 'jane.smith@tech.com',
          activeStatus: false,
        },
      ];

      this._customers.set(customers);
    }
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
