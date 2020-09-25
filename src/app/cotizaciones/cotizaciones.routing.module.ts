import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';

// Services
import { AuthGuardService } from 'src/app/core/auth-guard.service';

// Importar componentes
import { CotizacionesComponent } from './cotizaciones.component';

const appRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'pgmCotizaciones',
        component: CotizacionesComponent,
        canActivate: [AuthGuardService],
        data: {
          idProgram:   'pgmCotizaciones',
          nameProgram: 'Cotizaciones'
        }
      }
    ]
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(appRoutes)
  ],
  exports: [
    RouterModule
  ]
})
export class CotizacionesRoutingModule {}
