import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/home/home').then((m) => m.HomeComponent),
    title: 'Inicio',
  },
  {
    path: 'machines/:area',
    loadComponent: () =>
      import('./features/machine-list/machine-list').then(
        (m) => m.MachineListComponent
      ),
    title: 'Gestión de Máquinas',
  },
  {
    path: 'machines/:area/add',
    loadComponent: () =>
      import('./features/add-machine/add-machine').then(
        (m) => m.AddMachineComponent
      ),
    title: 'Agregar Máquina',
  },
  {
    path: 'machines/:area/:machineId/edit',
    loadComponent: () =>
      import('./features/edit-machine/edit-machine').then(
        (m) => m.EditMachineComponent
      ),
    title: 'Editar Máquina',
  },
  // Rutas de refacciones
  {
    path: 'machines/:area/:machineId/parts',
    loadComponent: () =>
      import('./features/part-category-selector/part-category-selector').then(
        (m) => m.PartCategorySelectorComponent
      ),
    title: 'Seleccionar Categoría',
  },
  {
    path: 'machines/:area/:machineId/parts/:category',
    loadComponent: () =>
      import('./features/part-list/part-list').then((m) => m.PartListComponent),
    title: 'Listado de Refacciones',
  },
  {
    path: 'machines/:area/:machineId/parts/:category/add',
    loadComponent: () =>
      import('./features/add-part/add-part').then((m) => m.AddPartComponent),
    title: 'Agregar Refacción',
  },
  {
    path: 'machines/:area/:machineId/parts/:category/:partId/edit',
    loadComponent: () =>
      import('./features/add-part/add-part').then((m) => m.AddPartComponent),
    title: 'Editar Refacción',
  },
  // Rutas adicionales
  {
    path: 'search',
    loadComponent: () =>
      import('./features/global-search/global-search').then(
        (m) => m.GlobalSearchComponent
      ),
    title: 'Búsqueda Global',
  },
  {
    path: 'tools',
    loadComponent: () =>
      import('./features/herramientas/herramientas').then(
        (m) => m.HerramientasComponent
      ),
    title: 'Herramientas',
  },
  {
    path: 'excel-import',
    loadComponent: () =>
      import('./features/excel-import/excel-import').then(
        (m) => m.ExcelImportComponent
      ),
    title: 'Importar desde Excel',
  },
  {
    path: 'peticiones-admin',
    loadComponent: () =>
      import('./features/peticiones-admin/peticiones-admin').then(
        (m) => m.PeticionesAdmin
      ),
    title: 'Peticiones de Refacciones',
  },
  // Redirección al home para rutas no encontradas
  { path: '**', redirectTo: '' },
];
