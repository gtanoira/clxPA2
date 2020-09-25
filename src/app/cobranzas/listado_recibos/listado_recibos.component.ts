import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, AbstractControl } from '@angular/forms';
import { Observable, from, concat, of } from 'rxjs';
import { map, startWith, catchError, merge, mergeMap, toArray } from 'rxjs/operators';

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

// Models
import { DetalleReciboModel } from 'src/app/models/dealle_recibo.model';
import { SapClientModel } from 'src/app/models/sap_client.model';
import { SelectOption } from 'src/app/models/select-option';

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
  selector: 'app-listado-recibos',
  templateUrl: './listado_recibos.component.html',
  styleUrls: ['./listado_recibos.component.css'],
  providers: [
    {provide: MAT_DATE_FORMATS, useValue: MY_FORMATS}
  ]

})
export class ListadoRecibosComponent implements OnInit {

  // Definir variables
  cobradorOptions: SelectOption[];
  companyOptions: SelectOption[];
  clientOptions: SapClientModel[] = [];
  docsName = [];
  filteredClients: Observable<SapClientModel[]>;
  formData: FormGroup;
  hideBtnReporteSAP = false;
  sapDocFacturas = [];

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
      companyId: [
        ''
      ],
      tipoFecha: [
        'recibo'
      ],
      fechaDesde: [
        moment().subtract(1, 'month').startOf('month'),
        [Validators.required]
      ],
      fechaHasta: [
        moment().subtract(1, 'month').endOf('month'),
        [Validators.required]
      ],
      clientId: [
        ''
        // this.validateClientId.bind(this)
      ],
      cobradorId: [
        ''
      ]
    });
  }

  ngOnInit() {

    // Company Options
    this.auxiliarTablesService.getOptionsFromJsonFile('listado_recibos_company_options.json').subscribe(
      data => {
        this.companyOptions = data;
      }
    );

    // Cobrador Options
    this.auxiliarTablesService.getOptionsFromJsonFile('listado_recibos_cobrador_options.json').subscribe(
      data => {
        this.cobradorOptions = data;
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
  }

  // GETTERS
  get companyId() { return this.formData.get('companyId'); }
  get tipoFecha() { return this.formData.get('tipoFecha'); }
  get fechaDesde() { return this.formData.get('fechaDesde'); }
  get fechaHasta() { return this.formData.get('fechaHasta'); }
  get clientId() { return this.formData.get('clientId'); }
  get cobradorId() { return this.formData.get('cobradorId'); }

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

    // Obtener los datos de los recibos del SAP y formatearlos en un Json
    this.sapService.getDetalleRecibos(
      this.companyId.value,
      this.tipoFecha.value,
      this.fechaDesde.value.format('YYYYMMDD'),
      this.fechaHasta.value.format('YYYYMMDD'),
      ( typeof this.clientId.value === 'string') ? this.clientId.value : this.clientId.value['id'].toString(),
      this.cobradorId.value
    ).subscribe(
      data => {
        if (data.length <= 0) {
          // tslint:disable-next-line: max-line-length
          this.errorMessageService.changeErrorMessage('API-0004(E): no se encontró ningun registro que cumpla con los filtros establecidos.');
        } else {
          this.dataToExcel = data;
          this.sortJsonArray(this.dataToExcel);
          this.errorMessageService.changeErrorMessage('Reporte generado con éxito');
        }
        this.hideBtnReporteSAP = false;
        this.isFetching = false;
      },
      err => {
        this.errorMessageService.changeErrorMessage(err);
        this.isFetching = false;
      }
    );

  }

  private sortJsonArray(objectArray: DetalleReciboModel[]): void {
    objectArray.sort((left: DetalleReciboModel, right: DetalleReciboModel) => {
      // ASCENDENTE por docCompensacion
      if (left.docCompensacion < right.docCompensacion) {
         return -1;
      } else if (left.docCompensacion > right.docCompensacion) {
        return 1;

      // SON IGUALES, ordenar por docNroLegal DESCENDENTE
      } else {
        if (left.docClase < right.docClase) {
          return 1;
        } else {
          return -1;
        }
      }
    });
  }

  // Botón Exportar a Excel
  public exportExcel() {
   this.excelExporterService.exportAsExcelFile(
      this.dataToExcel,
      `${this.tipoFecha.value}_${this.companyId.value.replace(/\s/g, '').toLowerCase()}_${this.fechaHasta.value.format('YYYYMMDD')}_`);
  }
}



