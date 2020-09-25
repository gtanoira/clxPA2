import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

// Services
import { AuxiliarTablesService } from 'src/app/shared/auxiliar-tables.service';
import { ErrorMessageService } from 'src/app/core/error-message.service';

// Models
import { ActualVodClientModel } from 'src/app/models/actual_vod_client.model';

// Environments
import { environment } from 'src/environments/environment';

@Injectable()
export class PlanningService {

  // Suscripcion a actualizar la info de lotes
  // La idea de este Subject es que cada vez que alguien borra o agrega un lote a la BDatos, este subject emita un
  // aviso a la/s rutinas que tienen que actualizar la lista de lotes.
  public actualizarLotes = new BehaviorSubject(true);

  constructor(
    private auxiliarTablesService: AuxiliarTablesService,
    private http: HttpClient,
    private errorMessageService: ErrorMessageService
  ) { }

  // Leer todos los clientes para Actual VOD
  public getActualVodClients(): Observable<ActualVodClientModel[]>  {

    return this.http.get<ActualVodClientModel[]>(
      `${environment.envData.portalAdminServer}/api/get_actual_vod_clients/`
    ).pipe(
      map( data => data )
    );
  }

  // Enviar la planilla excel para su proceso
  public sendActualVod(formData: FormData): Observable<any> {
    return this.http.post<any>(`${environment.envData.portalAdminServer}/api2/pln_actual_vod/`, formData);
  }

}
