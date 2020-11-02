import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import * as moment from 'moment';

// Services
import { SapService } from '../shared/sap.service';

// Models
import { MonitorPartidaModel } from '../models/monitor-partida.model';

@Component({
  selector: 'app-monitor-pago',
  templateUrl: './monitor-pago.component.html',
  styleUrls: ['./monitor-pago.component.scss']
})
export class MonitorPagoComponent implements OnInit {

  public nuevoPagoForm: FormGroup;
  public partidas: MonitorPartidaModel[] = [];

  constructor(
    private fb: FormBuilder,
    private sapService: SapService
  ) {

    // Form para crear un nuevo pago
    this.nuevoPagoForm = this.fb.group({
      empresaId: ['XVE1'],
      fechaPago: [moment()],
      viaPago: ['']
    });

  }

  ngOnInit(): void {
  }

}
