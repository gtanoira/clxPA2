import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';

// External libraries
import * as moment from 'moment';
import { MAT_DATE_FORMATS } from '@angular/material/core';
// Moment date formats
export const MY_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD-MMM-YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'lll',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

// Models
import { SelectOption } from 'src/app/models/select-option';

// Services
import { AuxiliarTablesService } from 'src/app/shared/auxiliar-tables.service';
import { ErrorMessageService } from 'src/app/core/error-message.service';
import { CotizacionesService } from 'src/app/shared/cotizaciones.service';
import { AuthorizationService } from 'src/app/core/authorization.service';

@Component({
  selector: 'app-cotizaciones-actualizar',
  templateUrl: './actualizar.component.html',
  styleUrls: ['./actualizar.component.css'],
  providers: [
    {provide: MAT_DATE_FORMATS, useValue: MY_FORMATS}
  ]
})
export class ActualizarCotizacionComponent implements OnInit, OnDestroy {

  // Definir variables
  public currencyOriginOptions: SelectOption[] = [];
  public currencyTargetOptions: SelectOption[] = [{
    id: 'USD',
    name: 'USD-Dólar USA'
  }, {
    id: 'EUR',
    name: 'Euro'
  }];
  public rateTypeOptions: any[] = [
    {
      group: 'USD - Dólar',
      values: [
        { id: 'G', name: 'Compra' },
        { id: 'M', name: 'Venta'}
      ]
    }, {
      group: 'EUR - Euro',
      values: [
        { id: 'EURX', name: 'Venta Euro' }
      ]
    }
  ];
  public exchangeTooltip = '';
  public formData: FormGroup;
  sameDateAsSap = true;
  // Form Subscriptions
  subsDateSearch: Subscription;
  subsCurrOrigin: Subscription;
  subsCurrTarget: Subscription;
  subsRateType:   Subscription;

  // Variables para Holdable Button bar
  public color = 'warn';
  public holdableButtonMs = 0;
  public isFetching = false;  // se utiliza para mostrar el spinner

  // Variables para SEGURIDAD DE ACCESO
  btnSaveDisabled = true;  // boton disabled

  constructor(
    private fb: FormBuilder,
    private authorizationService: AuthorizationService,
    private auxiliarTablesService: AuxiliarTablesService,
    private errorMessageService: ErrorMessageService,
    private cotizacionesService: CotizacionesService
  ) {
    // Definir FORM
    this.formData = this.fb.group({
      dateSearch: [
        moment(),
        Validators.required
      ],
      currOrigin: [
        'ARS'
      ],
      currTarget: [
        'USD'
      ],
      rateType: [
        'M'
      ],
      directExchange: [
        ''
      ]
    });
  }

  ngOnInit() {
    // Definir valores para currencyOriginOptions
    this.auxiliarTablesService.getTableFromJson('currencies.json').subscribe(
      data  => {
        data.forEach(elem => {
          if ('EUR'.indexOf(elem.id) === -1) {
            this.currencyOriginOptions.push(elem);
          }
        });
      },
      error => { this.errorMessageService.changeErrorMessage('Error al leer el archivo currencies.json'); }
    );

    // Buscar cotización inicial
    this.cotizacionesService.getCotizacion(
      this.formData.value.rateType,
      this.formData.value.currOrigin,
      this.formData.value.currTarget,
      this.formData.value.dateSearch.format('YYYYMMDD')
    ).subscribe(
      data => {
        this.formData.get('directExchange').setValue(data.directExchange);
        this.exchangeTooltip = moment(data.validFromDate, 'YYYY-MM-DD').format('DD-MMM-YYYY');
        // Establecer el color para la cotizacion en el HTML
        this.sameDateAsSap = (data.validFromDate === this.formData.value.dateSearch.format('YYYY-MM-DD')) ? true : false;
      },
      err => {
        this.errorMessageService.changeErrorMessage(
          `API-0011(E): al usar la API /api2/exchangerate (${err})`
        );
      }
    );

    // Subscribir a validadores de campos del form
    this.subscribeDateSearch();
    this.subscribeCurrOrigin();
    this.subscribeCurrTarget();
    this.subscribeRateType();

    // Setear SEGURIDAD DE ACCESO
    // Si,No habilitar el botón ACTUALIZAR
    this.btnSaveDisabled =
      (this.authorizationService.componentPropertyValue('pgmCotizaciones', 'cptActualizacion', 'btnSave') === 'off') ? true : false;
  }

  ngOnDestroy() {
    this.subsDateSearch.unsubscribe();
    this.subsCurrOrigin.unsubscribe();
    this.subsCurrTarget.unsubscribe();
    this.subsRateType.unsubscribe();
  }

  // GETTERS
  get dateSearch() { return this.formData.get('dateSearch'); }
  get currOrigin() { return this.formData.get('currOrigin'); }
  get currTarget() { return this.formData.get('currTarget'); }
  get rateType()   { return this.formData.get('rateType'); }

  // Subscribir al validador del campo dateSearch
  private subscribeDateSearch() {
    // Update para fecha
    this.subsDateSearch = this.formData.controls.dateSearch.valueChanges.subscribe(
      x => {
        this.getCotizacion(this.dateSearch.value.format('YYYYMMDD'), this.currOrigin.value, this.currTarget.value, this.rateType.value);
      }
    );
  }

  // Subscribir al validador del campo dateSearch
  private subscribeCurrOrigin() {
    this.subsCurrOrigin = this.formData.controls.currOrigin.valueChanges.subscribe(
      x => {
        this.getCotizacion(this.dateSearch.value.format('YYYYMMDD'), this.currOrigin.value, this.currTarget.value, this.rateType.value);
      }
    );
  }

  // Subscribir al validador del campo dateSearch
  private subscribeCurrTarget() {
    this.subsCurrTarget = this.formData.controls.currTarget.valueChanges.subscribe(
      data => {
        this.currTargetValidator(data);  // Validar datos
      }
    );
  }

  // Subscribir al validador del campo dateSearch
  private subscribeRateType() {
    this.subsRateType = this.formData.controls.rateType.valueChanges.subscribe(
      data => {
        this.rateTypeValidator(data);  // Validar datos
      }
    );
  }

  // Validar la moneda destino: currTarget
  private currTargetValidator(data: string): void {

    if (data && data !== null && data !== undefined) {

      // EUR
      if (data === 'EUR' && this.rateType.value !== 'EURX') {
        this.subsRateType.unsubscribe();
        this.rateType.reset('EURX');
        this.subscribeRateType();
        this.getCotizacion(this.dateSearch.value.format('YYYYMMDD'), this.currOrigin.value, this.currTarget.value, this.rateType.value);

      // USD
      } else if (data === 'USD') {   // && ',M,G,'.indexOf(this.rateType.value) < 0) {
        this.subsRateType.unsubscribe();
        this.rateType.setValue('M');
        this.subscribeRateType();
        this.getCotizacion(this.dateSearch.value.format('YYYYMMDD'), this.currOrigin.value, this.currTarget.value, this.rateType.value);
     }
    }
  }

  // Validar la fecha
  private getCotizacion(fecha: string, currOrigin: string, currTarget: string, rateType: string): void {

    // Chequear que todos los campos tengan valores
    if (this.formData.valid) {

      if (currOrigin === currTarget) {
        // Las 2 monedas son iguales
        this.formData.get('directExchange').setValue(1);

      } else {
        // Buscar cotizacion
        this.cotizacionesService.getCotizacion(rateType, currOrigin, currTarget, fecha).subscribe(
          data => {
            this.formData.get('directExchange').setValue(data.directExchange);
            this.exchangeTooltip = moment(data.validFromDate, 'YYYY-MM-DD').format('DD-MMM-YYYY');
            // Establecer el color para la cotizacion en el HTML
            this.sameDateAsSap = (data.validFromDate.replace(/-/g, '') === fecha) ? true : false;
          },
          error => {
            this.errorMessageService.changeErrorMessage(
              `API-0011(E): no hay acceso a la API 2/exchangerate (${error})`
            );
          }
        );
      }
    } else {
      // Alguno de los datos es inválido
      this.formData.get('directExchange').setValue(0);
    }
  }

  // Confirmar botón ACTUALIZAR
  public holdHandler(e) {

    // Chequear si hay que actualizar la cotización al mantener apretado el botón por más de 1 segundo
    this.holdableButtonMs = e;
    if (e > 100) {
      // Mas de 1 segundo apretado el botón
      this.color = 'primary';

      // Procesar el botón
      if (!this.isFetching) {
        this.errorMessageService.changeErrorMessage('');  // borrar la linea de error si la hubiere
        this.saveExchangeRate();
      }

    } else {
      // No se llegó al segundo
      this.color = 'warn';
    }
  }

  // Validar el rateType
  private rateTypeValidator(data: string): void {

    if (data && data !== null && data !== undefined) {

      // USD
      if (',M,G,'.indexOf(data) > 0) {
        this.subsCurrTarget.unsubscribe();
        this.currTarget.setValue('USD');
        this.subscribeCurrTarget();
        this.getCotizacion(this.dateSearch.value.format('YYYYMMDD'), this.currOrigin.value, this.currTarget.value, this.rateType.value);

      // EUR
      } else if (data === 'EURX' && this.currTarget.value !== 'EUR') {
        this.subsCurrTarget.unsubscribe();
        this.currTarget.setValue('EUR');
        this.subscribeCurrTarget();
        this.getCotizacion(this.dateSearch.value.format('YYYYMMDD'), this.currOrigin.value, this.currTarget.value, this.rateType.value);
      }
    }
  }

  // Salvar la cotizacion cargada
  saveExchangeRate() {
    if (this.formData.invalid) {
      this.errorMessageService.changeErrorMessage('Los datos ingresados no son válidos. Revíselos y vuelva a intentar.');
    } else {
      this.isFetching = true;  // activo el spinner
      this.cotizacionesService.saveCotizacion(
        this.formData.get('rateType').value,
        this.formData.get('currOrigin').value,
        this.formData.get('currTarget').value,
        this.formData.get('dateSearch').value.format('YYYYMMDD'),
        Number(this.formData.get('directExchange').value)
      ).subscribe(
        data  => {
          this.errorMessageService.changeErrorMessage(data['message'], 'info');
          this.isFetching = false;
        },
        error => {
          this.errorMessageService.changeErrorMessage(`Error al guardar la cotización. (status ${error.status} - ${error.error.message})`);
          this.isFetching = false;
        }
      );
    }
  }
}
