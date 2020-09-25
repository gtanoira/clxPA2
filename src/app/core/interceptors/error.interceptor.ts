import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Router } from '@angular/router';

// Services
import { AuthenticationService } from '../authentication.service';
import { ErrorMessageService } from '../error-message.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  constructor(
    private authenticationService: AuthenticationService,
    private errorMessageService: ErrorMessageService,
    private router: Router
  ) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request)
      .pipe(
        map(
          res => res
        ),
        catchError(
          err => {
            let error: string;

            // auto logout if 401 Unauthorized returned from api
            if (err.status === 401) {
              this.authenticationService.logout();
              // Print the error message and go to LOGIN
              // this.errorMessageService.changeErrorMessage('API-0033(E):  su sesión a expirado, vuelva a loguearse.');
              // this.router.navigate(['/logout']);
              // location.reload(true);
              error = 'API-0033(E): su sesión a expirado, vuelva a loguearse.';

            // Chequear la conexión con el host
            } else if (err.statusText === 'Unknown Error' || err.status === 0) {
              error = 'API-0036(E): no hay conexión con el host. Error: ' + err.message;
            } else {
              if (err.error) {
                console.log('***ERR:', err.error['message']);
                error = `${err.error['message']} (${err.status})`;
              } else {
                error = err.message || err.statusText;
              }
            }

            return throwError(error);
          }
        )
      );
  }
}
