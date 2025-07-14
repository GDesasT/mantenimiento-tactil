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
  // 🆕 RUTAS DE REFACCIONES (usando tus componentes existentes)
  {
    path: 'machines/:area/:machineId/parts',
    loadComponent: () =>
      import('./features/part-category-selector/part-category-selector').then(
        (m) => m.PartCategorySelectorComponent
      ),
  },
  {
    path: 'machines/:area/:machineId/parts/:category',
    loadComponent: () =>
      import('./features/part-list/part-list').then((m) => m.PartListComponent),
  },
  {
    path: 'machines/:area/:machineId/parts/:category/add',
    loadComponent: () =>
      import('./features/add-part/add-part').then((m) => m.AddPartComponent),
  },
  {
    path: 'machines/:area/:machineId/parts/:category/:partId/edit',
    loadComponent: () =>
      import('./features/edit-part/edit-part').then((m) => m.EditPartComponent),
  },
  // 🆕 RUTA DE BÚSQUEDA GLOBAL
  {
    path: 'search',
    loadComponent: () =>
      import('./features/global-search/global-search').then(
        (m) => m.GlobalSearchComponent
      ),
  },
  // 🆕 RUTA DE IMPORTACIÓN EXCEL
  {
    path: 'excel-import',
    loadComponent: () =>
      import('./features/excel-import/excel-import').then(
        (m) => m.ExcelImportComponent
      ),
  },
  { path: '**', redirectTo: '' },
];
