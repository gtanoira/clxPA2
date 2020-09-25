import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';

// Services
import { AuthGuardService } from 'src/app/core/auth-guard.service';

// Importar componentes
import { CitiVentasComponent } from '../administracion/citi-ventas/citi-ventas.component';
import { SubdiariosComponent } from '../administracion/subdiarios/subdiarios.component';

const appRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'pgmCitiVentas',
        component: CitiVentasComponent,
        canActivate: [AuthGuardService],
        data: {
          idProgram:   'pgmCitiVentas',
          nameProgram: 'Citi Ventas'
        }
      },
      {
        path: 'pgmSubdiarioCompras',
        component: SubdiariosComponent,
        canActivate: [AuthGuardService],
        data: {
          idProgram:   'pgmSubdiarioCompras',
          nameProgram: 'Subdiario de Compras'
        }
      },
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
export class AdministracionRoutingModule {}
