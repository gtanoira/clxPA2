import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';

// Services
import { AuthGuardService } from 'src/app/core/auth-guard.service';

// Importar componentes
import { MonitorPagoComponent } from './monitor-pago.component';

const appRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'pgmMonitorPago',
        component: MonitorPagoComponent,
        canActivate: [AuthGuardService],
        data: {
          idProgram:   'pgmMonitorPago',
          nameProgram: 'Monitor de Pago'
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
export class MonitorPagoRoutingModule {}
