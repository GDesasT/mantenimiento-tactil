# 📋 Especificaciones Técnicas - Sistema de Gestión de Refacciones

**Versión:** 1.0.6  
**Autor:** DTSoftware  
**Descripción:** Sistema de gestión de refacciones y mantenimiento con interfaz táctil optimizada para dispositivos industriales.

---

## 🎯 Resumen Ejecutivo

Sistema de escritorio multiplataforma desarrollado con **Angular 20** y **Electron 37**, diseñado para gestionar máquinas, piezas/refacciones y mantenimiento en entornos industriales con pantalla táctil. Incluye sincronización automática de actualizaciones y base de datos local con IndexedDB.

---

## 🏗️ Arquitectura

### Estructura de Capas

```
┌─────────────────────────────────────────┐
│      UI Layer (Angular Components)      │
├─────────────────────────────────────────┤
│    Services Layer (Business Logic)      │
├─────────────────────────────────────────┤
│      Data Layer (IndexedDB + Dexie)     │
├─────────────────────────────────────────┤
│   Electron Main Process (IPC Bridge)    │
├─────────────────────────────────────────┤
│   Auto-Updater (electron-updater)       │
└─────────────────────────────────────────┘
```

### Patrón de Diseño

- **Standalone Components**: Componentes Angular independientes sin módulos
- **Reactive Architecture**: Uso extensivo de RxJS Observables
- **Service-First**: Lógica de negocio centralizada en servicios
- **Type Safety**: TypeScript con modo `strict` activado
- **IPC Communication**: Puente entre renderer y main process vía Electron IPC

---

## 🛠️ Stack Tecnológico

### Frontend Framework

| Paquete | Versión | Propósito |
|---------|---------|----------|
| `@angular/core` | ^20.1.0 | Framework core de Angular |
| `@angular/cli` | ^20.1.0 | CLI para desarrollo y build |
| `@angular/compiler` | ^20.1.0 | Compilador de plantillas |
| `@angular/router` | ^20.1.0 | Enrutamiento de aplicación |
| `@angular/forms` | ^20.1.0 | Formularios reactivos |
| `@angular/platform-browser` | ^20.1.0 | DOM rendering |
| `@angular/animations` | ^20.1.0 | Animaciones CSS |
| `@angular/material` | ^20.1.0 | Componentes Material Design |
| `@angular/cdk` | ^20.1.0 | Component Dev Kit |

### Backend/Desktop Framework

| Paquete | Versión | Propósito |
|---------|---------|----------|
| `electron` | ^37.2.1 | Framework de escritorio |
| `electron-builder` | ^26.0.12 | Empaquetado y generación de instaladores |
| `electron-updater` | ^6.6.2 | Auto-actualización de aplicación |
| `electron-reload` | ^2.0.0-alpha.1 | Hot reload en desarrollo |

### Base de Datos

| Paquete | Versión | Propósito |
|---------|---------|----------|
| `dexie` | ^4.0.11 | IndexedDB wrapper (BD local) |
| `@types/dexie` | ^1.3.35 | Tipos TypeScript para Dexie |

### Utilidades

| Paquete | Versión | Propósito |
|---------|---------|----------|
| `rxjs` | ~7.8.0 | Programación reactiva |
| `tslib` | ^2.3.0 | Utilidades de TypeScript |
| `xlsx` | ^0.18.5 | Lectura/escritura Excel |
| `@types/xlsx` | ^0.0.36 | Tipos TypeScript para XLSX |
| `zone.js` | ~0.15.0 | Angular Zone png s
ara detección de cambios |

### Estilos

| Paquete | Versión | Propósito |
|---------|---------|----------|
| `tailwindcss` | ^3.4.14 | Framework CSS utilitario |
| `postcss` | ^8.4.31 | Procesamiento de CSS |
| `autoprefixer` | ^10.4.16 | Autoprefijos CSS para compatibilidad |

### Desarrollo

| Paquete | Versión | Propósito |
|---------|---------|----------|
| `typescript` | ~5.8.2 | Lenguaje de tipado |
| `jasmine-core` | ~5.8.0 | Framework de testing |
| `karma` | ~6.4.0 | Test runner |
| `karma-jasmine` | ~5.1.0 | Plugin Jasmine para Karma |
| `karma-chrome-launcher` | ~3.2.0 | Launcher Chrome para tests |
| `karma-coverage` | ~2.2.0 | Coverage reports |
| `concurrently` | ^9.2.0 | Ejecutar múltiples scripts |
| `cross-env` | ^7.0.3 | Variables de entorno multiplataforma |
| `wait-on` | ^8.0.3 | Esperar a que servidor esté listo |

---

## 🎨 Configuración de Compilación

### TypeScript (`tsconfig.json`)

```typescript
// Opciones Compilador
target: ES2022
module: preserve
strict: true
noImplicitOverride: true
noPropertyAccessFromIndexSignature: true
noImplicitReturns: true
noFallthroughCasesInSwitch: true
experimentalDecorators: true
```

### Tailwind CSS (`tailwind.config.js`)

- Sistema de diseño utilitario
- Optimización de bundle automática
- Responsive breakpoints incluidos
- Extensión de colores personalizada

### PostCSS (`postcss.config.js`)

- Autoprefijos automáticos
- Procesamiento de Tailwind CSS
- Soporte para navegadores modernos

---

## 📦 Estructura de Carpetas

```
mantenimiento-tactil/
├── src/
│   ├── index.html              # Punto de entrada HTML
│   ├── main.ts                 # Bootstrap de Angular
│   ├── styles.scss             # Estilos globales
│   ├── app/
│   │   ├── app.ts              # Componente raíz
│   │   ├── app.routes.ts       # Definición de rutas
│   │   ├── app.config.ts       # Configuración de Angular
│   │   ├── core/               # Servicios y modelos
│   │   │   ├── models/         # Interfaces TypeScript
│   │   │   │   ├── employee.model.ts
│   │   │   │   ├── machine.model.ts
│   │   │   │   ├── part.model.ts
│   │   │   │   └── petition.model.ts
│   │   │   └── services/       # Lógica de negocio
│   │   │       ├── database.ts
│   │   │       ├── employee.ts
│   │   │       ├── machine.ts
│   │   │       ├── part.ts
│   │   │       └── petition.ts
│   │   ├── features/           # Componentes por features
│   │   │   ├── home/
│   │   │   ├── machine-list/
│   │   │   ├── add-machine/
│   │   │   ├── edit-machine/
│   │   │   ├── part-list/
│   │   │   ├── add-part/
│   │   │   ├── edit-part/
│   │   │   ├── part-category-selector/
│   │   │   ├── global-search/
│   │   │   ├── excel-import/
│   │   │   └── peticiones-admin/
│   │   └── shared/             # Componentes reutilizables
│   │       ├── components/
│   │       └── shared-module.ts
│   └── assets/                 # Recursos estáticos
├── main.js                     # Electron main process
├── preload.js                  # Preload script (IPC)
├── public/                     # Archivos públicos
│   ├── icon.ico               # Icono Windows
│   ├── icon.png               # Icono Linux
│   └── icon.icns              # Icono macOS
├── build/
│   └── installer.nsh          # Configuración NSIS Windows
├── angular.json               # Configuración Angular CLI
├── tsconfig.json              # Configuración TypeScript
├── package.json               # Dependencias y scripts
└── tailwind.config.js         # Configuración Tailwind
```

---

## 🔧 Componentes Principales

### Modelos de Datos

#### **Machine** (`machine.model.ts`)
```typescript
interface Machine {
  id?: number;
  nombre: string;
  area: 'corte' | 'costura' | 'consumible';
  descripcion?: string;
  ubicacion?: string;
  [key: string]: any;
}
```

#### **Part** (`part.model.ts`)
```typescript
interface Part {
  id?: number;
  nombre: string;
  codigo?: string;
  categoria: 'mecanica' | 'electronica' | 'consumible';
  descripcion?: string;
  precio?: number;
  imagen?: string;
  [key: string]: any;
}
```

#### **Employee** (`employee.model.ts`)
```typescript
interface Employee {
  id?: number;
  nombre: string;
  puesto: string;
  telefono?: string;
  email?: string;
  [key: string]: any;
}
```

#### **Petition** (`petition.model.ts`)
```typescript
interface Petition {
  id?: number;
  maquina: string;
  descripcion: string;
  estado: 'pendiente' | 'en_proceso' | 'completada';
  fecha: Date;
  [key: string]: any;
}
```

### Servicios Principales

#### **DatabaseService** (`database.ts`)
- Gestión de IndexedDB con Dexie
- Inicialización de tablas
- Operaciones CRUD genéricas

#### **MachineService** (`machine.ts`)
- CRUD de máquinas
- Filtrado por área (`'corte' | 'costura' | 'consumible'`)
- Validación de nombres únicos
- Búsqueda y estadísticas

#### **PartService** (`part.ts`)
- CRUD de refacciones/piezas
- Filtrado por categoría
- Procesamiento de imágenes
- Exportación/importación Excel

#### **EmployeeService** (`employee.ts`)
- Gestión de empleados
- Asignación de tareas

#### **PetitionService** (`petition.ts`)
- Gestión de solicitudes de mantenimiento
- Seguimiento de estado

### Componentes UI

#### **HomeComponent** (`home.ts`)
- Pantalla principal
- Dashboard de estadísticas
- Botón de verificación de actualizaciones
- Navegación a módulos

#### **MachineListComponent** (`machine-list.ts`)
- Listado de máquinas por área
- Filtrado y búsqueda
- Eliminación y edición
- Soporte para 3 áreas industriales

#### **PartListComponent** (`part-list.ts`)
- Grid infinito de refacciones
- 6-8 items por página (responsive)
- Imágenes con zoom hover
- Botón flotante scroll-to-top

#### **AddMachineComponent** (`add-machine.ts`)
- Formulario reactivo para máquinas
- Validación en tiempo real
- Selección de área

#### **ExcelImportComponent** (`excel-import.ts`)
- Importación masiva de datos
- Lectura de archivos XLSX
- Validación de datos

---

## 🌐 Rutas y Navegación

```typescript
// app.routes.ts
const routes = [
  { path: '', component: HomeComponent },
  { path: 'machines/:area', component: MachineListComponent },
  { path: 'add-machine/:area', component: AddMachineComponent },
  { path: 'edit-machine/:area/:id', component: EditMachineComponent },
  { path: 'parts/:category', component: PartListComponent },
  { path: 'add-part', component: AddPartComponent },
  { path: 'edit-part/:id', component: EditPartComponent },
  { path: 'part-category-selector', component: PartCategorySelectorComponent },
  { path: 'search', component: GlobalSearchComponent },
  { path: 'excel-import', component: ExcelImportComponent },
  { path: 'peticiones', component: PeticionesAdminComponent },
];
```

---

## 🔌 Comunicación Electron-Renderer

### IPC Channels

#### Check for Updates
```javascript
// Main Process (main.js)
ipcMain.handle('check-for-updates', () => {
  checkForUpdates();
  return { success: true };
});

// Renderer Process (home.ts)
window.electron.ipcRenderer.invoke('check-for-updates')
  .then(() => console.log('Update check initiated'))
  .catch(error => console.error(error));
```

### Preload Script (`preload.js`)
```javascript
contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    invoke: (channel, ...args) => {
      const validChannels = ['check-for-updates', 'get-app-version'];
      if (validChannels.includes(channel)) {
        return ipcRenderer.invoke(channel, ...args);
      }
    }
  }
});
```

---

## 🎬 Scripts NPM Disponibles

### Desarrollo
| Script | Propósito |
|--------|----------|
| `npm start` | Inicia Angular dev server (http://localhost:4200) |
| `npm run electron-dev` | Inicia dev server + Electron simultáneamente |
| `npm run watch` | Compilación en modo watch |

### Build/Distribución
| Script | Propósito |
|--------|----------|
| `npm run build` | Compilación producción (carpeta `dist/`) |
| `npm run dist-win` | Crea instalador Windows |
| `npm run dist-mac` | Crea DMG macOS |
| `npm run dist-linux` | Crea AppImage y DEB Linux |
| `npm run dist-portable` | Exe portable Windows sin instalador |
| `npm run pack` | Empaquetado sin firma |

### Testing
| Script | Propósito |
|--------|----------|
| `npm test` | Ejecuta tests con Karma |

---

## 📊 Configuración de Construcción

### Electron Builder (`package.json` - `build` section)

**App ID:** `com.empresa.mantenimiento-tactil`  
**Product Name:** Sistema de Gestion de Refacciones

#### Targets Windows
- **NSIS**: Instalador con opciones de desinstalación
- **Portable**: Ejecutable standalone sin instalación
- **Arquitecturas:** x64, ia32

#### Configuración NSIS
```nsis
oneClick: false
allowToChangeInstallationDirectory: true
createDesktopShortcut: true
createStartMenuShortcut: true
```

#### Publicación
- **Provider:** GitHub
- **Repo:** GDesasT/mantenimiento-tactil
- **Auto-update:** Habilitado

---

## 🗄️ Base de Datos

### IndexedDB con Dexie

**Nombre:** `MantenimientoTactilDB`  
**Versión:** 1

#### Tablas
```typescript
{
  empleados: '++id, nombre',
  maquinas: '++id, nombre, area',
  refacciones: '++id, nombre, categoria',
  peticiones: '++id, maquina, estado',
  historial: '++id, fecha'
}
```

#### Ventajas
- ✅ Almacenamiento local sin servidor
- ✅ Sincronización offline-first
- ✅ Indexación automática
- ✅ Consultas complejas
- ✅ Escalable a múltiples MB

---

## 🎨 Diseño UI/UX

### Framework: Tailwind CSS

#### Características Implementadas
- **Grid System:** Responsive 6-8 items por página
- **Image Optimization:** 
  - Altura: 150px
  - Modo: `object-fit: contain`
  - Zoom hover: `scale(1.15)`
- **Scroll infinito:** Todos los items sin paginación
- **Floating Buttons:** Scroll-to-top con gradiente
- **Touch Optimized:** Tamaño de botones para pantallas táctiles

#### Color Scheme
```scss
Primary: #2563eb (Blue)
Secondary: #7c3aed (Purple)
Success: #10b981 (Green)
Warning: #f59e0b (Amber)
Error: #ef4444 (Red)
```

---

## 📱 Plataformas Soportadas

| Platform | Build | Status |
|----------|-------|--------|
| Windows (x64, ia32) | NSIS + Portable | ✅ Activo |
| macOS (Intel, Apple Silicon) | DMG | ✅ Activo |
| Linux (x64) | AppImage + DEB | ✅ Activo |

---

## 🔄 Sistema de Auto-Actualizaciones

### electron-updater Configuration

```javascript
provider: 'github'
owner: 'GDesasT'
repo: 'mantenimiento-tactil'
private: false

// Auto-download: false
// Auto-install: on app quit
```

### Flujo de Actualización
1. Usuario click en "Verificar Actualizaciones"
2. IPC call a main process
3. `autoUpdater.checkForUpdatesAndNotify()`
4. Descarga en background
5. Instalación al cerrar app

---

## 🚀 Requisitos del Sistema

### Desarrollo
- **Node.js:** v18+ (recomendado v20+)
- **npm:** v9+
- **OS:** macOS 12+, Windows 10+, Linux Ubuntu 20.04+

### Producción (Runtime)
- **Windows:** Windows 10 Build 19041+ (x64, ia32)
- **macOS:** macOS 10.13+ (Intel, M1/M2/M3 nativo)
- **Linux:** Ubuntu 16.04+, Fedora 24+, Debian 9+

---

## 📝 Versión del Proyecto

**Actual:** 1.0.6  
**Patrón:** Semantic Versioning (MAJOR.MINOR.PATCH)

---

## 👨‍💻 Convenciones de Código

### TypeScript/Angular
- ✅ Modo `strict: true` en tsconfig
- ✅ Componentes standalone (sin módulos)
- ✅ Formularios reactivos con Validators
- ✅ Observables con typed streams
- ✅ Naming: camelCase variables, PascalCase clases

### Archivos
```
component-name.ts          // Lógica
component-name.html        // Template
component-name.scss        // Estilos
component-name.spec.ts     // Tests
```

---

## 🔐 Seguridad

### Electron Security

**Context Isolation:** ✅ Habilitado
**Preload Script:** ✅ Implementado
**IPC Whitelist:** ✅ Validación de canales

Canales permitidos:
- `check-for-updates`
- `get-app-version`
- `update-status`
- `download-progress`

---

## 📚 Referencias

- **Angular Documentation:** https://angular.dev
- **Electron Documentation:** https://www.electronjs.org/docs
- **Tailwind CSS:** https://tailwindcss.com
- **Dexie.js:** https://dexie.org
- **electron-updater:** https://www.electron.build/auto-update

---

**Última actualización:** Diciembre 2025  
**Mantentores:** Gerardo Alcantar/Nestor Cabrera
