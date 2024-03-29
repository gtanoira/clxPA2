import { animate, state, style, transition, trigger } from '@angular/animations';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { AsyncValidatorFn, FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';
import { takeWhile } from 'rxjs/operators';
import * as moment from 'moment';

// Models
import { ProductLocalPriceModel } from 'src/app/models/product-local-price.model';
// Components
import { LocalPricesCrudComponent } from './crud/crud.component';
// Services
import { AuthorizationService } from 'src/app/core/authorization.service';
import { ErrorMessageService } from 'src/app/core/error-message.service';
import { LocalPricesService, SearchQuery } from 'src/app/shared/local-prices.service';
import { PaginatedDataSource } from 'src/app/shared/datasource/datasource.component';
import { DialogModalComponent } from 'src/app/shared/dialog/dialog.component';

@Component({
  selector: 'app-local-prices',
  templateUrl: './local-prices.component.html',
  styleUrls: ['./local-prices.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style( {height: '0px', minHeight: '0'} )),
      state('expanded', style( {height: '*'} )),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class LocalPricesComponent implements OnInit, AfterViewInit {

  // Variables para la tabla a mostrar
  // localPricesData: ProductLocalPriceModel[];
  public columnsToDisplay = [
    'fecha',
    'duration',
    'country',
    'paymProcessor',
    'currency',
    'taxableAmount'
  ];
  public dataSource = new PaginatedDataSource<ProductLocalPriceModel, SearchQuery>(
    (request, query) => this.localPricesService.getPage(request, query),
    {property: 'fecha', order: 'desc'},  // initial sort
    {search: undefined},  // initial search: no search
    7  // initial pageSize
  );
  // tslint:disable-next-line: max-line-length
  public searchKeys: FormControl = new FormControl('', [ this.searchKeysValidator.bind(this) ]); // variable para reliazar searches a la tabla

  constructor(
    private authorizationService: AuthorizationService,
    private errorMessageService: ErrorMessageService,
    private localPricesService: LocalPricesService,
    private modalDialog: MatDialog
  ) { }

  // tslint:disable-next-line: use-lifecycle-interface
  ngOnInit() {
    // Add button EDIT if the user has the role
    if (this.authorizationService.componentPropertyValue('pgmHotGo', 'cptProductLocalPrices', 'btnUpdate') !== 'off') {
      this.columnsToDisplay.push('btnUpdate');
    }
    // Add button DELETE if the user has the role
    if (this.authorizationService.componentPropertyValue('pgmHotGo', 'cptProductLocalPrices', 'btnDelete') !== 'off') {
      this.columnsToDisplay.push('btnDelete');
    }
  }

  ngAfterViewInit() {
    this.cacheData();
  }

  // Get and cache all batchs
  private cacheData() {
    this.localPricesService.getAll()
    .pipe(takeWhile(total => total >= 0))
    .subscribe(
      data => {
        if (data > 0) {
          this.dataSource.fetch(0);
        }
      },
      error => {
        const msg = `${error.error.message} \n ${error.message}`;
        this.errorMessageService.changeErrorMessage(msg);
      }
    );

  }

  public changeSort(sort: Sort): void {
    if (sort.active && sort.direction !== '') {
      const toSort = { property: sort.active.toString(), order: sort.direction };
      this.dataSource.sortBy({ property: sort.active, order: sort.direction });
    }
  }

  public changePage(pageEvent: PageEvent): void {
    this.dataSource.pageSize = pageEvent.pageSize;
    this.dataSource.fetch(pageEvent.pageIndex);
  }

  // Delete a Record
  public deleteRecord(record: ProductLocalPriceModel): void {

    // Confirmar borrado
    // Open a Dialog Modal
    const dialogRef = this.modalDialog.open(DialogModalComponent, {
      width: '320px',
      data: {
        title: `Eliminar Precio`,
        dialogType: 'Alert',
        body: 'Confirma la eliminación del precio?',
        btn1Text: 'Cancelar',
        btn2Text: 'Ok'
      }
    });

    dialogRef.afterClosed().subscribe(
     btnClick => {
        if (btnClick === 2) {
          // Eliminar el registro
          this.localPricesService.deleteRecord(record.id).subscribe(
            data => {
              this.errorMessageService.changeErrorMessage(data.message);
              // Reimprimir los registros en la pantalla
              this.cacheData();
            },
            error => this.errorMessageService.changeErrorMessage(error.message)
          );
        }
      }
    );
  }

  // Editar un registro
  public updateRecord(record: ProductLocalPriceModel): void {
    // Open a Dialog Modal
    const dialogRef = this.modalDialog.open(LocalPricesCrudComponent, { data: record });
    dialogRef.afterClosed().subscribe(
      () => this.cacheData()  // Reimprimir los registros en la pantalla
    );
  }

  // Alta de un nuevo local price
  public nuevoLocalPrice() {
    this.updateRecord({
      id: 0,  // = 0 -> fuerza el alta
      fecha: moment().format('YYYY-MM-DD'),
      paymProcessor: 'mercado_pago',
      country: 'AR',
      currency: 'ARS',
      duration: 30,
      taxableAmount: 0
    });
  }

  // Search records
  public searchKeysValidator(control: FormControl): AsyncValidatorFn {
    if (control && control.value !== null && control.value !== undefined) {
      setTimeout(() => {
        console.log(control.value);
      }, 500);
    }
    return null;
  }
}
