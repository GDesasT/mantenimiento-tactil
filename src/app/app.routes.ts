import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/home/home').then((m) => m.HomeComponent),
  },
  {
    path: 'machines/:area',
    loadComponent: () =>
      import('./features/machine-list/machine-list').then(
        (m) => m.MachineListComponent
      ),
  },
  {
    path: 'machines/:area/add',
    loadComponent: () =>
      import('./features/add-machine/add-machine').then(
        (m) => m.AddMachineComponent
      ),
  },
  { path: '**', redirectTo: '' },
];
