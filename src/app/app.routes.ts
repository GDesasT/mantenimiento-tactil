import { Routes } from '@angular/router';
import { HomeComponent } from './home/home';
import { CorteComponent } from './corte/corte';
import { CosturaComponent } from './costura/costura';
import { RefaccionesComponent } from './refacciones/refacciones';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'corte', component: CorteComponent },
  { path: 'costura', component: CosturaComponent },
  { path: 'tipos/:funcion/:modelo', component: RefaccionesComponent },
  {
    path: 'refacciones/:funcion/:modelo/:tipo',
    component: RefaccionesComponent,
  }, // ← Agregar esta línea
  { path: 'tabla/:funcion/:modelo/:tipo', component: RefaccionesComponent },
  { path: '**', redirectTo: '/home' },
];
