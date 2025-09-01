# 🔄 Sistema de Auto-Actualización

Este documento explica cómo funciona el sistema de actualizaciones automáticas para el Sistema de Gestión de Refacciones.

## 🚀 Cómo Funciona

El sistema utiliza `electron-updater` junto con GitHub Releases para proporcionar actualizaciones automáticas:

1. **Verificación Automática**: La aplicación verifica actualizaciones al iniciar
2. **Descarga en Segundo Plano**: Las actualizaciones se descargan automáticamente
3. **Instalación Suave**: Se instalan al cerrar la aplicación o bajo demanda
4. **Notificaciones Visuales**: El usuario es informado de cada paso

## 📋 Configuración Inicial

### 1. Configurar GitHub Repository

```bash
# Asegúrate de que tu repositorio esté configurado correctamente
git remote -v
# origin  https://github.com/GDesasT/mantenimiento-tactil.git (fetch)
# origin  https://github.com/GDesasT/mantenimiento-tactil.git (push)
```

### 2. Configurar GitHub Actions

- Ve a tu repositorio en GitHub
- Ve a Settings > Actions > General
- Asegúrate de que "Allow GitHub Actions to create and approve pull requests" esté habilitado

### 3. Permisos del Token

GitHub Actions necesita permisos para crear releases:

- Ve a Settings > Actions > General
- En "Workflow permissions", selecciona "Read and write permissions"

## 🏷️ Crear un Nuevo Release

### Método 1: Usando Script (Recomendado)

```bash
# En Windows
create-release.bat 1.0.1 "Corrección de bugs críticos"

# En Linux/Mac
./create-release.sh 1.0.1 "Corrección de bugs críticos"
```

### Método 2: Manual

```bash
# 1. Actualizar versión
npm version 1.0.1 --no-git-tag-version

# 2. Commit y tag
git add package.json
git commit -m "chore: bump version to 1.0.1"
git tag -a "v1.0.1" -m "Corrección de bugs críticos"

# 3. Push
git push origin main
git push origin "v1.0.1"
```

## 📦 Proceso de Publicación

1. **Push del Tag**: Al hacer push de un tag `v*`, se activa GitHub Actions
2. **Build Automático**: Se construye la aplicación para Windows
3. **Publicación**: Se crea un release en GitHub con los archivos
4. **Notificación**: Los usuarios reciben la actualización automáticamente

## 🔧 Configuración de Desarrollo

Para probar el sistema de actualización en desarrollo:

```javascript
// En main.js, cambiar temporalmente:
const isDev = false; // Forzar modo producción

// Y configurar un repositorio de prueba:
autoUpdater.setFeedURL({
  provider: "github",
  owner: "TuUsuario",
  repo: "repositorio-de-prueba",
});
```

## 📱 Experiencia del Usuario

### Al Iniciar la Aplicación

- Se verifica automáticamente si hay actualizaciones
- Si hay una disponible, se muestra un diálogo informativo

### Durante la Descarga

- Se muestra el progreso de descarga
- La aplicación sigue funcionando normalmente

### Al Completar la Descarga

- Se ofrece reiniciar inmediatamente o al cerrar
- La actualización se aplica automáticamente

### Verificación Manual

- Menu > Sistema > "🔄 Verificar Actualizaciones"

## 🔍 Logs y Debugging

Los logs del updater aparecen en la consola:

```
🔍 Verificando actualizaciones...
✅ Actualización disponible: 1.0.1
📥 Descargando: 45%
✅ Actualización descargada
```

## 📋 Troubleshooting

### La aplicación no encuentra actualizaciones

- Verifica que el repositorio sea público o que tengas los permisos correctos
- Asegúrate de que exista al menos un release en GitHub
- Revisa que la versión en package.json sea anterior a la del release

### Error de descarga

- Verifica tu conexión a internet
- Asegúrate de que GitHub esté disponible
- Revisa los permisos del repositorio

### La actualización no se aplica

- Verifica que la aplicación se cierre completamente
- En Windows, revisa si hay procesos de Electron corriendo
- Intenta ejecutar como administrador si es necesario

## 🔒 Seguridad

- Las actualizaciones se verifican con checksums automáticamente
- Solo se descargan desde GitHub oficial
- Los releases deben estar firmados digitalmente (recomendado para producción)

## 🚀 Próximos Pasos

1. **Firma Digital**: Configurar code signing para Windows
2. **Auto-Updates**: Configurar actualizaciones completamente automáticas
3. **Rollback**: Sistema para revertir actualizaciones problemáticas
4. **Notificaciones**: Sistema de notificaciones más avanzado
