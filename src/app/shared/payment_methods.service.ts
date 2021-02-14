import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';

// Environment
import { environment } from 'src/environments/environment';
// Models & Interfaces
import { PaymentMethodModel } from '../models/payment-method.model';
interface GetAllByFilterParams {
  country?: string;
  sortField?: string;
  sortDirection?: string;
  pageIndex?: number;
  recsPerPage?: number;
}

@Injectable()
export class PaymentMethodsService {

  constructor(
    private http: HttpClient
  ) {}

  // Get all Batchs with filters (NOT USE, keep for future use)
  public getRecords(
    { country, sortField, sortDirection, pageIndex, recsPerPage }: GetAllByFilterParams
  ): Observable<PaymentMethodModel[]> {
    let qParams = '';
    if (country && country !== '') {
      qParams = qParams + (qParams !== '' ? '&' : '') + `country=${country}`;
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
    return this.http.get<PaymentMethodModel[]>(`${environment.envData.hotgoBackendServer}/api2/payment_methods?${qParams}`);
  }
}

