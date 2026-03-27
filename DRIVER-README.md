# Driver de Asistente de Voz para Refacciones - v2.0

Sistema integrado de asistente de voz con síntesis ElevenLabs, ahora disponible directamente en la UI de la aplicación.

## 🌟 Características

- ✅ Botón de inicio en el navbar ("Solicitar")
- ✅ Selección de idioma (Español, English, Français, Português)
- 🔊 Introducción del sistema con síntesis de voz
- 📋 Explicación de para qué sirve el programa
- 🎤 Instrucciones de uso del asistente
- ✨ Interfaz intuitiva con múltiples pasos
- 🌍 Completamente multiidioma
- 📱 Responsive y optimizado para táctil

## 📖 Flujo de Uso

### Paso 1: Presionar botón "Solicitar"
En el navbar, presiona el botón rojo con icono 🎙️

### Paso 2: Seleccionar idioma
Elige tu idioma preferido en el modal:
- 🇪🇸 Español
- 🇬🇧 English
- 🇫🇷 Français
- 🇵🇹 Português

### Paso 3: Escuchar introducción
- Se reproduce automáticamente una introducción del sistema
- Explicación de qué es el programa
- Para qué sirve el asistente
- Cómo usarlo para pedir refacciones
- Botón "Escuchar" disponible si quieres repetir el audio

### Paso 4: Solicitar refacción
- Ingresa el nombre de la refacción que necesitas
- Ejemplos: Válvula de presión, Motor de arranque, etc.
- Presiona Enter o el botón Confirmar

### Paso 5: Confirmar solicitud
- Revisa los detalles de tu solicitud
- Verifica idioma y fecha/hora
- Presiona "Enviar Solicitud" para completar

### Paso 6: Confirmación exitosa
- Se muestra pantalla de éxito
- Confirmación de que la solicitud fue registrada
- Presiona "Cerrar" para terminar

## � Instalación

### Ya incluido en la aplicación
No necesitas pasos adicionales. El driver está completamente integrado en la UI.

### Requisitos
- Angular 20+
- Angular Material
- HttpClient (incluido)
- ElevenLabs API Key

### Dependencias instaladas
- `axios` - Para llamadas HTTP
- `@angular/material` - Para componentes UI
- `rxjs` - Para manejo reactivo

## 🚀 Cómo usar en desarrollo

### 1. Asegúrate de tener configurada la API Key

En `src/app/core/services/voice-driver.service.ts`:

```typescript
private readonly ELEVENLABS_API_KEY = 'tu_api_key_aqui';
```

### 2. Ejecuta la aplicación

```bash
npm start
```

o para Electron:

```bash
npm run electron-dev
```

### 3. Presiona el botón en el navbar

El botón rojo "Solicitar" 🎙️ está en el navbar y está siempre disponible.

## 🎯 Especificación del Sistema

### Idiomas Soportados

| Código | Idioma | Introducción | Voz |
|--------|--------|--------------|-----|
| `es` | Español | Bienvenida en español | Bella |
| `en` | English | Welcome in English | Bella |
| `fr` | Français | Bienvenue en français | Bella |
| `pt` | Português | Bem-vindo em português | Bella |

### Estructura de componentes

**VoiceDriverComponent** - Componente principal
- Gestiona los 4 pasos del flujo
- Manejo de estado y navegación
- Comunicación con servicio de voz

**LanguageSelectorComponent** - Selector de idioma
- Modal para elegir idioma
- 4 opciones disponibles
- Interfaz clara y táctil

**VoiceDriverService** - Servicio de síntesis de voz
- Integración con ElevenLabs
- Reproducción de audio
- Gestión de idiomas

## 🎨 Styling

### Botón en navbar
- Gradiente rojo dinámico: `#ff6b6b` → `#ee5a52`
- Efecto pulse constante (animación)
- Altura: 80px para mejor táctil
- Hover effect con elevación

### Modal del driver
- Fondo semi-transparente
- Animación de entrada suave
- Esquinas redondeadas (16px)
- Responsive en móviles

### Colores de estado
- **Intro**: Azul (información)
- **Request**: Neutro (entrada)
- **Confirm**: Gris (resumen)
- **Complete**: Verde (éxito)

## 🔄 Escalabilidad

El sistema está diseñado para ser escalable. Próximos drivers planeados:

### Driver de Refacciones
- Específico para solicitar piezas del inventario
- Con autocomplete de partes disponibles
- Búsqueda avanzada

### Driver de Herramientas
- Para solicitar herramientas
- Con disponibilidad en tiempo real
- Historial de préstamos

### Driver de Mantenimiento
- Para solicitudes de mantenimiento
- Con descripción detallada del problema
- Prioridades

### Driver Admin
- Para gestionar solicitudes
- Asignar técnicos
- Seguimiento de tareas

## 🔐 Seguridad

- **API Key**: Guardada en el código (usar variables de entorno en producción)
- **CORS**: Manejado por ElevenLabs
- **Datos**: Las solicitudes se registran con timestamp
- **Audio**: Solo se reproduce en cliente, no se envía

## 🌐 Configuración de ElevenLabs

### Obtener API Key
1. Ir a https://elevenlabs.io
2. Crear cuenta gratuita
3. En Settings, copiar tu API Key
4. Pegar en `src/app/core/services/voice-driver.service.ts`

### Plan Gratuito
- 10,000 caracteres por mes
- Perfecto para testing
- Mejora a plan de pago si necesitas más

### Cambiar voz
En el servicio, puedes cambiar `voiceId` para cada idioma:

```typescript
es: {
  name: 'Español',
  voiceId: 'dlGxemPxFMTY7iXagmOj',  // Cambiar aquí
  // ...
}
```

Voces disponibles:
- `dlGxemPxFMTY7iXagmOj` - Bella (Neutral)
- `EXAVITQu4vr4xnSDxMaL` - Rachel (EN)
- `21m00Tcm4TlvDq8ikWAM` - Charlotte

## 📝 Notas

- El audio se descarga desde ElevenLabs
- Requiere conexión a Internet
- Compatible con navegadores modernos
- Probado en Chrome, Firefox, Safari, Edge

## 🐛 Troubleshooting

### El botón no aparece
- Verifica que hayas ejecutado `npm install`
- Recarga la página (Ctrl+R o Cmd+R)
- Abre consola del navegador (F12) para ver errores

### No se reproduce el audio
- Revisa que el volumen del sistema esté activado
- Verifica que la API Key sea correcta
- Comprueba que tengas conexión a Internet
- Abre la consola para ver mensajes de error

### Error "API key inválida"
- Copia nuevamente tu API Key de elevenlabs.io
- Asegúrate de no tener espacios extra
- Verifica que la key sea para la API (no para la web)

### Error CORS
- Normalmente no ocurre con ElevenLabs
- Si ocurre, verifica tu plan en ElevenLabs

## 📚 Documentación completa

Para más detalles técnicos sobre la arquitectura y escalabilidad, ver:
[VOICE-DRIVER-DOCS.md](./VOICE-DRIVER-DOCS.md)

## 🚀 Próximas mejoras

- [ ] Soporte para más idiomas (Chino, Japonés, etc.)
- [ ] Selección de voces diferentes por idioma
- [ ] Ajuste de velocidad de reproducción
- [ ] Historial de solicitudes
- [ ] Integración con backend para almacenamiento
- [ ] Dashboard de solicitudes pendientes
- [ ] Notificaciones cuando se completen solicitudes

## 📄 Licencia

Parte del proyecto "Sistema de Gestión de Refacciones" - DTSoftware

✅ SOLICITUD REGISTRADA
═══════════════════════════════════════════════════════════

📦 Refacción: Válvula de presión
🌐 Idioma: Español
⏰ Fecha: 14/1/2026 10:30:45

✨ La solicitud ha sido enviada al sistema.
```

## 🛠️ Troubleshooting

### Error: "API key de ElevenLabs inválida"
- Verifica que `ELEVENLABS_API_KEY` esté configurada correctamente
- Revisa que tu API key sea válida en elevenlabs.io

### Error: "Cuota de ElevenLabs excedida"
- Has alcanzado tu límite de caracteres
- Suscríbete a un plan superior en elevenlabs.io

### No se reproduce audio
- Asegúrate de que `mpg123` esté instalado (o descomenta la línea de simulación)
- Verifica que tu sistema tenga acceso a dispositivos de audio

## 📝 Notas

- El driver es **básico** y está diseñado para **solicitudes simples**
- La síntesis de voz requiere **conexión a Internet**
- Cada solicitud se registra con **idioma y fecha**

## 🔒 Seguridad

- **Nunca** hagas commit de tu `ELEVENLABS_API_KEY`
- Usa variables de entorno para almacenar credenciales
- El archivo `.env` debe estar en `.gitignore`

## 📄 Licencia

Parte del proyecto "Sistema de Gestión de Refacciones" - DTSoftware
