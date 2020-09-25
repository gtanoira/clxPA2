/*
   Este servicio ofrece los métodos necesarios para autenticar a los usuarios contra una Active Directory (AD) de
   Microsoft via el protocolo LDAP, contra un backend en Django on Python
   Este servicio llama se conecta via una API al Django quien es el que luego realiza la autenticación del usuario
   a través del LDAP.
*/
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Router } from '@angular/router';

// Models
import { User } from 'src/app/models/user';

// Environment
import { environment } from 'src/environments/environment';

// Services
import { ErrorMessageService } from './error-message.service';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {

  private currentUserSubject: BehaviorSubject<User>;
  public currentUser: Observable<User>;

  constructor(
    private errorMessageService: ErrorMessageService,
    private http: HttpClient,
    private router: Router
  ) {
    this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(sessionStorage.getItem('currentUser')));
    this.currentUser = this.currentUserSubject.asObservable();
  }

  // GETTERS
  public get currentUserValue(): User {
    return this.currentUserSubject.value;
  }

  // LOGIN y AUTENTICACION del usuario que se quiere loguear
  public login(username: string, password: string): Observable<User> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': 'Basic ' + btoa(username + ':' + password)
      })
    };
    return this.http.get<User>(`${environment.envData.loginServer}/api2/ldap/portaladmin_v2`, httpOptions)
      .pipe(
        map(
          data => {
            // login successful
            if (data) {
              // Recuperar los datos obtenidos del LDAP server
              const user: User = {
                id:             data.id,
                userName:       data.userName,
                firstName:      data.firstName,
                lastName:       data.lastName,
                fullName:       `${data.firstName}, ${data.lastName}`,
                sessionKey:     data.sessionKey,
                authorizations: data['authorizations']
              };
              // store user details in local storage to keep user logged in between page refreshes
              sessionStorage.setItem('currentUser', JSON.stringify(user));
              this.currentUserSubject.next(user);
            }
            return data;
          }
        ),
        catchError(
          err => {
            if (err.statusText === 'Unknown Error') {
              return throwError(`API-0011(E): no se pudo acceder la api ${err.url}`);
            } else {
              return throwError(err);
            }
          }
        )

    );
  }

  public logout() {
    // Remover los datos del usuario del sessionStorage
    sessionStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    // Cerrar la sesion en el Login Central
    this.http.get<any>(`${environment.envData.loginServer}/api2/logout`)
      .subscribe();
    // Set Program Title
    this.errorMessageService.changeAppProgramTitle('Login');
    // Ir al Login
    this.router.navigate(['/login']);
  }
}
