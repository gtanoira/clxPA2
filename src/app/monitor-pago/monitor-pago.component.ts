import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { animate, state, style, transition, trigger } from '@angular/animations';
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
  styleUrls: ['./monitor-pago.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style( {height: '0px', minHeight: '0'} )),
      state('expanded', style( {height: '*'} )),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class MonitorPagoComponent implements OnInit, AfterViewInit {

  // Variables
  public estadoPago = 'I'; // indicará el estado en que se encuentra el monitor de pago: (I)inicial / (S)simular
  public nuevoPagoModal = false;

  // Tabla de facturas a pagar (partidas)
  // public partidas: PagoPartidaModel[] = [];
  public columnsToDisplay = ['select', 'expandIcon', 'proveedorDesc', 'vtoFecha', 'docNro', 'docMoneda', 'docImporte'];
  public dataSource = new MatTableDataSource<PagoPartidaModel>([]);
  public expandedElement: PagoPartidaModel | null;  // Indica que row está expandido
  public selection = new SelectionModel<PagoPartidaModel>(true, []);

  // Varaibles para filtrar las partidas del Nuevo Pago
  private empresaId = '';
  private fechaPago: moment.Moment;
  private viaPago = '';

  // HTML element para ordenar la tabla (sort)
  @ViewChild(MatSort) sort: MatSort;

  constructor(
    private errorMessageService: ErrorMessageService,
    public dialog: MatDialog,
    private sapService: SapService
  ) {}

  ngOnInit(): void {}

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }

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
                this.dataSource.data = partidas;
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

  // Chequear si se han seleccionado todas las facturas
  public isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /// Seleccionar o deseleccionar todas las columnas
  public masterToggle() {
    this.isAllSelected() ?
        this.selection.clear() :
        this.dataSource.data.forEach(row => this.selection.select(row));
  }

  // Simular pago
  public simular() {

  }

  // Pagar
  public pagar() {

  }

}
