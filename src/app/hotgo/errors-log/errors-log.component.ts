import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';

// External Libraries
import * as moment from 'moment';

// Servicios
import { ErrorMessageService } from 'src/app/core/error-message.service';
import { HotgoService } from 'src/app/shared/hotgo.service';

// Modelos
import { HgErrorLogModel } from 'src/app/models/hg-error-log.model';

// Componentes
import { AgGridLoadingComponent } from 'src/app/shared/ag-grid/ag-grid_loading.component';

@Component({
  selector: 'app-errors-log',
  templateUrl: './errors-log.component.html',
  styleUrls: ['./errors-log.component.css']
})
export class ErrorsLogComponent {

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
  public  rowData: HgErrorLogModel[] = [];
  private initComponent = true;  // ajuste de las columnas en el ag-grid
  // TRUE: ajusta cada columnas a su ancho establecido
  // FALSE: ajusta cada columna para que quepan en el ancho de la ventana

  constructor(
    private errorMessageService: ErrorMessageService,
    private fb: FormBuilder,
    private hotgoService: HotgoService
  ) {

    // Definir las columnas del AG-GRID
    this. columnDefs = [
      {
        headerName: 'Fecha error',
        field: 'timestamp',
        width: 160,
        sort: 'desc',
        valueFormatter: (params) => {
          return moment(params.value, 'YYYY/MM/DDTHH:mm:ssZ').format('DD-MMM-YYYY  HH:mm:ss');
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
        headerName: 'Tipo',
        field: 'errorType',
        width: 150,
        filter: 'agTextColumnFilter'
      },
      {
        headerName: 'Resultado',
        field: 'message',
        width: 927
      },
      {
        headerName: 'Código',
        field: 'errorCode',
        width: 111,
        filter: 'agTextColumnFilter'
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

  // Ejecutar una vez inicializado el AG-GRID
  onGridReady(params) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;

    // Actualizar el maestro de titulos
    this.getErrorsLog();
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
  getErrorsLog() {

    // Spinner
    this.gridApi.showLoadingOverlay();

    // Buscar los titulos en la BDatos
    this.hotgoService.getErrorsLog().subscribe(
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
      },
      err => {
        this.errorMessageService.changeErrorMessage(err);
      }
    );
  }
}
