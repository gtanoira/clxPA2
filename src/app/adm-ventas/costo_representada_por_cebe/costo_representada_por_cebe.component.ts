import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

// External libraries
import * as moment from 'moment';

// Models
import { SelectOption } from 'src/app/models/select-option';
import { TelevisaClientesCtoReps } from 'src/app/models/televisa_clientes_cto_reps.model';

// Services
import { AuxiliarTablesService } from 'src/app/shared/auxiliar-tables.service';
import { ErrorMessageService } from 'src/app/core/error-message.service';
import { ExcelExporterService } from 'src/app/shared/excel_exporter.service';
import { AdmVentasService } from 'src/app/shared/adm-ventas.service';
import { SapService } from 'src/app/shared/sap.service';

@Component({
  selector: 'app-costo-rep-cebe',
  templateUrl: './costo_representada_por_cebe.component.html',
  styleUrls: ['./costo_representada_por_cebe.component.css']
})
export class CostoRepresentadaPorCeBeComponent implements OnInit {

  // Definir variables
  ceBeOptions: SelectOption[];
  ceBeSelected: string;
  companyOptions: SelectOption[];
  companySelected: string;
  formData: FormGroup;
  isFetching = false;  // se utiliza para mostrar el spinner
  hideBtnReporteSAP = false;
  televisaClientes: TelevisaClientesCtoReps[];

  // Variables para progress bar
  public color = 'warn';
  public sapProgressBarValue = 0;
  public  isFetchingSap = false;  // se utiliza para mostrar el spinner

  // Definir array para exportar a Excel
  dataToExcel = [];

  constructor(
    private auxiliarTablesService: AuxiliarTablesService,
    private errorMessageService: ErrorMessageService,
    private excelExporterService: ExcelExporterService,
    private admVentasService: AdmVentasService,
    private fb: FormBuilder,
    private sapService: SapService
  ) {

    // Definir FORM
    this.formData = this.fb.group({
      fechaDesde: [
        moment().subtract(1, 'M').startOf('month'),
        [Validators.required]
      ],
      fechaHasta: [
        moment().subtract(1, 'M').endOf('month'),
        [Validators.required]
      ],
      ceBe: [
        ''
      ],
      companyId: [
        'XVE1'
      ]
    });

  }

  ngOnInit() {

    // Company Options
    this.auxiliarTablesService.getOptionsFromJsonFile('costo_representada_por_cebe_company_options.json').subscribe(
      data => {
        this.ceBeOptions = data;
        this.ceBeSelected = this.ceBeOptions[0].id;
      }
    );
    // CeBe Options
    this.auxiliarTablesService.getOptionsFromJsonFile('costo_representada_por_cebe_cebe_options.json').subscribe(
      data => {
        this.ceBeOptions = data;
        this.ceBeSelected = this.ceBeOptions[0].id;
      }
    );
  }

  // GETTERS:convenience getter for easy access to form fields
  get fechaDesde() { return this.formData.get('fechaDesde'); }
  get fechaHasta() { return this.formData.get('fechaHasta'); }
  get ceBe() { return this.formData.get('ceBe'); }
  get companyId() { return this.formData.get('companyId'); }

  // Confirmar botón OBTENER de SAP
  public holdHandlerSap(e): void {
    // Borrar mensaje de Error

    // Chequear si hay que actualizar la cotización al mantener apretado el botón por más de 1 segundo
    this.sapProgressBarValue = e;
    if (e > 100) {
      // Mas de 1 segundo apretado el botón
      this.color = 'primary';

      // Actualizar la cotización
      if (!this.isFetchingSap) {
        this.onSubmit();
      }

    } else {
      // No se llegó al segundo
      this.color = 'warn';
    }
  }

  // Calcular el Costo de Representadas y mostrarlo en pantalla habilitando los botones de descarga a Excel
  private onSubmit() {

    // Ocultar botón Reporte SAP
    this.hideBtnReporteSAP = true;
    this.isFetching = true;  // activar Loading spinner

    // Ocultar el botón Exportar a Excel
    this.dataToExcel = [];

    this.admVentasService.getAllBillingByCeBe(
      this.fechaDesde.value.format('YYYYMMDD'),
      this.fechaHasta.value.format('YYYYMMDD'),
      this.ceBe.value,
      this.companyId.value
    ).subscribe(
        data => {
          // Agregar a los datos el Nombre del cliente
          this.sapService.addClientName(data).subscribe(
            data2 => {
              // Salvar los datos para enviarlos por excel
              this.dataToExcel = data2;
              this.hideBtnReporteSAP = false;  // mostrar botón reporte SAP
              this.isFetching = false;
            },
            err2 => {
              // Salvar los datos para enviarlos por excel
              this.dataToExcel = data;
              this.hideBtnReporteSAP = false;  // mostrar botón reporte SAP
              this.isFetching = false;
            }
          );
        },
        err => {
          this.errorMessageService.changeErrorMessage('');
          this.hideBtnReporteSAP = false;  // mostrar botón reporte SAP
          this.isFetching = false;
        }
      );
  }

  // Exportar a Excel
  exportExcel() {
    this.excelExporterService.exportAsExcelFile(
      this.dataToExcel,
      `costo_representada_${this.fechaDesde.value.format('YYYYMM')}_`);
  }
}
