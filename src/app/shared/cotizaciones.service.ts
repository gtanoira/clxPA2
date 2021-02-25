import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, from, BehaviorSubject, merge } from 'rxjs';
import { concatMap, map, mergeMap, toArray, groupBy } from 'rxjs/operators';

// MOMENT.JS
import * as moment from 'moment';

// Services
import { ErrorMessageService } from '../core/error-message.service';
import { round } from './math-functions';

// Models
import { CotizacionesDiariaModel } from 'src/app/models/cotizaciones-diaria';
import { Cotizacion } from 'src/app/models/cotizacion';

// Environments
import { environment } from 'src/environments/environment';

// HTTP options for calling API
const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type':  'application/json;charset="UTF-8"',
    // 'Accept': 'text/plain; application/json; text/html;',
  })
};

interface CotizacionesABuscar {
  monedaOrigen: string;
  monedaDestino: string;
  rateType: string;
}

@Injectable()
export class CotizacionesService {

  private arrayCotiz = new BehaviorSubject([]);
  public rtnArray = this.arrayCotiz.asObservable();

  constructor(
    private http: HttpClient,
    private errorMessageService: ErrorMessageService
  ) { }

  // Leer todas las cotizaciones de un dia
  getDiaria(fecha: string, cotizacionesABuscar: CotizacionesABuscar[]) {
    const diariaByDay = from(cotizacionesABuscar);

    const diariaArray = diariaByDay.pipe(
      mergeMap(
        cotizacion => {
          const qp1 = 'ratetype=' + cotizacion.rateType;
          const qp2 = 'monorigen=' + cotizacion.monedaOrigen;
          const qp3 = 'mondestino=' + cotizacion.monedaDestino;
          const qp4 = 'fecha=' + fecha;
          return this.http.get(`${environment.envData.sapGwServer}/api2/exchangerate?${qp1}&${qp2}&${qp3}&${qp4}`).pipe(
            map(
              data => {
                return <CotizacionesDiariaModel>{
                  monedaOrigen: data['fromCurrency'],
                  monedaDestino: data['toCurrency'],
                  tipoCotizacion: (cotizacion.rateType === 'M' || cotizacion.rateType === 'EURX') ? 'Venta' : 'Compra',
                  valorCotizacion: `1 ${data['toCurrency']} = ${data['directExchange']} ${data['fromCurrency']}`,
                  fechaCotizacion: data['validFromDate']
                };
              }
            )
          );
        }
      ), toArray()
    );

    return diariaArray;
  }

  // Leer una cotizacion del SAP
  getCotizacion(rateType: String, monOrigen: string, monDestino: string, fecha: string): Observable<Cotizacion> {
    const qp1 = `ratetype=${rateType}`;
    const qp2 = `monorigen=${monOrigen}`;
    const qp3 = `mondestino=${monDestino}`;
    const qp4 = `fecha=${fecha}`;
    return this.http.get<Cotizacion>(`${environment.envData.sapGwServer}/api2/exchangerate?${qp1}&${qp2}&${qp3}&${qp4}`);
  }

  // Actualizar una cotizacion en el SAP y en el MySql para el Tableau
  saveCotizacion(rateType: String, monOrigen: string, monDestino: string, fecha: string, valor: number): Observable<Object> {
    // Map data before send
    const exchangeData = {
      ratetype: rateType,
      monorigen: monOrigen,
      mondestino: monDestino,
      fecha,
      directexchange: valor,
      indirectexchange: (1 / valor)
    };

    // Llamar al Gateway SAP de Claxson
    return this.http.post(`${environment.envData.sapGwServer}/api/updexchangerate`, exchangeData, httpOptions);
  }

  // Obtener un array de 3 filas:
  // 1ra.fila: ultimas cotizaciones mensuales para el tipo comprador
  // 2da.fila: ultimas cotizaciones mensuales para el tipo vendedor
  // 3ra.fila: cotizaciones promedio mensuales
  getCotizacionesPromedio(monedaOrigen: string, monedaDestino: string, mesInicial: moment.Moment, mesFinal: moment.Moment) {
    const mesIni = mesInicial.format('YYYYMMDD');
    const mesFin = mesFinal.format('YYYYMMDD');

    // Generar el Array con las fechas a obtener cotizaciones
    const datesToSearch = [];
    let mes = moment(mesIni).endOf('M');
    while (mes <= moment(mesFin).endOf('M')) {
      datesToSearch.push(mes.format('YYYYMMDD'));
      mes = mes.add(1, 'M').endOf('M');
    }

    // Obtener tipo de cambio vendedor
    const vendedorDates = from(datesToSearch);
    const vendedorArray = vendedorDates
      .pipe(
        concatMap(
          data => {
            return this.getCotizacion((monedaDestino === 'USD') ? 'M' : 'EURX', monedaOrigen, monedaDestino, data).pipe(
              map(
                data2 => {
                  return {
                    type: 'vendedor',
                    validFromDate: data2.validFromDate,
                    directExchange: data2.directExchange
                  };
                }
              )
            );
          }
        )
      );

    // Obtener tipo de cambio comprador
    const compradorDates = from(datesToSearch);
    const compradorArray = compradorDates
      .pipe(
        concatMap(
          data => {
            return this.getCotizacion('G', monedaOrigen, monedaDestino, data).pipe(
              map(
                data2 => {
                  return {
                    type: 'comprador',
                    validFromDate: data2.validFromDate,
                    directExchange: data2.directExchange
                  };
                }
              )
            );
          }
        )
      );

    // Obtener las cotizaciones promedio mensuales
    // Generar el Array con las fechas a obtener cotizaciones
    const datesPromedio = [];
    let dia = moment(mesIni).startOf('M');
    while (dia <= moment(mesFin).endOf('M')) {
      datesPromedio.push(dia.format('YYYYMMDD'));
      dia = dia.add(1, 'd');
    }
    const promedioDia = from(datesPromedio);
    const promedioAll = promedioDia.pipe(
      mergeMap(
        dataDay => {
          return this.getCotizacion((monedaDestino === 'USD') ? 'M' : 'EURX', monedaOrigen, monedaDestino, dataDay).pipe(
            map(
              data2 => {
                return {
                  type: 'promedio',
                  month: dataDay.substring(0, 6),
                  validFromDate: data2.validFromDate,
                  directExchange: data2.directExchange
                };
              }
            )
          );
        }
      )
    );
    const promedioArray = promedioAll.pipe(
      groupBy(cotizacion => cotizacion.month),
      mergeMap(group => group.pipe(toArray())),
      map(
        group => {
          let total = 0;
          group.forEach((data) => { total += data['directExchange']; });
          return {
            type: 'promedio',
            validFromDate: group[0]['month'],
            directExchange: round(total / group.length, 2)
          };
        }
      )
    );

    // Devolver todas las cotizaciones agrupadas segun el tipo de cotización
    return merge(vendedorArray, compradorArray, promedioArray).pipe(
      groupBy(data => data['type']),
      mergeMap(group => group.pipe(toArray()))
    );
  }

  // Obtener las cotizaciones de una moneda entre ciertas fechas desde-hasta
  getEntreFechas(deMoneda: string, aMoneda: string, fechaDesde: string, fechaHasta: string, tipoCotizacion: string): Observable<{[key: string]: any}[]> {

    // Generar el Array con las fechas a obtener cotizaciones
    const datesToSearch = [];
    let dia = moment(fechaDesde, 'YYYYMMDD');
    while (dia.format('YYYYMMDD') <= fechaHasta) {
      datesToSearch.push(dia.format('YYYYMMDD'));
      dia = dia.add(1, 'd');
    }

    // Determinar la moneda origen y destino y el tipo de cotización
    let invertirCotizacion = false;
    let rateType = tipoCotizacion === 'compra' ? 'G' : 'M';  // dato específico del SAP
    if (deMoneda === 'EUR' || aMoneda === 'EUR') {
      // EUR: euro
      rateType = 'EURX';
      invertirCotizacion = (deMoneda === 'EUR');

    } else if (deMoneda === 'USD' || aMoneda === 'USD') {
      // USD: dólar
      invertirCotizacion = (deMoneda === 'USD');
    }
    const monedaOrigen = invertirCotizacion ? aMoneda : deMoneda;
    const monedaDestino = invertirCotizacion ? deMoneda : aMoneda;

    // Obtener tipo de cambio vendedor
    const valoresDias = from(datesToSearch);
    const valoresArray = valoresDias.pipe(
      concatMap(
        data => {
          return this.getCotizacion(rateType, monedaOrigen, monedaDestino, data).pipe(
            map(
              data2 => {
                let cotizacion = 1;
                if (monedaOrigen !== monedaDestino) {
                  cotizacion = invertirCotizacion ? data2.inDirectExchange : data2.directExchange;
                }

                return {
                  fecha: moment(data, 'YYYYMMDD'),
                  fechaSap: moment(data2.validFromDate, 'YYYY-MM-DD'),
                  valorCotizacion: cotizacion
                };
              }
            )
          );
        }
      ), toArray()
    );

    return valoresArray;
  }
}
