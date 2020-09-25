import { Component, OnInit, ElementRef } from '@angular/core';
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

// Modelos
import { CotizacionesDiariaModel } from 'src/app/models/cotizaciones-diaria';
import { SelectOption } from 'src/app/models/select-option';

// Servicios
import { AuxiliarTablesService } from 'src/app/shared/auxiliar-tables.service';
import { CotizacionesService } from 'src/app/shared/cotizaciones.service';
import { ErrorMessageService } from 'src/app/core/error-message.service';
import { ExcelExporterService } from 'src/app/shared/excel_exporter.service';

// Components
import { AgGridLoadingComponent } from 'src/app/shared/ag-grid/ag-grid_loading.component';
import { AggridTooltipComponent } from 'src/app/shared/ag-grid/aggrid-tooltip.component';

@Component({
  selector: 'app-cotizaciones-promedio',
  templateUrl: './promedio.component.html',
  styleUrls: ['./promedio.component.css'],
  providers: [
    {provide: MAT_DATE_FORMATS, useValue: MY_FORMATS}
  ]
})
export class CotizacionPromedioComponent implements OnInit {

  // Definir variables
  public formData: FormGroup;
  public isFetching = true;
  public monedaOrigenOptions: SelectOption[] = [];
  public monedaDestinoOptions: SelectOption[] = [{
    id: 'USD',
    name: 'USD-Dólar USA'
  }, {
    id: 'EUR',
    name: 'Euro'
  }];

  // Definir variables del AG-GRID
  public  columnDefs;
  public  defaultColDef;
  public  frameworkComponents;
  private gridApi;
  private gridColumnApi;
  public  loadingOverlayComponent;
  public  loadingOverlayComponentParams;
  public  overlayLoadingTemplate;
  public  rowData: CotizacionesDiariaModel[] = [];

  constructor(
    private auxiliarTablesService: AuxiliarTablesService,
    private cotizacionesService: CotizacionesService,
    private el: ElementRef,
    private fb: FormBuilder,
    private errorMessageService: ErrorMessageService,
    private excelExporterService: ExcelExporterService,
  ) {
    // Inicializar el FORM
    this.formData = this.fb.group({
      monedaOrigen: ['ARS', <any>Validators.required],
      monedaDestino: ['USD', <any>Validators.required]
    });

    // Definir las columnas del AG-GRID
    this. columnDefs = [{
      headerName: '',
      field: 'rowDescription',
      width: 80
    }, {
      headerName: 'dec',
      field: 'mes0',
      width: 65,
      tooltipField: 'date0'
    }, {
      headerName: 'ene',
      field: 'mes1',
      width: 65,
      tooltipField: 'date1'
    }, {
      headerName: 'feb',
      field: 'mes2',
      width: 65,
      tooltipField: 'date2'
    }, {
      headerName: 'mar',
      field: 'mes3',
      width: 65,
      tooltipField: 'date3'
    }, {
      headerName: 'abr',
      field: 'mes4',
      width: 65,
      tooltipField: 'date4'
    }, {
      headerName: 'may',
      field: 'mes5',
      width: 65,
      tooltipField: 'date5'
    }, {
      headerName: 'jun',
      field: 'mes6',
      width: 65,
      tooltipField: 'date6'
    }, {
      headerName: 'jul',
      field: 'mes7',
      width: 65,
      tooltipField: 'date7'
    }, {
      headerName: 'ago',
      field: 'mes8',
      width: 65,
      tooltipField: 'date8'
    }, {
      headerName: 'sep',
      field: 'mes9',
      width: 65,
      tooltipField: 'date9'
    }, {
      headerName: 'oct',
      field: 'mes10',
      width: 65,
      tooltipField: 'date10'
    }, {
      headerName: 'nov',
      field: 'mes11',
      width: 65,
      tooltipField: 'date11'
    }, {
      headerName: 'dic',
      field: 'mes12',
      width: 65,
      tooltipField: 'date12'
    }];
    this.defaultColDef = {
      sortable: false,
      tooltipComponent: 'customTooltip',
      resizable: true
    };
    this.frameworkComponents = {
      customLoadingOverlay: AgGridLoadingComponent,
      customTooltip: AggridTooltipComponent
    };
    this.loadingOverlayComponent = 'customLoadingOverlay';
    this.loadingOverlayComponentParams = { loadingMessage: 'Loading ...' };
  }

  ngOnInit() {
    // Definir valores para monedaOrigenOptions
    this.auxiliarTablesService.getTableFromJson('currencies.json')
      .subscribe(
        data  => {
          data.forEach(elem => {
            if ('EUR'.indexOf(elem.id) === -1) {
              this.monedaOrigenOptions.push(elem);
            }
          });
        },
        error => { this.errorMessageService.changeErrorMessage('Error al leer el archivo currencies.json'); }
      );
  }

  // Ejecutar una vez inicializado el AG-GRID
  onGridReady(params) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;

    this.getCotizacionesPromedio();
  }

  // GETTERS
  get monedaOrigen() { return this.formData.get('monedaOrigen'); }
  get monedaDestino() { return this.formData.get('monedaDestino'); }

  getCotizacionesPromedio() {
    // Spinner
    this.isFetching = true;

    const arrayRows = [];
    // Determinar el mes inicial y final para los cálculos
    const mesFinal = moment().subtract(1, 'M').startOf('month');
    const mesInicial = moment().year(mesFinal.year() - 1).month(11).startOf('month');

    this.cotizacionesService.getCotizacionesPromedio(
      this.monedaOrigen.value,
      this.monedaDestino.value,
      mesInicial,
      mesFinal
    ).subscribe(
      data => {
        const rowData = {};
        rowData['rowDescription'] = data[0]['type'];
        // tslint:disable-next-line: forin
        for (const i in data) {
          rowData['mes' + i] = data[i]['directExchange'];
          rowData['date' + i] = data[i]['validFromDate'];
        }
        arrayRows.push(rowData);
        this.gridApi.setRowData(arrayRows);
        this.autoSizeAllColumns();

        // Desactivar el spinner
        this.isFetching = false;
      }
    );

  }

  // Ajustar las columnas del grid
  private autoSizeAllColumns() {
    const allColumnIds = [];
    this.gridColumnApi.getAllColumns().forEach((column) => {
      allColumnIds.push(column.colId);
    });
    this.gridColumnApi.autoSizeColumns(allColumnIds);
  }

  // Exportar a Excel
  exportExcel() {
    // Transformar los datos
    const arrayData = [];
    this.gridApi.forEachNode((rowNode, index) => {
      arrayData.push({
        descripcion: rowNode.data.rowDescription,
        dec: rowNode.data.mes0,
        ene: rowNode.data.mes1,
        feb: rowNode.data.mes2,
        mar: rowNode.data.mes3,
        abr: rowNode.data.mes4,
        may: rowNode.data.mes5,
        jun: rowNode.data.mes6,
        jul: rowNode.data.mes7,
        ago: rowNode.data.mes8,
        sep: rowNode.data.mes9,
        oct: rowNode.data.mes10,
        nov: rowNode.data.mes11,
        dic: rowNode.data.mes12,
      });
    });
    this.excelExporterService.exportAsExcelFile(
      arrayData,
      `cotizacion_promedio_`);
  }


}
