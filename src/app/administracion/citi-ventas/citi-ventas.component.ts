import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';


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
import { SelectOption } from 'src/app/models/select-option';

// Services
import { AuxiliarTablesService } from 'src/app/shared/auxiliar-tables.service';
import { ErrorMessageService } from 'src/app/core/error-message.service';
import { ExcelExporterService } from 'src/app/shared/excel_exporter.service';
import { SapService } from 'src/app/shared/sap.service';

@Component({
  selector: 'app-citi-ventas',
  templateUrl: './citi-ventas.component.html',
  styleUrls: ['./citi-ventas.component.css'],
  providers: [
    {provide: MAT_DATE_FORMATS, useValue: MY_FORMATS}
  ]

})
export class CitiVentasComponent implements OnInit {

  // Definir variables
  companyOptions: SelectOption[];
  formData: FormGroup;
  hideBtnReporteSAP = false;
  sapDocFacturas = [];

  // Variables para Holdable Button bar
  public color = 'warn';
  public holdableButtonMs = 0;
  public isFetching = false;  // se utiliza para mostrar el spinner

  // Definir array para exportar a Excel
  dataToExcel = {};

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
      fechaDesde: [
        moment().subtract(1, 'month').startOf('month'),
        [Validators.required]
      ],
      fechaHasta: [
        moment().subtract(1, 'month').endOf('month'),
        [Validators.required]
      ]
    });
  }

  ngOnInit() {

    // Company Options
    this.auxiliarTablesService.getOptionsFromJsonFile('citi_ventas_company_options.json').subscribe(
      data => {
        this.companyOptions = data;
      }
    );
  }

  // GETTERS
  get companyId() { return this.formData.get('companyId'); }
  get fechaDesde() { return this.formData.get('fechaDesde'); }
  get fechaHasta() { return this.formData.get('fechaHasta'); }

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
    this.dataToExcel = {};

    // Obtener los datos de los recibos del SAP y formatearlos en un Json
    this.sapService.getCitiVentas(
      this.companyId.value,
      this.fechaDesde.value.format('YYYYMMDD'),
      this.fechaHasta.value.format('YYYYMMDD'),
    ).subscribe(
      data => {
        if (data['comprobantes'].length <= 0) {
          // tslint:disable-next-line: max-line-length
          this.errorMessageService.changeErrorMessage('API-0004(E): no se encontró ningun registro que cumpla con los filtros establecidos.');
        } else {
          this.dataToExcel = data;
          this.errorMessageService.changeErrorMessage('Reporte generado con éxito');
        }
        this.hideBtnReporteSAP = false;
        this.isFetching = false;
      },
      err => {
        this.errorMessageService.changeErrorMessage(err);
        this.hideBtnReporteSAP = false;
        this.isFetching = false;
      }
    );

  }


  // Botón Exportar a Excel
  public exportExcel() {
   this.excelExporterService.exportMultiSheets(
      this.dataToExcel,
      `${this.companyId.value.replace(/\s/g, '').toLowerCase()}_${this.fechaHasta.value.format('YYYYMMDD')}_citi_ventas_`);
  }
}



