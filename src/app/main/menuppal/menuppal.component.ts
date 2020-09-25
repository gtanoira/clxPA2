import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';

// Servicios
import { AuthorizationService } from 'src/app/core/authorization.service';
import { ErrorMessageService } from 'src/app/core/error-message.service';

// Librerias externas
import * as Isotope from 'isotope-layout';

@Component({
  selector: 'app-main',
  templateUrl: './menuppal.component.html',
  styleUrls: ['./menuppal.component.css']
})
export class MenuppalComponent implements OnInit, AfterViewInit {

  // Contenido de las opciones de Menú
  /*
  bricks = [
    {
      title: 'Cotizaciones SAP',
      alias: 'AdCs',
      group: 'Administración',
      id: 'pgmCotizaciones',
      color: 'blue'
    },
    { ... }
  ]
  */
  bricks = [];

  // Filtro para el menu basado en los Grupos
  mnuGroups = [
    {
      name: 'all',
      color: 'black'
    }
  ];

  // Opciones para configurar el Menu via IsotopeOptions
  @ViewChild('grid', { static: true }) grid: ElementRef;
  private isotopeOptions: Isotope.IsotopeOptions = {
    itemSelector: '.grid-item',
    layoutMode: 'fitRows',
    stagger: 30,
    transitionDuration: '0.8s'
  };
  // Instanciar la clase Isotope
  public isotope: Isotope;

  constructor (
    private authorizationService: AuthorizationService,
    private errorMessageService: ErrorMessageService,
    private router: Router
  ) {}

  ngOnInit() {

    // Armar el menu para el usuario
    this.authorizationService.createUsermenu()
      .subscribe(
        data => {
          this.bricks = data;

          // Armar el array de Grupos
          this.bricks.forEach(mnuButton => {
            // Determinar si el grupo ya existe
            let groupExists = false;
            for (const group of this.mnuGroups) {
              if (group.name === mnuButton.group) {
                groupExists = true;
                break;
              }
            }
            if (groupExists === false) {
              this.mnuGroups.push({
                name: mnuButton.group,
                color: mnuButton.color
              });
            }
          });
        },
        err => {
          this.errorMessageService.changeErrorMessage(err);
        }
      );
  }

  ngAfterViewInit() {
    // Definir el componente Isotope
    setTimeout(() => {
      this.isotope = new Isotope(this.grid.nativeElement, this.isotopeOptions);
    }, 2000);

    // Borrar la linea de errores
    this.errorMessageService.changeErrorMessage('');
  }

  runProgram(pgmUrl: string) {
    this.router.navigate([`/${pgmUrl}`]);
  }

  // Filtrar los menúes por GrupoId
  onFilter(group) {

    this.isotope.arrange({
      // item element provided as argument
      filter: (group === 'all') ? '*' : `.${group}`
    });
  }
}
