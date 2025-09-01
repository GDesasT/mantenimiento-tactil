# Auto-Actualización

Sistema de actualizaciones automáticas usando `electron-updater` y GitHub Releases.

## Crear Release

```bash
# Windows
create-release.bat 1.0.1 "Descripción"

# Linux/Mac
./create-release.sh 1.0.1 "Descripción"
```

## Configuración

- Repositorio: GDesasT/mantenimiento-tactil
- Verificación: Al iniciar aplicación
- Instalación: Al cerrar aplicación
- Manual: Menu > "🔄 Verificar Actualizaciones"

## Proceso

1. Push tag `v*` activa GitHub Actions
2. Build automático en Windows
3. Release publicado en GitHub
4. Usuarios reciben actualización automática
