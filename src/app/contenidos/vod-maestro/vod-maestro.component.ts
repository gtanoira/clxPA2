import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup} from '@angular/forms';
import { MAT_DATE_FORMATS } from '@angular/material/core';
import { of } from 'rxjs';

// External libraries
import * as moment from 'moment';

// Environment
import { environment } from 'src/environments/environment';

// Services
import { ErrorMessageService } from 'src/app/core/error-message.service';
import { LotesBatchService } from 'src/app/shared/lotes_batch.service';
import { VodService } from 'src/app/shared/vod.service';

// Models

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
  selector: 'app-pln-vod-actual',
  templateUrl: './vod-maestro.component.html',
  styleUrls: ['./vod-maestro.component.css'],
  providers: [
    {provide: MAT_DATE_FORMATS, useValue: MY_FORMATS}
  ]
})
export class VodMaestroComponent implements OnInit {

  // Definir variables
  public area = 'VOD';
  public cssClass = 'notok-class';  // se usa para el campo fileUpload
  // tslint:disable-next-line: max-line-length
  public descripcion = of('Este programa sube y procesa los reportes VOD de ciertos clientes y los guarda en una base de datos MySql.');  // Descripcion del listado según el cliente
  private descripcionCliente = [];
  public downloadFile = '';
  public fileUpload: File = null;
  public formData: FormGroup;
  public msgProceso = '';
  public msgStatus = '';
  public showBtnDownload = false;
  public showModal = false;

  // Variables para Holdable Button bar
  public color = 'warn';
  public holdableButtonMs = 0;
  public isFetching = false;  // se utiliza para mostrar el spinner

  constructor(
    private errorMessageService: ErrorMessageService,
    private lotesBatchService: LotesBatchService,
    private vodService: VodService,
    private fb: FormBuilder,
  ) {

    // Definir FORM
    this.formData = this.fb.group({
      fechaValidez: [moment()]
    });

  }

  // GETTERS:convenience getter for easy access to form fields
  get fechaValidez() { return this.formData.get('fechaValidez'); }

  ngOnInit() {}

  // Guardar el archivo a subir
  public onFileSelected(event) {
    this.fileUpload = event.target.files[0];
    if (!this.fileUpload) {
      this.errorMessageService.changeErrorMessage('API-0039(E): debe elegir un archivo');
      this.cssClass = 'notok-class';
    } else {
      this.cssClass = 'ok-class';
    }
  }

  // Confirmar botón ACTUALIZAR
  holdHandler(e) {

    // Chequear si hay que actualizar la cotización al mantener apretado el botón por más de 1 segundo
    this.holdableButtonMs = e;
    if (e > 100) {
      // Mas de 1 segundo apretado el botón
      this.color = 'primary';

      // Enviar el archivo VOD a procesar
      if (!this.isFetching) {
        this.showBtnDownload = false;
        this.isFetching = true;  // spinner & button Hold Handler
        // Preparar el body
        const formData = new FormData();  // en JS permite crear un body del tipo FORM
        formData.append('fileDatos', this.fileUpload, this.fileUpload.name);  // agregar File
        this.vodService.addTitulos(formData, this.fechaValidez.value.format('YYYYMM01')).subscribe(
          data => {
            // Stop spinner
            this.isFetching = false;
            // Mostrar resultado
            this.msgProceso = data['message'];
            if (data['fileDownloads'] !== '') {
              this.downloadFile = environment.envData.portalAdminServer + data['fileDownloads'];
              this.showBtnDownload = true;
            } else {
              this.downloadFile = '';
              this.showBtnDownload = false;
            }
            this.showModal = true;
            // Actualizar la lista de lotes a borrar
            this.lotesBatchService.actualizarLotes.next(true);
            // Actualizar el VOD Maestro de Titulos de ser necesario
            this.vodService.actualizarTitulos.next(true);
          },
          err => {
            this.errorMessageService.changeErrorMessage(err);
            this.isFetching = false;
          }
        );
      }

    } else {
      // No se llegó al segundo
      this.color = 'warn';
    }
  }

  // Cerrar ventana Modal
  closeModal() {
    this.showModal = false;
  }
}
