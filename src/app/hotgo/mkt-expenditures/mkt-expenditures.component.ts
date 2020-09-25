import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, AbstractControl} from '@angular/forms';
import { Observable, of, Subscription } from 'rxjs';

// External libraries
import * as moment from 'moment';

// Services
import { AuxiliarTablesService } from 'src/app/shared/auxiliar-tables.service';
import { ErrorMessageService } from 'src/app/core/error-message.service';
import { HotgoService } from 'src/app/shared/hotgo.service';
import { SapService } from 'src/app/shared/sap.service';

// Models
import { MktExpenditureModel } from 'src/app/models/mkt_expenditure.model';
import { SelectOption } from 'src/app/models/select-option';

// Shared Components
import { AgGridLoadingComponent } from 'src/app/shared/ag-grid/ag-grid_loading.component';
import { MktExpButtonsComponent } from 'src/app/hotgo/mkt-expenditures/mktexp-buttons.component';

@Component({
  selector: 'app-mkt-expenditures',
  templateUrl: './mkt-expenditures.component.html',
  styleUrls: ['./mkt-expenditures.component.css'],
})
export class MktExpendituresComponent implements OnInit, OnDestroy {

  // Definir variables
  public canalOptions: Observable<SelectOption[]>;
  public formData: FormGroup;
  public fuenteOptions: Observable<SelectOption[]>;
  public medioOptions: Observable<SelectOption[]>;
  public monedaOptions: Observable<SelectOption[]>;
  public paisOptions: Observable<SelectOption[]>;

  // Definir variables del AG-GRID
  public  columnDefs;
  public  defaultColDef;
  public  frameworkComponents;
  private gridApi;
  private gridColumnApi;
  public  loadingOverlayComponent;
  public  loadingOverlayComponentParams;
  public  overlayLoadingTemplate;
  public  rowData: MktExpenditureModel[] = [];
  private initComponent = true;  // ajuste de las columnas en el ag-grid
  // TRUE: ajusta cada columnas a su ancho establecido
  // FALSE: ajusta cada columna para que quepan en el ancho de la ventana

  // Suscripciones
  private actualizarMktTable: Subscription;

  // triggers
  public triggerDocImporte: Subscription;
  public triggerDocMonedaId: Subscription;
  public triggerFecha: Subscription;

  // Variables para Holdable Button bar
  public color = 'warn';
  public holdableButtonMs = 0;
  public isFetching = false;  // se utiliza para mostrar el spinner

  constructor(
    private auxiliarTablesService: AuxiliarTablesService,
    private errorMessageService: ErrorMessageService,
    private fb: FormBuilder,
    private hotGoService: HotgoService,
    private sapService: SapService
  ) {

    // Definir FORM
    this.formData = this.fb.group({
      mesAnio: [moment(), {updateOn: 'blur'}],
      pais: [''],
      canal: [''],
      fuente: [''],
      medio: [''],
      campania: [''],
      docMonedaId: [''],
      docImporte: [0, {updateOn: 'blur'}],
      usdImporte: [{value: 0, disabled: true}]
    });

    // Trigger
    this.triggerDocImporte = this.formData.get('docImporte').valueChanges.subscribe(
      value => {
        // Convertir el importe a USD
        // tslint:disable-next-line: max-line-length
        this.sapService.convertirImporte(this.docImporte.value, this.mesAnio.value.format('YYYYMMDD'), this.docMonedaId.value, 'USD').subscribe(
          importe => this.usdImporte.setValue(importe['importe']),
          err => this.usdImporte.setValue(0)
        );
      }
    );

    // Trigger
    this.triggerDocMonedaId = this.formData.get('docMonedaId').valueChanges.subscribe(
      value => {
        // Convertir el importe a USD
        // tslint:disable-next-line: max-line-length
        this.sapService.convertirImporte(this.docImporte.value, this.mesAnio.value.format('YYYYMMDD'), this.docMonedaId.value, 'USD').subscribe(
          importe => this.usdImporte.setValue(importe['importe']),
          err => this.usdImporte.setValue(0)
        );
      }
    );

    // Trigger
    this.triggerFecha = this.formData.get('mesAnio').valueChanges.subscribe(
      value => {
        // Convertir el importe en USD
        if (this.docImporte.value !== 0) {
          // tslint:disable-next-line: max-line-length
          this.sapService.convertirImporte(this.docImporte.value, this.mesAnio.value.format('YYYYMMDD'), this.docMonedaId.value, 'USD').subscribe(
            importe => this.usdImporte.setValue(importe['importe']),
            err => this.usdImporte.setValue(0)
          );
        }
      }
    );

    // Definir las columnas del AG-GRID
    this. columnDefs = [
      {
        headerName: 'Actions',
        cellRenderer: 'buttonRenderer',
        width: 70
      },
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
        headerName: 'Paìs',
        field: 'pais',
        width: 110,
        filter: 'agTextColumnFilter'
      },
      {
        headerName: 'Canal',
        field: 'canal',
        width: 110,
        filter: 'agTextColumnFilter'
      },
      {
        headerName: 'Fuente',
        field: 'fuente',
        width: 110,
        filter: 'agTextColumnFilter'
      },
      {
        headerName: 'Medio',
        field: 'medio',
        width: 110,
        filter: 'agTextColumnFilter'
      },
      {
        headerName: 'Campaña',
        field: 'campania',
        width: 200,
        filter: 'agTextColumnFilter'
      },
      {
        headerName: 'Local Moneda',
        field: 'localMoneda',
        width: 80,
        sort: false
      },
      {
        headerName: 'Local Importe',
        field: 'localImporte',
        width: 136,
        sort: false,
        valueFormatter: (params) => {
          return this.formatNumber(params.value.toString());
        },
        cellStyle: {textAlign: 'right'}
      },
      {
        headerName: 'USD Importe',
        field: 'usdImporte',
        width: 136,
        sort: false,
        valueFormatter: (params) => {
          return this.formatNumber(params.value.toString());
        },
        cellStyle: {textAlign: 'right'}
      }
    ];
    this.defaultColDef = {
      sortable: true,
      resizable: true
    };
    this.frameworkComponents = {
      customLoadingOverlay: AgGridLoadingComponent,
      buttonRenderer: MktExpButtonsComponent
    };
    this.loadingOverlayComponent = 'customLoadingOverlay';
    this.loadingOverlayComponentParams = { loadingMessage: 'Loading ...' };

  }

  ngOnInit() {

    // Input Options de distintos campos
    this.paisOptions = this.hotGoService.getHotGoPaises();
    this.canalOptions = this.hotGoService.getHotGoCanales();
    this.fuenteOptions = this.hotGoService.getHotGoFuentes();
    this.medioOptions = this.hotGoService.getHotGoMedios();
    this.monedaOptions = this.auxiliarTablesService.getOptionsFromJsonFile('currencies.json');

    // Suscribirme al subject para actualizar la tabla
    this.actualizarMktTable = this.hotGoService.actualizarMktExpenditures.subscribe(
      actualizar => {
        if (actualizar && this.gridApi) {
          // Actualizar lista del Maestro de Titulos
          this.getMktTable();
        }
      }
    );
  }

  ngOnDestroy() {
    this.triggerDocImporte.unsubscribe();
    this.triggerDocMonedaId.unsubscribe();
    this.actualizarMktTable.unsubscribe();
  }

  // GETTERS:convenience getter for easy access to form fields
  get mesAnio() { return this.formData.get('mesAnio'); }
  get docMonedaId() { return this.formData.get('docMonedaId'); }
  get docImporte() { return this.formData.get('docImporte'); }
  get usdImporte() { return this.formData.get('usdImporte'); }

  // Ejecutar una vez inicializado el AG-GRID
  onGridReady(params) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;

    // Actualizar el maestro de titulos
    this.getMktTable();
  }
  // Confirmar botón ACTUALIZAR
  holdHandler(e) {

    // Chequear si hay que actualizar la cotización al mantener apretado el botón por más de 1 segundo
    this.holdableButtonMs = e;
    if (e > 100) {
      // Mas de 1 segundo apretado el botón
      this.color = 'primary';

      // Enviar los datos a grabar a la tabla en DATA LAKE
      if (!this.isFetching) {
        this.isFetching = true;  // spinner & button Hold Handler

        // Armar el JSON a enviar
        const dataHttp = {
          anioMes: this.mesAnio.value.format('YYYY/MM/DD'),
          canal: this.formData.get('canal').value,
          fuente: this.formData.get('fuente').value,
          medio: this.formData.get('medio').value,
          pais: this.formData.get('pais').value,
          campania: this.formData.get('campania').value,
          localMoneda: this.docMonedaId.value,
          localImporte: this.docImporte.value,
          usdMoneda: 'USD',
          usdImporte: this.usdImporte.value
        };

        this.hotGoService.addMktExpenditures(dataHttp).subscribe(
          data => {
            this.isFetching = false;
            this.errorMessageService.changeErrorMessage('Datos agregados con éxito');
            // Actualizar la tabla
            this.hotGoService.actualizarMktExpenditures.next(true);
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

  // Validador para docImporte
  public validateDocImporte(control: AbstractControl): Observable<boolean | null> {

    // Calcular el usdImporte
    /* this.sapService.convertirImporte(control.value, this.mesAnio.value, this.docMonedaId.value, 'USD').subscribe(
      importe => this.usdImporte.setValue(importe['importe']),
      err => this.usdImporte.setValue(0)
    ); */
    console.log('** AsyncValidator: ', control);
    return of(true);
  }
  // Leer las cotizaciones diaria y cargarlas en el grid
  getMktTable() {

    // Spinner
    this.gridApi.showLoadingOverlay();

    // Buscar los titulos en la BDatos
    this.hotGoService.getMktExpenditures().subscribe(
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
        // Activar botón exportar a excel
        this.isFetching = false;
      }
    );
  }

  private formatNumber(value) {
    // Format the value
    let [integer, fraction = ''] = (value || '').toString().split('.');
    fraction = '.' + (fraction + '000000000').substring(0, 2);
    integer = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return integer + fraction;
  }

}
