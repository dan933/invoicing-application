import { HttpClient } from '@angular/common/http';
import { Component, ViewChild, AfterViewInit, inject, Injectable, signal } from '@angular/core';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule, SortDirection } from '@angular/material/sort';
import { merge, Observable, of as observableOf } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DatePipe } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-customers',
  imports: [
    MatProgressSpinnerModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    // DatePipe,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatInputModule,
    MatSlideToggleModule,
    FormsModule,
  ],
  templateUrl: './customers.html',
  styleUrl: './customers.scss',
})
export class Customers implements AfterViewInit {
  router = inject(Router);
  filter = new FormControl('');
  private _httpClient = inject(HttpClient);
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  showInactiveCustomers = false;

  customerData!: HttpDatabase | null;
  data: Customer[] = [];

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

  ngAfterViewInit() {
    this.customerData = new HttpDatabase(this._httpClient);

    // If the user changes the sort order, reset back to the first page.
    this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));

    setTimeout(() => {
      merge(this.sort.sortChange, this.paginator.page)
        .pipe(
          startWith({}),
          switchMap(() => {
            this.isLoadingResults = true;
            return this.customerData!.getCustomers(
              this.sort.active,
              this.sort.direction,
              this.paginator.pageIndex
            ).pipe(catchError(() => observableOf(null)));
          }),
          map((data) => {
            // Flip flag to show that loading has finished.
            this.isLoadingResults = false;
            this.isRateLimitReached = data === null;

            if (data === null) {
              return [];
            }

            // Only refresh the result length if there is new data. In case of rate
            // limit errors, we do not want to reset the paginator to zero, as that
            // would prevent users from re-triggering requests.
            this.resultsLength = data.total_count;
            return data.items;
          })
        )
        .subscribe((data) => (this.data = data));
    });
  }

  onCustomerRowClick(row: any) {
    console.log(row);

    this.router.navigate(['/customers-details', row.id]);
  }
}

export interface CustomersApi {
  items: Customer[];
  total_count: number;
}

export interface Customer {
  id: string;
  customerCode: string;
  firstName: string;
  lastName: string;
  company: string;
  email: string;
  activeStatus: boolean;
}

/** An example database that the data source uses to retrieve data for the table. */
@Injectable({ providedIn: 'root' })
export class HttpDatabase {
  constructor(private _httpClient: HttpClient) {}

  getCustomers(sort: string, order: SortDirection, page: number): Observable<CustomersApi> {
    // const href = 'https://api.github.com/search/issues';
    // const requestUrl = `${href}?q=repo:angular/components&sort=${sort}&order=${order}&page=${
    //   page + 1
    // }`;

    return observableOf({
      items: [
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
      ],
      total_count: 2,
    });
  }
}
