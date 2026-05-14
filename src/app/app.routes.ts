import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/home/home').then((m) => m.HomeComponent),
    title: 'Inicio',
  },
  // Rutas de refacciones por área (directas)
  {
    path: 'areas/:area/parts',
    loadComponent: () =>
      import('./features/part-category-selector/part-category-selector').then(
        (m) => m.PartCategorySelectorComponent
      ),
    title: 'Seleccionar Categoría',
  },
  {
    path: 'areas/:area/parts/:category',
    loadComponent: () =>
      import('./features/part-list/part-list').then((m) => m.PartListComponent),
    title: 'Listado de Refacciones',
  },
  {
    path: 'areas/:area/parts/:category/add',
    loadComponent: () =>
      import('./features/add-part/add-part').then((m) => m.AddPartComponent),
    title: 'Agregar Refacción',
  },
  {
    path: 'areas/:area/parts/:category/:partId/edit',
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
    path: 'fasteners',
    loadComponent: () =>
      import('./features/tornillos/tornillos').then(
        (m) => m.TornillosComponent
      ),
    title: 'Tornillos',
  },
  {
    path: 'chemicals',
    loadComponent: () =>
      import('./features/quimicos/quimicos').then(
        (m) => m.QuimicosComponent
      ),
    title: 'Químicos',
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
  {
    path: 'manuales',
    loadComponent: () =>
      import('./features/manuales/manuales').then((m) => m.ManualesComponent),
    title: 'Manuales',
  },
  {
    path: 'admin-manuales',
    loadComponent: () =>
      import('./features/admin-manuales/admin-manuales').then(
        (m) => m.AdminManualesComponent
      ),
    title: 'Administrar Manuales',
  },
  // Redirección al home para rutas no encontradas
  { path: '**', redirectTo: '' },
];
