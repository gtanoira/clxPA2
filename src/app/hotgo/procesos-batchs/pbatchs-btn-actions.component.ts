import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { MatDialog } from '@angular/material/dialog';

// Dialog Modal Component
import { DialogModalComponent } from 'src/app/shared/dialog/dialog.component';

// Services
import { ErrorMessageService } from 'src/app/core/error-message.service';
import { HotgoService } from 'src/app/shared/hotgo.service';

@Component({
  selector: 'app-pbatch-buttons',
  templateUrl: './pbatchs-btn-actions.component.html',
  styleUrls: ['./pbatchs-btn-actions.component.css']
})

export class PbatchsBtnActionsComponent implements ICellRendererAngularComp {

  constructor(
    public  dialog: MatDialog,
    private errorMessageService: ErrorMessageService,
    private hotGoService: HotgoService
  ) {}

  public params: any;
  public label: string;

  public agInit(params: any): void {
    this.params = params;
    this.label = this.params.label || null;
  }

  public refresh(params?: any): boolean {
    return true;
  }

  // Borrar un registro
  public deleteItem($event) {
    // Open a Dialog Modal
    const dialogPbatch = this.dialog.open(DialogModalComponent, {
      width: '320px',
      data: {
        title: 'Eliminar registro',
        dialogType: 'Alert',
        body: `Id: ${this.params.node.data.id}`,
        btn1Text: 'Cancelar',
        btn2Text: 'Eliminar'
      }
    });

    dialogPbatch.afterClosed().subscribe(
      btnClick => {
        if (btnClick === 2) {
          this.hotGoService.delProcesoBatch(this.params.data['id']).subscribe(
            data => {
              this.errorMessageService.changeErrorMessage(data['message']);
              // Get all screens refresh with the new data
              this.hotGoService.actualizarProcesosBatchs.next(true);
            },
            err => this.errorMessageService.changeErrorMessage(err)
          );
        }
      }
    );
  }

  // Dialog Modal
  openDialogModal(): void {
  }
}
