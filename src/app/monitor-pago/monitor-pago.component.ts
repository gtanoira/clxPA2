import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import * as moment from 'moment';

// Services
import { ErrorMessageService } from '../core/error-message.service';
import { SapService } from '../shared/sap.service';

// Models
import { PagoPartidaModel } from '../models/pago-partida.model';

// Components
import { NuevoPagoModalComponent } from './nuevo-pago/nuevo-pago.component';

@Component({
  selector: 'app-monitor-pago',
  templateUrl: './monitor-pago.component.html',
  styleUrls: ['./monitor-pago.component.scss']
})
export class MonitorPagoComponent implements OnInit {

  // Variables
  public estadoPago = 'I'; // indicará el estado en que se encuentra el monitor de pago: (I)inicial / (S)simular
  public nuevoPagoModal = false;

  // Tabla de facturas a pagar (partidas)
  public partidas: PagoPartidaModel[] = [];
  public columnsToDisplay = ['proveedorDesc', 'vtoFecha', 'docNro', 'docMoneda', 'docImporte'];

  // Varaibles para filtrar las partidas del Nuevo Pago
  private empresaId = '';
  private fechaPago: moment.Moment;
  private viaPago = '';

  constructor(
    private errorMessageService: ErrorMessageService,
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
        if (result) {
          // Crear el nuevo pago
          this.empresaId = result['empresaId'];
          this.fechaPago = result['fechaPago'];
          this.viaPago = result['viaPago'];

          // Setear variables
          this.estadoPago = 'I';

          // Buscar las partidas al SAP
          this.sapService.getPagoPartidas(this.empresaId, this.fechaPago.format('YYYYMMDD'), this.viaPago).subscribe(
            partidas => {
              if (partidas.length <= 0) {
                this.errorMessageService.changeErrorMessage('No se han encontrado facturas que pagar.');
              } else {
                console.log('*** PARTIDAS:', partidas);
                this.partidas = partidas;
              }
            },
            error => {
              this.errorMessageService.changeErrorMessage(error);
            }
          );
        }
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
