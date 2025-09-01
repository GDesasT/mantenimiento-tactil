# Instrucciones para crear el Release en GitHub

## Paso 1: Ir a GitHub

Ve a: https://github.com/GDesasT/mantenimiento-tactil/releases

## Paso 2: Crear nuevo release

1. Haz clic en "Create a new release"
2. En "Tag version" escribe: v1.0.1
3. En "Release title" escribe: Version 1.0.1 - Admin Mode Improvements
4. En "Describe this release" escribe:

   ```
   ## Changes in v1.0.1

   ### Features
   - Simplified admin mode interface
   - Removed admin controls from machine list and part category selector
   - Admin mode now only available in parts list for better UX

   ### Bug Fixes
   - Fixed card overflow issues in admin mode
   - Improved responsive layout for better mobile experience

   ### Technical
   - Updated Angular components for better performance
   - Streamlined admin permission logic
   ```

## Paso 3: Subir archivos

Arrastra estos archivos desde: c:\Users\gera3\Desktop\mantenimiento-touch\electron-dist\

**Archivos requeridos:**

- Sistema de Gestion de Refacciones Setup 1.0.1.exe
- Sistema de Gestion de Refacciones Setup 1.0.1.exe.blockmap
- latest.yml

## Paso 4: Configurar release

1. Marca "Set as the latest release"
2. NO marques "Set as a pre-release"
3. Haz clic en "Publish release"

## Resultado esperado:

- El auto-updater podrá detectar la nueva versión
- Los usuarios recibirán notificación de actualización automáticamente
- El archivo latest.yml proporcionará la información de la nueva versión
