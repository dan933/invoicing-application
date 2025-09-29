import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, HostListener, inject, signal, ViewChild } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSort, MatSortModule, SortDirection } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { catchError, map, merge, Observable, of as observableOf, startWith, switchMap } from 'rxjs';

@Component({
  selector: 'app-customer-details',
  imports: [
    MatIconModule,
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
  templateUrl: './customer-details.html',
  styleUrl: './customer-details.scss',
})
export class CustomerDetails implements AfterViewInit {
  screenWidth = signal(window.innerWidth);

  private _httpClient = inject(HttpClient);
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  invoiceData!: HttpDatabase | null;
  data: Invoice[] = [];

  displayedColumns: string[] = ['invoiceNumber', 'date', 'subTotal', 'paid', 'gst'];

  resultsLength = 0;
  isLoadingResults = true;
  isRateLimitReached = false;

  ngAfterViewInit() {
    this.invoiceData = new HttpDatabase(this._httpClient);

    // If the user changes the sort order, reset back to the first page.
    this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));

    setTimeout(() => {
      merge(this.sort.sortChange, this.paginator.page)
        .pipe(
          startWith({}),
          switchMap(() => {
            this.isLoadingResults = true;
            return this.invoiceData!.getInvoices(
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

  onInvoiceRowClick(invoiceId: string) {}

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    // console.log('window.innerWidth', window.innerWidth);

    this.screenWidth.set(window.innerWidth);
  }
}

export interface InvoiceApi {
  items: Invoice[];
  total_count: number;
}

export interface Invoice {
  id: string;
  invoiceReference: string;
  invoiceDate: string;
  subTotal: string;
  paid: boolean;
  gst: boolean;
}

export class HttpDatabase {
  constructor(private _httpClient: HttpClient) {}

  getInvoices(sort: string, order: SortDirection, page: number): Observable<InvoiceApi> {
    // const href = 'https://api.github.com/search/issues';
    // const requestUrl = `${href}?q=repo:angular/components&sort=${sort}&order=${order}&page=${
    //   page + 1
    // }`;

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

    return observableOf(invoiceData);
  }
}
