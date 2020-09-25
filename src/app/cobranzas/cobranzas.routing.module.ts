import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';

// Services
import { AuthGuardService } from 'src/app/core/auth-guard.service';

// Importar componentes
import { ListadoRecibosComponent } from '../cobranzas/listado_recibos/listado_recibos.component';
import { OpenItemsComponent } from '../cobranzas/open_items/open_items.component';

const appRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'pgmListadoRecibos',
        component: ListadoRecibosComponent,
        canActivate: [AuthGuardService],
        data: {
          idProgram:   'pgmListadoRecibos',
          nameProgram: 'Listado detallado de recibos'
        }
      },
      {
        path: 'pgmOpenItems',
        component: OpenItemsComponent,
        canActivate: [AuthGuardService],
        data: {
          idProgram:   'pgmOpenItems',
          nameProgram: 'Partidas Abiertas'
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
export class CobranzasRoutingModule {}
