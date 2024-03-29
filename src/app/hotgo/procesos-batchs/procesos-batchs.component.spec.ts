import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ProcesosBatchsComponent } from './procesos-batchs.component';

describe('ProcesosBatchComponent', () => {
  let component: ProcesosBatchsComponent;
  let fixture: ComponentFixture<ProcesosBatchsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ProcesosBatchsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProcesosBatchsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
