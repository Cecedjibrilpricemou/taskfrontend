import { Routes } from '@angular/router';
import { adminGuard } from './core/guards/admin.guard';
import { standardGuard } from './core/guards/standard.guard';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/login/login').then((m) => m.Login),
  },
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () => import('./layout/shell/shell').then((m) => m.Shell),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'tableau-de-bord' },
      {
        path: 'utilisateurs',
        loadComponent: () => import('./pages/admin/utilisateurs/utilisateurs').then((m) => m.Utilisateurs),
      },
      {
        path: 'taches',
        loadComponent: () => import('./pages/admin/taches/taches').then((m) => m.Taches),
      },
      {
        path: 'tableau-de-bord',
        loadComponent: () =>
          import('./pages/admin/tableau-de-bord/tableau-de-bord').then((m) => m.TableauDeBord),
      },
    ],
  },
  {
    path: 'app',
    canActivate: [standardGuard],
    loadComponent: () => import('./layout/shell/shell').then((m) => m.Shell),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'mes-taches' },
      {
        path: 'mes-taches',
        loadComponent: () => import('./pages/app/mes-taches/mes-taches').then((m) => m.MesTaches),
      },
    ],
  },
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: '**', redirectTo: 'login' },
];
