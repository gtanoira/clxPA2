/**
  SEGURIDAD DE ACCESO:  /app.routing.ts
  program:
    id: pgmCotizaciones
    components:
      cptActualizacion
      cptCalculadora
      cptPromedio

**/
import { Component, OnInit, Input } from '@angular/core';

// Models
import { User } from 'src/app/models/user';

// Services
import { AuthenticationService } from 'src/app/core/authentication.service';
import { AuthorizationService } from 'src/app/core/authorization.service';
import { ErrorMessageService } from 'src/app/core/error-message.service';

@Component({
  selector: 'app-main',
  templateUrl: './cotizaciones.component.html',
  styleUrls: ['./cotizaciones.component.css']
})
export class CotizacionesComponent implements OnInit {
  currentUser: User;
  userFromApi: User;

  // Variables para el acceso a los componentes del programa
  ynActualizar = true;
  ynPromedio = true;
  ynCalculadora = true;

  // Leer el height en pixels del header
  @Input() headerHeight: number;

  constructor(
    private authenticationService: AuthenticationService,
    private authorizationService: AuthorizationService,
    private errorMessageService: ErrorMessageService
  ) {
    // Obtener los datos del usuario logueado
    this.currentUser = this.authenticationService.currentUserValue;

    // Borrar la linea de mensaje de error
    this.errorMessageService.changeErrorMessage('');
  }

  ngOnInit() {
    // Setear el acceso a los componentes
    this.ynActualizar  = this.authorizationService.componentAccess('pgmCotizaciones', 'cptActualizacion');
    this.ynPromedio    = this.authorizationService.componentAccess('pgmCotizaciones', 'cptPromedio');
    this.ynCalculadora = this.authorizationService.componentAccess('pgmCotizaciones', 'cptCalculadora');
  }

}
