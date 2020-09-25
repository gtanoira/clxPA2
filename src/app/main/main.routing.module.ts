import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';

// Services
import { AuthGuardService } from 'src/app/core/auth-guard.service';

// Importar componentes
import { LoginComponent } from 'src/app/main/login/login.component';
import { MenuppalComponent } from 'src/app/main/menuppal/menuppal.component';

const appRoutes: Routes = [
  {
    path: 'main',
    children: [
      {
        path: 'menu',
        component: MenuppalComponent,
        canActivate: [AuthGuardService],
        data: {
          idProgram:   'homePage',
          nameProgram: 'Home Page'
        }
      }
    ]
  },
  {
    path: 'login',
    component: LoginComponent
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
export class MainRoutingModule {}
