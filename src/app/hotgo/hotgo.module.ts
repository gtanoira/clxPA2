import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { OverlayModule } from '@angular/cdk/overlay';

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
import { LocalPricesComponent } from './local-prices/local-prices.component';
import { LocalPricesCrudComponent } from './local-prices/crud/crud.component';
import { GaComponent } from './ga/ga.component';

@NgModule({
  declarations: [
    HotgoComponent,
    MktExpButtonsComponent,
    ErrorsLogComponent,
    MissingRecordsComponent,
    MktExpendituresComponent,
    ProcesosBatchsComponent,
    PbatchsBtnActionsComponent,
    ScheduleComponent,
    LocalPricesComponent,
    LocalPricesCrudComponent,
    GaComponent
  ],
  imports: [
    AggridAddonsModule,
    AgGridModule.withComponents([AgGridLoadingComponent, AggridTooltipComponent, PbatchsBtnActionsComponent, MktExpButtonsComponent]),
    DirectivesModule,
    HotgoRoutingModule,
    // Angular Modules
    CommonModule,
    MatBadgeModule,
    MatButtonModule,
    MatCheckboxModule,
    MatChipsModule,
    MatDatepickerModule,
    MatExpansionModule,
    MatIconModule,
    MatInputModule,
    MatMenuModule,
    MatProgressBarModule,
    MatSelectModule,
    MatTableModule,
    MatTabsModule,
    MatTooltipModule,
    OverlayModule,
    ReactiveFormsModule
  ],
  providers: [
    HotgoService,
    SapService
  ]
})
export class HotgoModule { }
