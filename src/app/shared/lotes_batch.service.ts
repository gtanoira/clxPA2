import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

// Services
import { AuxiliarTablesService } from 'src/app/shared/auxiliar-tables.service';
import { ErrorMessageService } from 'src/app/core/error-message.service';

// Models
import { LoteBatchModel } from 'src/app/models/lote_batch.model';

// Environments
import { environment } from 'src/environments/environment';

@Injectable()
export class LotesBatchService {

  // Suscripcion a actualizar la info de lotes
  // La idea de este Subject es que cada vez que alguien borra o agrega un lote a la BDatos, este subject emita un
  // aviso a la/s rutinas que tienen que actualizar la lista de lotes.
  public actualizarLotes = new BehaviorSubject(true);

  constructor(
    private auxiliarTablesService: AuxiliarTablesService,
    private http: HttpClient,
    private errorMessageService: ErrorMessageService
  ) { }

  /** ************************************************************************************************
   * Lotes PLANNING
   */
  // Borrar un lote
  public deleteLote(loteId: number, area: String): Observable<any> {
    if (area === 'PLANNING') {
      return this.http.delete<any>(`${environment.envData.portalAdminServer}/plnborrarlote/${loteId}/`);
    } else if (area === 'VOD') {
      return this.http.delete<any>(`${environment.envData.portalAdminServer}/api/vod_lotes/VOD_MAESTRO_TITULOS/${loteId}`);
    }
  }

  // Leer todos los lotes existentes de Planning
  public getLotes(area: String): Observable<LoteBatchModel[]>  {
    if (area === 'PLANNING') {
      return this.http.get<LoteBatchModel[]>(
        `${environment.envData.portalAdminServer}/api/get_pln_lotes/UPLOADVOD/`
      ).pipe(
        map( data => data )
      );
    } else if (area === 'VOD') {
      return this.http.get<LoteBatchModel[]>(
        `${environment.envData.portalAdminServer}/api/vod_lotes/VOD_MAESTRO_TITULOS`
      ).pipe(
        map( data => data )
      );
    }
  }
}
