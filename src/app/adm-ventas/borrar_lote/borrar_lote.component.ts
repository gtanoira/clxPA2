import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, FormControl} from '@angular/forms';
import { Observable, Subscription, of } from 'rxjs';

// Models
import { FactCobrLoteModel } from 'src/app/models/factcobr_lote.model';

// Services
import { ErrorMessageService } from 'src/app/core/error-message.service';
import { AdmVentasService } from 'src/app/shared/adm-ventas.service';
import { tap, catchError } from 'rxjs/operators';

@Component({
  selector: 'app-factycobr-borrar-lote',
  templateUrl: './borrar_lote.component.html',
  styleUrls: ['./borrar_lote.component.css']
})
export class BorrarLoteComponent implements OnInit, OnDestroy {

  // Definir variables
  public dataAvailable = false;
  private descripcionLotes = [];
  public formLote: FormGroup;
  public infoLotes: Observable<FactCobrLoteModel[]>;

  // Variables para Holdable Button bar
  public color = 'warn';
  public holdableButtonMs = 0;
  public isFetching = false;  // se utiliza para mostrar el spinner

  // Subscriptions
  private actualizarLotes: Subscription;

  constructor(
    private errorMessageService: ErrorMessageService,
    private admVentasService: AdmVentasService,
    private fb: FormBuilder,
  ) {

    // Definir FORM
    this.formLote = this.fb.group({
      loteId: ['', this.validateLoteId.bind(this)],
      descripcionLote: [''],
      altaUser: [''],
      altaFecha: ['']
    });

    // Suscribirme al subject ACTUALIZAR LOTES
    this.actualizarLotes = this.admVentasService.actualizarLotes.subscribe(
      actualizar => {
        if (actualizar) {
          // Actualizar lista de lotes
          this.dataAvailable = false;
          this.infoLotes = this.admVentasService.getLotes().pipe(
            tap(
              // Salvo las descripciones de los lotes para usarlas en el trigger de Loteid
              data => {
                this.descripcionLotes = data;
                this.dataAvailable = true;
                // Inicializar campos
                this.altaFecha.setValue('');
                this.altaUser.setValue('');
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

  ngOnInit() {
    // Lote Options
    // this.factYCobrService.actualizarLotes.next(true);
  }

  // GETTERS:convenience getter for easy access to form fields
  get loteId() { return this.formLote.get('loteId'); }
  get descripcionLote() { return this.formLote.get('descripcionLote'); }
  get altaUser() { return this.formLote.get('altaUser'); }
  get altaFecha() { return this.formLote.get('altaFecha'); }

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
        this.admVentasService.deleteLote(this.loteId.value).subscribe(
          data => {
            this.errorMessageService.changeErrorMessage('Lote borrado.');
            // Actualizar la lista de lotes
            this.admVentasService.actualizarLotes.next(true);
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
        this.descripcionLote.setValue(lote.filtrosAplicados);
        this.altaUser.setValue(lote.altaUser);
        this.altaFecha.setValue(lote.altaFecha);
      } else {
        this.descripcionLote.setValue('Sin información disponible.');
        this.altaUser.setValue('');
        this.altaFecha.setValue('');
      }
    }
    return null;
  }

}
