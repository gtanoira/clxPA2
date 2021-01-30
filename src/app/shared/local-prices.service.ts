import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';

// Environment
import { environment } from 'src/environments/environment';
// Models & Interfaces
import { Page, PageRequest } from './datasource/page.interfaces';
import { ProductLocalPriceModel } from '../models/product-local-price.model';

interface GetAllByFilterParams {
  duration?: string;
  sortField?: string;
  sortDirection?: string;
  pageIndex?: number;
  recsPerPage?: number;
}

export interface SearchQuery {
  search: string;
}

@Injectable()
export class LocalPricesService {

  // Cache for Retrieved records
  public allRecords: ProductLocalPriceModel[] = [];

  constructor(
    private http: HttpClient
  ) {}

  // Delete a batch
  /* public deleteBatch(id: number): Observable<{[key: string]: any}> {
    return this.http.delete<ProductLocalPriceModel>(`${environment.envData.hotgoBackendServer}/api/batchs/${id}`);
  }
 */
  // Select all batchs to delete
  /* public filterBatchsForDeletion(id: number): boolean {
    try {
      // Find batchs to delete
      const batchSelected = this.allRecords.find(batch => batch.id === id);
      const filteredBatchs = this.allRecords.filter(
        (batch) => batch.channelName === batchSelected.channelName && batch.firstEvent >= batchSelected.firstEvent
      );
      this.allRecords = filteredBatchs;
      return true;
    } catch (error) {
      return false;
    }
  } */

  // Get all Batchs
  public getAll(): Observable<number> {
    return this.http.get<ProductLocalPriceModel[]>(`${environment.envData.hotgoBackendServer}/api2/product_local_prices`)
    .pipe(
      map(data => {
        this.allRecords = data;
        return data.length;
      })
    );
  }

  // Get all Batchs with filters (NOT USE, keep for future use)
  public getAllByFilter(
    { duration, sortField, sortDirection, pageIndex, recsPerPage }: GetAllByFilterParams
  ): void {
    let qParams = '';
    if (duration && duration !== '') {
      qParams = qParams + (qParams !== '' ? '&' : '') + `duration=${duration}`;
    }
    if (sortField && sortField !== '') {
      qParams = qParams + (qParams !== '' ? '&' : '') + `sort_field=${sortField}`;
    }
    if (sortDirection && sortDirection !== '') {
      qParams = qParams + (qParams !== '' ? '&' : '') + `sort_direction=${sortDirection}`;
    }
    if (pageIndex) {
      qParams = qParams + (qParams !== '' ? '&' : '') + `page_no=${pageIndex <= 0 ? 1 : pageIndex}`;
    }
    if (recsPerPage) {
      qParams = qParams + (qParams !== '' ? '&' : '') + `recs_page=${recsPerPage <= 0 ? 100 : recsPerPage}`;
    }
    this.http.get<ProductLocalPriceModel[]>(`${environment.envData.hotgoBackendServer}/api2/product_local_prices?${qParams}`)
    .pipe(
      map(data => {
        this.allRecords = data;
      })
    );
  }

  // Get all Batchs
  public getPage(
    request: PageRequest<ProductLocalPriceModel>,
    query: SearchQuery
  ): Observable<Page<ProductLocalPriceModel>> {

    if (this.allRecords.length > 0) {
      // Filtering
      let filteredBatchs = this.allRecords;
      let { search } = query;
      if (search) {
        search = search.toLowerCase();
        filteredBatchs = filteredBatchs.filter(
          ({ country, duration }) =>
            country.toLowerCase().includes(search) ||
            duration.toString().toLowerCase().includes(search)
        );
      }

      // Sorting
      filteredBatchs = [...filteredBatchs].sort((a, b) => {
        const propA = a[request.sort.property];
        const propB = b[request.sort.property];
        let result: any;
        if (typeof propA === 'string') {
          result = propA.toLowerCase().localeCompare(propB.toString().toLowerCase());
        } else {
          result = propA as any - (propB as any);
        }
        const factor = request.sort.order === 'asc' ? 1 : -1;
        return result * factor;
      });

      // Return value
      const start = request.page * request.size;
      const end = start + request.size;
      const pageUsers = filteredBatchs.slice(start, end);
      const page = {
        content: pageUsers,
        number: request.page,
        size: pageUsers.length,
        totalElements: filteredBatchs.length
      };
      return of(page).pipe(delay(500));

    } else {
      const page = {
        content: [],
        number: 0,
        size: 0,
        totalElements: 0
      };
      return of(page);
    }
  }

  // Get the total records in the DBase table (NO SE USA)
  public getTotalRecords(): Observable<number> {
    return this.http.get<{[key: string]: number}>(`${environment.envData.hotgoBackendServer}/api2/product_local_prices/total`)
    .pipe(map(
      data => data.total
    ));
  }
}

