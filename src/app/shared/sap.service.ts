import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { map, catchError, mergeMap, toArray } from 'rxjs/operators';

// MOMENT.JS
import * as _moment from 'moment';

// Services
import { AuxiliarTablesService } from 'src/app/shared/auxiliar-tables.service';
import { ErrorMessageService } from 'src/app/core/error-message.service';

// Models
import { DetalleReciboModel } from 'src/app/models/dealle_recibo.model';
import { OpenItemModel } from 'src/app/models/open_item.model';
import { SapClientModel } from 'src/app/models/sap_client.model';

// Environments
import { environment } from 'src/environments/environment';

@Injectable()
export class SapService {

  constructor(
    private auxiliarTablesService: AuxiliarTablesService,
    private http: HttpClient,
    private errorMessageService: ErrorMessageService
  ) { }

  // Agregar a una lista de datos el nombre del cliente.
  // Se debe tener en dicha lista para cada objeto, los campos companyId y el clientId
  public addClientName(dataList: {}[]): Observable<{}[]> {

    const elements = from(dataList);
    const rtnList = elements.pipe(
      mergeMap(
        // Buscar el nombre del cliente
        elem => {
          return this.getClientName(elem['companyId'], elem['clienteId']).pipe(
            map(
              data => {
                elem['clienteDesc'] = data;
                return elem;
              }
            ),
            catchError(
              map(
                err => {
                  elem['clienteDesc'] = '';
                  return elem;
                }
              )
            )
          );
        }
      ), toArray()
    );

    return rtnList;
  }

  // Convertir un importe de una moneda a otra
  public convertirImporte(importe: number, fecha: string, monOrigen: string, monDestino: string ): Observable<{}> {
    const query = `?importe=${importe}&monorigen=${monOrigen}&mondestino=${monDestino}&fecha=${fecha.replace(/-/g, '')}`;
    return this.http.get<{}>(`${environment.envData.sapGwServer}/api2/convertir_importe${query}`);
  }

  // Get Citi Ventas
  public getCitiVentas(companiaId: string, fechaDesde: string, fechaHasta): Observable<any> {

    // Armar el queryParameter
    const qp1 = `companyid=${companiaId}`;
    const qp2 = `fechadocdesde=${fechaDesde}`;
    const qp3 = `fechadochasta=${fechaHasta}`;

    // Leer del SAP el subdiario
    return this.http.get<any>(`${environment.envData.sapGwServer}/api2/citi_ventas?${qp1}&${qp2}&${qp3}`);
  }

  // Leer el nombre de un cliente
  public getClientName(companyId: string, clientId: string): Observable<string> {
    const qp = `companyid=${companyId}&clientid=${clientId}`;
    return this.http.get<string>(`${environment.envData.sapGwServer}/api2/client_details?${qp}`).pipe(
      map(
        data => data['clienteDescripcion']
      ),
      catchError(
        err => { throw err; }
      )
    );
  }

  // Leer todos los clientes
  public getClients(): Observable<SapClientModel[]> {
    return this.http.get<SapClientModel[]>(`${environment.envData.sapGwServer}/api2/clients`);
  }

  // Get Customer All Items - Todos los DOCS del cliente de los últimos 2 años
  public getCustomerAllItems(companiaId: string, clienteId: string, fechaDesde: string, fechaHasta): Observable<OpenItemModel[]> {

    // Armar el queryParameter
    const qp1 = `companyid=${companiaId}`;
    const qp2 = `clientid=${clienteId}`;
    const qp3 = `datefrom=${fechaDesde}`;
    const qp4 = `dateto=${fechaHasta}`;

    // Leer del SAP el subdiario
    return this.http.get<OpenItemModel[]>(`${environment.envData.sapGwServer}/api2/customer_all_items?${qp1}&${qp2}&${qp3}&${qp4}`);
  }

  // Get de los detalles de los recibos de una empresa entre 2 fechas
  public getDetalleRecibos(
    companyId: string,
    tipoFecha: string,
    fechaDesde: string,
    fechaHasta: string,
    clienteId: string,
    cobradorId: string
  ): Observable<DetalleReciboModel[]> {

    // Armar el queryParameter
    const qp1 = `companyid=${companyId}`;
    const qp2 = `fechadesde=${fechaDesde}`;
    const qp3 = `fechahasta=${fechaHasta}`;
    const qp4 = `clienteid=${clienteId}`;
    const qp5 = `cobradorid=${cobradorId}`;

    // Obtener los datos del SAP
    if (tipoFecha === 'recibo') {
      return this.http.get<DetalleReciboModel[]>(
        `${environment.envData.sapGwServer}/api2/detalle_recibos?${qp1}&${qp2}&${qp3}&${qp4}&${qp5}`
      );
    } else {
      return this.http.get<DetalleReciboModel[]>(
        `${environment.envData.sapGwServer}/api2/detalle_compensaciones?${qp1}&${qp2}&${qp3}&${qp4}&${qp5}`
      );
    }
  }

  // Open Items - Partidas Abiertas
  public getOpenItems(companiaId: string, clienteId: string, fechaCorte: string): Observable<OpenItemModel[]> {

    // Armar el queryParameter
    const qp1 = `companyid=${companiaId}`;
    const qp2 = `clienteId=${clienteId}`;
    const qp3 = `fechaCorte=${fechaCorte}`;

    // Leer del SAP el subdiario
    return this.http.get<OpenItemModel[]>(`${environment.envData.sapGwServer}/api2/open_items?${qp1}&${qp2}&${qp3}`);
  }

  // Subdiario de compras
  public getSubdiarioCompras(companyId: string, fechaDesde: string, fechaHasta: string, tiposDoc: string): Observable<any[]> {

    // Armar el queryParameter
    const qp1 = `companyid=${companyId}`;
    const qp2 = `fechadocdesde=${fechaDesde}`;
    const qp3 = `fechadochasta=${fechaHasta}`;
    const qp4 = `tiposdoc=${tiposDoc}`;

    // Leer del SAP el subdiario
    return this.http.get<any[]>(`${environment.envData.sapGwServer}/api2/subdiariocompras?${qp1}&${qp2}&${qp3}&${qp4}`);
  }
}
