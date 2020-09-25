import { Component } from '@angular/core';
import { ITooltipAngularComp } from 'ag-grid-angular';

@Component({
  selector: 'app-tooltip-component',
  template:
    `
      <div class="custom-tooltip">
        <p>{{data}}</p>
      </div>
    `,
  styles: [
    `
      :host {
        position: absolute;
        width: 150px;
        height: 50px;
        border: 1px solid cornflowerblue;
        overflow: hidden;
        pointer-events: none;
        transition: opacity 1s;
        background-color: lightyellow;
      }

      :host.ag-tooltip-hiding {
        opacity: 0;
      }

      .custom-tooltip p {
        margin: 5px;
        white-space: nowrap;
        color: black;
      }

      .custom-tooltip p:first-of-type {
        font-weight: bold;
      }
    `
  ]
})
export class AggridTooltipComponent implements ITooltipAngularComp {

  private params: any;
  public data: any;

  agInit(params): void {
    this.data = params.value;
    /*
      console.log('*** PARAMS: ', params);
      this.params = params;
      console.log('*** PARAMS2:', params.api.getRowNode(params.rowIndex));
      this.data = params.api.getRowNode(params.rowIndex).data;
      this.data.color = this.params.color || 'black';
      console.log('***DATA:', this.data);
    */
  }
}
