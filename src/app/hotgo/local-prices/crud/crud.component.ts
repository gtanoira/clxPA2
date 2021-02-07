import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
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
import { ErrorMessageService } from 'src/app/core/error-message.service';
import { HotgoService } from 'src/app/shared/hotgo.service';
import { LocalPricesService } from 'src/app/shared/local-prices.service';
// Models & Interfaces
import { CountryModel } from 'src/app/models/country.model';
import { ProductLocalPriceModel } from 'src/app/models/product-local-price.model';

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
  public countryOptions: CountryModel[] = [];

  // Form validations
  subsCountry: Subscription;

  constructor(
    private errorMessageService: ErrorMessageService,
    private hotgoService: HotgoService,
    public dialogRef: MatDialogRef<LocalPricesCrudComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ProductLocalPriceModel,
    private fb: FormBuilder,
    private localPricesService: LocalPricesService
  ) {
    if (data) {
      // Definir el formulario
      this.localPriceRecord = this.fb.group({
        id: [data.id],
        fecha: [data.fecha],
        country: [data.country, {updateOn: 'blur'}],
        currency: [{value: data.currency, disabled: true}],
        duration: [data.duration],
        taxableAmount: [data.taxableAmount]
      });
    } else {
      this.localPriceRecord = this.fb.group({
        id: 0,
        fecha: [''],
        country: ['', {updateOn: 'blur'}],
        currency: [{value: 'USD', disabled: true}],
        duration: [0],
        taxableAmount: [0]
      });
    }
    this.localPriceRecord.markAsUntouched();
    this.localPriceRecord.markAsPristine();
  }

  // GETTERS
  get fecha() { return this.localPriceRecord.get('fecha'); }
  get country() { return this.localPriceRecord.get('country'); }
  get currency() { return this.localPriceRecord.get('currency'); }
  get duration() { return this.localPriceRecord.get('duration'); }

  ngOnInit(): void {
    // Country Options
    this.hotgoService.getCountries().subscribe(
      data => this.countryOptions = data,
      () => this.countryOptions = []
    );

    // Subscribir a validadores de campos del form
    this.subscribeCountry();
  }

  ngOnDestroy() {
    this.subsCountry.unsubscribe();
  }

  public onBtnClick(btnNo: number): void {
    this.dialogRef.close(btnNo);
  }

  // Validador del campo COUNTRY
  private subscribeCountry() {
    console.log('*** validar country');
    // Update para fecha
    this.subsCountry = this.country.valueChanges.subscribe(
      () => this.currency.setValue(
        this.countryOptions.find(el => el.country === this.country.value).currency
      )
    );
  }

  // Grabar los datos en la BDatos
  public saveRecord(): void {
    const newRecord: ProductLocalPriceModel = {
      id: +this.localPriceRecord.get('id').value,
      fecha: this.fecha.value,
      country: this.country.value,
      currency: this.currency.value,
      duration: +this.duration.value,
      taxableAmount: +this.localPriceRecord.get('taxableAmount').value
    };
    this.localPricesService.updateRecord(newRecord).subscribe(
      () => this.dialogRef.close('refresh'),
      error => this.errorMessageService.changeErrorMessage(error)
    );
  }

  // Cancelar el form y salir sin grabar
  public cancelAndExit(): void {
    this.dialogRef.close();
  }

}
