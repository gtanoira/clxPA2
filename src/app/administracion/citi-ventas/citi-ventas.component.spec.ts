import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CitiVentasComponent } from './citi-ventas.component';

describe('CitiVentasComponent', () => {
  let component: CitiVentasComponent;
  let fixture: ComponentFixture<CitiVentasComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CitiVentasComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CitiVentasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
