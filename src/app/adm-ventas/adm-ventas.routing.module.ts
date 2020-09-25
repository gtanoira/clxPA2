import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';

// Services
import { AuthGuardService } from 'src/app/core/auth-guard.service';

// Importar componentes
import { AggingComponent } from '../adm-ventas/agging/agging.component';
import { CostoRepresentadaPorCeBeComponent } from '../adm-ventas/costo_representada_por_cebe/costo_representada_por_cebe.component';

const appRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'pgmAging',
        component: AggingComponent,
        canActivate: [AuthGuardService],
        data: {
          idProgram:   'pgmAging',
          nameProgram: 'Agging - Plazo medio de cobro'
        },
      },
      {
        path: 'pgmCostoRepTelevisa',
        component: CostoRepresentadaPorCeBeComponent,
        canActivate: [AuthGuardService],
        data: {
          idProgram:   'pgmCostoRepTelevisa',
          nameProgram: 'Costo Representada para Televisa'
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
export class AdmVentasRoutingModule {}
