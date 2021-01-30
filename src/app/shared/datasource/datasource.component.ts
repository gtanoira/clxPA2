import { DataSource } from '@angular/cdk/collections';
import { Subject, Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { startWith, switchMap, share, pluck } from 'rxjs/operators';
// Datasource
import { indicate } from './operators';
// Interfaces
import { Page, Sort, PaginatedEndpoint } from './page.interfaces';

export interface SimpleDataSource<T> extends DataSource<T> {
  connect(): Observable<T[]>;
  disconnect(): void;
}

export class PaginatedDataSource<T, Q> implements SimpleDataSource<T> {

  // Variables
  private pageNumber = new Subject<number>();  // for any change in the page index of the table
  private sort = new Subject<Sort>();  // For any change in the sort of the table
  private query: BehaviorSubject<Q>;  // For any changes in the query of the table

  // spinner
  private loading = new Subject<boolean>();
  public loading$ = this.loading.asObservable();

  // Data (items) requested
  public page$: Observable<Page<T>>;

  constructor(
    public endpoint: PaginatedEndpoint<T, Q>,
    initialSort: Sort,
    initialQuery: Q,
    public pageSize = 20
  ) {

    // Set the observable to whatch for query and sort changes
    this.query = new BehaviorSubject<Q>(initialQuery);
    this.sort = new BehaviorSubject<Sort>(initialSort);
    const param$ = combineLatest([this.query, this.sort]);
    // Get the new page of items
    this.page$ = param$.pipe(
      switchMap(([query, sort]) => this.pageNumber.pipe(
        startWith(0),
        switchMap(page =>
          this.endpoint({page, size: this.pageSize, sort}, query)
          .pipe(indicate(this.loading))
        )
      )),
      share()
    );
  }

  // Sort the items by a certain field
  public sortBy(sort: Sort): void {
    this.sort.next(sort);
  }

  queryBy(query: Partial<Q>): void {
    const lastQuery = this.query.getValue();
    const nextQuery = {...lastQuery, ...query};
    this.query.next(nextQuery);
  }
  // Fetch a page of items
  public fetch(page: number): void {
    this.pageNumber.next(page);
  }

  public connect(): Observable<T[]> {
    return this.page$.pipe(pluck('content'));
  }

  public disconnect(): void {}
}
