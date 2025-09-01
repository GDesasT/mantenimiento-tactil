# 🔄 GUÍA COMPLETA: Cómo Probar el Auto-Updater

## 📋 Preparación

Has instalado una versión anterior (1.0.0) y quieres probar que se actualice automáticamente a la versión 1.0.1.

## 🚀 Pasos para Probar la Actualización

### 1. Instalar Versión Base (1.0.0)

```
📁 Ubicación: electron-dist\Sistema de Gestion de Refacciones Setup 1.0.0.exe
```

- Ejecuta el installer 1.0.0
- Completa la instalación normalmente

### 2. Crear Release en GitHub

```
🌐 URL: https://github.com/GDesasT/mantenimiento-tactil/releases/new
```

- **Tag version**: `v1.0.1`
- **Release title**: `Version 1.0.1 - Update System & UI Improvements`
- **Description**:

```markdown
## ✨ Nuevas Características

- 🔄 Sistema de actualización automática con interfaz visual
- 🎛️ Botón "Verificar Actualizaciones" en la página principal
- 📡 Comunicación IPC segura entre procesos
- 📊 Logs mejorados para debugging de actualizaciones

## 🔧 Mejoras Técnicas

- ✅ Simplificación del modo administrador (solo en lista de refacciones)
- 🔐 Script preload para comunicación segura
- 📝 Logs detallados del proceso de actualización
- 🎯 Configuración automática de GitHub como fuente de updates

## 🐛 Correcciones

- 🎨 Resolución de problemas de overflow en tarjetas del modo admin
- 📱 Mejor experiencia de usuario en dispositivos táctiles
```

### 3. Subir Archivos al Release

```
📂 Archivos requeridos desde: electron-dist\
```

- ✅ `Sistema de Gestion de Refacciones Setup 1.0.1.exe`
- ✅ `Sistema de Gestion de Refacciones Setup 1.0.1.exe.blockmap`
- ✅ `latest.yml`

### 4. Publicar Release

- ✅ Marcar "Set as the latest release"
- ❌ NO marcar "Set as a pre-release"
- 🚀 Clic en "Publish release"

## 🔍 Cómo Detectar que Funciona

### A) Verificación Automática (5 segundos después de abrir)

```javascript
// En la consola del navegador verás:
🔍 Verificando actualizaciones automáticamente...
📍 URL de actualización: https://api.github.com/repos/GDesasT/mantenimiento-tactil/releases/latest
📍 Versión actual: 1.0.0
```

### B) Verificación Manual (Botón en la UI)

1. Abre la aplicación instalada (versión 1.0.0)
2. En la página principal verás un botón verde "VERIFICAR ACTUALIZACIONES"
3. Haz clic en el botón
4. Observa los logs en DevTools (F12)

### C) Estados Posibles

#### ✅ Actualización Disponible

```
✅ Actualización disponible: 1.0.1
```

- Aparece un diálogo: "Nueva versión disponible: 1.0.1"
- Opciones: "Descargar Ahora" | "Más Tarde"

#### 📥 Descargando

```
📥 Descargando: 45%
📥 Descargando: 78%
📥 Descargando: 100%
```

#### ✅ Descarga Completa

```
✅ Actualización descargada
```

- Aparece un diálogo: "La actualización se ha descargado correctamente"
- Opciones: "Reiniciar Ahora" | "Reiniciar Al Cerrar"

#### ℹ️ Sin Actualizaciones

```
ℹ️ No hay actualizaciones disponibles
📍 Versión actual: 1.0.1
📍 Última verificación: [timestamp]
```

#### ❌ Error

```
❌ Error en actualización: [descripción del error]
📍 Detalles del error: [mensaje específico]
📍 URL consultada: [URL de GitHub]
```

## 🛠️ Debugging Avanzado

### Abrir DevTools

```
Método 1: F12 en la aplicación
Método 2: Ctrl+Shift+I
Método 3: Menú → Ver → Toggle Developer Tools
```

### Logs Importantes

```javascript
// Inicialización
🔍 Verificando actualizaciones...
📍 URL de actualización: [URL]
📍 Versión actual: [versión]

// Estados del proceso
checking-for-update
update-available / update-not-available
download-progress
update-downloaded
error
```

### Verificar Comunicación IPC

```javascript
// En la consola del navegador:
window.electron?.ipcRenderer.invoke("get-app-version");
// Debería retornar: "1.0.0"

window.electron?.ipcRenderer.invoke("check-for-updates");
// Debería iniciar el proceso de verificación
```

## 📱 Testing Completo

### Escenario 1: Primera Vez

1. Instala versión 1.0.0
2. Abre la aplicación
3. Espera 5 segundos → debería verificar automáticamente
4. Si hay update disponible → descarga y notifica

### Escenario 2: Verificación Manual

1. Aplicación ya abierta (versión 1.0.0)
2. Clic en botón "VERIFICAR ACTUALIZACIONES"
3. Observa el proceso completo en logs

### Escenario 3: Sin Conexión

1. Desconecta internet
2. Intenta verificar actualizaciones
3. Debería mostrar error de conectividad

### Escenario 4: Ya Actualizado

1. Después de actualizar a 1.0.1
2. Verifica actualizaciones nuevamente
3. Debería mostrar "No hay actualizaciones disponibles"

## 🎯 Resultado Esperado

Si todo funciona correctamente:

1. ✅ La app detecta automáticamente la nueva versión
2. ✅ Se descarga en segundo plano
3. ✅ Notifica al usuario cuando está lista
4. ✅ Se reinicia y aplica la actualización
5. ✅ La nueva versión tiene todas las mejoras implementadas

## 🆘 Solución de Problemas

### No detecta actualizaciones

- ✅ Verifica que el release esté publicado como "latest"
- ✅ Confirma que los archivos estén subidos correctamente
- ✅ Revisa la conectividad a internet
- ✅ Consulta los logs de error en DevTools

### Error de descarga

- ✅ Verifica el archivo `latest.yml` en el release
- ✅ Confirma que el hash SHA512 sea correcto
- ✅ Revisa permisos de escritura en el directorio temp

### IPC no funciona

- ✅ Verifica que `preload.js` esté correctamente configurado
- ✅ Confirma que contextBridge esté exponiendo las APIs
- ✅ Revisa que no haya errores de seguridad CSP
