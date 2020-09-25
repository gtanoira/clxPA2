import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
// Angular Material
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule, MatMenuModule } from '@angular/material';
import { MatTooltipModule } from '@angular/material/tooltip';

// Modules
import { AppRoutingModule } from './app.routing.module';
import { CoreModule } from '@angular/flex-layout';
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
    CoreModule,
    MainModule
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
