import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import {
  MatAutocompleteModule,
  MatButtonModule,
  MatDatepickerModule,
  MatIconModule,
  MatInputModule,
  MatProgressBarModule,
  MatSelectModule
} from '@angular/material';
import { MatRadioModule } from '@angular/material/radio';

// Modules
import { CobranzasRoutingModule } from './cobranzas.routing.module';
import { DirectivesModule } from '../shared/directives.module';

// Services
import { SapService } from '../shared/sap.service';

// Components
import { ListadoRecibosComponent } from './listado_recibos/listado_recibos.component';
import { OpenItemsComponent } from './open_items/open_items.component';

@NgModule({
  declarations: [
    ListadoRecibosComponent,
    OpenItemsComponent
  ],
  imports: [
    CobranzasRoutingModule,
    DirectivesModule,
    // Angular Modules
    CommonModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatDatepickerModule,
    MatIconModule,
    MatInputModule,
    MatProgressBarModule,
    MatRadioModule,
    MatSelectModule,
    ReactiveFormsModule
  ],
  providers: [
    SapService
  ]
})
export class CobranzasModule { }
