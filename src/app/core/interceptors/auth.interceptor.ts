/*
  Esta rutina intercepta todos los HTTP REQUESTS que tengan /api en el URL, realizando lo siguiente:
  1) agrega un "Authorization Bearer ...." con el id de sesión enviada por el backend
*/
import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';

// Services
import { AuthenticationService } from '../authentication.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(
    private authenticationService: AuthenticationService
   ) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    // All API calls
    if (this.authenticationService.currentUserValue && req.url.includes('/api')) {
      const userData = JSON.parse(sessionStorage.getItem('currentUser'));
      const sessionKey = userData.sessionKey;

      if (sessionKey) {
        const newReq = req.clone({
          headers: req.headers.append('Authorization', `Bearer ${sessionKey}`)
        });
        return next.handle(newReq);
      }
    }

    return next.handle(req);
  }
}

