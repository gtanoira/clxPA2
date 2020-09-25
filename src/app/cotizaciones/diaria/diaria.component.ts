import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';

// External libraries
import * as moment from 'moment';

// Modelos
import { CotizacionesDiariaModel } from 'src/app/models/cotizaciones-diaria';
interface CotizacionesABuscar {
  monedaOrigen: string;
  monedaDestino: string;
  rateType: string;
}

// Servicios
import { CotizacionesService } from 'src/app/shared/cotizaciones.service';
import { ErrorMessageService } from 'src/app/core/error-message.service';
import { ExcelExporterService } from 'src/app/shared/excel_exporter.service';

// Components
import { AgGridLoadingComponent } from 'src/app/shared/ag-grid/ag-grid_loading.component';
import { AggridTooltipComponent } from 'src/app/shared/ag-grid/aggrid-tooltip.component';

@Component({
  selector: 'app-cotizacion-diaria',
  templateUrl: './diaria.component.html',
  styleUrls: ['./diaria.component.css']
})
export class CotizacionDiariaComponent {

  // Definir FORM
  public  formData: FormGroup;
  public isFetching = true;

  // Definir variables del AG-GRID
  public  columnDefs;
  public  defaultColDef;
  public  frameworkComponents;
  private gridApi;
  private gridColumnApi;
  public  loadingOverlayComponent;
  public  loadingOverlayComponentParams;
  public  overlayLoadingTemplate;
  public  dataToExcel: CotizacionesDiariaModel[] = [];

  // Otras variables
  private initComponent = true;

  // Definir las cotizaciones a buscar en SAP
  private cotizacionesABuscar = [
    {
      monedaOrigen: 'ARS',
      monedaDestino: 'USD',
      rateType: 'G',
    }, {
      monedaOrigen: 'ARS',
      monedaDestino: 'USD',
      rateType: 'M',
    }, {
      monedaOrigen: 'UYU',
      monedaDestino: 'USD',
      rateType: 'M',
    }, {
      monedaOrigen: 'CLP',
      monedaDestino: 'USD',
      rateType: 'M',
    }, {
      monedaOrigen: 'COP',
      monedaDestino: 'USD',
      rateType: 'M',
    }, {
      monedaOrigen: 'PEN',
      monedaDestino: 'USD',
      rateType: 'M',
    }, {
      monedaOrigen: 'MXN',
      monedaDestino: 'USD',
      rateType: 'M',
    }, {
      monedaOrigen: 'BRL',
      monedaDestino: 'USD',
      rateType: 'M',
    }, {
      monedaOrigen: 'VEL',
      monedaDestino: 'USD',
      rateType: 'M',
    }, {
      monedaOrigen: 'VES',
      monedaDestino: 'USD',
      rateType: 'M',
    }, {
      monedaOrigen: 'ARS',
      monedaDestino: 'EUR',
      rateType: 'EURX',
    }, {
      monedaOrigen: 'USD',
      monedaDestino: 'EUR',
      rateType: 'EURX',
    }, {
      monedaOrigen: 'MXN',
      monedaDestino: 'EUR',
      rateType: 'EURX',
    }
  ];

  constructor(
    private cotizacionesDiaria: CotizacionesService,
    private errorMessageService: ErrorMessageService,
    private excelExporterService: ExcelExporterService,
    private fb: FormBuilder,
  ) {
    // Inicializar el FORM
    this.formData = this.fb.group({
      fechaCotizacion: [moment()]
    });

    // Definir las columnas del AG-GRID
    this. columnDefs = [
      {
        headerName: 'Des',
        field: 'monedaDestino',
        width: 80,
        sort: 'des',
        sortable: true,
        suppressSizeToFit: true
      }, {
        headerName: 'Ori',
        field: 'monedaOrigen',
        width: 80,
        sortable: true,
        suppressSizeToFit: true
      }, {
        headerName: 'Tipo',
        field: 'tipoCotizacion',
        width: 82,
        sortable: true,
        suppressSizeToFit: true
      }, {
        headerName: 'Valor',
        field: 'valorCotizacion',
        width: 220,
        sortable: false,
        tooltipField: 'fechaCotizacion',
        tooltipComponentParams: { }
      }
    ];
    this.defaultColDef = {
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

  // GETTERS
  get fechaCotizacion() { return this.formData.get('fechaCotizacion'); }

  // Ejecutar una vez inicializado el AG-GRID
  onGridReady(params) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;

    // Establecer los validadores
    this.formData.get('fechaCotizacion').setValidators(this.fechaCotizacionValidator.bind(this));

    // Get all the Exchange Rates of TODAY
    this.getCotizacionesDiaria(moment().format('YYYYMMDD'), this.cotizacionesABuscar);

  }

  // Ajustar las columnas del grid
  autoSizeAllColumns() {
    const allColumnIds = [];
    this.gridColumnApi.getAllColumns().forEach((column) => {
      allColumnIds.push(column.colId);
    });
    this.gridColumnApi.autoSizeColumns(allColumnIds);
  }

  // Validation for item fechaCotizacion
  fechaCotizacionValidator(control: FormControl): {[s: string]: boolean} {
    if (control && (control.value !== null || control.value !== undefined)) {

      this.errorMessageService.changeErrorMessage('');
      // console.log('*** EVT: ', evt);

      // MOMENT object
      const val = moment(control.value);
      if (val.isValid()) {
        // Get all the Exchange Rates of the day
        this.getCotizacionesDiaria(val.format('YYYYMMDD'), this.cotizacionesABuscar);
      } else {
        this.errorMessageService.changeErrorMessage('La fecha ingresada es incorrecta.');
      }

      return null;  // null means NO errors
    }
  }

  // Leer las cotizaciones diaria y cargarlas en el grid
  getCotizacionesDiaria(fecha: string, cotizacionesABuscar: CotizacionesABuscar[]) {

    // Spinner
    this.gridApi.showLoadingOverlay();
    this.isFetching = true;

    this.cotizacionesDiaria.getDiaria(fecha, cotizacionesABuscar).subscribe(
      data => {
        // Cargo el grid con datos
        this.gridApi.setRowData(data);

        // Salvo los datos para exportarlos a excel
        this.dataToExcel = data;
        this.isFetching = false;

        // Autosize a las columnas
        if (this.initComponent) {
          this.gridApi.sizeColumnsToFit();
          this.initComponent = false;
        } else {
          this.autoSizeAllColumns();
        }
      }
    );
  }

  // Botón Exportar a Excel
  exportExcel() {
    this.excelExporterService.exportAsExcelFile(
      this.dataToExcel,
      `cotizaciones_diaria_${this.fechaCotizacion.value.format('YYYYMMDD')}_`);
  }
}
