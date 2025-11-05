import { HttpClient } from '@angular/common/http';
import { Component, ViewChild, AfterViewInit, inject, computed, signal } from '@angular/core';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule, SortDirection } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NewCustomer } from './new-customer/new-customer';
import { Customer, CustomerService } from '../../services/customers/customer-service';
import { debounceTime } from 'rxjs/operators';
import { MatGridListModule } from '@angular/material/grid-list';
import { InvoiceService } from '../../services/invoices/invoice-service';

@Component({
  selector: 'app-customers',
  imports: [
    MatProgressSpinnerModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatInputModule,
    MatSlideToggleModule,
    FormsModule,
    NewCustomer,
    MatGridListModule,
  ],
  templateUrl: './customers.html',
  styleUrl: './customers.scss',
})
export class Customers implements AfterViewInit {
  customerService = inject(CustomerService);
  invoiceService = inject(InvoiceService);

  router = inject(Router);

  filter = new FormControl('');

  data: Customer[] = [];

  invoiceCountLoading = signal(false);
  invoiceCount = signal<{
    outstandingCount: number;
    overdueCount: number;
  } | null>(null);

  private _httpClient = inject(HttpClient);
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  showActiveCustomers = true;

  resultsLength = 0;
  isLoadingResults = signal(true);
  isRateLimitReached = signal(false);

  displayedColumns: string[] = [
    'customerCode',
    'firstName',
    'lastName',
    'company',
    'email',
    'activeStatus',
  ];

  customerData = computed(() => ({
    items: this.customerService.customers(),
    total_count: this.customerService.total_count(),
  }));

  onToggleChange() {
    this.paginator.pageIndex = 0;
    this.isLoadingResults.set(true);
    this.loadCustomers();
  }

  loadCustomers() {
    this.customerService
      .getCustomers(
        this.sort.active,
        this.sort.direction,
        this.paginator.pageIndex,
        this.paginator.pageSize,
        this.filter.value,
        this.showActiveCustomers
      )
      .finally(() => {
        this.isLoadingResults.set(false);
      });
  }

  constructor() {
    this.invoiceCountLoading.set(true);
    this.invoiceService
      .getInvoiceCount()
      .then((resp) => {
        this.invoiceCount.set(resp);
      })
      .finally(() => {
        this.invoiceCountLoading.set(false);
      });
  }

  ngAfterViewInit() {
    // If the user changes the sort order, reset back to the first page.
    this.sort.sortChange.subscribe(() => {
      this.isLoadingResults.set(true);
      this.paginator.pageIndex = 0;

      this.loadCustomers();
    });

    // Listen for page changes
    this.paginator.page.subscribe(() => {
      this.isLoadingResults.set(true);
      this.loadCustomers();
    });

    // Debounced filter changes
    this.filter.valueChanges.pipe(debounceTime(300)).subscribe(() => {
      this.paginator.pageIndex = 0;
      this.isLoadingResults.set(true);
      this.loadCustomers();
    });

    this.loadCustomers();
  }

  onCustomerCreate() {
    this.isLoadingResults.set(true);

    this.loadCustomers();
  }

  onCustomerRowClick(row: any) {
    this.router.navigate(['/customers-details', row.id]);
  }
}
