import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';

// External libraries
import { AgGridModule } from 'ag-grid-angular';

// Modules
import { AggridAddonsModule } from 'src/app/shared/aggrid_addons.module';
import { DirectivesModule } from '../shared/directives.module';
import { HotgoRoutingModule } from './hotgo.routing.module';

// Services
import { HotgoService } from 'src/app/shared/hotgo.service';
import { SapService } from 'src/app/shared/sap.service';

// Shared Components
import { AgGridLoadingComponent } from '../shared/ag-grid/ag-grid_loading.component';
import { AggridTooltipComponent } from '../shared/ag-grid/aggrid-tooltip.component';

// Components
import { ErrorsLogComponent } from './errors-log/errors-log.component';
import { HotgoComponent } from './hotgo.component';
import { MktExpButtonsComponent } from './mkt-expenditures/mktexp-buttons.component';
import { MissingRecordsComponent } from './missing-records/missing-records.component';
import { MktExpendituresComponent } from './mkt-expenditures/mkt-expenditures.component';
import { PbatchsBtnActionsComponent } from './procesos-batchs/pbatchs-btn-actions.component';
import { ProcesosBatchsComponent } from './procesos-batchs/procesos-batchs.component';
import { ScheduleComponent } from './schedule/schedule.component';

@NgModule({
  declarations: [
    HotgoComponent,
    MktExpButtonsComponent,
    ErrorsLogComponent,
    MissingRecordsComponent,
    MktExpendituresComponent,
    ProcesosBatchsComponent,
    PbatchsBtnActionsComponent,
    ScheduleComponent
  ],
  imports: [
    AggridAddonsModule,
    AgGridModule.withComponents([AgGridLoadingComponent, AggridTooltipComponent, PbatchsBtnActionsComponent, MktExpButtonsComponent]),
    DirectivesModule,
    HotgoRoutingModule,
    // Angular Modules
    CommonModule,
    MatButtonModule,
    MatChipsModule,
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
    HotgoService,
    SapService
  ]
})
export class HotgoModule { }
