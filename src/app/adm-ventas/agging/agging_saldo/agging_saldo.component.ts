import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup} from '@angular/forms';

// Librerias externas
import * as moment from 'moment';

// Models
import { SelectOption } from 'src/app/models/select-option';
import { AggingSaldoModel } from 'src/app/models/agging_saldo.model';

// Services
import { AuxiliarTablesService } from 'src/app/shared/auxiliar-tables.service';
import { AuthenticationService } from 'src/app/core/authentication.service';
import { ErrorMessageService } from 'src/app/core/error-message.service';
import { AdmVentasService } from 'src/app/shared/adm-ventas.service';
import { ExcelExporterService } from 'src/app/shared/excel_exporter.service';


@Component({
  selector: 'app-agging-saldo',
  templateUrl: './agging_saldo.component.html',
  styleUrls: ['./agging_saldo.component.css']
})
export class AggingSaldoComponent implements OnInit {

  // Definir variables
  public  companyOptions: SelectOption[];
  public  companyInitial: string[];
  private loginUser: string;
  public  formData: FormGroup;
  public  isFetchingSap = false;  // se utiliza para mostrar el spinner
  public  isUploadingMySql = false;  // se utiliza para mostrar el spinner

  // Variables para progress bar
  color = 'warn';
  sapProgressBarValue = 0;
  MySqlProgressBarValue = 0;

  // Definir array para exportar a Excel
  dataToExcel: AggingSaldoModel[] = [];

  constructor(
    private auxiliarTablesService: AuxiliarTablesService,
    private authenticationService: AuthenticationService,
    private errorMessageService: ErrorMessageService,
    private excelExporterService: ExcelExporterService,
    private admVentasService: AdmVentasService,
    private fb: FormBuilder,
  ) {

    // Definir FORM
    this.formData = this.fb.group({
      companyIds: [
        ''
      ],
      reportMonth: [
        moment()
      ],
    });

  }

  // GETTERS:convenience getter for easy access to form fields
  get reportMonth() { return this.formData.get('reportMonth'); }
  get companyIds() { return this.formData.get('companyIds'); }

  ngOnInit() {

    // Company Options
    this.auxiliarTablesService.getOptionsFromJsonFile('agging_6_months_company_options.json').subscribe(
      data => {
        this.companyOptions = data;
        // Setear inicialmente los campos companyIds y CompanyInitial para el FORM
        const auxCompany = [];
        for (const elem of this.companyOptions) {
          auxCompany.push(elem.id);
        }
        this.companyInitial = auxCompany;
        this.companyIds.setValue(auxCompany);
      }
    );

    // Obtener el Login User
    this.loginUser = this.authenticationService.currentUserValue.userName;
  }

  // Obtener el reporte del Agging y subirlo al MySql
  getFromSap(): void {

    // Activar Loading spinner
    this.isFetchingSap = true;
    this.dataToExcel = [];

    // Obtener los datos del SAP
    this.admVentasService.getAggingSaldo(
      this.reportMonth.value.format('YYYYMMDD'),
      this.companyIds.value
    ).subscribe(
      data => {
        this.isFetchingSap = false;

        // Guardar los datos
        this.dataToExcel = data;
        this.errorMessageService.changeErrorMessage('Se obtuvo del Sap correctamente los datos');
      },
      err => {
        this.errorMessageService.changeErrorMessage(err);
        this.isFetchingSap = false;  // desactivar el spinner
      }
    );
  }

  // Confirmar botón OBTENER de SAP
  holdHandlerSap(e): void {
    // Borrar mensaje de Error
    this.errorMessageService.changeErrorMessage('');

    // Chequear si hay que actualizar la cotización al mantener apretado el botón por más de 1 segundo
    this.sapProgressBarValue = e;
    if (e > 100) {
      // Mas de 1 segundo apretado el botón
      this.color = 'primary';

      // Actualizar la cotización
      if (!this.isFetchingSap) {
        this.getFromSap();
      }

    } else {
      // No se llegó al segundo
      this.color = 'warn';
    }
  }

  // Confirmar botón SUBIR a MySql
  holdHandlerMySql(e): void {
    // Borrar mensaje de Error
    this.errorMessageService.changeErrorMessage('');

    // Chequear si hay que actualizar la cotización al mantener apretado el botón por más de 1 segundo
    this.sapProgressBarValue = e;
    if (e > 100) {
      // Mas de 1 segundo apretado el botón
      this.color = 'primary';

      // Actualizar la cotización
      if (!this.isUploadingMySql) {
        this.uploadToMySql(this.dataToExcel);
      }

    } else {
      // No se llegó al segundo
      this.color = 'warn';
    }
  }

  uploadToMySql(data: AggingSaldoModel[]): void {

    this.isUploadingMySql = true;

    // Preparar los datos del lote
    const recordBatch = {};
    recordBatch['tipoProceso'] = 'AgingSaldos';
    recordBatch['filtrosAplicados'] =
`Empresas: ${this.companyIds.value}
Fecha de corte: ${this.reportMonth.value.format('YYYY-MMM-DD')}`;
    recordBatch['altaUser'] = this.loginUser;

    // Guardar el Agging facturacion en el MySql
    const messageBody = {
      batch: recordBatch,
      body: data
    };
    this.admVentasService.uploadAggingSaldoToMySql(messageBody).subscribe(
      todoOk => {
        this.errorMessageService.changeErrorMessage(todoOk['message']);
        // Desactivar el spinner
        this.isUploadingMySql = false;
        // Actualizar la lista de lotes
        this.admVentasService.actualizarLotes.next(true);
      },
      err => {
        this.errorMessageService.changeErrorMessage(err);
        this.isUploadingMySql = false;  // Stop spinner
      }
    );
  }

  // Exportar a Excel
  exportExcel() {
    this.excelExporterService.exportAsExcelFile(
      this.dataToExcel,
      `agging_saldo_${this.reportMonth.value.format('YYYYMM')}_`);
  }
}
