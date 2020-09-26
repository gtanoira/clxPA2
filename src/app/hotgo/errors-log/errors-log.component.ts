import { Component, OnInit } from '@angular/core';

// External Libraries
import * as moment from 'moment';

// Common
import { arraySort } from 'src/app/shared/sort_functions';

// Servicios
import { ErrorMessageService } from 'src/app/core/error-message.service';
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

  constructor(
    private errorMessageService: ErrorMessageService,
    private hotgoService: HotgoService
  ) { }

  ngOnInit() {
    this.getErrorsLog();
  }

  // Leer las cotizaciones diaria y cargarlas en el grid
  private getErrorsLog() {

    // Spinner

    // Buscar los titulos en la BDatos
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
            this.errorSections.push({ name: el.errorType, cantidad: 0, noResuelto: 0, resuelto: 0, soloInfo: 0 });
          } else {
            this.errorSections[i].cantidad = this.errorSections[i].cantidad + 1;
            if (el.errorSolved === 0) { this.errorSections[i].noResuelto = this.errorSections[i].noResuelto + 1; }
            if (el.errorSolved === 1) { this.errorSections[i].resuelto = this.errorSections[i].resuelto + 1; }
            if (el.errorSolved === 2) { this.errorSections[i].soloInfo = this.errorSections[i].soloInfo + 1; }
          }
        });
        console.log('*** errorSections');
        console.log(this.errorSections);
      },
      err => {
        this.errorMessageService.changeErrorMessage(err);
      }
    );
  }

  public formatDate(dateToFormat: string): String {
    return moment(dateToFormat, 'YYYY-MM-DD HH:mm:ss').format('ddd DD, MMM');
  }
}
