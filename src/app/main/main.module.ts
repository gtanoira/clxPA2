import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import {
  MatButtonModule,
  MatIconModule,
  MatInputModule,
  MatTooltipModule
} from '@angular/material';

// External libraries

// Modules
import { CoreModule } from 'src/app/core/core.module';
import { DirectivesModule } from '../shared/directives.module';
import { MainRoutingModule } from './main.routing.module';

// Components
import { LoginComponent } from './login/login.component';
import { MenuppalComponent } from './menuppal/menuppal.component';

// Shared Components

@NgModule({
  declarations: [
    LoginComponent,
    MenuppalComponent
  ],
  imports: [
    CommonModule,
    CoreModule,
    DirectivesModule,
    MainRoutingModule,
    // Angular Material
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatTooltipModule,
    ReactiveFormsModule
  ],
  providers: [
  ]
})
export class MainModule { }
