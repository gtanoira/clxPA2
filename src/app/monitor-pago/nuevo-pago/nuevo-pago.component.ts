import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subscription } from 'rxjs';

// Moment.Js library
import * as moment from 'moment';
import { MAT_DATE_FORMATS } from '@angular/material/core';
// Moment date formats
export const MY_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD-MM-YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'lll',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

// Services
import { AuxiliarTablesService } from '../../shared/auxiliar-tables.service';

// Models
import { SelectOption } from '../../models/select-option';

@Component({
  selector: 'app-nuevo-pago-modal',
  templateUrl: './nuevo-pago.html',
  styleUrls: ['./nuevo-pago.scss'],
  providers: [
    {provide: MAT_DATE_FORMATS, useValue: MY_FORMATS}
  ]
})
export class NuevoPagoModalComponent implements OnInit {

  // Variables
  public empresaOptions: SelectOption[] = [];
  public nuevoPagoForm: FormGroup;
  public viasPagoOptions: SelectOption[] = [];
  private viasDePagoPorSociedad = [];

  // Triggers
  public triggerEmpresaId: Subscription;

  constructor(
    private auxiliarTablesService: AuxiliarTablesService,
    public dialogRef: MatDialogRef<NuevoPagoModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {[key: string]: any},
    private fb: FormBuilder,
  ) {

    // Calcular el día jueves de la semana en curso o de la próxima
    const dowActual = +moment().format('e');  // nro del dia actual (dow: day of week)
    const daysToJueves = (4 - dowActual) >= 0 ? (4 - dowActual) : (11 - dowActual);

    // Form para crear un nuevo pago
    this.nuevoPagoForm = this.fb.group({
      empresaId: [{ value: 'XVE1', updateOn: 'blur' }, Validators.required],
      fechaPago: [moment().add(daysToJueves, 'day'), Validators.required],
      viaPago: ['1', Validators.required]
    });

    // Triggers
    this.triggerEmpresaId = this.nuevoPagoForm.get('empresaId').valueChanges.subscribe(
      empresa => {
        // Buscar las vias de pago de la empresa
        this.viasPagoOptions = this.viasDePagoPorSociedad?.[empresa];
      }
    );
  }

  ngOnInit() {
    // Empresas habilitadas
    this.auxiliarTablesService.getOptionsFromJsonFile('monitor_pago_empresa_options.json').subscribe(
      data => {
        this.empresaOptions = data;
      },
      () => null  // por error no hacer nada
    );

    // Vias de Pago por sociedad habilitadas
    this.auxiliarTablesService.getOptionsFromJsonFile('monitor_pago_vias_empresa_options.json').subscribe(
      data => {
        this.viasDePagoPorSociedad = data;
      },
      () => null  // por error no hacer nada
    );
  }

  public onSaveDialog(): void {
    this.triggerEmpresaId.unsubscribe();
    this.dialogRef.close({
      empresaId: this.nuevoPagoForm.get('empresaId').value,
      fechaPago: this.nuevoPagoForm.get('fechaPago').value,
      viaPago: this.nuevoPagoForm.get('viaPago').value
    });
  }

  public onCloseDialog(): void {
    this.triggerEmpresaId.unsubscribe();
    this.dialogRef.close();
  }

}
