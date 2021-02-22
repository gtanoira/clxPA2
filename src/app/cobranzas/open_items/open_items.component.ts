import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Observable, from, concat, of } from 'rxjs';
import { map, startWith, catchError, mergeMap, toArray } from 'rxjs/operators';

// External libraries
import * as moment from 'moment';
import { MAT_DATE_FORMATS } from '@angular/material/core';
// Moment date formats
export const MY_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD-MMM-YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'lll',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

// Functions
import { arraySort } from 'src/app/shared/sort_functions';

// Models
import { OpenItemModel, CrearOpenItem } from 'src/app/models/open_item.model';
import { SelectOption } from 'src/app/models/select-option';
import { SapClientModel } from 'src/app/models/sap_client.model';

// Private Models
interface PagoParcialModel {
  docFecha: string;
  monedaId: string;
  docImporte: number;
}

// Services
import { AuxiliarTablesService } from 'src/app/shared/auxiliar-tables.service';
import { ErrorMessageService } from 'src/app/core/error-message.service';
import { ExcelExporterService } from 'src/app/shared/excel_exporter.service';
import { SapService } from 'src/app/shared/sap.service';

@Component({
  selector: 'app-open-items',
  templateUrl: './open_items.component.html',
  styleUrls: ['./open_items.component.css'],
  providers: [
    {provide: MAT_DATE_FORMATS, useValue: MY_FORMATS}
  ]

})
export class OpenItemsComponent implements OnInit {

  // Definir variables
  companyOptions: SelectOption[];
  clientOptions: SapClientModel[] = [];
  docsName = [];
  filteredClients: Observable<SapClientModel[]>;
  formData: FormGroup;
  hideBtnReporteSAP = false;
  sapDocFacturas = [];
  clienteAllItems = [];  // Son todas las partidas (docs) del cliente de los últimos 2 años.
                         // Se usa para obtener la fecha y el importe del recibo con que se pagó el doc para armar
                         // las observaciones de los WHy

  // Variables para Holdable Button bar
  public color = 'warn';
  public holdableButtonMs = 0;
  public isFetching = false;  // se utiliza para mostrar el spinner

  // Definir array para exportar a Excel
  dataToExcel = [];

  constructor(
    private fb: FormBuilder,
    private auxiliarTablesService: AuxiliarTablesService,
    private errorMessageService: ErrorMessageService,
    private excelExporterService: ExcelExporterService,
    private sapService: SapService
  ) {

    // Definir FORM
    this.formData = this.fb.group({
      clientId: [
        '',
        this.validateClientId.bind(this)
      ],
      companyId: [
        ''
      ],
      fechaCorte: [
        moment(),
        [Validators.required]
      ]
    });
  }

  ngOnInit() {

    // Company Options
    this.auxiliarTablesService.getOptionsFromJsonFile('open_items_company_options.json').subscribe(
      data => {
        this.companyOptions = data;
      }
    );

    // Leer todos los clientes
    this.sapService.getClients().subscribe(
      clients => this.clientOptions = clients,
      err => this.errorMessageService.changeErrorMessage(err)
    );

    // Trigger para clientId (mat-autocomplete)
    this.filteredClients = this.formData.get('clientId').valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value))
    );

    /*
      Leer los tipos de doc SAP para las FACTURAS y ND que servirán para determinar qué cbtes.
      deben tomarse en cuenta para generar cada registro del Excel que devolverá esta aplicación
    */
    this.auxiliarTablesService.getOptionsFromJsonFile('open_items_doc_facturas.json').subscribe(
      data => {
        this.sapDocFacturas = data['sapDocsFactura'];
        this.docsName = data['docsName'];
      }
    );
  }

  // GETTERS
  get clientId() { return this.formData.get('clientid'); }

  // Display value for mat-autocomplete
  public displayFn(subject) {
    // subject es el contenido de [value] en <mat-option>
    return subject ? `${subject.name} (${subject.id})` : undefined;
  }

  // Filter para mat-autocomplete 'clientId'
  private _filter(value: string): SapClientModel[] {
    const filterValue = typeof value === 'string' ? value.toLowerCase() : value;
    return this.clientOptions.filter(el => el.name.toLowerCase().includes(filterValue) || el.id.toString().includes(filterValue));
  }

  public validateClientId(control: AbstractControl): {[key: string]: any} | null {
    if (typeof(control.value) !== 'object') {
      return {'objeto': false};
    } else {
      return null;
    }
  }

  // Confirmar botón ACTUALIZAR
  public holdHandler(e) {

    // Chequear si hay que actualizar la cotización al mantener apretado el botón por más de 1 segundo
    this.holdableButtonMs = e;
    if (e > 100) {
      // Mas de 1 segundo apretado el botón
      this.color = 'primary';

      // Procesar el botón
      if (!this.isFetching) {
        this.submitReport();
      }

    } else {
      // No se llegó al segundo
      this.color = 'warn';
    }
  }

  // Obtener el reporte y habilitar los botones de descarga a Excel
  private submitReport(): void {

    // Borrar la linea de mensajes de error
    this.errorMessageService.changeErrorMessage('');

    // Ocultar botón Reporte SAP
    this.hideBtnReporteSAP = true;
    this.isFetching = true;  // activar Loading spinner

    // Ocultar el botón Exportar a Excel
    this.dataToExcel = [];

    /*
      Obtener los datos necesarios del SAP:
      1) Las partidas abiertas del cliente
      2) Todas las partidas del cliente
    */
    const sapOpenItems = this.sapService.getOpenItems(
      this.formData.get('companyId').value,
      this.formData.get('clientId').value['id'].toString(),
      this.formData.get('fechaCorte').value.format('YYYYMMDD')
    ).pipe(
      map(
        data => {
          if (data.length <= 0) {
            // tslint:disable-next-line: max-line-length
            this.errorMessageService.changeErrorMessage('API-0004(E): no se encontró ningun registro que cumpla con los filtros establecidos.');
          } else {
            // this.dataToExcel = this.generateReport(data);
            this.generateReport(data).then( valores => this.dataToExcel = valores );
          }
          this.hideBtnReporteSAP = false;
          this.isFetching = false;
          return of({});
        }
      ),
      catchError(
        err => {
          console.log('*** error:', err);
          throw new Error(err);
        }
      )
    );

    const dateFrom = moment(this.formData.get('fechaCorte').value);
    const sapAllItems = this.sapService.getCustomerAllItems(
      this.formData.get('companyId').value,
      this.formData.get('clientId').value['id'].toString(),
      dateFrom.subtract(3, 'years').format('YYYYMMDD'),
      this.formData.get('fechaCorte').value.format('YYYYMMDD')
    ).pipe(
      map(
        data => {
          this.clienteAllItems = data;
          return of({});
        }
      ),
      catchError(
        err => {
          this.errorMessageService.changeErrorMessage(err);
          this.clienteAllItems = [];
          return of({});
        }
      )

    );

    concat(sapAllItems, sapOpenItems).subscribe(
      data => {
        this.errorMessageService.changeErrorMessage('Reporte generado con éxito', 'info');
        return data;
      },
      err => {
        this.errorMessageService.changeErrorMessage(err.toString());
        this.hideBtnReporteSAP = false;
        this.isFetching = false;
      }
    );
  }

  // Transformar el JSON recibido del SAP al formato deseado
  private async generateReport(data: OpenItemModel[]): Promise<any[]> {

    // Iniciailizar variables
    const rtnArray = [];

    // Agregar la columna calculada refFact2 (referencia factura 2)
    let arrayData: OpenItemModel[] = [];
    for (const el of data) {
      if (el['refFactura'] === '') {
        el['refFact2'] = el['docContable'];
      } else {
        el['refFact2'] = el['refFactura'];
      }
      arrayData.push(el);
    }

    // Ordenar el array
    arrayData = arraySort(arrayData, ['refFact2', 'refKey1']);

    /*
      Armar el array definitivo: estará compuesto de 3 tipos de registros:
      1) Facturas pendientes de cobro
      2) Certificados de retención pendientes: son los WH que quedaron sin cancelar
      3) Pagos recibidos pendientes de aplicación
      Cada registro del array será identificado con una de estas 3 secciones en una columna "tipoRegistro"
      El proceso se realiza por corte de control aplicado a 'refFact2'
    */
    let antRefFact2 = 'CORTE';  // fuerzo el 1er. corte de control

    let existsFactura: OpenItemModel = new CrearOpenItem();
    let existsCertRet: OpenItemModel = new CrearOpenItem();
    let existsRecibo: OpenItemModel = new CrearOpenItem();
    let existsOtros: OpenItemModel = new CrearOpenItem();
    const inOutData = {
      totFacturas: 0,
      totCertRets: 0,
      totRecibos: 0,
      totOtros: 0,
      monFacturas: '',
      monCertRets: '',
      monRecibos: '',
      monOtros: '',
      observaciones: ''
    };
    let pagosParciales: PagoParcialModel[] = [];

    let docImporte = 0;
    let socImporte = 0;

    for (const doc of arrayData) {

      // Corte de control
      if (doc['refFact2'] !== antRefFact2) {

        if (antRefFact2 !== 'CORTE') {
          // Crear el registro
          // tslint:disable-next-line: max-line-length
          const registro = await this.crearRegistro(existsFactura, existsCertRet, existsRecibo, existsOtros, docImporte, socImporte, pagosParciales, inOutData);
          rtnArray.push( registro );
        }

        // Inicializar variables
        docImporte = 0;
        socImporte = 0;
        antRefFact2 = doc['refFact2'];
        existsFactura = new CrearOpenItem();
        existsCertRet = new CrearOpenItem();
        existsRecibo = new CrearOpenItem();
        existsOtros = new CrearOpenItem();
        pagosParciales = [];
      }

      /* No hay corte de control: procesar la info necesaria  */
      // Determinar el tipo de registro
      if (doc['refKey1'] === 'WH') {
        if (doc['tipoDoc'] !== 'DC') {
          existsCertRet = doc;
        }
      } else if (doc['tipoDoc'] === 'DX') {
        existsRecibo = doc;
      } else if (this.sapDocFacturas.findIndex(el => el === doc['tipoDoc']) >= 0) {
        existsFactura = doc;
      } else if (doc['tipoDoc'] !== 'DC') {
        existsOtros = doc;
      }

      // Actualizar incrementadores
      docImporte += doc.docImporte;
      socImporte += doc.socImporte;

      // Acumular los datos de los pagos parciales
      if (doc['tipoDoc'] === 'DC') {
        pagosParciales.push({
          monedaId: doc.monedaId,
          docFecha: doc.docFecha,
          docImporte: doc.docImporte
        });
      }
    }

    // Armar el registro por fin del array
    // tslint:disable-next-line: max-line-length
    const record = await this.crearRegistro(existsFactura, existsCertRet, existsRecibo, existsOtros, docImporte, socImporte, pagosParciales, inOutData);
    rtnArray.push( record );

    // Agregar totales
    if (inOutData['totFacturas'] !== 0) {
      // Totales generales FACTURAS
      rtnArray.push({
        docFecha: 'Total Facturas/Invoices: ',
        docNumero: inOutData['monFacturas'],
        mesServicio: inOutData['totFacturas']
      });
    }
    if (inOutData['totOtros'] !== 0) {
      // Totales generales NC / Otros
      rtnArray.push({
        docFecha: 'Total NC/Credits: ',
        docNumero: inOutData['monOtros'],
        mesServicio: inOutData['totOtros']
      });
    }
    if (inOutData['totCertRets'] !== 0) {
      // Totales generales WH
      rtnArray.push({
        docFecha: 'Total Certificados/WH certificates: ',
        docNumero: inOutData['monCertRets'],
        mesServicio: inOutData['totCertRets']
      });
    }
    if (inOutData['totRecibos'] !== 0) {
      // Totales generales RECIBOS
      rtnArray.push({
        docFecha: 'Total Recibos/AR receipts: ',
        docNumero: inOutData['monRecibos'],
        mesServicio: inOutData['totRecibos']
      });
    }

    return rtnArray;

  }

  // Crear el registro por existir Corte de Control
  private async crearRegistro(
    existsFactura: OpenItemModel,
    existsCertRet: OpenItemModel,
    existsRecibo: OpenItemModel,
    existsOtros: OpenItemModel,
    docImporte: number,
    socImporte: number,
    pagosParciales: PagoParcialModel[],
    inOutData: {}
  ): Promise<{}> {

    // Definir variables
    let docName: object;
    let newElement: OpenItemModel = new CrearOpenItem();
    let rtnObject = {};
    let tipoRegistro = '';
    let observaciones = '';

    // Armar el registro
    if (existsFactura.clienteId !== undefined) {
      // Factura o ND
      newElement = existsFactura;
      tipoRegistro = 'Factura / Invoice';
      // Recalcular el importe
      try {
        docImporte = await this.recalcularImporte(docImporte, existsFactura.monedaId, pagosParciales);
      } catch (err) {
        this.errorMessageService.changeErrorMessage(err);
        docImporte = 999999999;
      }
      inOutData['totFacturas'] = inOutData['totFacturas'] + docImporte;
      inOutData['monFacturas'] = existsFactura['monedaId'];
      observaciones = this.crearObservacionFactura(pagosParciales, existsFactura['monedaId']);

    } else if (existsOtros.clienteId !== undefined) {
      // Otros
      newElement = existsOtros;
      tipoRegistro = 'Nota de Crédito / Credit Note';
      inOutData['totOtros'] = inOutData['totOtros'] + docImporte;
      inOutData['monOtros'] = existsOtros['monedaId'];

    } else if (existsRecibo.clienteId !== undefined) {
      // Recibos
      newElement = existsRecibo;
      tipoRegistro = 'Recibos pendientes / AR receipts';
      inOutData['totRecibos'] = inOutData['totRecibos'] + docImporte;
      inOutData['monRecibos'] = existsRecibo['monedaId'];

    } else if (existsCertRet.clienteId !== undefined) {
      // Certificado de retencion
      newElement = existsCertRet;
      tipoRegistro = 'Certificado de retención / WithHolding tax certificate';
      inOutData['totCertRets'] = inOutData['totCertRets'] + docImporte;
      inOutData['monCertRets'] = existsCertRet['monedaId'];
      observaciones = this.crearObservaciones(existsCertRet['docNumero']);
    }

    // Buscar el nombre del "Tipo de Documento"
    // tslint:disable-next-line: no-shadowed-variable
    const objDocName = this.docsName.find(
      el => el.companyId === newElement['companiaId'] && el.docId === newElement['tipoDoc']
    );
    docName = (objDocName) ? objDocName['name'] : newElement['tipoDoc'];

    // Crear el registro final por corte de control
    rtnObject = {
      docFecha: newElement.docFecha,
      docTipoId: newElement.tipoDoc,
      docTipo: docName,
      docNum: newElement.docNumero,
      docNumero: (newElement.companiaId === 'XVE1') ? newElement.docNumero : newElement.docNumero.substring(3),
      mesServicio: newElement.mesServicio,
      referencia: newElement.refKey1,
      docMoneda: newElement.monedaId,
      docImporte: docImporte === 999999999 ? 'error' : docImporte,
      socMoneda: newElement.socMonId,
      socImporte,
      tipoRegistro,
      observaciones
    };

    return rtnObject;
  }

  /*
    Esta funcion recalcula el docImporte solo para las FACTURAS, ya que puede existir
    que la factura esté en una moneda (ej. BRL) y los pagos parciales (recibos) estén
    en otra moneda (ej. USD). En estos casos los recibos deben ser convertidos a la moneda
    de la factura y vueltos a sumar
  */
  private recalcularImporte(docImporte: number, docMoneda: string, pagosParciales: PagoParcialModel[]): Promise<number> {

    // Inicializar variables
    let rtnImporte = docImporte;

    const pagos = from(pagosParciales).pipe(
      mergeMap(
        data => {
          rtnImporte -= data.docImporte;
          return this.sapService.convertirImporte(data.docImporte, data.docFecha, data.monedaId, docMoneda).pipe(
            map( valor => <number>valor['importe'] )
          );
        }
      ), toArray()
    );  // .toPromise();

    return pagos.pipe(
      map(
        data => {
          data.forEach( valor => rtnImporte += valor);
          return rtnImporte;
        }
      ),
      catchError(
        err => {
          // this.errorMessageService.changeErrorMessage(err);
          // return of(999999999 );
          throw err;
        }
      )
    ).toPromise();
  }

  /*
    Crear el campo observaciones para los registros tipo WH
    Las observaciones son solo para los registro WH y tienen el sig. formato:
        "pago del dia 22/ene/2020 usd 12679.91"
    Para obtenerla es necesario realizar 2 operaciones:
    1) obtener el doc de compensación de la factura que generó el WH
    2) Obtener el cbte. DX del doc de compensación, quien es el que tiene la FECHA y el IMPORTE necesario
    Para poder lograr estos 2 pasos, es necesario acceder al SAP a través de la API  /api2/customer_all_items
    que devuelve todos los docs del cliente de los últimos 2 años (sap tts FBL5N)
  */
  private crearObservaciones(docNumero: string): string {
    // Paso 1: obtener el doc de compensación de la factura que generó el WH
    const docCompensacion = this.clienteAllItems.find(
      el => el['docNumero'] === docNumero && el['docCompensacion'] !== ''
    );
    if (!docCompensacion) {
      return '*** no se pudo encontrar el recibo ***';

    } else {

      // Paso 2: Obtener el cbte. DX del doc de compensación
      const recibo = this.clienteAllItems.find(
        el => el['docCompensacion'] === docCompensacion['docCompensacion'] && el['tipoDoc'] === 'DX'
      );
      if (recibo) {
        return `pago del día ${recibo['docFecha']} ${recibo['monedaId']} ${Math.abs(recibo['docImporte'])}`;

      } else {

        // Paso 3: no existe un DX sino un DC, por lo que hay que buscar el Doc. de compensación de ese DC
        const docCompensacionDC = this.clienteAllItems.find(
          // tslint:disable-next-line: max-line-length
          el => el['docContable'] === docCompensacion['docCompensacion'] &&
          el['tipoDoc'] === 'DC' &&
          el['docCompensacion'] !== docCompensacion['docCompensacion']
        );
        if (!docCompensacionDC) {
          return '*** no se pudo encontrar el recibo ***';

        } else {

          // Paso 4: buscar el recibo DX de ese recibo DC
          const reciboDX = this.clienteAllItems.find(
            el => el['docContable'] === docCompensacionDC['refFactura'] && el['tipoDoc'] === 'DX'
          );
          if (!reciboDX) {
            return '*** no se pudo encontrar el recibo ***';
          } else {
            return `pago del día ${reciboDX['docFecha']} ${reciboDX['monedaId']} ${Math.abs(reciboDX['docImporte'])}`;
          }
        }
      }
    }
  }

  /*
    Crear el campo observaciones para los registros tipo FACTURA
    Las observaciones tienen el sig. formato:
      "Factura pagada parcialmente: 22/ene/2020 usd 12679.91, 03/feb/2020 usd 73,21, etc."
  */
  private crearObservacionFactura(pagosParciales: PagoParcialModel[], monFactura: String): string {

    let obs = pagosParciales.length > 0 ? 'Factura pagada parcialmente:' : '';

    for (const recibo of pagosParciales) {

      // Convertir si lo hubiere, el importe del recibo a la monFactura

      obs += ` ${recibo.docFecha} ${recibo.monedaId} ${recibo.docImporte}`;
    }

    return obs;
  }

  // Botón Exportar a Excel
  public exportExcel() {
   this.excelExporterService.exportAsExcelFile(
      this.dataToExcel,
      `open_items_${this.formData.get('clientId').value['name'].replace(/\s/g, '').toLowerCase()}_`);
  }
}



