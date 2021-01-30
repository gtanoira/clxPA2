import { Observable } from 'rxjs';

// Sorting to be applied
export interface Sort {
  property: string;
  order: 'asc' | 'desc';
}

// Is what we'll eventually pass to a service which in turn will kick off a corresponding HTTP request
export interface PageRequest<T> {
  page: number;
  size: number;
  sort?: Sort;
}

// Requested Data (items to be displayed in the screen)
export interface Page<T> {
  content: T[];
  totalElements: number;
  size: number;
  number: number;
}

// Is a function accepting a PageRequest<T> and returning an RxJS stream aka. observable
// containing a corresponding Page<T>
export type PaginatedEndpoint<T, Q> = (req: PageRequest<T>, query: Q) => Observable<Page<T>>;
