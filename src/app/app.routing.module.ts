import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';

// Lazy Loading Setup (por módulos)
const appRoutes: Routes = [

  // Administación de Ventas
  {
    path: 'adm-ventas',
    loadChildren: () => import('./adm-ventas/adm-ventas.module').then(m => m.AdmVentasModule)
  },
  // Administación
  {
    path: 'administracion',
    loadChildren: () => import('./administracion/administracion.module').then(m => m.AdministracionModule)
  },
  // Cobranzas
  {
    path: 'cobranzas',
    loadChildren: () => import('./cobranzas/cobranzas.module').then(m => m.CobranzasModule)
  },
  // Contenidos
  {
    path: 'contenidos',
    loadChildren: () => import('./contenidos/contenidos.module').then(m => m.ContenidosModule)
  },
  // Cotizaciones
  {
    path: 'cotizaciones',
    loadChildren: () => import('./cotizaciones/cotizaciones.module').then(m => m.CotizacionesModule)
  },
  // HotGo
  {
    path: 'hotgo',
    loadChildren: () => import('./hotgo/hotgo.module').then(m => m.HotgoModule)
  },

  // Monitor de Pagos
  {
    path: 'monitorpago',
    loadChildren: () => import('./monitor-pago/monitor-pago.module').then(m => m.MonitorPagoModule)
  },

  // Main Module Paths
  { path: '', redirectTo: '/main/menu', pathMatch: 'full' },
  // { path: 'main/pgmCotizaciones', redirectTo: '/main/pgmCotizaciones' },

  // otherwise redirect to Lgin
  { path: '**', redirectTo: '/login' }
];

@NgModule({
  imports: [
    RouterModule.forRoot(appRoutes)
  ],
  exports: [
    RouterModule
  ]
})
export class AppRoutingModule {}
