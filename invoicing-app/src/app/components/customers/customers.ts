import { HttpClient } from '@angular/common/http';
import { Component, ViewChild, AfterViewInit, inject, computed } from '@angular/core';
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
  ],
  templateUrl: './customers.html',
  styleUrl: './customers.scss',
})
export class Customers implements AfterViewInit {
  customerService = inject(CustomerService);
  router = inject(Router);
  filter = new FormControl('');
  data: Customer[] = [];
  private _httpClient = inject(HttpClient);
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  showInactiveCustomers = false;

  resultsLength = 0;
  isLoadingResults = true;
  isRateLimitReached = false;

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
    total_count: this.customerService.customers().length,
  }));

  ngAfterViewInit() {
    // If the user changes the sort order, reset back to the first page.
    this.sort.sortChange.subscribe(() => {
      this.paginator.pageIndex = 0;
    });

    this.customerService.getCustomers(
      this.sort.active,
      this.sort.direction,
      this.paginator.pageIndex
    );

    this.isLoadingResults = false;
  }

  onCustomerCreate() {
    this.isLoadingResults = true;

    this.customerService.getCustomers(
      this.sort.active,
      this.sort.direction,
      this.paginator.pageIndex
    );

    this.isLoadingResults = false;
  }

  onCustomerRowClick(row: any) {
    console.log(row);

    this.router.navigate(['/customers-details', row.id]);
  }
}
