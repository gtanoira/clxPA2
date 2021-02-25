import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';

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

// Modelos
import { SelectOption } from 'src/app/models/select-option';
interface Cotizacion {
  fecha: string;
  fechaSap: string;
  valorCotizacion: number;
}

// Servicios
import { AuxiliarTablesService } from 'src/app/shared/auxiliar-tables.service';
import { AgGridLoadingComponent } from 'src/app/shared/ag-grid/ag-grid_loading.component';
import { CotizacionesService } from 'src/app/shared/cotizaciones.service';
import { ErrorMessageService } from 'src/app/core/error-message.service';
import { ExcelExporterService } from 'src/app/shared/excel_exporter.service';
import { ContentObserver } from '@angular/cdk/observers';

@Component({
  selector: 'app-cotizacion-entre-fechas',
  templateUrl: './entre_fechas.component.html',
  styleUrls: ['./entre_fechas.component.css'],
  providers: [
    {provide: MAT_DATE_FORMATS, useValue: MY_FORMATS}
  ]
})
export class CotizacionEntreFechasComponent implements OnInit {

  // Definir FORM
  public formData: FormGroup;
  public currencyOptions: SelectOption[];
  public isFetching = true;
  public rateTypeOptions: any[] = [
    { id: 'compra', name: 'Compra' },
    { id: 'venta', name: 'Venta'}
  ];

  // Definir variables del AG-GRID
  public  columnDefs;
  public  defaultColDef;
  public  frameworkComponents;
  private gridApi;
  private gridColumnApi;
  public  loadingOverlayComponent;
  public  loadingOverlayComponentParams;
  public  overlayLoadingTemplate;
  public  rowData: Cotizacion[] = [];

  // Otras variables
  private initComponent = true;

  // Form validators (triggers)
  subsCurrencies: Subscription;
  subsRateType: Subscription;

  constructor(
    private auxiliarTablesService: AuxiliarTablesService,
    private cotizacionesDiaria: CotizacionesService,
    private errorMessageService: ErrorMessageService,
    private excelExporterService: ExcelExporterService,
    private fb: FormBuilder,
  ) {
    // Inicializar el FORM
    this.formData = this.fb.group({
      deMoneda: [
        'ARS',
        this.validateCurrencies.bind(this)
      ],
      aMoneda: [
        'USD',
        this.validateCurrencies.bind(this)
      ],
      fechaDesde: [
        moment().subtract(15, 'd')
      ],
      fechaHasta: [
        moment()
      ],
      rateType: [
        'venta',
        this.validateRateType.bind(this)
      ]
    });

    // Definir las columnas del AG-GRID
    this. columnDefs = [
      {
        headerName: 'Fecha',
        field: 'fecha',
        width: 110,
        sort: 'asc',
        valueFormatter: (params) => {
          return moment(params.value).format('DD-MMM-YYYY');
        }
      }, {
        headerName: 'Cotización',
        field: 'valorCotizacion',
        width: 110,
        cellStyle: (params) => {
          if (params.data.fecha.format('YYYYMMDD') !== params.data.fechaSap.format('YYYYMMDD')) {
            return {color: 'red'};
          } else {
            return null;
          }
        }
      }, {
        headerName: 'Fecha SAP',
        field: 'fechaSap',
        width: 110,
        cellStyle: {color: 'grey'},
        sort: false,
        valueFormatter: (params) => {
          // Solo mostrar la fecha si la cotización SAP pertenece a otro día
          if (params.data.fechaSap.format('YYYYMMDD') !== params.data.fecha.format('YYYYMMDD')) {
            return moment(params.value).format('DD-MMM-YYYY');
          } else {
            return '';
          }
        }
      }
    ];
    this.defaultColDef = {
      sortable: true,
      resizable: true
    };
    this.frameworkComponents = {
      customLoadingOverlay: AgGridLoadingComponent
    };
    this.loadingOverlayComponent = 'customLoadingOverlay';
    this.loadingOverlayComponentParams = { loadingMessage: 'Loading ...' };
  }

  // GETTERS
  get deMoneda()   { return this.formData.get('deMoneda'); }
  get aMoneda()    { return this.formData.get('aMoneda'); }
  get fechaDesde() { return this.formData.get('fechaDesde'); }
  get fechaHasta() { return this.formData.get('fechaHasta'); }
  get rateType()   { return this.formData.get('rateType'); }

  ngOnInit() {
    // Definir valores para moneda
    this.auxiliarTablesService.getTableFromJson('currencies.json')
    .subscribe(
      data  => { this.currencyOptions = data; },
      error => { this.errorMessageService.changeErrorMessage('Error al leer el archivo currencies.json'); }
    );

    // Validador (trigger) de los campos Moneda
    // this.validateCurrencies();
    // this.validateRateType();
  }

  // Ejecutar una vez inicializado el AG-GRID
  onGridReady(params) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;

    // Get all the Exchange Rates of TODAY
    this.getCotizaciones();
  }

  // Ajustar las columnas del grid
  private autoSizeAllColumns() {
    const allColumnIds = [];
    this.gridColumnApi.getAllColumns().forEach((column) => {
      allColumnIds.push(column.colId);
    });
    this.gridColumnApi.autoSizeColumns(allColumnIds);
  }

  // Leer las cotizaciones diaria y cargarlas en el grid
  getCotizaciones() {

    // Definir variables
    let tipoCotizacion: string;

    // Desactivar botón exportar a excel
    this.isFetching = true;

    // Spinner
    this.gridApi.showLoadingOverlay();

    // Calcular el rate type
    if (this.aMoneda.value === 'EUR' || this.deMoneda.value === 'EUR') {
      tipoCotizacion = 'EURX';
      this.rateType.setValue('venta');
    } else {
      if (this.rateType.value === 'venta') {
        tipoCotizacion = 'M';
      } else {
        tipoCotizacion = 'G';
      }
    }

    this.cotizacionesDiaria.getEntreFechas(
      this.deMoneda.value,
      this.aMoneda.value,
      this.fechaDesde.value.format('YYYYMMDD'),
      this.fechaHasta.value.format('YYYYMMDD')
    ).subscribe(
      data => {
        // Cargo el grid con datos
        this.gridApi.setRowData(data);

        // Autosize a las columnas
        if (this.initComponent) {
          this.gridApi.sizeColumnsToFit();
          this.initComponent = false;
        } else {
          this.autoSizeAllColumns();
        }

        // Activar botón exportar a excel
        this.isFetching = false;
      }
    );
  }

  // Exportar a Excel
  exportExcel() {
    // Transformar los datos
    const arrayData = [];
    this.gridApi.forEachNode((rowNode, index) => {
      arrayData.push({
        deMoneda: this.deMoneda.value,
        aMoneda: this.aMoneda.value,
        fecha: rowNode.data.fecha.format(),
        cotizacion: rowNode.data.valorCotizacion,
        fechaSap: rowNode.data.fechaSap.format('DD/MM/YYYY')
      });
    });
    this.excelExporterService.exportAsExcelFile(
      arrayData,
      `cotizacion_entreFechas_`);
  }

  // Validador de los campos Moneda
  public validateCurrencies(control: FormControl): {[key: string]: any} {
    if (control.parent && (control.parent.get('deMoneda').value !== 'ARS' || control.parent.get('aMoneda').value !== 'USD')) {
      this.rateType.setValue('venta');
    }
    return null;
  }

  // Validador del campo Tipo de Cambio
  public validateRateType(control: FormControl): {[key: string]: any} {
    if (control && control.value === 'compra') {
      this.deMoneda.clearValidators()
      this.deMoneda.setValue('ARS');
      this.deMoneda.setValidators(this.validateCurrencies.bind(this));

      this.aMoneda.clearValidators();
      this.aMoneda.setValue('USD');
      this.aMoneda.setValidators(this.validateCurrencies.bind(this));
    }
    return null;
  }
}
