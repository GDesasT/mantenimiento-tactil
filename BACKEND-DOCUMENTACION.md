# Backend actual del proyecto (inventario tecnico)

## 1) Objetivo
Este documento concentra todo lo que hoy funciona como backend en este proyecto.
La meta es ayudarte a migrar a una API real reutilizando el front y tocando solo las capas necesarias.

Estado actual: el sistema no usa una API principal para catalogo/peticiones; usa persistencia local con Dexie + proceso Electron + un backend Express opcional para audio.

## 2) Arquitectura backend actual

### 2.1 Persistencia local (Dexie sobre IndexedDB)
- Archivo base: `src/app/core/services/database.ts`
- Motor: Dexie (`MaintenanceDB`)
- Ubicacion real de datos: IndexedDB del runtime (Chromium/Electron renderer)
- Consumo: servicios Angular en `src/app/core/services/*.ts`

### 2.2 Proceso principal Electron (backend local de escritorio)
- Archivo base: `main.js`
- Bridge seguro al renderer: `preload.js`
- Responsabilidad 1: manejo de PDFs en disco para manuales (guardar/abrir/borrar/migrar)
- Responsabilidad 2: check de auto updates con electron-updater
- Responsabilidad 3: menu nativo con accion de reinicio de base local

### 2.3 Backend HTTP local opcional (audio tour)
- Archivo: `backend-audio.js`
- Stack: Express + CORS + Axios
- Endpoint: `POST /api/text-to-speech` en puerto `3001`
- Uso actual: solo `HomeTourService` (`src/app/core/services/home-tour.service.ts`)

### 2.4 Servicios externos
- ElevenLabs API para TTS
- GitHub Releases feed para auto update de Electron

## 3) Mapa de archivos backend

### 3.1 Nucleo de datos
- `src/app/core/services/database.ts`: definicion de DB Dexie, versiones, hooks, stats y limpieza
- `src/app/core/models/*.ts`: contratos de datos (Machine, Part, Employee, Petition, Tool, Manual)
- `src/app/core/services/machine.ts`: CRUD de maquinas
- `src/app/core/services/part.ts`: CRUD y busqueda de refacciones
- `src/app/core/services/employee.ts`: alta/busqueda de empleados
- `src/app/core/services/petition.ts`: CRUD de peticiones y cambios de estatus
- `src/app/core/services/tool.ts`: CRUD de herramientas
- `src/app/core/services/fastener.ts`: CRUD de tornillos
- `src/app/core/services/chemical.ts`: CRUD de quimicos
- `src/app/core/services/manual.ts`: CRUD de manuales + integracion IPC para PDFs

### 3.2 Backend de escritorio (Electron)
- `main.js`: proceso principal, handlers IPC, updater
- `preload.js`: whitelist de canales IPC

### 3.3 Backend HTTP auxiliar
- `backend-audio.js`: servidor Express para TTS del tour
- `driver.js`: driver CLI de voz para pruebas locales

### 3.4 Pantallas que ingresan o modifican datos
- `src/app/features/excel-import/excel-import.ts`: importacion masiva desde Excel
- `src/app/features/add-machine/add-machine.ts`: alta de maquina
- `src/app/features/edit-machine/edit-machine.ts`: edicion de maquina
- `src/app/features/add-part/add-part.ts`: alta/edicion de refaccion
- `src/app/features/part-list/part-list.ts`: listado, edicion rapida, borrado, peticiones
- `src/app/features/global-search/global-search.ts`: busqueda global + peticiones
- `src/app/features/peticiones-admin/peticiones-admin.ts`: aprobacion/rechazo de peticiones
- `src/app/features/admin-manuales/admin-manuales.ts`: alta/edicion/borrado de manuales PDF
- `src/app/features/manuales/manuales.ts`: lectura/consulta de manuales

## 4) Estructura de base de datos Dexie ("Dixie")

### 4.1 Base
- Nombre de DB: `MaintenanceDB`
- Archivo: `src/app/core/services/database.ts`
- Version actual: `8`

### 4.2 Evolucion de versiones
- v1: tablas `machines`, `parts`
- v2: agrega campo `image` a `parts` (con migracion)
- v3: agrega tabla `employees`
- v4: agrega tabla `petitions`
- v5: agrega tabla `tools`
- v6: agrega campo `location` a `tools` (con migracion)
- v7: agrega tablas `fasteners`, `chemicals`
- v8: agrega tabla `manuals`

### 4.3 Tablas e indices declarados en Dexie

| Tabla | Store schema Dexie |
|---|---|
| machines | `++id, name, area, createdAt` |
| parts | `++id, sapNumber, partNumber, machineId, category, location, description, image, createdAt` |
| employees | `++id, employeeNumber, name, createdAt` |
| petitions | `++id, partId, machineId, employeeNumber, employeeName, status, createdAt` |
| tools | `++id, name, location, createdAt` |
| fasteners | `++id, name, location, createdAt` |
| chemicals | `++id, name, location, createdAt` |
| manuals | `++id, name, category, createdAt` |

### 4.4 Campos de modelo (contratos TypeScript)

Machine (`machine.model.ts`)
- id?
- name
- area: `corte | costura | consumible`
- createdAt
- updatedAt

Part (`part.model.ts`)
- id?
- sapNumber
- partNumber
- description
- category: `mecanica | electronica | consumible`
- machineId
- location
- image?
- createdAt
- updatedAt

Employee (`employee.model.ts`)
- id?
- employeeNumber
- name
- createdAt
- updatedAt

Petition (`petition.model.ts`)
- id?
- partId
- machineId
- employeeNumber
- employeeName
- note?
- status: `pending | approved | rejected`
- createdAt
- updatedAt

Tool/Fastener/Chemical (`tools.ts`)
- id
- name
- image?
- location
- createdAt
- updatedAt

Manual (`manual.model.ts`)
- id
- name
- description?
- category
- fileName
- pdfData (base64 legacy o ruta local en disco)
- createdAt
- updatedAt

### 4.5 Reglas y comportamiento de persistencia
- Hooks `creating` y `updating` en todas las tablas para timestamps automaticos.
- En `petitions`, hook de `creating` fuerza `status = pending` si no viene valor.
- No hay foreign keys reales (IndexedDB/Dexie), la integridad se controla desde servicios/pantallas.

## 5) Como se importan las cosas hoy

### 5.1 Importacion de Excel (catalogo)
Archivo principal: `src/app/features/excel-import/excel-import.ts`

Maquinas
- Lee primera hoja del archivo con `xlsx`.
- Espera columnas tipo: `Nombre` y `Area`.
- Valida area (`corte` o `costura`) y unicidad por nombre+area.
- Inserta via `MachineService.createMachine`.

Refacciones
- Lee todas las hojas del archivo.
- Espera hojas con nombres `CONSUMIBLE`, `ELECTRONICA`, `MECANICA`.
- Columnas requeridas por fila: `SAP`, `#PARTE`, `DESCRIPCION`.
- Columnas opcionales: `IMAGEN`, `UBICACION`, `MAQUINA`.
- Si `MAQUINA` no existe, crea maquina automaticamente en area por defecto seleccionada.
- Si no hay nombre de maquina, usa/crea maquina `GENERAL`.
- Dedup principal por `sapNumber` (si ya existe, se omite).

Herramientas, tornillos y quimicos
- Cada flujo lee la primera hoja del Excel.
- Requiere `NOMBRE`.
- Opcionales: `IMAGEN`, `UBICACION`.
- Inserta en tablas `tools`, `fasteners`, `chemicals` via sus servicios.

Limpieza masiva desde Excel Import
- Pantalla permite borrar todo.
- Flujo actual: borra refacciones y luego maquinas por iteracion de servicios.

### 5.2 Importacion y manejo de manuales PDF

Alta/edicion desde admin
- Pantalla: `src/app/features/admin-manuales/admin-manuales.ts`
- Convierte archivo PDF a base64 con `ManualService.fileToBase64`.
- En Electron, al guardar manual:
- `ManualService` llama IPC `pdf-save`.
- `main.js` guarda archivo en: `app.getPath('userData')/manuales/...`.
- En DB se persiste la ruta local devuelta (no solo base64).

Migracion legacy
- Al cargar manuales, `ManualService.loadManuals` detecta `pdfData` en formato data URL.
- Si esta en Electron, llama `pdf-migrate` y reemplaza base64 por ruta en disco.

Apertura y borrado
- `manuales.ts`: si `pdfData` es ruta local y hay Electron, usa `pdf-open`.
- Si no, abre en visor interno con Blob desde base64.
- `ManualService.deleteManual`: en Electron tambien llama `pdf-delete` para borrar archivo fisico.

### 5.3 Ingreso de peticiones (empleados y solicitudes)

Puntos de entrada
- `src/app/features/part-list/part-list.ts`
- `src/app/features/global-search/global-search.ts`

Flujo
- Usuario captura numero de empleado.
- Si no existe empleado: se crea automaticamente (`EmployeeService.create`) con nombre temporal `Empleado ####`.
- Se crea peticion con `PetitionService.create` y status inicial `pending`.
- Admin gestiona estatus en `src/app/features/peticiones-admin/peticiones-admin.ts`.

### 5.4 CRUD operativo normal
- Maquinas: alta/edicion/borrado por `MachineService`.
- Refacciones: alta/edicion/borrado por `PartService`.
- Herramientas/tornillos/quimicos: CRUD por sus servicios.
- Todas estas operaciones van directo a Dexie local, sin API remota.

### 5.5 Exportacion de datos
- No se detecto un flujo de exportacion de catalogo/peticiones a archivo o API en el codigo actual.

## 6) Contrato Electron IPC (backend local)

### 6.1 Canales permitidos por preload
Archivo: `preload.js`
- invoke permitidos: `check-for-updates`, `get-app-version`, `pdf-save`, `pdf-open`, `pdf-delete`, `pdf-migrate`
- on/removeAllListeners permitidos: `update-status`, `download-progress`

### 6.2 Canales implementados en main
Archivo: `main.js`
- `pdf-save`
- `pdf-open`
- `pdf-delete`
- `pdf-migrate`
- `check-for-updates`

Nota importante
- `get-app-version` esta permitido en preload pero no tiene handler en `main.js`.
- `main.js` emite `update-status` y `download-progress`; hoy no hay listeners activos en pantallas Angular para esos eventos.

## 7) Backend de actualizaciones (Electron updater)
Archivo: `main.js`
- Configurado con `electron-updater`.
- Feed GitHub: owner `GDesasT`, repo `mantenimiento-tactil`.
- Flujo: check -> disponible/no disponible -> descarga -> instalacion con reinicio

Trigger desde UI
- `src/app/features/home/home.ts` llama IPC `check-for-updates`.

## 8) Backend de audio

### 8.1 Servicio Express local (tour)
Archivo: `backend-audio.js`
- Endpoint: `POST http://localhost:3001/api/text-to-speech`
- Entrada: `{ text }`
- Salida: `audio/mpeg`
- Uso: `HomeTourService.playAudio`.

### 8.2 Servicio directo a ElevenLabs desde front
Archivo: `src/app/core/services/voice-driver.service.ts`
- Hace `POST` directo a ElevenLabs desde Angular (sin pasar por backend local).
- Se usa en `src/app/shared/components/voice-driver/voice-driver.component.ts`.

## 9) Scripts y ejecucion relacionados a backend
Archivo: `package.json`

Scripts importantes
- `npm run dev`: levanta Angular + backend de audio local
- `npm run audio-backend`: levanta solo Express audio
- `npm run electron`: ejecuta app Electron
- `npm run electron-dev`: Angular dev server + Electron
- `npm run driver`: prueba CLI de voz (driver.js)

Dependencias backend/local relevantes
- `dexie`
- `electron`, `electron-updater`, `electron-builder`
- `express`, `cors`, `axios`
- `xlsx`

## 10) Operaciones de borrado/reset de datos
- Reset total desde menu Electron (`main.js`): `window.indexedDB.deleteDatabase('MaintenanceDB')`.
- Borrado total desde Excel Import: elimina refacciones y luego maquinas por servicio.
- Borrados individuales por servicio: maquinas, refacciones, herramientas, tornillos, quimicos, manuales.

## 11) Que tocar para migrar a API sin romper front

Objetivo
- Mantener componentes y rutas.
- Reemplazar capa de acceso a datos (servicios) y puentes de archivo/IPC donde aplique.

Capa a sustituir primero
- `MachineService`
- `PartService`
- `EmployeeService`
- `PetitionService`
- `ToolService`
- `FastenerService`
- `ChemicalService`
- `ManualService` (incluyendo manejo de archivos)

Puntos de control para no tocar UI
- Conservar firmas/metodos publicos de los servicios actuales.
- Conservar modelos TypeScript para minimizar cambios en templates.
- En una primera fase, implementar servicios tipo adapter (Dexie/API con misma interfaz).

Migracion sugerida por bloques
- Bloque 1: catalogo (machines, parts, tools, fasteners, chemicals)
- Bloque 2: flujo de peticiones (employees, petitions)
- Bloque 3: manuales (metadata + archivos)
- Bloque 4: importacion Excel como job API o endpoint batch

## 12) Hallazgos tecnicos utiles para la migracion
- Hoy conviven dos vias de TTS: backend local (`backend-audio.js`) para tour y llamada directa a ElevenLabs desde front (`voice-driver.service.ts`).
- Hay archivos legacy/no activos en rutas actuales (`global-search-new.ts`, `global-search-old.ts`, `machine-list-new.ts`), considerar limpieza para evitar duplicidad al migrar.
- El front inicializa DB local desde multiples pantallas (`initializeDatabase` por componente), no desde un bootstrap central.
- Existen API keys de ElevenLabs hardcodeadas en `src/app/core/services/voice-driver.service.ts`, `backend-audio.js` y como fallback en `driver.js`; conviene moverlas a variables de entorno/secret manager.
