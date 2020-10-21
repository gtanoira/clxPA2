import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-local-prices-crud',
  templateUrl: './crud.component.html',
  styleUrls: ['./crud.component.scss']
})
export class LocalPricesCrudComponent implements OnInit {

  public localPriceRecord: FormGroup;

  constructor(
    private fb: FormBuilder
  ) {
    // Definir el formulario
    this.localPriceRecord = this.fb.group({
      fecha: [''],
      country: ['', {updateOn: 'blur'}],
      currency: [{value: '', disabled: true}],
      duration: [''],
      taxableAmount: [0]
    });
  }

  // GETTERS
  get fecha() { return this.localPriceRecord.get('fecha'); }

  ngOnInit(): void {
  }

}
