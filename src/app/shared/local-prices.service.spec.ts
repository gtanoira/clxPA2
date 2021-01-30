import { TestBed } from '@angular/core/testing';

import { LocalPricesService } from './local-prices.service';

describe('LocalPricesService', () => {
  let service: LocalPricesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LocalPricesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
