import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { MatDialog } from '@angular/material/dialog';

// Dialog Modal Component
import { DialogModalComponent } from 'src/app/shared/dialog/dialog.component';

// Services
import { ErrorMessageService } from 'src/app/core/error-message.service';
import { HotgoService } from 'src/app/shared/hotgo.service';

@Component({
  selector: 'app-action-buttons',
  templateUrl: './mktexp-buttons.component.html',
  styleUrls: ['./mktexp-buttons.component.css']
})

export class MktExpButtonsComponent implements ICellRendererAngularComp {

  constructor(
    public  dialog: MatDialog,
    private errorMessageService: ErrorMessageService,
    private hotGoService: HotgoService
  ) {}
  params;
  label: string;

  agInit(params): void {
    this.params = params;
    this.label = this.params.label || null;
  }

  refresh(params?: any): boolean {
    return true;
  }

  // Delete an Item of the order
  public deleteItem($event) {
    // Open a Dialog Modal
    const dialogRef = this.dialog.open(DialogModalComponent, {
      width: '320px',
      data: {
        title: 'Eliminar registro',
        dialogType: 'Alert',
        body: this.params.node.data.itemId,
        btn1Text: 'Cancelar',
        btn2Text: 'Borrar'
      }
    });

    dialogRef.afterClosed().subscribe(
     btnClick => {
        if (btnClick === 2) {
          this.hotGoService.deleteMktExpenditures(this.params.data['id']).subscribe(
            data => {
              this.errorMessageService.changeErrorMessage(data['message']);
              // Get all screens refresh with the new data
              this.hotGoService.actualizarMktExpenditures.next(true);
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
