import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Subscription } from 'rxjs';

// External Libraries
import * as moment from 'moment';

// Servicios
import { ErrorMessageService } from 'src/app/core/error-message.service';
import { HotgoService } from 'src/app/shared/hotgo.service';

// Modelos
import { HgScheduleModel } from 'src/app/models/hg-schedule.model';
import { SelectOption } from 'src/app/models/select-option';

// Componentes
import { AgGridLoadingComponent } from 'src/app/shared/ag-grid/ag-grid_loading.component';
import { AggridTooltipComponent } from 'src/app/shared/ag-grid/aggrid-tooltip.component';

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.css']
})
export class ScheduleComponent implements OnInit {

  // Definir variables del AG-GRID
  public  columnDefs;
  public  defaultColDef;
  public  frameworkComponents;
  private gridApi;
  private gridColumnApi;
  public  isFetching = false;
  public  loadingOverlayComponent;
  public  loadingOverlayComponentParams;
  public  overlayLoadingTemplate;
  public  rowData: HgScheduleModel[] = [];
  private initComponent = true;  // ajuste de las columnas en el ag-grid
  // TRUE: ajusta cada columnas a su ancho establecido
  // FALSE: ajusta cada columna para que quepan en el ancho de la ventana

  // Definir el FORM
  public eventForm: FormGroup;
  public eventOptions: String[] = [];
  public timeOptions: SelectOption[] = [
    { id: 'DAY', name: 'DIA/S' },
    { id: 'HOUR', name: 'HORA/S' },
    { id: 'MINUTE', name: 'MINUTO/S' }
  ];

  // triggers
  public triggerEventoId: Subscription;

  // Suscriptions
  private actualizarScheduleEvents: Subscription;

  // Variables para Holdable Button bar
  public color = 'warn';
  public holdableButtonMs = 0;

  constructor(
    private errorMessageService: ErrorMessageService,
    private fb: FormBuilder,
    private hotgoService: HotgoService
  ) {

    // Definir FORM
    this.eventForm = this.fb.group({
      eventoId: [{ value: '', updateOn: 'blur' }],
      actualValue: [0],
      actualTime: ['DAYS'],
      actualStatus: ['ENABLED'],
    });

    // Trigger
    this.triggerEventoId = this.eventForm.get('eventoId').valueChanges.subscribe(
      value => {
        // Grabar los datos del evento
        this.rowData.forEach( (el, index) => {
          if (el.evento === this.eventoId.value) {
            this.actualStatus.setValue(this.rowData[index].status);
            this.actualValue.setValue(+this.rowData[index].intervalValue);
            this.actualTime.setValue(this.rowData[index].intervalField);
          }
        });
      }
    );

    // Definir las columnas del AG-GRID
    this. columnDefs = [
      {
        headerName: '',
        field: 'status',
        width: 43,
        cellRenderer: (params) => {
          if (params.value.toLowerCase() === 'enabled') {
            return `<span class="material-icons" style="color:green;width:18px;">done</span>`;
          } else {
            return `<span class="material-icons" style="color:red;width:18px;">clear</span>`;
          }
        },
        tooltipField: 'status'
      },
      {
        headerName: 'Evento',
        field: 'evento',
        width: 143,
        sort: 'asc'
      },
      {
        headerName: 'Intervalo',
        field: 'intervalo',
        width: 130,
        cellStyle: { 'text-align': 'center' }
      },
      {
        headerName: 'Hora Local',
        field: 'lastExecuted',
        width: 140,
        valueFormatter: (params) => {
          return moment(params.value, 'YYYY/MM/DDTHH:mm:ssZ').format('DD-MMM-YYYY HH:mm');
        }
      }
    ];
    this.defaultColDef = {
      sortable: true,
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
    // Suscribirme al subject para actualizar la tabla
    this.actualizarScheduleEvents = this.hotgoService.actualizarScheduleEvents.subscribe(
      actualizar => {
        if (actualizar && this.gridApi) {
          // Actualizar tabla de eventos
          this.getEvents();
        }
      }
    );
  }

  // GETTERS
  get eventoId() { return this.eventForm.get('eventoId'); }
  get actualValue() { return this.eventForm.get('actualValue'); }
  get actualTime() { return this.eventForm.get('actualTime'); }
  get actualStatus() { return this.eventForm.get('actualStatus'); }

  // Ejecutar una vez inicializado el AG-GRID
  onGridReady(params) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;

    // Actualizar el maestro de titulos
    this.getEvents();
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
  private getEvents() {

    // Spinner
    this.gridApi.showLoadingOverlay();

    // Buscar los titulos en la BDatos
    this.hotgoService.getEvents().subscribe(
      data => {
        // Cargo el grid con datos
        this.gridApi.setRowData(data);

        // Inicializar el FORM eventForm
        this.eventOptions = [];
        this.rowData = data;
        data.forEach( (el) => { this.eventOptions.push(el.evento); });
        // Inicializar el eventForm
        this.eventoId.setValue(this.rowData[0].evento);
        this.actualValue.setValue(+this.rowData[0].intervalValue);
        this.actualTime.setValue(this.rowData[0].intervalField);
        this.actualStatus.setValue(this.rowData[0].status);

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

  // Confirmar botón ACTUALIZAR
  holdHandler(e) {

    // Chequear si hay que actualizar la cotización al mantener apretado el botón por más de 1 segundo
    this.holdableButtonMs = e;
    if (e > 100) {
      // Mas de 1 segundo apretado el botón
      this.color = 'primary';

      // Actualizar el EVENT en la base de datos
      if (!this.isFetching) {
        this.isFetching = true;  // spinner & button Hold Handler

        this.hotgoService.patchEvent(this.eventoId.value, this.actualValue.value, this.actualTime.value).subscribe(
          data => {
            this.isFetching = false;
            this.errorMessageService.changeErrorMessage('Schedule del proceso actualizado con éxito');
            // Actualizar la tabla
            this.hotgoService.actualizarScheduleEvents.next(true);
          },
          err => {
            this.isFetching = false;
            this.errorMessageService.changeErrorMessage(err);
          }
        );
      }

    } else {
      // No se llegó al segundo
      this.color = 'warn';
    }
  }

}
