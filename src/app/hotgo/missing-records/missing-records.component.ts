import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';

// Services
import { ErrorMessageService } from 'src/app/core/error-message.service';
import { HotgoService } from 'src/app/shared/hotgo.service';

@Component({
  selector: 'app-missing-records',
  templateUrl: './missing-records.component.html',
  styleUrls: ['./missing-records.component.scss']
})
export class MissingRecordsComponent implements OnInit {

  // Definir variables
  /*
    REGISTER
  */
  public cssClassRegister = 'notok-class';  // se usa para el campo fileRegister
  public cssResultadoRegister = 'resultado'; // css para formatear el mensaje de respuesta
  public fileRegister: File = null;
  public iconResultadoRegister = ''; // icono de OK o ERROR
  public msgProcesoRegister = '';
  // Variables para Holdable Button bar
  public colorBtnRegister = 'warn';
  public holdableBtnRegister = 0;
  public isFetchingRegister = false;  // se utiliza para mostrar el spinner
  /*
  PAYMENT_COMMIT
  */
  public cssClassPyc = 'notok-class';  // se usa para el campo fileRegister
  public cssResultadoPyc = 'resultado'; // css para formatear el mensaje de respuesta
  public filePyc: File = null;
  public iconResultadoPyc = ''; // icono de OK o ERROR
  public msgProcesoPyc = '';
  // Variables para Holdable Button bar
  public colorBtnPyc = 'warn';
  public holdableBtnPyc = 0;
  public isFetchingPyc = false;  // se utiliza para mostrar el spinner
  /*
  CANCEL
  */
  public cssClassCancel = 'notok-class';  // se usa para el campo fileRegister
  public cssResultadoCancel = 'resultado'; // css para formatear el mensaje de respuesta
  public fileCancel: File = null;
  public iconResultadoCancel = ''; // icono de OK o ERROR
  public msgProcesoCancel = '';
  // Variables para Holdable Button bar
  public colorBtnCancel = 'warn';
  public holdableBtnCancel = 0;
public isFetchingCancel = false;  // se utiliza para mostrar el spinner

  constructor(
    private errorMessageService: ErrorMessageService,
    private hotgoService: HotgoService
  ) { }

  ngOnInit() {
  }

  /*
    REGISTER
  */
  // Validar el archivo a subir
  public uploadRegister(event) {
    this.fileRegister = event.target.files[0];
    if (!this.fileRegister) {
      this.errorMessageService.changeErrorMessage('API-0039(E): debe elegir un archivo');
      this.cssClassRegister = 'notok-class';
    } else {
      this.cssClassRegister = 'ok-class';
    }
  }

  // Confirmar botón ACTUALIZAR
  holdBtnRegister(e) {

    // Chequear si hay que actualizar la cotización al mantener apretado el botón por más de 1 segundo
    this.holdableBtnRegister = e;
    if (e > 100) {
      // Mas de 1 segundo apretado el botón
      this.colorBtnRegister = 'primary';

      // Enviar el archivo a procesar
      if (!this.isFetchingRegister) {
        this.isFetchingRegister = true;  // spinner & button Hold Handler
        this.msgProcesoRegister = ''; // inicializo el mensaje de error
        // Preparar el body
        const formData = new FormData();
        formData.append('uploadRegister', this.fileRegister, this.fileRegister.name);  // File
        this.hotgoService.uploadRegister(formData).subscribe(
          data => {
            // Stop spinner
            this.isFetchingRegister = false;
            // Mostrar resultado
            this.cssResultadoRegister = 'resultado resultado-ok';
            this.iconResultadoRegister = 'done';
            this.msgProcesoRegister = data['message'];
          },
          err => {
            this.cssResultadoRegister = 'resultado resultado-notOk';
            this.iconResultadoRegister = 'clear';
            this.msgProcesoRegister = '0 registro/s grabados';
            this.errorMessageService.changeErrorMessage(err);
            this.isFetchingRegister = false;
          }
        );
      }

    } else {
      // No se llegó al segundo
      this.colorBtnRegister = 'warn';
    }
  }

  /*
    PAYMENT_COMMIT
  */
  // Validar el archivo a subir
  public uploadPyc(event) {
    this.filePyc = event.target.files[0];
    if (!this.filePyc) {
      this.errorMessageService.changeErrorMessage('API-0039(E): debe elegir un archivo');
      this.cssClassPyc = 'notok-class';
    } else {
      this.cssClassPyc = 'ok-class';
    }
  }

  // Confirmar botón ACTUALIZAR
  holdBtnPyc(e) {

    // Chequear si hay que actualizar la cotización al mantener apretado el botón por más de 1 segundo
    this.holdableBtnPyc = e;
    if (e > 100) {
      // Mas de 1 segundo apretado el botón
      this.colorBtnPyc = 'primary';

      // Enviar el archivo a procesar
      if (!this.isFetchingPyc) {
        this.isFetchingPyc = true;  // spinner & button Hold Handler
        this.msgProcesoPyc = ''; // inicializo el mensaje de error
        // Preparar el body
        const formData = new FormData();
        formData.append('uploadPyc', this.filePyc, this.filePyc.name);  // File
        this.hotgoService.uploadPyc(formData).subscribe(
          data => {
            // Stop spinner
            this.isFetchingPyc = false;
            // Mostrar resultado
            this.cssResultadoPyc = 'resultado resultado-ok';
            this.iconResultadoPyc = 'done';
            this.msgProcesoPyc = data['message'];
          },
          err => {
            this.cssResultadoPyc = 'resultado resultado-notOk';
            this.iconResultadoPyc = 'clear';
            this.msgProcesoPyc = '0 registro/s grabados';
            this.errorMessageService.changeErrorMessage(err);
            this.isFetchingPyc = false;
          }
        );
      }

    } else {
      // No se llegó al segundo
      this.colorBtnPyc = 'warn';
    }
  }

  /*
    CANCEL
  */
  // Validar el archivo a subir
  public uploadCancel(event) {
    this.fileCancel = event.target.files[0];
    if (!this.fileCancel) {
      this.errorMessageService.changeErrorMessage('API-0039(E): debe elegir un archivo');
      this.cssClassCancel = 'notok-class';
    } else {
      this.cssClassCancel = 'ok-class';
    }
  }

  // Confirmar botón ACTUALIZAR
  holdBtnCancel(e) {

    // Chequear si hay que actualizar la cotización al mantener apretado el botón por más de 1 segundo
    this.holdableBtnCancel = e;
    if (e > 100) {
      // Mas de 1 segundo apretado el botón
      this.colorBtnCancel = 'primary';

      // Enviar el archivo a procesar
      if (!this.isFetchingCancel) {
        this.isFetchingCancel = true;  // spinner & button Hold Handler
        this.msgProcesoCancel = ''; // inicializo el mensaje de error
        // Preparar el body
        const formData = new FormData();
        formData.append('uploadCancel', this.fileCancel, this.fileCancel.name);  // File
        this.hotgoService.uploadCancel(formData).subscribe(
          data => {
            // Stop spinner
            this.isFetchingCancel = false;
            // Mostrar resultado
            this.cssResultadoCancel = 'resultado resultado-ok';
            this.iconResultadoCancel = 'done';
            this.msgProcesoCancel = data['message'];
          },
          err => {
            this.cssResultadoCancel = 'resultado resultado-notOk';
            this.iconResultadoCancel = 'clear';
            this.msgProcesoCancel = '0 registro/s grabados';
            this.errorMessageService.changeErrorMessage(err);
            this.isFetchingCancel = false;
          }
        );
      }

    } else {
      // No se llegó al segundo
      this.colorBtnCancel = 'warn';
    }
  }
}
