import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ReactiveFormsModule } from '@angular/forms';

// Modules
import { CommonModule } from '@angular/common';
import { MonitorPagoRoutingModule } from './monitor-pago.routing.module';

// Components
import { MonitorPagoComponent } from './monitor-pago.component';
import { NuevoPagoModalComponent } from './nuevo-pago/nuevo-pago.component';

// Services
import { AuxiliarTablesService } from '../shared/auxiliar-tables.service';
import { SapService } from '../shared/sap.service';

@NgModule({
  declarations: [
    MonitorPagoComponent,
    NuevoPagoModalComponent
  ],
  imports: [
    MonitorPagoRoutingModule,
    CommonModule,
    // Angular Material
    MatButtonModule,
    MatDatepickerModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    ReactiveFormsModule
  ],
  providers: [
    AuxiliarTablesService,
    SapService
  ],
  entryComponents: [
    NuevoPagoModalComponent
  ]
})
export class MonitorPagoModule { }
