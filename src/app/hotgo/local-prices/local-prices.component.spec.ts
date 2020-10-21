import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LocalPricesComponent } from './local-prices.component';

describe('LocalPricesComponent', () => {
  let component: LocalPricesComponent;
  let fixture: ComponentFixture<LocalPricesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LocalPricesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LocalPricesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
