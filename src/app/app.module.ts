import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
// Angular Material
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';

// Modules
import { AppRoutingModule } from './app.routing.module';
import { MainModule } from 'src/app/main/main.module';

// Componentes
import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    // Angular
    MatIconModule,
    MatMenuModule,
    MatToolbarModule,
    MatTooltipModule,
    // Modules
    AppRoutingModule,
    MainModule
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
