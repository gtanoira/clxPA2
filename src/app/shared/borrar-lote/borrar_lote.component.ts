import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, FormControl} from '@angular/forms';
import { MAT_DATE_FORMATS } from '@angular/material/core';
import { Observable, Subscription, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

// Models
import { LoteBatchModel } from 'src/app/models/lote_batch.model';

// Services
import { ErrorMessageService } from 'src/app/core/error-message.service';
import { LotesBatchService } from 'src/app/shared/lotes_batch.service';
import { VodService } from 'src/app/shared/vod.service';

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
  selector: 'app-borrar-lote',
  templateUrl: './borrar_lote.component.html',
  styleUrls: ['./borrar_lote.component.css'],
  providers: [
    {provide: MAT_DATE_FORMATS, useValue: MY_FORMATS}
  ]
})
export class BorrarLoteComponent implements OnInit, OnDestroy {

  // Import parameters
  @Input() area: String;  // Determinará la tabla de lotes a usar. Ej.: PLANNING, VOD, etc.

  // Definir variables
  public dataAvailable = false;
  private descripcionLotes: LoteBatchModel[] = [];
  public formLote: FormGroup;
  public infoLotes: Observable<LoteBatchModel[]>;

  // Variables para Holdable Button bar
  public color = 'warn';
  public holdableButtonMs = 0;
  public isFetching = false;  // se utiliza para mostrar el spinner

  // Subscriptions
  private actualizarLotes: Subscription;

  constructor(
    private errorMessageService: ErrorMessageService,
    private fb: FormBuilder,
    private lotesBatchService: LotesBatchService,
    private vodService: VodService
  ) {

    // Definir FORM
    this.formLote = this.fb.group({
      loteId: ['', this.validateLoteId.bind(this)],
      descripcionLote: ['']
    });
  }

  ngOnInit() {
    // Suscribirme al subject ACTUALIZAR LOTES
    this.actualizarLotes = this.lotesBatchService.actualizarLotes.subscribe(
      actualizar => {
        if (actualizar) {
          // Actualizar lista de lotes
          this.dataAvailable = false;
          this.infoLotes = this.lotesBatchService.getLotes(this.area).pipe(
            tap(
              // Salvo las descripciones de los lotes para usarlas en el trigger de Loteid
              data => {
                this.descripcionLotes = data;
                this.dataAvailable = true;
              }
            ),
            catchError(
              err => {
                this.errorMessageService.changeErrorMessage(err);
                return of([]);
              }
            )
          );
        }
      }
    );
  }

  // GETTERS:convenience getter for easy access to form fields
  get loteId() { return this.formLote.get('loteId'); }
  get descripcionLote() { return this.formLote.get('descripcionLote'); }

  ngOnDestroy() {
    this.actualizarLotes.unsubscribe();
  }

  // Confirmar botón BORRAR LOTE
  holdHandler(e) {

    // Chequear si hay que actualizar la cotización al mantener apretado el botón por más de 1 segundo
    this.holdableButtonMs = e;
    if (e > 100) {
      // Mas de 1 segundo apretado el botón
      this.color = 'primary';

      // Solicitar el borrado de un lote
      if (!this.isFetching) {
        this.isFetching = true;  // spinner & button Hold Handler
        this.lotesBatchService.deleteLote(this.loteId.value, this.area).subscribe(
          data => {
            this.errorMessageService.changeErrorMessage('Lote borrado.', 'info');
            // Actualizar la lista de lotes
            this.lotesBatchService.actualizarLotes.next(true);
            // Actualizar el VOD Maestro de Titulos de ser necesario
            if (this.area === 'VOD') { this.vodService.actualizarTitulos.next(true); }
            // Activar el boton y quitar el spinner
            this.isFetching = false;
            // Inicializar variables
            this.descripcionLote.setValue('');
          },
          err => {
            this.errorMessageService.changeErrorMessage(err);
            // Activar el boton y quitar el spinner
            this.isFetching = false;
          }
        );
      }

    } else {
      // No se llegó al segundo
      this.color = 'warn';
    }
  }

  // Trigger para LoteId
  public validateLoteId(control: FormControl): {[s: string]: boolean} {
    // Leer la descripcion del lote y mostrarlo en pantalla
    if (this.dataAvailable) {
      const lote = this.descripcionLotes.find(el => el.id === control.value);
      if (lote) {
        this.descripcionLote.setValue(lote.descripcion);
      } else {
        this.descripcionLote.setValue('Sin información disponible.');
      }
    }
    return null;
  }

}
