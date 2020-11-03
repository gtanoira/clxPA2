import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import * as moment from 'moment';
import { Subscription } from 'rxjs';

// Services
import { SapService } from '../shared/sap.service';

// Models
import { MonitorPartidaModel } from '../models/monitor-partida.model';
import { SelectOption } from '../models/select-option';
import { AuxiliarTablesService } from '../shared/auxiliar-tables.service';

@Component({
  selector: 'app-monitor-pago',
  templateUrl: './monitor-pago.component.html',
  styleUrls: ['./monitor-pago.component.scss']
})
export class MonitorPagoComponent implements OnInit {

  // Variables
  public empresaOptions: SelectOption[];
  public nuevoPagoForm: FormGroup;
  public nuevoPagoModal = false;
  public partidas: MonitorPartidaModel[] = [];
  public viasPagoOptions: SelectOption[];

  // Triggers
  public triggerEmpresaId: Subscription;

  constructor(
    private auxiliarTablesService: AuxiliarTablesService,
    public dialog: MatDialog,
    private fb: FormBuilder,
    private sapService: SapService
  ) {

    // Calcular el día jueves de la semana en curso o de la próxima
    const dowActual = +moment().format('e');  // nro del dia actual (dow: day of week)
    const daysToJueves = (4 - dowActual) >= 0 ? (4 - dowActual) : (11 - dowActual);

    // Form para crear un nuevo pago
    this.nuevoPagoForm = this.fb.group({
      empresaId: [{ value: 'XVE1', updateOn: 'blur' }],
      fechaPago: [moment().add(daysToJueves, 'days')],
      viaPago: ['1']
    });

    // Triggers
    this.triggerEmpresaId = this.nuevoPagoForm.get('empresaId').valueChanges.subscribe(
      empresa => {
        // Buscar las vias de pago de la empresa
        this.viasPagoOptions = [
          { id: '1', name: 'Via 01' },
          { id: '2', name: 'Via 02' },
          { id: '3', name: 'Via 03' },
        ];
      }
    );
  }

  ngOnInit(): void {
    // Empresa Options
    this.auxiliarTablesService.getOptionsFromJsonFile('monitor_pago_empresa_options.json').subscribe(
      data => {
        this.empresaOptions = data;
      }
    );
  }

  public nuevoPagoDialog(): void {
    const dialogRef = this.dialog.open(NuevoPagoModalComponent, {
      width: '360px',
      data: this.nuevoPagoForm
    });

    dialogRef.afterClosed().subscribe(
      result => {
        console.log('Modal data:', result);
        //this.nuevoPagoForm = result;
      }
    );
  }

  public nuevoPago() {

  }

  // Simular pago
  public simular() {

  }

  // Pagar
  public pagar() {

  }

}

/*
  MODAL para el formulario de Nuevo Pago
*/
@Component({
  selector: 'app-nuevo-pago-modal',
  templateUrl: './nuevo-pago.html',
})
class NuevoPagoModalComponent {

  constructor(
    public dialogRef: MatDialogRef<NuevoPagoModalComponent>, @Inject(MAT_DIALOG_DATA) public data: FormGroup
  ) {}

  onCancelDialog(): void {
    this.dialogRef.close();
  }

}
