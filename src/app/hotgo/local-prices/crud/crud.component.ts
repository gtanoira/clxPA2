import { AfterViewChecked, AfterViewInit, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
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
// Service
import { AuxiliarTablesService } from 'src/app/shared/auxiliar-tables.service';
import { ErrorMessageService } from 'src/app/core/error-message.service';
import { HotgoService } from 'src/app/shared/hotgo.service';
import { LocalPricesService } from 'src/app/shared/local-prices.service';
import { PaymentMethodsService } from 'src/app/shared/payment_methods.service';
// Models & Interfaces
import { CountryModel } from 'src/app/models/country.model';
import { HotgoProductModel } from 'src/app/models/hotgo_product.model';
import { ProductLocalPriceModel } from 'src/app/models/product-local-price.model';
import { SelectOption } from 'src/app/models/select-option';
import { PaymentMethodModel } from 'src/app/models/payment-method.model';

@Component({
  selector: 'app-local-prices-crud',
  templateUrl: './crud.component.html',
  styleUrls: ['./crud.component.scss'],
  providers: [
    {provide: MAT_DATE_FORMATS, useValue: MY_FORMATS}
  ]
})
export class LocalPricesCrudComponent implements OnInit, OnDestroy {

  // Variables
  public localPriceRecord: FormGroup;
  public paymentMethodOptions: PaymentMethodModel[] = [];
  public countryOptions: CountryModel[] = [];
  public paymProcessorOptions: PaymentMethodModel[] = [];
  public currencyOptions: PaymentMethodModel[] = [];
  public productOptions: HotgoProductModel[] = [];

  // Form validations
  subsCountry: Subscription;
  subsPaymProcessor: Subscription;

  constructor(
    private auxiliarTablesService: AuxiliarTablesService,
    private errorMessageService: ErrorMessageService,
    private hotgoService: HotgoService,
    public dialogRef: MatDialogRef<LocalPricesCrudComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ProductLocalPriceModel,
    private fb: FormBuilder,
    private localPricesService: LocalPricesService,
    private paymentMethodsService: PaymentMethodsService
  ) {
    if (data) {
      // Definir el formulario
      this.localPriceRecord = this.fb.group({
        id: [data.id],
        fecha: [data.fecha],
        country: [data.country, {updateOn: 'blur'}],
        paymProcessor: [data.paymProcessor, {updateOn: 'blur'}],
        currency: [{value: data.currency}],
        duration: [data.duration.toString()],
        taxableAmount: [data.taxableAmount]
      });
    } else {
      this.localPriceRecord = this.fb.group({
        id: 0,
        fecha: [''],
        country: ['', {updateOn: 'blur'}],
        paymProcessor: ['', {updateOn: 'blur'}],
        currency: [{value: 'USD', disabled: true}],
        duration: ['30'],
        taxableAmount: [0]
      });
    }
    this.localPriceRecord.markAsUntouched();
    this.localPriceRecord.markAsPristine();
  }

  // GETTERS
  get fecha() { return this.localPriceRecord.get('fecha'); }
  get country() { return this.localPriceRecord.get('country'); }
  get paymProcessor() { return this.localPriceRecord.get('paymProcessor'); }
  get currency() { return this.localPriceRecord.get('currency'); }
  get duration() { return this.localPriceRecord.get('duration'); }

  ngOnInit(): void {
    // Payment Method Options
    this.paymentMethodsService.getRecords({}).subscribe(
      data => {
        this.paymentMethodOptions = data;
        this.country.updateValueAndValidity();
      },
      () => this.paymentMethodOptions = []
    );

    // Country Options
    this.hotgoService.getCountries().subscribe(
      data => this.countryOptions = data,
      () => this.countryOptions = []
    );

    // Product Options
    this.auxiliarTablesService.getOptionsFromJsonFile('local_prices_product_options.json').subscribe(
      data => this.productOptions = data
    );

    // Subscribir a validadores de campos del form
    this.subscribeCountry();
    this.subscribePaymProcessor();
  }

  ngOnDestroy() {
    this.subsCountry.unsubscribe();
    this.subsPaymProcessor.unsubscribe();
  }

  public onBtnClick(btnNo: number): void {
    this.dialogRef.close(btnNo);
  }

  // Validador del campo COUNTRY
  private subscribeCountry() {
    this.subsCountry = this.country.valueChanges.subscribe(
      () => {
        // Re-armar el Options para paymProcessor
        this.paymProcessorOptions = this.paymentMethodOptions.filter(el => el.country === this.country.value);
        // Establecer nuevo valor
        this.paymProcessor.setValue(this.paymProcessorOptions[0].paymProcessor);
        console.log('*** country', this.paymentMethodOptions, this.paymProcessorOptions, this.paymProcessor.value);
      }
    );
  }

  // Validador del campo PAYMPROCESSOR
  private subscribePaymProcessor() {
    this.subsPaymProcessor = this.paymProcessor.valueChanges.subscribe(
      () => {
        console.log('*** payment processor');
        this.currencyOptions = this.paymProcessorOptions.filter(el => el.paymProcessor === this.paymProcessor.value);
        this.currency.setValue(this.currencyOptions[0].currency);
      }
    );
  }

  // Grabar los datos en la BDatos
  public saveRecord(): void {
    const newRecord: ProductLocalPriceModel = {
      id: +this.localPriceRecord.get('id').value,
      fecha: this.fecha.value,
      country: this.country.value,
      paymProcessor: this.paymProcessor.value,
      currency: this.currency.value,
      duration: +this.duration.value,
      taxableAmount: +this.localPriceRecord.get('taxableAmount').value
    };

    if (newRecord.id === 0) {
      // Alta de un nuevo precio
      this.localPricesService.createRecord(newRecord).subscribe(
        () => this.dialogRef.close(),
        error => this.errorMessageService.changeErrorMessage(error)
      );
    } else {
      // Update de un precio
      this.localPricesService.updateRecord(newRecord).subscribe(
        () => this.dialogRef.close(),
        error => this.errorMessageService.changeErrorMessage(error)
      );
    }
  }

  // Cancelar el form y salir sin grabar
  public cancelAndExit(): void {
    this.dialogRef.close();
  }

}
