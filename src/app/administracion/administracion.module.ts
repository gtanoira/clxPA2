import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';

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
