import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import * as moment from 'moment';

// Services
import { SapService } from '../shared/sap.service';

// Models
import { MonitorPartidaModel } from '../models/monitor-partida.model';

// Components
import { NuevoPagoModalComponent } from './nuevo-pago/nuevo-pago.component';

@Component({
  selector: 'app-monitor-pago',
  templateUrl: './monitor-pago.component.html',
  styleUrls: ['./monitor-pago.component.scss']
})
export class MonitorPagoComponent implements OnInit {

  // Variables
  public nuevoPagoModal = false;
  public partidas: MonitorPartidaModel[] = [];

  // Varaibles para Nuevo Pago
  private empresaId = '';
  private fechaPago: moment.Moment;
  private viaPago = '';

  constructor(
    public dialog: MatDialog,
    private sapService: SapService
  ) {}

  ngOnInit(): void {}

  // Solicitar los datos para crear la nueva solicitud de pago
  public nuevoPagoDialog(): void {

    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.data = {};

    const dialogRef = this.dialog.open(NuevoPagoModalComponent, dialogConfig);

    dialogRef.afterClosed().subscribe(
      result => {
        console.log('Modal data:', result);
        this.empresaId = result['empresaId'];
        this.fechaPago = result['fechaPago'];
        this.viaPago = result['viaPago'];
      }
    );
  }

  // Simular pago
  public simular() {

  }

  // Pagar
  public pagar() {

  }

}
