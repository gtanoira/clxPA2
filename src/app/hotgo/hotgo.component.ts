/**
  SEGURIDAD DE ACCESO:  /app.routing.ts
  program:
    id: pgmHotGo
    components:
      cptProcesosBatchs
      cptErrorsLog
      cptMktExpenditures

**/
import { Component, OnInit } from '@angular/core';

// Models
import { User } from '../models/user';

// Services
import { AuthenticationService } from '../core/authentication.service';
import { AuthorizationService } from '../core/authorization.service';
import { ErrorMessageService } from '../core/error-message.service';

@Component({
  selector: 'app-hotgo',
  templateUrl: './hotgo.component.html',
  styleUrls: ['./hotgo.component.css']
})
export class HotgoComponent implements OnInit {
  private currentUser: User;
  private userFromApi: User;

  // Variables para el acceso a los componentes del programa
  public ynErrorsLog = true;
  public ynMktExpenditures = true;
  public ynProcesosBatchs = true;
  public ynSchedule = true;
  public ynMissingRecords = true;

  constructor(
    private authenticationService: AuthenticationService,
    private authorizationService: AuthorizationService,
    private errorMessageService: ErrorMessageService
  ) {
    // Obtener los datos del usuario logueado
    this.currentUser = this.authenticationService.currentUserValue;
  }

  ngOnInit() {
    // Setear el acceso a los componentes
    this.ynErrorsLog = this.authorizationService.componentAccess('pgmHotGo', 'cptErrorsLog');
    this.ynMktExpenditures = this.authorizationService.componentAccess('pgmHotGo', 'cptMktExpenditures');
    this.ynProcesosBatchs = this.authorizationService.componentAccess('pgmHotGo', 'cptProcesosBatchs');
    this.ynSchedule = this.authorizationService.componentAccess('pgmHotGo', 'cptSchedule');
    this.ynMissingRecords = this.authorizationService.componentAccess('pgmHotGo', 'cptMissingynMissingRecords');

    // Borrar la linea de mensaje de error
    this.errorMessageService.changeErrorMessage(null);
  }

}
