import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';

// External libraries
import { AgGridModule } from 'ag-grid-angular';

// Modules
import { AggridAddonsModule } from 'src/app/shared/aggrid_addons.module';
import { ContenidosRoutingModule } from './contenidos.routing.module';
import { DirectivesModule } from '../shared/directives.module';

// Services
import { LotesBatchService } from '../shared/lotes_batch.service';
import { PlanningService } from '../shared/planning.service';
import { VodService } from 'src/app/shared/vod.service';

// Components
import { BorrarLoteComponent } from 'src/app/shared/borrar-lote/borrar_lote.component';
import { MaestroTitulosComponent } from './vod-maestro/maestro-titulos/maestro-titulos.component';
import { VodActualComponent } from './vod-actual/vod-actual.component';
import { VodMaestroComponent } from './vod-maestro/vod-maestro.component';

// Shared Components
import { AgGridLoadingComponent } from '../shared/ag-grid/ag-grid_loading.component';
import { AggridTooltipComponent } from '../shared/ag-grid/aggrid-tooltip.component';

@NgModule({
  declarations: [
    BorrarLoteComponent,
    MaestroTitulosComponent,
    VodActualComponent,
    VodMaestroComponent
  ],
  imports: [
    AggridAddonsModule,
    AgGridModule.withComponents([AgGridLoadingComponent, AggridTooltipComponent]),
    ContenidosRoutingModule,
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
    LotesBatchService,
    PlanningService,
    VodService
  ]
})
export class ContenidosModule { }
