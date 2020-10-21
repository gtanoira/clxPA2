import { AfterViewInit, Component, OnInit } from '@angular/core';
import {animate, state, style, transition, trigger} from '@angular/animations';
import { Observable } from 'rxjs';

// Models
import { ProductLocalPriceModel } from 'src/app/models/product-local-price.model';

// Services
import { HotgoService } from 'src/app/shared/hotgo.service';


@Component({
  selector: 'app-local-prices',
  templateUrl: './local-prices.component.html',
  styleUrls: ['./local-prices.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class LocalPricesComponent implements OnInit {

  localPricesData: ProductLocalPriceModel[];
  columnsToDisplay = ['fecha', 'country', 'duration', 'currency', 'taxableAmount'];
  expandedElement: ProductLocalPriceModel | null;

  constructor(
    private hotgoService: HotgoService
  ) { }

  // tslint:disable-next-line: use-lifecycle-interface
  ngOnInit() {

    // Establecer los datos a mostrar
    this.hotgoService.getProductLocalPrices().subscribe(
      data => this.localPricesData = data
    );
  }

}
