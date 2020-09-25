import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl} from '@angular/forms';
import { MAT_DATE_FORMATS } from '@angular/material/core';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

// External libraries
import * as moment from 'moment';

// Environment
import { environment } from 'src/environments/environment';

// Models
import { ActualVodClientModel } from 'src/app/models/actual_vod_client.model';

// Services
import { ErrorMessageService } from 'src/app/core/error-message.service';
import { LotesBatchService } from 'src/app/shared/lotes_batch.service';
import { PlanningService } from 'src/app/shared/planning.service';

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
  templateUrl: './vod-actual.component.html',
  styleUrls: ['./vod-actual.component.css'],
  providers: [
    {provide: MAT_DATE_FORMATS, useValue: MY_FORMATS}
  ]
})
export class VodActualComponent implements OnInit {

  // Definir variables
  public area = 'PLANNING';
  public cssClass = 'notok-class';  // se usa para el campo fileUpload
  // tslint:disable-next-line: max-line-length
  public descripcion = of('Este programa sube y procesa los reportes VOD de ciertos clientes y los guarda en una base de datos MySql.');  // Descripcion del listado según el cliente
  private descripcionCliente = [];
  public downloadFile = '';
  public fileUpload: File = null;
  public formData: FormGroup;
  public msgProceso = '';
  public showBtnDownload = false;
  public showModal = false;

  // Variables para Holdable Button bar
  public color = 'warn';
  public holdableButtonMs = 0;
  public isFetching = false;  // se utiliza para mostrar el spinner

  // Definir variables para Select
  public clientOptions: Observable<ActualVodClientModel[]>;

  constructor(
    private errorMessageService: ErrorMessageService,
    private lotesBatchService: LotesBatchService,
    private planningService: PlanningService,
    private fb: FormBuilder,
  ) {

    // Definir FORM
    this.formData = this.fb.group({
      clienteId: ['', this.validateClienteId.bind(this)],
      mesServicio: [moment()]
    });

  }

  // GETTERS:convenience getter for easy access to form fields
  get clienteId() { return this.formData.get('clienteId'); }
  get mesServicio() { return this.formData.get('mesServicio'); }

  ngOnInit() {

    // Client Options
    this.clientOptions = this.planningService.getActualVodClients().pipe(
      tap(
        data => {
          // Crear una tabla de descripciones
          this.descripcionCliente = [];
          data.forEach(el => {
            this.descripcionCliente.push(
              {
                id: el.id,
                descripcion: el.descripcion
              }
            );
          });
        }
      ),
      catchError(
        err => {
          console.log('*** ERROR:', err);
          // this.errorMessageService.changeErrorMessage(err);
          return of([]);
        }
      )
    );
  }

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
        const formData = new FormData();
        formData.append('clienteId', this.clienteId.value);
        formData.append('fechaServicio', this.mesServicio.value.format('DD/MM/YYYY'));
        formData.append('fileFichadas', this.fileUpload, this.fileUpload.name);  // File
        this.planningService.sendActualVod(formData).subscribe(
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

  // Validador para Cliente
  public validateClienteId(control: FormControl): {[s: string]: boolean} {
    // Leer la descripcion del reporte para el cliente seleccionado
    const cliente = this.descripcionCliente.find(el => el.id === control.value);
    if (cliente && cliente.descripcion) {
      this.descripcion = of(cliente.descripcion);
    } else {
      this.descripcion = of('Este programa sube y procesa los reportes VOD de ciertos clientes y los guarda en una base de datos MySql.');
    }
    return null;
  }

}
