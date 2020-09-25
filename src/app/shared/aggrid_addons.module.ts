import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';

// Components
import { AgGridLoadingComponent } from 'src/app/shared/ag-grid/ag-grid_loading.component';
import { AggridTooltipComponent } from 'src/app/shared/ag-grid/aggrid-tooltip.component';
import { DialogModalComponent } from 'src/app/shared/dialog/dialog.component';

@NgModule({
  declarations: [
    AgGridLoadingComponent,
    AggridTooltipComponent,
    DialogModalComponent
  ],
  exports: [
    AgGridLoadingComponent,
    AggridTooltipComponent,
    DialogModalComponent
  ],
  entryComponents: [
    DialogModalComponent
  ],
  imports: [
    CommonModule,
    MatDialogModule
  ]
})
export class AggridAddonsModule {}
