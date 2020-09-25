import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import {
  MatButtonModule,
  MatDatepickerModule,
  MatIconModule,
  MatInputModule,
  MatProgressBarModule,
  MatSelectModule,
} from '@angular/material';

// Modules
import { AdmVentasRoutingModule } from './adm-ventas.routing.module';
import { DirectivesModule } from '../shared/directives.module';

// Services
import { AdmVentasService } from '../shared/adm-ventas.service';
import { SapService } from '../shared/sap.service';

// Components
import { AggingComponent } from './agging/agging.component';
import { AggingFacturacionComponent } from './agging/agging_facturacion/agging_facturacion.component';
import { AggingSaldoComponent } from './agging/agging_saldo/agging_saldo.component';
import { BorrarLoteComponent } from './borrar_lote/borrar_lote.component';
import { CostoRepresentadaPorCeBeComponent } from './costo_representada_por_cebe/costo_representada_por_cebe.component';

@NgModule({
  declarations: [
    AggingComponent,
    AggingFacturacionComponent,
    AggingSaldoComponent,
    BorrarLoteComponent,
    CostoRepresentadaPorCeBeComponent
  ],
  imports: [
    AdmVentasRoutingModule,
    DirectivesModule,
    // Angular Modules
    CommonModule,
    MatButtonModule,
    MatDatepickerModule,
    MatIconModule,
    MatInputModule,
    MatProgressBarModule,
    MatSelectModule,
    ReactiveFormsModule
  ],
  providers: [
    SapService,
    AdmVentasService
  ]
})
export class AdmVentasModule { }
