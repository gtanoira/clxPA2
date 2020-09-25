import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';

// Services
import { AuthGuardService } from 'src/app/core/auth-guard.service';

// Importar componentes
import { HotgoComponent } from '../hotgo/hotgo.component';

const appRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'pgmHotGo',
        component: HotgoComponent,
        canActivate: [AuthGuardService],
        data: {
          idProgram:   'pgmHotGo',
          nameProgram: 'HotGo'
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
export class HotgoRoutingModule {}
