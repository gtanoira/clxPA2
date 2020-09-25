import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import {
  MatButtonModule,
  MatCardModule,
  MatDatepickerModule,
  MatIconModule,
  MatInputModule,
  MatProgressBarModule,
  MatSelectModule
} from '@angular/material';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';

// External libraries
import { AgGridModule } from 'ag-grid-angular';

// Modules
import { AggridAddonsModule } from 'src/app/shared/aggrid_addons.module';
import { CotizacionesRoutingModule } from './cotizaciones.routing.module';
import { DirectivesModule } from '../shared/directives.module';

// Components
import { ActualizarCotizacionComponent } from './actualizar/actualizar.component';
import { CalculadoraComponent } from './calculadora/calculadora.component';
import { CotizacionDiariaComponent } from './diaria/diaria.component';
import { CotizacionPromedioComponent } from './promedio/promedio.component';
import { CotizacionEntreFechasComponent } from './entre_fechas/entre_fechas.component';
import { CotizacionesComponent } from './cotizaciones.component';

// Shared Components
import { AgGridLoadingComponent } from '../shared/ag-grid/ag-grid_loading.component';
import { AggridTooltipComponent } from '../shared/ag-grid/aggrid-tooltip.component';
import { CotizacionesService } from '../shared/cotizaciones.service';

@NgModule({
  declarations: [
    ActualizarCotizacionComponent,
    CalculadoraComponent,
    CotizacionDiariaComponent,
    CotizacionEntreFechasComponent,
    CotizacionPromedioComponent,
    CotizacionesComponent
  ],
  imports: [
    AggridAddonsModule,
    AgGridModule.withComponents([AgGridLoadingComponent, AggridTooltipComponent]),
    CommonModule,
    CotizacionesRoutingModule,
    DirectivesModule,
    // Angular Material
    MatButtonModule,
    MatCardModule,
    MatDatepickerModule,
    MatIconModule,
    MatInputModule,
    MatProgressBarModule,
    MatSelectModule,
    MatTabsModule,
    MatTooltipModule,
    ReactiveFormsModule
  ],
  providers: [
    CotizacionesService
  ]
})
export class CotizacionesModule { }
