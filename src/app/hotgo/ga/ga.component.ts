import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import * as moment from 'moment';

// Services
import { ErrorMessageService } from 'src/app/core/error-message.service';
import { ExcelExporterService } from 'src/app/shared/excel_exporter.service';
import { HotgoService } from 'src/app/shared/hotgo.service';

@Component({
  selector: 'app-ga',
  templateUrl: './ga.component.html',
  styleUrls: ['./ga.component.scss']
})
export class GaComponent implements OnInit {

  // Formularios
  public gaFiltros: FormGroup;
  public gaDimensions: FormGroup;
  public gaMetrics: FormGroup;

  // Otros datos
  public dataToExcel: [] = [];
  ayudaFiltros = false;  // botón de ayuda para filtros

  // Variables para Holdable Button bar
  public color = 'warn';
  public holdableButtonMs = 0;
  public isFetching = false;  // se utiliza para mostrar el spinner

  constructor(
    private errorMessageService: ErrorMessageService,
    private excelExporterService: ExcelExporterService,
    private fb: FormBuilder,
    private hotgoService: HotgoService
  ) {
    // Filtros
    this.gaFiltros = this.fb.group({
      fechaDesde: [moment().subtract(7, 'days')],
      fechaHasta: [moment()],
      filters: ['']
    });
    // Dimensiones
    this.gaDimensions = this.fb.group({
      customDimensions: [''],
      userId: [true],
      transactionId: [false],
      paisId: [false],
      medioPago: [false],
      dateTime: [false],
      channelGrouping: [false],
      source: [false],
      medium: [false],
      campaign: [false],
      adContent: [false],
      socialNetwork: [false]
    });
    // Metricas
    this.gaMetrics = this.fb.group({
      customMetrics: [''],
      organicSearches: [false],
      itemRevenue: [false],
      localRefundAmount: [false],
      newUsers: [false],
      users: [true]
    });
  }

  ngOnInit(): void {
  }

  // GETTERS
  get fechaDesde() { return this.gaFiltros.get('fechaDesde'); }
  get fechaHasta() { return this.gaFiltros.get('fechaHasta'); }
  get filters() { return this.gaFiltros.get('filters'); }

  // Confirmar botón SUBMIT
  public holdHandler(e) {

    // Chequear si hay que actualizar la cotización al mantener apretado el botón por más de 1 segundo
    this.holdableButtonMs = e;
    if (e > 50) {
      // Mas de 1 segundo apretado el botón
      this.color = 'primary';

      // Procesar el botón
      if (!this.isFetching) {
        this.getFromGA();
      }

    } else {
      // No se llegó al segundo
      this.color = 'warn';
    }
  }

  // Obtener los datos desde Google Analytics
  public getFromGA() {

    this.isFetching = true;
    this.dataToExcel = [];
    this.errorMessageService.changeErrorMessage('');

    // Armar el campo METRICS
    let metrics = '';
    metrics += this.gaMetrics.get('users').value ? 'ga:users,' : '';
    metrics += this.gaMetrics.get('newUsers').value ? 'ga:newUsers,' : '';
    metrics += this.gaMetrics.get('organicSearches').value ? 'ga:organicSearches,' : '';
    metrics += this.gaMetrics.get('itemRevenue').value ? 'ga:itemRevenue,' : '';
    metrics += this.gaMetrics.get('localRefundAmount').value ? 'ga:localRefundAmount,' : '';
    metrics += this.gaMetrics.get('customMetrics').value;
    if (metrics.substr(metrics.length - 1) === ',') { metrics = metrics.substring(0, metrics.length - 1); }

    // Armar el campo DIMENSIONS
    let dimensions = '';
    dimensions += this.gaDimensions.get('userId').value ? 'ga:dimension1,' : '';
    dimensions += this.gaDimensions.get('transactionId').value ? 'ga:transactionId,' : '';
    dimensions += this.gaDimensions.get('paisId').value ? 'ga:dimension5,' : '';
    dimensions += this.gaDimensions.get('medioPago').value ? 'ga:dimension8,' : '';
    dimensions += this.gaDimensions.get('dateTime').value ? 'ga:dateHourMinute,' : '';
    dimensions += this.gaDimensions.get('channelGrouping').value ? 'ga:channelGrouping,' : '';
    dimensions += this.gaDimensions.get('source').value ? 'ga:source,' : '';
    dimensions += this.gaDimensions.get('medium').value ? 'ga:medium,' : '';
    dimensions += this.gaDimensions.get('campaign').value ? 'ga:campaign,' : '';
    dimensions += this.gaDimensions.get('adContent').value ? 'ga:adContent,' : '';
    dimensions += this.gaDimensions.get('socialNetwork').value ? 'ga:socialNetwork,' : '';
    dimensions += this.gaDimensions.get('customDimensions').value;
    // Quitar la coma final
    if (dimensions.substr(dimensions.length - 1) === ',') { dimensions = dimensions.substring(0, dimensions.length - 1); }

    // Validar que haya por lo menos 1 metrica o dimension
    if (dimensions === '' && metrics === '') { dimensions = 'ga:dimension1,ga:sessionCount'; }
    this.hotgoService.getFromGA(
      metrics,
      dimensions,
      this.fechaDesde.value.format('YYYY-MM-DD'),
      this.fechaHasta.value.format('YYYY-MM-DD'),
      this.filters.value
    ).subscribe(
      data => {
        // Obtener los datos
        const rows: [] = data['rows'];
        console.log('*** ROWS:', rows);

        if (!rows || rows.length <= 0) {
          this.errorMessageService.changeErrorMessage('Ningún dato encontrado.');
        } else {
          this.dataToExcel = rows;
        }
        this.isFetching = false;
      },
      error => {
        this.errorMessageService.changeErrorMessage(error);
        this.isFetching = false;
      }
    );

  }

  // Botón Exportar a Excel
  public exportExcel() {
    this.excelExporterService.exportAsExcelFile(
       this.dataToExcel,
       `GA_reporte_`);
   }
}
