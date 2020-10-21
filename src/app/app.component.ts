/*
  Este componente es el principal del sistema y muestra la página ppal del portal y el
  esquema de menúes
*/
import { Component, ElementRef, AfterViewInit, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { MatIconRegistry } from '@angular/material/icon';
import { Subscription } from 'rxjs';

// Services
import { ErrorMessageService } from './core/error-message.service';
import { AuthenticationService } from './core/authentication.service';

// Environment
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterViewInit, OnDestroy {

  // Error Line variables
  formErrorMessage = '';
  errorLineClasses = '';

  // Toolbar variables
  toolbarUser   = '';
  toolbarSapGw  = '';
  toolbarLogin  = '';
  toolbarPortal = '';
  toolbarPortalAdmin = '';

  // Program Title render in screen
  currentProgramTitle = 'Home';

  // Suscribers de Observables
  public errorLine: Subscription;   // Error line
  public currProgram: Subscription; // Program Title en el header
  public currUser: Subscription;    // Nombre de usuario en el header

  constructor(
    public authenticationService: AuthenticationService,
    private domSanitizer: DomSanitizer,
    public  errorMessageService: ErrorMessageService,
    private elementRef: ElementRef,
    private matIconRegistry: MatIconRegistry
  ) {

    // Definir iconos
    // Close
    this.matIconRegistry.addSvgIcon(
      'close',
      this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/images/close.svg')
    );
    // Cotizacion Promedio
    this.matIconRegistry.addSvgIcon(
      'cotizacion_promedio',
      this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/images/cotizacion_promedio.svg')
    );
    // Cross with a circle
    this.matIconRegistry.addSvgIcon(
      'cross_circle',
      this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/images/cross-circle.svg')
    );
    // Currency Calcultator
    this.matIconRegistry.addSvgIcon(
      'currency_calculator',
      this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/images/currency_calculator.svg')
    );
    // Currency Rates
    this.matIconRegistry.addSvgIcon(
      'currency_rates',
      this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/images/currency_rates.svg')
    );
    // Daily Currencies
    this.matIconRegistry.addSvgIcon(
      'daily_currencies',
      this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/images/daily_currencies.svg')
    );
    // Delete basket
    this.matIconRegistry.addSvgIcon(
      'delete_basket',
      this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/images/delete_basket.svg')
    );
    // Done with a circle
    this.matIconRegistry.addSvgIcon(
      'done_circle',
      this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/images/done-circle.svg')
    );
    // Download Files
    this.matIconRegistry.addSvgIcon(
      'download-file',
      this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/images/download-file.svg')
    );
    // Download File Cloud
    this.matIconRegistry.addSvgIcon(
      'download-file-cloud',
      this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/images/download-file-cloud.svg')
    );
    // EnvironmentInfo
    this.matIconRegistry.addSvgIcon(
      'env_info',
      this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/images/information.svg')
    );
    // Excel
    this.matIconRegistry.addSvgIcon(
      'excel',
      this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/images/excel.svg')
    );
    // From To
    this.matIconRegistry.addSvgIcon(
      'fromTo',
      this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/images/from_to.svg')
    );
    // Home
    this.matIconRegistry.addSvgIcon(
      'home_main',
      this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/images/home_main.svg')
    );
    // Info in a circle
    this.matIconRegistry.addSvgIcon(
      'info_circle',
      this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/images/info-circle.svg')
    );
    // Logout
    this.matIconRegistry.addSvgIcon(
      'logout',
      this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/images/logout.svg')
    );
    // Lost items
    this.matIconRegistry.addSvgIcon(
      'lost_items',
      this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/images/lost-items.svg')
    );
    // Recycle
    this.matIconRegistry.addSvgIcon(
      'recycle',
      this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/images/recycle.svg')
    );
    // Save
    this.matIconRegistry.addSvgIcon(
      'save',
      this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/images/save.svg')
    );
    // Spinner
    this.matIconRegistry.addSvgIcon(
      'spinner',
      this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/images/spinner01.svg')
    );
    // User
    this.matIconRegistry.addSvgIcon(
      'user_toolbar',
      this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/images/avatar.svg')
    );
    // Warning
    this.matIconRegistry.addSvgIcon(
      'warning',
      this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/images/warning.svg')
    );
    // Subscribir a los errores del módulo, para que sean mostrados en la pantalla
    this.errorLine = this.errorMessageService.formCurrentMessage.subscribe(
      message => {
        if (message === null || message.trim() === '') {

          // Cerrar la linea de error
          this.errorLineClasses = '';

        } else {

          // Chequear si la linea de error esta abierta o cerrada
          if (this.formErrorMessage !== null || this.formErrorMessage.trim() !== '') {

            // Cerrar la linea de error
            this.errorLineClasses = '';
            setTimeout(() => {
              this.formErrorMessage = message;
              this.errorLineClasses = 'fm__open';
            }, 550);
          } else {
            // Abrir la linea de error con el nuevo mensaje
            this.formErrorMessage = message;
            this.errorLineClasses = 'fm__open';
            console.log('*** meSSage:', this.formErrorMessage);
          }
        }
      }
    );

    // Subscribe to the currentProgramTitle, to show program's title on the screen
    this.currProgram = this.errorMessageService.currentProgramTitle.subscribe(
      message => this.currentProgramTitle = message
    );

    // Subscibir el Toolbar user
    this.currUser = this.authenticationService.currentUser.subscribe(
      user => this.toolbarUser = (user) ? user.fullName : ''
    );

  }

  ngOnInit() {
    // Borrar posible mensaje de error
    this.errorMessageService.changeErrorMessage(null);

    // Toolbar
    this.toolbarSapGw  = environment.envData.sapGwServer;
    this.toolbarLogin  = environment.envData.loginServer;
    this.toolbarPortal = environment.envData.portal;
    this.toolbarPortalAdmin = environment.envData.portalAdminServer;
  }

  ngAfterViewInit() {
    if (environment.envData.sapGwServer.search('clxsapjgw01') >= 0) {
      // SAP Produccion
      this.elementRef.nativeElement.ownerDocument.body.style.backgroundColor = '#add8e699';  // azul
    } else if (environment.envData.sapGwServer.search('clxsapjgw02') >= 0) {
      // SAP QA
      this.elementRef.nativeElement.ownerDocument.body.style.backgroundColor = '#0eda0e3b';  // verde
    } else {
      // Sin environment definido todavía
      this.elementRef.nativeElement.ownerDocument.body.style.backgroundColor = '#e3e3c8';  // gris
    }
  }

  // Destruir las suscripciones
  ngOnDestroy() {
    this.errorLine.unsubscribe();
    this.currProgram.unsubscribe();
    this.currUser.unsubscribe();
  }
}
