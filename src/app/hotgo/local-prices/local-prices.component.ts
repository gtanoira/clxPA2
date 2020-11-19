import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

// Models
import { ProductLocalPriceModel } from 'src/app/models/product-local-price.model';

// Services
import { ErrorMessageService } from 'src/app/core/error-message.service';
import { HotgoService } from 'src/app/shared/hotgo.service';

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
  public columnsToDisplay = ['fecha', 'country', 'duration', 'currency', 'taxableAmount'];
  public dataSource = new MatTableDataSource<ProductLocalPriceModel>([]);
  public expandedElement: ProductLocalPriceModel | null;    // Indica que row está expandido

  // HTML element para ordenar la tabla (sort)
  @ViewChild(MatSort) sort: MatSort;

  constructor(
    private errorMessageService: ErrorMessageService,
    private hotgoService: HotgoService
  ) { }

  // tslint:disable-next-line: use-lifecycle-interface
  ngOnInit() {

    // Establecer los datos a mostrar
    this.hotgoService.getProductLocalPrices().subscribe(
      data => {
        if (data.length <= 0) {
          this.errorMessageService.changeErrorMessage('No se han encontrado datos que mostrar.');
        } else {
          this.dataSource.data = data;
        }
      }
    );
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }

  // Alta de un nuevo local price
  public nuevoLocalPrice() {}
}
