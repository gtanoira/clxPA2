import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';

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
import { round } from 'src/app/shared/math-functions';

@Component({
  selector: 'app-cotizaciones-calculadora',
  templateUrl: './calculadora.component.html',
  styleUrls: ['./calculadora.component.css'],
  providers: [
    {provide: MAT_DATE_FORMATS, useValue: MY_FORMATS}
  ]
})
export class CalculadoraComponent implements OnInit {

  // Definir variables
  public currencyOptions: SelectOption[];
  public formData: FormGroup;
  public sameDateAsSap = true;

  constructor(
    private fb: FormBuilder,
    private auxiliarTablesService: AuxiliarTablesService,
    private errorMessageService: ErrorMessageService,
    private cotizacionesService: CotizacionesService
  ) {
    // Definir FORM
    this.formData = this.fb.group({
      dateSearch: [
        moment(),
        <any>Validators.required
      ],
      currOrigin: [
        'ARS',
        <any>Validators.required
      ],
      currTarget: [
        'USD',
        [
          <any>Validators.required,
          this.currTargetValidator.bind(this)
        ]
      ],
      directExchange: [{
        value: 0,
        disabled: true
      }],
      inDirectExchange: [{
        value: 0,
        disabled: true
      }],
      sapDate: [{
        value: moment(''),
        disabled: true
      }]
    });

    // Triggers para dateSearch
    this.formData.controls.dateSearch.valueChanges
      .subscribe(
        x => this.formData.controls.currTarget.updateValueAndValidity()
      );
    // Triggers para currOrigin
    this.formData.controls.currOrigin.valueChanges
      .subscribe(
        x => this.formData.controls.currTarget.updateValueAndValidity()
      );
  }

  ngOnInit() {
    // Definir valores para moneda
    this.auxiliarTablesService.getTableFromJson('currencies.json')
      .subscribe(
        data  => { this.currencyOptions = data; },
        error => { this.errorMessageService.changeErrorMessage('Error al leer el archivo currencies.json'); }
      );

    // Buscar cotización inicial
    this.cotizacionesService.getCotizacion(
      'M',
      this.formData.value.currOrigin,
      this.formData.value.currTarget,
      this.formData.value.dateSearch.format('YYYYMMDD')
    ).subscribe(
        data => {
          this.formData.get('directExchange').setValue(data.directExchange);
          this.formData.get('inDirectExchange').setValue(data.inDirectExchange);
          this.formData.get('sapDate').setValue(moment(data.validFromDate));
          // Colorear con rojo si son fechas distintas
          this.sameDateAsSap = (this.formData.get('dateSearch').value.format('YYYY-MM-DD') === data.validFromDate) ? true : false;
        },
        error => {
          // tslint:disable-next-line: max-line-length
          this.errorMessageService.changeErrorMessage(`PADM-0011(E): al usar la API /api2/exchangerate (status:${error.status}-${error.message})`);
        }
      );
  }

  // GETTERS
  get sapDate() { return this.formData.get('sapDate'); }
  get dateSearch() { return this.formData.get('dateSearch'); }

  /*
      VALIDATORS
  */
  currTargetValidator(control: FormControl) {
    if (control && control.value !== null && control.value !== undefined) {

      // Obtener todos los datos necesarios para recalcular la cotizacion
      const cotizacionesService = CotizacionesService;
      let   currTarget: string = control.value;
      const currOriginControl: AbstractControl = control.root.get('currOrigin');
      const dateSearchControl: AbstractControl = control.root.get('dateSearch');

      // Validar que existan los otros 2 datos necesarios
      if (currOriginControl && dateSearchControl && dateSearchControl.valid) {

        // Obtener los valores de los otros 2 datos necesarios
        let   currOrigin: string = currOriginControl.value;
        const dateSearch: string = dateSearchControl.value.format('YYYYMMDD');

        // Definir variables
        let auxChar = '';
        let invertirCotiz = false;
        let rateType = 'M';

        // Calcular rateType
        if (currOrigin === currTarget) {
          this.formData.get('directExchange').setValue(1);
          this.formData.get('inDirectExchange').setValue(1);

        // Convertir a Euros
        } else if (currOrigin === 'EUR' || currTarget === 'EUR') {
          rateType = 'EURX';
          if (currOrigin === 'EUR') {
            // Invertir monedas
            invertirCotiz = true;
            auxChar    = currOrigin;
            currOrigin = currTarget;
            currTarget = auxChar;
          }

        // Convertir a USD
        } else if (currOrigin === 'USD' || currTarget === 'USD') {
          rateType = 'M';
          if (currOrigin === 'USD') {
            // Invertir monedas
            invertirCotiz = true;
            auxChar    = currOrigin;
            currOrigin = currTarget;
            currTarget = auxChar;
          }

        } else {

          // Ninguna de las monedas es USD ni EUR
          // La cotización se busca llevando ambas monedas a USD
          // Convierto moneda Origen
          this.cotizacionesService.getCotizacion(rateType, currOrigin, 'USD', dateSearch)
            .subscribe(
              data => {
                const exchOrigin = data.directExchange;

                // Convierto moneda Destino
                this.cotizacionesService.getCotizacion(rateType, currTarget, 'USD', dateSearch)
                  .subscribe(
                    data1 => {
                      const exchTarget = data1.directExchange;

                      // Calculo cotizacion
                      this.formData.get('directExchange').setValue(round(exchTarget / exchOrigin, 6));
                      this.formData.get('inDirectExchange').setValue(round(1 / (exchTarget / exchOrigin), 6));
                      this.formData.get('sapDate').setValue(moment(data1.validFromDate));
                      // Colorear con rojo si son fechas distintas
                      this.sameDateAsSap = (dateSearchControl.value.format('YYYY-MM-DD') === data1.validFromDate) ? true : false;
                      return null;
                    },
                    error => {
                      // tslint:disable-next-line: max-line-length
                      this.errorMessageService.changeErrorMessage(`PADM-0011(E): al usar la API /api2/exchangerate (status:${error.status}-${error.message['message']})`);
                      return {
                        isError: true
                      };
                    }
                  );
              },
              error => {
                // tslint:disable-next-line: max-line-length
                this.errorMessageService.changeErrorMessage(`PADM-0011(E): al usar la API /api2/exchangerate (status:${error.status}-${error.message['message']})`);
                return {
                  isError: true
                };
              }
            );
        }

        // Una de las monedas es USD o EUR
        this.cotizacionesService.getCotizacion(rateType, currOrigin, currTarget, dateSearch)
          .subscribe(
            data => {
              if (invertirCotiz) {
                this.formData.get('inDirectExchange').setValue(data.directExchange);
                this.formData.get('directExchange').setValue(data.inDirectExchange);
                this.formData.get('sapDate').setValue(moment(data.validFromDate));

              } else {
                this.formData.get('directExchange').setValue(data.directExchange);
                this.formData.get('inDirectExchange').setValue(data.inDirectExchange);
                this.formData.get('sapDate').setValue(moment(data.validFromDate));
              }
              // Colorear con rojo si son fechas distintas
              this.sameDateAsSap = (dateSearchControl.value.format('YYYY-MM-DD') === data.validFromDate) ? true : false;
            },
            error => {
              console.log('*** ERROR (2):', error);
              this.errorMessageService.changeErrorMessage(error);
              return {
                isError: true
              };
            }
          );
      }
    }
    return null;
  }

}
