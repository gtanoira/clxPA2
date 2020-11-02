import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonitorPagoComponent } from './monitor-pago.component';

describe('MonitorPagoComponent', () => {
  let component: MonitorPagoComponent;
  let fixture: ComponentFixture<MonitorPagoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MonitorPagoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MonitorPagoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
