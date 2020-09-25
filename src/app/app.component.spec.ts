import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MatMenuModule } from '@angular/material/menu';
import { getTestScheduler, cold } from 'jasmine-marbles';

import { HttpTestingController, HttpClientTestingModule } from '@angular/common/http/testing';
// import { ErrorMessageService } from '../shared/error-message.service';
import { AuthenticationService } from './core/authentication.service';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';
import { Router } from '@angular/router';
import { delay } from 'rxjs/operators';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let errorMessageService: ErrorMessageService;
  // let httpTestingController: HttpTestingController;

  beforeEach(async(() => {
    /* const elementRefStub = () => ({
      nativeElement: {
        ownerDocument: { body: { style: { backgroundColor: {} } } }
      }
    });
    const domSanitizerStub = () => ({
      bypassSecurityTrustResourceUrl: string => ({})
    });
    // const matIconRegistryStub = () => ({ addSvgIcon: (string, arg) => ({}) });
    const errorMessageServiceStub = () => ({
      formCurrentMessage: { subscribe: f => f({}) },
      currentProgramTitle: { subscribe: f => f({}) },
      changeErrorMessage: arg => ({})
    });
    const authenticationServiceStub = () => ({
      currentUser: { subscribe: f => f({}) }
    }); */

    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        MatMenuModule,
        RouterTestingModule,
      ],
      schemas: [NO_ERRORS_SCHEMA],
      declarations: [AppComponent],
      providers: [
        ErrorMessageService,
        // AuthenticationService
      ]
    })
    .compileComponents()
    .then(() => {
      fixture = TestBed.createComponent(AppComponent);
      component = fixture.componentInstance;
      errorMessageService = TestBed.get(ErrorMessageService);
    });
  }));

  it('el componente appComponent es instanciado', () => {
    expect(component).toBeTruthy();
  });

  it(`los errores pueden ser capturados`, (done: DoneFn) => {
    component.errorMessageService.changeErrorMessage('Error Capturado');
    fixture.detectChanges();
    setTimeout(() => {
      console.log(fixture.q);
      expect(component.formErrorMessage).toEqual('Error Capturado');
      done();
    }, 500);
  });

});
