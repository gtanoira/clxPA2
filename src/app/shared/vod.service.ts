import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';

// Services
import { AuxiliarTablesService } from 'src/app/shared/auxiliar-tables.service';
import { ErrorMessageService } from 'src/app/core/error-message.service';

// Models
import { VodTituloModel } from 'src/app/models/vod_titulo.model';

// Environments
import { environment } from 'src/environments/environment';

@Injectable()
export class VodService {

  // Suscripciones para actualizar datos
  // La idea de estos Subject es que cada vez que alguien borra o agrega un registro/s a la BDatos,
  // este subject emita un aviso a la/s rutinas que tienen que actualizar los datos
  public actualizarTitulos = new BehaviorSubject(true);  // VOD maestro titulos

  constructor(
    private auxiliarTablesService: AuxiliarTablesService,
    private http: HttpClient,
    private errorMessageService: ErrorMessageService
  ) { }

  // Enviar la planilla excel para su proceso
  public addTitulos(formData: FormData, fechaValidez: String): Observable<any> {
    return this.http.post<any>(`${environment.envData.portalAdminServer}/api/add_titulos/${fechaValidez}`, formData);
  }

  // Leer el maestro de titulos
  public getMaestroTitulos(): Observable<VodTituloModel[]> {
    return this.http.get<VodTituloModel[]>(`${environment.envData.portalAdminServer}/api/get_titulos`);
  }

}
