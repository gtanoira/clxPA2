import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MAT_DATE_FORMATS } from '@angular/material';
import { Subscription } from 'rxjs';

// Servicios
import { AgGridLoadingComponent } from 'src/app/shared/ag-grid/ag-grid_loading.component';
import { ErrorMessageService } from 'src/app/core/error-message.service';
import { VodService } from 'src/app/shared/vod.service';

// Modelos
import { VodTituloModel } from 'src/app/models/vod_titulo.model';

// External libraries
import * as moment from 'moment';

// Moment date formats
export const MY_FORMATS = {
  parse: {
    dateInput: 'MM/YYYY',
  },
  display: {
    dateInput: 'MMM-YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'lll',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-maestro-titulos',
  templateUrl: './maestro-titulos.component.html',
  styleUrls: ['./maestro-titulos.component.css'],
  providers: [
    {provide: MAT_DATE_FORMATS, useValue: MY_FORMATS}
  ]
})
export class MaestroTitulosComponent implements OnInit, OnDestroy {

  // Definir variables del AG-GRID
  public  columnDefs;
  public  defaultColDef;
  public  frameworkComponents;
  private gridApi;
  private gridColumnApi;
  public  isFetching = true;
  public  loadingOverlayComponent;
  public  loadingOverlayComponentParams;
  public  overlayLoadingTemplate;
  public  rowData: VodTituloModel[] = [];
  private initComponent = true;  // ajuste de las columnas en el ag-grid
  // TRUE: ajusta cada columnas a su ancho establecido
  // FALSE: ajusta cada columna para que quepan en el ancho de la ventana

  // Suscripciones
  private actualizarTitulos: Subscription;

  constructor(
    private errorMessageService: ErrorMessageService,
    private fb: FormBuilder,
    private vodService: VodService
  ) {

    // Definir las columnas del AG-GRID
    this. columnDefs = [
      {
        headerName: 'Año-Mes',
        field: 'anioMes',
        width: 110,
        sort: 'desc',
        // filter: 'agTextColumnFilter',
        valueFormatter: (params) => {
          return moment(params.value, 'YYYY/MM/DD').format('YYYY-MMM');
        },
        filter: 'agDateColumnFilter',
        filterParams: {
          comparator: function(filterValue: Date, cellValue: Date) {
            const filterData = filterValue.toISOString().substring(0, 7).replace('-', '/') ;
            const cellData = cellValue.toString().substring(0, 7);
            // Comparar las fechas
            if (filterData === cellData) {
              return 0;
            }
            if (cellData < filterData) {
              return -1;
            }
            if (cellData > filterData) {
              return 1;
            }
          },
          browserDatePicker: true,
        }
      },
      {
        headerName: 'Brand',
        field: 'brand',
        width: 110,
        filter: 'agTextColumnFilter'
      },
      {
        headerName: 'Categoría',
        field: 'categoria',
        width: 110,
        filter: 'agTextColumnFilter'
      },
      {
        headerName: 'Titulo Original',
        field: 'tituloOriginal',
        width: 240,
        sort: 'asc',
        filter: 'agTextColumnFilter'
      },
      {
        headerName: 'Titulo Español',
        field: 'tituloEsp',
        width: 240,
        filter: 'agTextColumnFilter'
      },
      {
        headerName: 'Titulo Portugués',
        field: 'tituloPor',
        width: 240,
        filter: 'agTextColumnFilter'
      },
      {
        headerName: 'Id Proceso',
        field: 'idProceso',
        width: 136,
        sort: false
      },

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

  ngOnInit() {
    // Suscribirme al subject ACTUALIZAR LOTES
    this.actualizarTitulos = this.vodService.actualizarTitulos.subscribe(
      actualizar => {
        if (actualizar && this.gridApi) {
          // Actualizar lista del Maestro de Titulos
          this.getTitulos();
        }
      }
    );
  }

  ngOnDestroy() {
    this.actualizarTitulos.unsubscribe();
  }

  // Ejecutar una vez inicializado el AG-GRID
  onGridReady(params) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;

    // Actualizar el maestro de titulos
    this.getTitulos();
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
  getTitulos() {

    // Spinner
    this.gridApi.showLoadingOverlay();

    // Buscar los titulos en la BDatos
    this.vodService.getMaestroTitulos().subscribe(
      data => {
        // Cargo el grid con datos
        this.gridApi.setRowData(data);

        // Autosize a las columnas
        /* if (this.initComponent) {
          this.gridApi.sizeColumnsToFit();
          this.initComponent = false;
        } else {
          this.autoSizeAllColumns();
        } */

        // Activar botón exportar a excel
        this.isFetching = false;
      },
      err => {
        this.errorMessageService.changeErrorMessage(err);
      }
    );
  }
}
