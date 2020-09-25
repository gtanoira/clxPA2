import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, throwError, BehaviorSubject } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

// Services
import { AuxiliarTablesService } from 'src/app/shared/auxiliar-tables.service';
import { ErrorMessageService } from 'src/app/core/error-message.service';
import { SapService } from 'src/app/shared/sap.service';

// Class Models
import { AggingFacturacionModel } from 'src/app/models/agging_facturacion.model';
import { AggingSaldoModel } from 'src/app/models/agging_saldo.model';
import { BillingByCeBeModel } from '../models/billing_by_cebe.model';
import { CostoRepresentadaPorCeBe } from 'src/app/models/costo_representada_por_cebe.model';
import { FactCobrLoteModel } from 'src/app/models/factcobr_lote.model';
import { TelevisaClientesCtoReps } from 'src/app/models/televisa_clientes_cto_reps.model';

// Environments
import { environment } from 'src/environments/environment';

@Injectable()
export class AdmVentasService {

  // Suscripcion a actualizar la info de lotes
  // La idea de este Subject es que cada vez que alguien borra o agrega un lote a la BDatos, este subject emita un
  // aviso a la/s rutinas que tienen que actualizar la lista de lotes.
  public actualizarLotes = new BehaviorSubject(true);

  constructor(
    private auxiliarTablesService: AuxiliarTablesService,
    private http: HttpClient,
    private errorMessageService: ErrorMessageService,
    private sapService: SapService
  ) { }

  /* *************************************************************************************************************
    TELEVISA - COSTO DE REPRESENTADAS
    Aqui se encuentran todos los métodos y procesos dedicados a calcular los costos de representadas para Televisa
  */
  // Leer toda la facturación de un período por CeBe desde SAP
  public getAllBillingByCeBe(fechaDesde: string, fechaHasta: string, ceBe: string, companyId: string): Observable<BillingByCeBeModel[]> {

    // Obtener los parámetros por DEFAULT del reporte
    const reportDefaults = this.auxiliarTablesService.getReportDefaults('costo_representada_por_cebe_setup.json');

    // Obtener todos los datos de los clientes de Televisa: monto base, tipo, etc.
    const televisaClientes =
      this.http.get<any[]>(`${environment.envData.portalAdminServer}/api/televisaClientesCtoReps/`)
        .pipe(
          map(
            data => {
              return <TelevisaClientesCtoReps[]>data;
            }
          ),
          catchError(
            err => {
              this.errorMessageService.changeErrorMessage(
                // tslint:disable-next-line: max-line-length
                `API-0011(E): no se pudo obtener dato alguno de la API ${environment.envData.portalAdminServer}/api/televisaClientesCtoReps`);
              return [];
              }
          )
        );

    // Obtener la facturación por CeBe
    const queryString = `fechadesde=${fechaDesde}&fechahasta=${fechaHasta}&cebe=${ceBe}&companyid=${companyId}`;
    const billingByCebe =
      this.http.get<CostoRepresentadaPorCeBe[]>(
        `${environment.envData.sapGwServer}/api2/facturacionporcebe?${queryString}`
      );

    // Obtener el costo de representadas en formato planilla
    return forkJoin([
      reportDefaults,
      televisaClientes,
      billingByCebe
    ]).pipe(map(
      ([defaults, clientes, billing]) => {

        // Chequear que haya algo que procesar
        if (billing.length <= 0) {
          this.errorMessageService.changeErrorMessage(
            'API-0004(E): no se encontró ninguna factura que cumpla con los filtros establecidos'
          );
          return [];
        }

        // Definir variables
        const ctoRepReport = [];

        // Ordenar la facturación por moneda y cliente
        const billingSort = billing.sort(
          (a, b) => {
            if (a.moneda < b.moneda) {
              return -1;
            } else if (a.moneda === b.moneda) {
              return (a.clienteId <= b.clienteId) ? -1 : 1;
            } else {
              return 1;
            }
          }
        );

        // Obtener los costos de representadas por corte de control
        let antMoneda = billingSort[0].moneda;
        let antClienteId = billingSort[0].clienteId;
        let antCompanyId = billingSort[0].orgVentas;
        let antPaisId = billingSort[0].paisId;
        let netoFacturado = 0.00;
        let netoFacturadoNuevo = 0.00;
        let netoFacturadoExistente = 0.00;
        let lastBilling = {};

        for (const billElement of billingSort) {

          // Preguntar si hubo corte de control
          if (billElement.moneda !== antMoneda || billElement.clienteId !== antClienteId) {
            corteDeControl(this, billElement, defaults);
          }

          // Sumar importe dependiendo del tipo de contrato
          const auxChar = billElement.datosContrato.split(',');
          const tipoContrato = auxChar.length > 1 ? auxChar[1] : '???';
          if (tipoContrato === 'N') {
            // El item pertenece a un contrato Nuevo
            netoFacturadoNuevo += billElement.netoSinIva;
          } else if (tipoContrato === 'E') {
            // El item pertenece a un contrato Existente
            netoFacturadoExistente += billElement.netoSinIva;
          } else {
            // El item no pertenece a un contrato Nuevo ni Existente
            netoFacturado += billElement.netoSinIva;
          }
          lastBilling = billElement;

        } // end for
        corteDeControl(this, lastBilling, defaults);

        return ctoRepReport;

        // Corte de control - Generar un costo de representada
        function corteDeControl(self, billElement, ctoRepDefaults: any[] | {}): void {

          // Se pueden generar 3 tipos de registros de Costo de representadas

          // Costo Representada por Contrato Nuevo
          let ctoRepElement = {};
          if (netoFacturadoNuevo !== 0) {
            ctoRepElement = ccCrearRegistro(self, 'Nuevo', ctoRepDefaults);
          }

          // Costo Representada por Contrato Existente
          if (netoFacturadoExistente !== 0) {
           ctoRepElement = ccCrearRegistro(self, 'Existente', ctoRepDefaults);
          }

          // Costo Representada por Contrato Sin Definir
          if (netoFacturado !== 0) {
            ctoRepElement = ccCrearRegistro(self, 'SIN DEFINIR', ctoRepDefaults);
          }

          // Agregar el cliente al reporte de salida
          ctoRepReport.push(ctoRepElement);

          // Inicializar variables
          antMoneda = billElement.moneda;
          antClienteId = billElement.clienteId;
          antCompanyId = billElement.orgVentas;
          antPaisId = billElement.paisId;
          netoFacturado = 0.00;
          netoFacturadoNuevo = 0.00;
          netoFacturadoExistente = 0.00;

        }

        // Corte de control - Crear el registro por corte de control
        function ccCrearRegistro(self, tipoContrato: string, ctoRepDefaults: any[] | {}): {}  {

          // @tipoContrato: string 'Nuevo' o 'Existente' o 'SIN DEFINIR'

          const defaultPorcCtoRep = ctoRepDefaults['PorcentajeCtoRep'];  // porcentajes del costo repr.
          let ctoRepElement = {};  // vaiable de retorno de la funcion

          // Buscar el nombre del cliente en SAP
          const clienteDesc = '';
          /* try {
            clienteDesc = self.sapService.getClientName(antCompanyId, antClienteId);
          } catch (err) {
            self.errorMessageService.changeErrorMessage(err);
            clienteDesc = '';
          } */

          // Crear un registro por contrato Nuevo
          if (tipoContrato === 'Nuevo') {
            ctoRepElement = {
              companyId: antCompanyId,
              clienteId: antClienteId,
              clienteDesc: clienteDesc,
              paisId: antPaisId,
              tipoContrato: tipoContrato,
              observaciones: clienteDesc === '' ? 'No se encontró el nombre del cliente en SAP' : '',
              moneda: antMoneda,
              ctoRepPorc: defaultPorcCtoRep[tipoContrato],
              montoBase: 0.00,
              netoFacturado: netoFacturadoNuevo
            };
          }

          // Crear un registro por contrato Existente
          if (tipoContrato === 'Existente') {

            // Buscar el monto base del cliente
            const cl = clientes.findIndex(x => x.clienteId.padStart(antClienteId.length, '0') === antClienteId);  // buscar cliente
            if (cl >= 0) {
              // Se encontró el monto base
              ctoRepElement = {
                companyId: antCompanyId,
                clienteId: clientes[cl].clienteId,
                clienteDesc: clienteDesc,
                paisId: antPaisId,
                tipoContrato: tipoContrato,
                observaciones: clienteDesc === '' ? 'No se encontró el nombre del cliente en SAP' : '',
                moneda: antMoneda,
                ctoRepPorc: (Math.abs(clientes[cl].ctoRepPorc - 0.00) <= 0.001) ? defaultPorcCtoRep[tipoContrato] : clientes[cl].ctoRepPorc,
                montoBase: parseFloat(clientes[cl].montoBase),
                netoFacturado: netoFacturadoExistente
              };
            } else {
              // No se encontró el monto base
              ctoRepElement = {
                companyId: antCompanyId,
                clienteId: antClienteId,
                clienteDesc: clienteDesc,
                paisId: antPaisId,
                tipoContrato: tipoContrato,
                observaciones: 'ERROR: no se encontró el Monto Base para este cliente',
                moneda: antMoneda,
                ctoRepPorc: 0.00,
                montoBase: 0.00,
                netoFacturado: netoFacturadoExistente
              };
            }
          }

          // Crear un registro por contrato SIN DEFINIR
          if (tipoContrato === 'SIN DEFINIR') {
            ctoRepElement = {
              companyId: antCompanyId,
              clienteId: antClienteId,
              clienteDesc: clienteDesc,
              paisId: antPaisId,
              tipoContrato: tipoContrato,
              observaciones: 'ERROR: el contrato no especifica si es Nuevo o Existente',
              moneda: antMoneda,
              ctoRepPorc: 0.00,
              montoBase: 0.00,
              netoFacturado: netoFacturado
            };
          }

          // Calcular costo de representada
          ctoRepElement['diferencia'] = ctoRepElement['netoFacturado'] - ctoRepElement['montoBase'];
          if (ctoRepElement['diferencia'] > 0) {
            ctoRepElement['totCostoRepresentada'] = ctoRepElement['diferencia'] * ctoRepElement['ctoRepPorc'] / 100;
          } else {
            ctoRepElement['totCostoRepresentada'] = 0.00;
          }

          return ctoRepElement;

        }

      }
    ));

  }

  /* *************************************************************************************************************
    AGGING
    Aqui se encuentran todos los métodos dedicados a obtener los datos necesarios para el Agging.
  */
  // Agging- Facturación
  getAggingFacturacion(reportMonth: string, companyIds: string[] ): Observable<AggingFacturacionModel[]> {

    // Obtener el reporte desde SAP
    let companies = '';
    companyIds.forEach((company) => {
      companies += company + ',';
    });
    companies = companies.substring(0, companies.length - 1);
    const queryString = `reportmonth=${reportMonth}&companyids=${companies}`;
    return this.http.get<AggingFacturacionModel[]>(
      `${environment.envData.sapGwServer}/api/aggingfacturacion?${queryString}`
    ).pipe(
      map(
        data => <AggingFacturacionModel[]>data
      ),
      catchError(
        err => {
          // tslint:disable-next-line: max-line-length
          return throwError(`API-0011(E): no se pudo obtener dato alguno de la API ${environment.envData.portalAdminServer}/api/aggingfacturacion`);
        }
      )
    );
  }

  // Subir los datos del Agging Facturación al MySql
  uploadAggingFacturacionToMySql(data: {}): Observable<{}> {
    return this.http.post<any>(
      `${environment.envData.portalAdminServer}/api/agging_facturacion/create`, data
    );
  }

  // Agging- Saldo
  getAggingSaldo(reportMonth: string, companyIds: string[] ): Observable<AggingSaldoModel[]> {

    // Obtener el reporte desde SAP
    let companies = '';
    companyIds.forEach((company) => {
      companies += company + ',';
    });
    companies = companies.substring(0, companies.length - 1);
    const queryString = `reportmonth=${reportMonth}&companyids=${companies}`;
    return this.http.get<AggingSaldoModel[]>(
      `${environment.envData.sapGwServer}/api/aggingsaldo?${queryString}`
    ).pipe(
      map(
        data => <AggingSaldoModel[]>data
      ),
      catchError(
        err => {
          // tslint:disable-next-line: max-line-length
          return throwError(`API-0011(E): no se pudo obtener dato alguno de la API ${environment.envData.portalAdminServer}/api/aggingsaldo`);
        }
      )
    );
  }

  // Subir los datos del Agging Saldo al MySql
  uploadAggingSaldoToMySql(data: {}): Observable<{}> {
    return this.http.post<any>(
      `${environment.envData.portalAdminServer}/api/agging_saldos/create`, data
    );
  }

  /* *************************************************************************************************************
    PROCESOS BATCH
    Aqui se encuentran todos los métodos dedicados a obtener y guardar los procesos batch para FactyCobr.
  */
  // Guardar lotes
  public saveProcesoBatch(datosBatch: {}): Observable<any> {
    return this.http.post<String>(
      `${environment.envData.portalAdminServer}/api/factcobr_lotes/create`,
      datosBatch
    ).pipe(
      tap(
        data => data
      ),
      catchError (
        err => throwError(err)
      )
    );
  }

  // Leer todos los lotes existentes de Facturcion y Cobranzas
  public getLotes(): Observable<FactCobrLoteModel[]>  {
    return this.http.get<FactCobrLoteModel[]>(
      `${environment.envData.portalAdminServer}/api/factcobr_lotes/index`
    ).pipe(
      map(
        data => {
          return data;  // this.serializeDjangoQueryset(data);
        }
      )
    );
  }
  // Borrar un lote
  public deleteLote(loteId: string): Observable<any> {
    return this.http.get<any>(`${environment.envData.portalAdminServer}/api/factcobr_lotes/delete/${loteId}`);
  }

  /**********************************
   * RUTINAS COMUNES
   **********************************/
  // Leer un queryset de Django y devolver un array de objetos
  private serializeDjangoQueryset(data: any): any[] {
    const rtnData = [];
    data.forEach(el => {
      // Record ID
      const elObject = {id: el['pk']};
      // Demás datos del registro
      const dataRecord = el['fields'];
      const keys = Object.keys(dataRecord);
      keys.forEach(key => {
        elObject[key] = dataRecord[key];
      });
      rtnData.push(elObject);
    });
    return rtnData;
  }

}
