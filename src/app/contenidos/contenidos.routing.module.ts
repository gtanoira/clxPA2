import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';

// Services
import { AuthGuardService } from 'src/app/core/auth-guard.service';

// Importar componentes
import { VodActualComponent } from '../contenidos/vod-actual/vod-actual.component';
import { VodMaestroComponent } from '../contenidos/vod-maestro/vod-maestro.component';

const appRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'pgmPlnActualVod',
        component: VodActualComponent,
        canActivate: [AuthGuardService],
        data: {
          idProgram:   'pgmPlnActualVod',
          nameProgram: 'Upload VOD'
        }
      },
      {
        path: 'pgmVodMaestroTitulos',
        component: VodMaestroComponent,
        canActivate: [AuthGuardService],
        data: {
          idProgram:   'pgmVodMaestroTitulos',
          nameProgram: 'VOD Maestro Títulos'
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
export class ContenidosRoutingModule {}
