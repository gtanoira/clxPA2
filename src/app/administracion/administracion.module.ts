import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import {
  MatButtonModule,
  MatDatepickerModule,
  MatIconModule,
  MatInputModule,
  MatProgressBarModule,
  MatSelectModule
} from '@angular/material';

// Modules
import { AdministracionRoutingModule } from './administracion.routing.module';
import { DirectivesModule } from '../shared/directives.module';

// Services
import { SapService } from '../shared/sap.service';

// Components
import { CitiVentasComponent } from './citi-ventas/citi-ventas.component';
import { SubdiariosComponent } from './subdiarios/subdiarios.component';

@NgModule({
  declarations: [
    CitiVentasComponent,
    SubdiariosComponent
  ],
  imports: [
    AdministracionRoutingModule,
    DirectivesModule,
    // Angular Modules
    CommonModule,
    MatButtonModule,
    MatDatepickerModule,
    MatIconModule,
    MatInputModule,
    MatProgressBarModule,
    MatSelectModule,
    ReactiveFormsModule
  ],
  providers: [
    SapService
  ]
})
export class AdministracionModule { }
