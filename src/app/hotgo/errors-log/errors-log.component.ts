import { Component, OnInit } from '@angular/core';

// External Libraries
import * as moment from 'moment';

// Common
import { arraySort } from 'src/app/shared/sort_functions';

// Servicios
import { ErrorMessageService } from 'src/app/core/error-message.service';
import { ExcelExporterService } from 'src/app/shared/excel_exporter.service';
import { HotgoService } from 'src/app/shared/hotgo.service';

// Modelos
import { HgErrorLogModel } from 'src/app/models/hg-error-log.model';

interface ErrorSection {
  name: string;
  cantidad: number;
  noResuelto: number;
  resuelto: number;
  soloInfo: number;
}

@Component({
  selector: 'app-errors-log',
  templateUrl: './errors-log.component.html',
  styleUrls: ['./errors-log.component.scss']
})
export class ErrorsLogComponent implements OnInit {

  // Definir variables
  public errorLogs: HgErrorLogModel[];
  public errorSections: ErrorSection[];
  public isFetching = false;  // para el spinner

  constructor(
    private errorMessageService: ErrorMessageService,
    private excelExporterService: ExcelExporterService,
    private hotgoService: HotgoService
  ) { }

  ngOnInit() {
    this.getErrorLogs();
  }

  // Leer las cotizaciones diaria y cargarlas en el grid
  public getErrorLogs() {

    this.isFetching = true;

    // Buscar los datos
    this.hotgoService.getErrorsLog().subscribe(
      data => {
        // Cargo el grid con datos ordenado por timestamp
        this.errorLogs = arraySort(data, ['errorType', '-timestamp']);
        // this.errorLogs = data.sort((a, b) => moment(b.timestamp).unix() - moment(a.timestamp).unix() );

        // Crear el array para separar los distintos errores
        this.errorSections = [];
        this.errorLogs.forEach( (el) => {
          const i = this.errorSections.findIndex( section => section.name === el.errorType );
          if (i < 0) {
            const noResuelto = el.errorSolved === 0 ? 1 : 0;
            const resuelto = el.errorSolved === 1 ? 1 : 0;
            const soloInfo = el.errorSolved === 2 ? 1 : 0;
            this.errorSections.push({ name: el.errorType, cantidad: 1, noResuelto, resuelto, soloInfo });
          } else {
            this.errorSections[i].cantidad = this.errorSections[i].cantidad + 1;
            if (el.errorSolved === 0) { this.errorSections[i].noResuelto = this.errorSections[i].noResuelto + 1; }
            if (el.errorSolved === 1) { this.errorSections[i].resuelto = this.errorSections[i].resuelto + 1; }
            if (el.errorSolved === 2) { this.errorSections[i].soloInfo = this.errorSections[i].soloInfo + 1; }
          }
        });
        this.isFetching = false;
      },
      err => {
        this.isFetching = false;
        this.errorMessageService.changeErrorMessage(err);
      }
    );
  }

  // Formatea una fecha al formato:  Lun 25, Sep
  public formatDate(dateToFormat: string): String {
    return moment(dateToFormat, 'YYYY-MM-DD HH:mm:ss').format('ddd DD, MMM');
  }

  // Download de los datos a Excel
  public downloadToExcel() {
    this.excelExporterService.exportAsExcelFile(
       this.errorLogs,
       `error_logs_`);
   }

   public checkErrors() {
     return null;
   }
}
