/*
  El sistema de SEGURIDAD está basado en un objeto de formato JSON, cuya estructura es la siguiente:
  {
    "programId_(i)": {
      // El objecto "menuppal" se acompaña para indicar al programa que lo llamó cómo
      "menuppal": {
        "id": <number>,
        "alias": <string>,
        "title": <string>,
        "group": <string>,
        "color": <string>
      },
      "componentId_(i)": {
        <propertyKey>: <propertyValue>
        "access":      "off",
        "btnSave":     "off"
        "...":         "..."
      },

      "componentId_...": { ...
      }
    },

    "programId_...": { ...
    }
  }

  El JSON se encuentra en el "sessionStorage" en la variable "currentUser.authorizations"

  El concepto es que este JSON determina toda la seguiradad de cada programa o app que se maneje en este
  proyecto Angular.

  La estructura jerárquica es simple:
    1.   Programa ID o APP
    1.1.    Componente ID
    1.1.1      Propiedad / valor
  Y ésta estructura se repite para cada programa que este proyecto maneje.

  ¿Cómo se determina la seguridad?
  Excepto para los programas (programId), la ausencia de un componente (componentId) o propiedad (propertyKey)
  determina que el acceso es TOTAL. En el JSON solo se debe escribir si se quiere RESTRINGIR algo, pero no hace
  falta escribir si se quiere dar acceso.

  Pero para el caso de los programas (programId) es al REVES. El programID debe existir en el JSON si se quiere
  dar acceso al usuario a dicho progama. La ausencia del programa (programID) en el JSON hace que el sistema
  no navegue a dicho programa.

*/

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

// Models
import { Menues } from 'src/app/models/menues';

// Environment
import { environment } from 'src/environments/environment';

// Services
import { AuthenticationService } from './authentication.service';

@Injectable({ providedIn: 'root' })
export class AuthorizationService {

  userData: object = {};  // Info del usuario logueado
  userAuth: object = {};  // Authorizations del usuario

  constructor(
    private authenticationService: AuthenticationService,
    private http: HttpClient,
  ) {}

  // Esta rutina obtiene las authorizations del usuario activo a través de sessionStorage
  getUserAuthorizations() {
    if (this.authenticationService.currentUserValue) {
      this.userData = JSON.parse(sessionStorage.getItem('currentUser'));
      this.userAuth = this.userData['authorizations'];
    } else {
      this.userData = null;
    }
  }

  // Esta rutina determina si se permite el acceso a un programa dentro del proyecto
  programAccess(programId: string): boolean {

    // Asignar FALSE, ya que por defecto, NO se tiene acceso al menos que se especifique lo contrario
    // Para tener acceso a un programa, basta con que el ID del programa figure dentro del JSON
    // de authorizations del usuario
    let retorno = false;

    // Get user authorizations
    this.getUserAuthorizations();

    // Hay un usuario logueado?
    if (this.userData) {

      // Obtener las authorizations del programId
      const programAuthorizations: object = this.userAuth[programId];
      if (programAuthorizations) {

        // Chequear si existe por las dudas la propiedad "access"
        if (programAuthorizations['access'] && programAuthorizations['access'] === 'off') {
          retorno = false;
        } else {
          retorno = true;
        }

      } else {
        // NO tiene acceso al programa
        retorno = false;
      }

    } else {
      // No hay un usuario logueado
      retorno = false;
    }
    return retorno;
  }

  // Esta rutina determina si se permite el acceso a un componente dentro de un programa
  componentAccess(programId: string, componentId: string): boolean {
    // Asignar TRUE, ya que siempre se tiene acceso TOTAL al menos que
    // se especifique lo contrario
    let retorno = true;

    // Get user authorizations
    this.getUserAuthorizations();

    // Hay un usuario logueado?
    if (this.userData) {

      // Obtener las authorizations del progamId
      const programAuthorizations: object = this.userAuth[programId];
      if (programAuthorizations) {

        // Obtener las authorizations del componente
        const componentAuthorizations = programAuthorizations[componentId];
        if (componentAuthorizations) {

          // Obtener la propiedad "access"
          if (componentAuthorizations.access && componentAuthorizations.access === 'off') {
            retorno = false;
          } else {
            retorno = true;
          }

        } else {
          // El componente NO existe, garantizar acceso TOTAL
          retorno = true;
        }

      } else {
        // NO tiene acceso al programa
        retorno = false;
      }

    } else {
      // No hay un usuario logueado
      retorno = false;
    }
    return retorno;
  }

  // Esta rutina devuelve el valor de una propiedad (propertyId) de un componenete dado (componentId)
  // Si la propiedad (propertyId) NO existe, se devuelve null
  componentPropertyValue(programId: string, componentId: string, propertyId: string): any {

    // Asignar NULL, ya que es el valor por defecto si la propiedad (propertyId) No existe
    const retorno = null;

    // Get user authorizations
    this.getUserAuthorizations();

    // Hay un usuario logueado?
    if (this.userData) {

      // Obtener las authorizations del progamId
      const programAuthorizations: object = this.userAuth[programId];
      if (programAuthorizations) {

        // Obtener las authorizations del componente
        const componentAuthorizations = programAuthorizations[componentId];
        if (componentAuthorizations) {

          // Obtener la propiedad propertyId
          if (componentAuthorizations[propertyId]) {
            return componentAuthorizations[propertyId];
          }
        }
      }
    }
    return retorno;
  }

  // Esta rutina obtiene los menúes que el usuario activo puede usar
  createUsermenu(): Observable<Menues[]> {

    let pgmsUser = [];  // todos los programas que el usuario tiene acceso
    const mnuUser = [] as Menues[];  // Menú ppal. del usuario

    // Obtener los datos del usuario
    this.getUserAuthorizations();

    if (this.userAuth) {

      // Obtener los IDs de los programas
      pgmsUser = Object.keys(this.userAuth);

      // Obtener la info de todos los programa de la app PortalAdmin II
      return this.http.get<Menues[]>(`${environment.envData.loginServer}/api2/menues/portaladmin_v2/index/`)
        .pipe(
          map(
            pgmsApp => {
              // Eliminar los programas que el usuario no tiene acceso
              pgmsApp.forEach(
                program => {
                  if (pgmsUser.includes(program.pgmId)) {
                    // SI tiene acceso
                    mnuUser.push(program);
                  }
                }
              );
              return mnuUser;
            }
          ),
          // 1ro.: arrojar el error encontrado
          catchError(
            error => {
              return throwError(`API-0011(E): error al llamar a http://<loginServer>/api2/menues/<appId>/index/ - Error: ${error}`);
            }
          )
         );
    } else {
      return of([]);
    }
  }
}
