import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MissingRecordsComponent } from './missing-records.component';

describe('MissingRecordsComponent', () => {
  let component: MissingRecordsComponent;
  let fixture: ComponentFixture<MissingRecordsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MissingRecordsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MissingRecordsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
