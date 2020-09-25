import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Subscription } from 'rxjs';

// External Libraries
import * as moment from 'moment';

// Servicios
import { ErrorMessageService } from 'src/app/core/error-message.service';
import { HotgoService } from 'src/app/shared/hotgo.service';

// Modelos
import { ProcesoBatchModel } from 'src/app/models/proceso-batch.model';

// Componentes
import { AgGridLoadingComponent } from 'src/app/shared/ag-grid/ag-grid_loading.component';
import { PbatchsBtnActionsComponent } from 'src/app/hotgo/procesos-batchs/pbatchs-btn-actions.component';

@Component({
  selector: 'app-procesos-batchs',
  templateUrl: './procesos-batchs.component.html',
  styleUrls: ['./procesos-batchs.component.css']
})
export class ProcesosBatchsComponent implements OnInit, OnDestroy {

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
  public  rowData: ProcesoBatchModel[] = [];
  private initComponent = true;  // ajuste de las columnas en el ag-grid
  // TRUE: ajusta cada columnas a su ancho establecido
  // FALSE: ajusta cada columna para que quepan en el ancho de la ventana

  // Suscripciones
  private actualizarProcesosBatchs: Subscription;

  constructor(
    private errorMessageService: ErrorMessageService,
    private fb: FormBuilder,
    private hotgoService: HotgoService
  ) {

    // Definir las columnas del AG-GRID
    this. columnDefs = [
      {
        headerName: 'Id',
        field: 'id',
        width: 50
      },
      {
        headerName: 'Fecha',
        field: 'altaDate',
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
        headerName: 'Tabla',
        field: 'tabla',
        width: 151,
        filter: 'agTextColumnFilter'
      },
      {
        headerName: 'Resultado',
        field: 'resultado',
        width: 485
      },
      {
        headerName: 'Id FKey',
        field: 'idFk',
        width: 90
      },
      {
        headerName: 'Timestamp FKey',
        field: 'ultimoTimestampLote',
        width: 160,
        valueFormatter: (params) => {
          return moment(params.value, 'YYYY/MM/DDTHH:mm:ssZ').format('DD-MMM-YYYY  HH:mm:ss');
        },
      },
      {
        headerName: 'User Alta',
        field: 'altaUser',
        width: 139
      },
      {
        headerName: 'Acciones',
        cellRenderer: 'buttonRenderer',
        width: 70
      }
    ];
    this.defaultColDef = {
      sortable: true,
      resizable: true
    };
    this.frameworkComponents = {
      customLoadingOverlay: AgGridLoadingComponent,
      buttonRenderer: PbatchsBtnActionsComponent
    };
    this.loadingOverlayComponent = 'customLoadingOverlay';
    this.loadingOverlayComponentParams = { loadingMessage: 'Loading ...' };
  }

  ngOnInit() {
    // Suscribirme al subject ACTUALIZAR LOTES
    this.actualizarProcesosBatchs = this.hotgoService.actualizarProcesosBatchs.subscribe(
      actualizar => {
        if (actualizar && this.gridApi) {
          // Actualizar lista del Maestro de Titulos
          this.getProcesosBatchs();
        }
      }
    );
  }

  ngOnDestroy() {
    this.actualizarProcesosBatchs.unsubscribe();
  }

  // Ejecutar una vez inicializado el AG-GRID
  onGridReady(params) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;

    // Actualizar el maestro de titulos
    this.getProcesosBatchs();
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
  getProcesosBatchs() {

    // Spinner
    this.gridApi.showLoadingOverlay();

    // Buscar los titulos en la BDatos
    this.hotgoService.getProcesosBatchs().subscribe(
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
