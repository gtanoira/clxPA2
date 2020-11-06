import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
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
    MatCheckboxModule,
    MatDatepickerModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatSortModule,
    MatTableModule,
    MatTooltipModule,
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
