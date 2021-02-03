import { animate, state, style, transition, trigger } from '@angular/animations';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';
import { takeWhile } from 'rxjs/operators';

// Models
import { ProductLocalPriceModel } from 'src/app/models/product-local-price.model';
// Components
import { LocalPricesCrudComponent } from './crud/crud.component';
// Services
import { AuthorizationService } from 'src/app/core/authorization.service';
import { ErrorMessageService } from 'src/app/core/error-message.service';
import { LocalPricesService, SearchQuery } from 'src/app/shared/local-prices.service';
import { PaginatedDataSource } from 'src/app/shared/datasource/datasource.component';

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
    'country',
    'duration',
    'currency',
    'taxableAmount'
  ];
  public dataSource = new PaginatedDataSource<ProductLocalPriceModel, SearchQuery>(
    (request, query) => this.localPricesService.getPage(request, query),
    {property: 'fecha', order: 'desc'},  // initial sort
    {search: undefined},  // initial query: no query
    7  // initial pageSize
  );
  public expandedElement: ProductLocalPriceModel | null;    // Indica que row está expandido

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
    // Get and cache all batchs
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
  public deleteRecord(id: number): void {

    // Confirmar borrado

    // Reimprimir los registros en la pantalla
    this.dataSource.fetch(0);
  }

  // Editar un registro
  public updateRecord(record: ProductLocalPriceModel): void {
    // Open a Dialog Modal
    const dialogRef = this.modalDialog.open(LocalPricesCrudComponent, { data: record });

    dialogRef.afterClosed().subscribe();
  }

  // Alta de un nuevo local price
  public nuevoLocalPrice() {}
}
