import { Component } from '@angular/core';
import { ILoadingOverlayAngularComp } from 'ag-grid-angular';

@Component({
  selector: 'app-loading-overlay',
  template: `
    <div class="wrap">
      <div class="container">
        <div class="triangle"></div>
        <div class="triangle"></div>
      </div>
      <div class="container">
        <div class="triangle shadow"></div>
        <div class="triangle shadow"></div>
      </div>
      <i class="text"> {{params.loadingMessage}} </i>
    </div>
  `,
  styleUrls: ['./ag-grid_loading.component.css']
})
export class AgGridLoadingComponent implements ILoadingOverlayAngularComp {

    params: any;

    agInit(params): void {
      this.params = params;
    }
}
