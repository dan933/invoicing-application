import { HttpClient } from '@angular/common/http';
import {
  AfterViewInit,
  Component,
  HostListener,
  Inject,
  inject,
  signal,
  ViewChild,
} from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { catchError, map, merge, Observable, of as observableOf, startWith, switchMap } from 'rxjs';
import { Invoice, InvoiceApi, InvoiceService } from '../../../services/invoices/invoice-service';
import { EditCustomer } from '../edit-customer/edit-customer';
import { Customer, CustomerService } from '../../../services/customers/customer-service';
import { ActivatedRoute, Router } from '@angular/router';
import { DeleteCustomer } from '../delete-customer/delete-customer';

@Component({
  selector: 'app-customer-details',
  imports: [
    MatIconModule,
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
    EditCustomer,
    DeleteCustomer,
  ],
  templateUrl: './customer-details.html',
  styleUrl: './customer-details.scss',
})
export class CustomerDetails implements AfterViewInit {
  screenWidth = signal(window.innerWidth);
  invoiceService = inject(InvoiceService);
  customerService = inject(CustomerService);
  route = inject(ActivatedRoute);
  router = inject(Router);

  private _httpClient = inject(HttpClient);
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  invoiceData!: HttpDatabase | null;
  data: Invoice[] = [];
  customer: Customer | null = null;

  displayedColumns: string[] = ['invoiceNumber', 'date', 'subTotal', 'paid', 'gst'];

  resultsLength = 0;
  isLoadingResults = true;
  isRateLimitReached = false;

  constructor() {
    this.getCustomer();
  }

  ngAfterViewInit() {
    this.invoiceData = new HttpDatabase(this._httpClient);

    // If the user changes the sort order, reset back to the first page.
    this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));

    setTimeout(() => {
      merge(this.sort.sortChange, this.paginator.page)
        .pipe(
          startWith({}),
          switchMap((): Observable<InvoiceApi | null> => {
            this.isLoadingResults = true;
            return this.invoiceService
              .getInvoices(this.sort.active, this.sort.direction, this.paginator.pageIndex)
              .pipe(catchError(() => observableOf(null)));
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

  getCustomer() {
    const customerId = this.route.snapshot.paramMap.get('id');
    if (customerId) {
      this.customer = this.customerService.getCustomerById(customerId);
    }
  }

  onInvoiceRowClick(invoiceId: string) {
    console.log('invoiceId', invoiceId);
    this.router.navigate(['/invoices', invoiceId]);
  }

  onCustomerEdit() {
    this.getCustomer();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    // console.log('window.innerWidth', window.innerWidth);

    this.screenWidth.set(window.innerWidth);
  }
}

export class HttpDatabase {
  constructor(private _httpClient: HttpClient) {}
}
