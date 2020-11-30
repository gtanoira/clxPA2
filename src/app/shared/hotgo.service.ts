import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

// Environments
import { environment } from 'src/environments/environment';

// Services
import { AuthenticationService } from 'src/app/core/authentication.service';
import { AuxiliarTablesService } from 'src/app/shared/auxiliar-tables.service';
import { ErrorMessageService } from 'src/app/core/error-message.service';

// Models
import { HgErrorLogModel } from '../models/hg-error-log.model';
import { HgScheduleModel } from '../models/hg-schedule.model';
import { MktExpenditureModel } from 'src/app/models/mkt_expenditure.model';
import { ProcesoBatchModel } from 'src/app/models/proceso-batch.model';
import { ProductLocalPriceModel } from '../models/product-local-price.model';
import { SelectOption } from 'src/app/models/select-option';

@Injectable()
export class HotgoService {

  /*
   * BehaviourSubjects y Suscriptions
   * La idea de estos BehaviourSubject es que cada vez que alguien borra o agrega un registo en una tabla
   * que necesita ser monitoreada, este subject emita un aviso a la/s rutinas que tienen que actualizarlas
   */
  public actualizarMktExpenditures = new BehaviorSubject(true);
  public actualizarProcesosBatchs = new BehaviorSubject(true);
  public actualizarScheduleEvents = new BehaviorSubject(true);

  constructor(
    private authenticationService: AuthenticationService,
    private auxiliarTablesService: AuxiliarTablesService,
    private http: HttpClient,
    private errorMessageService: ErrorMessageService
  ) { }

  // Agregar datos manuales a la tabla MKT_EXPENDITURES en data lake
  public addMktExpenditures(data: {}): Observable<String> {
    return this.http.post<String>(`${environment.envData.portalAdminServer}/api/add_mkt_expenditures/`, data);
  }

  // Chequear la solución de los errores de la tabla error_logs
  public checkErrors() {
    const userId = this.authenticationService.currentUserValue.userName;
    return this.http.patch(`${environment.envData.hotgoBackendServer}/api2/error_logs/check/${userId}`, {});
  }

  // Borrar un registro de la tabla MKT_EXPENDITURES en data lake
  public deleteMktExpenditures(recordId: number): Observable<{}> {
    return this.http.delete<{}>(`${environment.envData.portalAdminServer}/api/delete_mkt_expenditures/${recordId}`);
  }

  // Borrar un registro de la tabla procesos_batchs
  public delProcesoBatch(recordId: number): Observable<{}> {
    return this.http.delete<{}>(`${environment.envData.hotgoBackendServer}/api2/procesos_batchs/${recordId}`);
  }

  // Procesos Batchs
  public getErrorsLog(): Observable<HgErrorLogModel[]>  {
    return this.http.get<HgErrorLogModel[]>(
      `${environment.envData.hotgoBackendServer}/api2/error_logs`
    ).pipe(map(
      data => data,
      catchError(
        err => { console.log('*** err: ', err); return err; }
      )
    ));
  }

  // Eventos de Schedule
  public getEvents(): Observable<HgScheduleModel[]>  {
    return this.http.get<HgScheduleModel[]>(
      `${environment.envData.hotgoBackendServer}/api2/schedule_events`
    ).pipe(map(
      data => {
        const events: HgScheduleModel[] = [];
        for (const event of data) {
          event['evento'] = event.eventName.indexOf('evt_update_') >= 0 ? event.eventName.replace('evt_update_', '') : event.eventName;
          event['intervalo'] = `cada ${event.intervalValue} ${event.intervalField}`;
          events.push(event);
        }
        return events;
      }
      ),
      catchError(
        err => {
          return of(err);
        }
      )
    );
  }

  // Obtener datos desde Google Analytics
  public getFromGA(metrics: string, dimensions: string, fechaDesde: string, fechaHasta: string, filters: string): Observable<{}> {
    return this.http.get(
      `${environment.envData.hotgoBackendServer}/api2/ga/data?` +
      `metrics=${metrics}` +
      `&dimensions=${dimensions}` +
      `&fechadesde=${fechaDesde}` +
      `&fechahasta=${fechaHasta}` +
      `&filters=${filters}`
    );
  }

  // HotGo - Canales
  public getHotGoCanales(): Observable<SelectOption[]>  {
    return this.http.get<SelectOption[]>(
      `${environment.envData.portalAdminServer}/api/hotgo_canales`
    ).pipe(
      map( data => data )
    );
  }

  // HotGo - Fuentes
  public getHotGoFuentes(): Observable<SelectOption[]>  {
    return this.http.get<SelectOption[]>(
      `${environment.envData.portalAdminServer}/api/hotgo_fuentes`
    ).pipe(
      map( data => data )
    );
  }

  // HotGo - Medios
  public getHotGoMedios(): Observable<SelectOption[]>  {
    return this.http.get<SelectOption[]>(
      `${environment.envData.portalAdminServer}/api/hotgo_medios`
    ).pipe(
      map( data => data )
    );
  }

  // HotGo - Paises
  public getHotGoPaises(): Observable<SelectOption[]>  {
    return this.http.get<SelectOption[]>(
      `${environment.envData.portalAdminServer}/api/hotgo_paises`
    ).pipe(
      map( data => data )
    );
  }

  // Leer todos los registro de Mkt Expenditures
  public getMktExpenditures(): Observable<MktExpenditureModel[]>  {
    return this.http.get<MktExpenditureModel[]>(
      `${environment.envData.portalAdminServer}/api/get_mkt_expenditures`
    ).pipe( map( data => data ) );
  }

  // Leer todos los registros de Product Local Prices
  public getProductLocalPrices(): Observable<ProductLocalPriceModel[]>  {
    return this.http.get<ProductLocalPriceModel[]>(
      `${environment.envData.hotgoBackendServer}/api2/product_local_prices`);
  }

  // Procesos Batchs
  public getProcesosBatchs(): Observable<ProcesoBatchModel[]>  {
    return this.http.get<ProcesoBatchModel[]>(
      `${environment.envData.hotgoBackendServer}/api2/procesos_batchs`
    ).pipe(map(
      data => data,
      catchError(
        err => { console.log('*** err: ', err); return err; }
      )
    ));
  }

  // Modificar la ejecución de un EVENT en la base de datos AWS
  public patchEvent(eventId: string, intervalValue: number, intervalTime: string) {
    const eventData = {
      eventId,
      intervalValue,
      intervalTime
    };
    return this.http.patch(
      `${environment.envData.hotgoBackendServer}/api2/schedule_events`,
      eventData
    );
  }

  // Procesar los missing CANCEL y cargarlos en el Datalake.
  public uploadCancel(formData: FormData): Observable<any> {
    return this.http.post<any>(`${environment.envData.hotgoBackendServer}/api2/cancel/missing`, formData);
  }

  // Procesar los missing PAYMENT COMMITS y cargarlos en el Datalake.
  public uploadPyc(formData: FormData): Observable<any> {
    return this.http.post<any>(`${environment.envData.hotgoBackendServer}/api2/payment_commit/missing`, formData);
  }

  // Procesar los missing PAYMENT COMMITS y cargarlos en el Datalake.
  public uploadRebill(formData: FormData): Observable<any> {
    return this.http.post<any>(`${environment.envData.hotgoBackendServer}/api2/rebill/missing`, formData);
  }

  // Procesar los missing REGISTER y cargarlos en el Datalake.
  public uploadRegister(formData: FormData): Observable<any> {
    return this.http.post<any>(`${environment.envData.hotgoBackendServer}/api2/register/missing`, formData);
  }
}
