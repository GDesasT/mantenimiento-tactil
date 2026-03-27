# 🎙️ Guía Rápida - Voice Driver

## ¿Cómo empezar?

### 1️⃣ Obtener API Key
- Ir a https://elevenlabs.io
- Crear cuenta gratuita
- Copiar API Key desde Settings

### 2️⃣ Configurar la API Key
En `src/app/core/services/voice-driver.service.ts` (línea ~27):

```typescript
private readonly ELEVENLABS_API_KEY = 'PEGA_TU_API_KEY_AQUI';
```

### 3️⃣ Ejecutar la app
```bash
npm start
```

Para Electron:
```bash
npm run electron-dev
```

### 4️⃣ Usar el driver
- Presiona el botón 🎙️ **"Solicitar"** en el navbar rojo
- Selecciona tu idioma
- Escucha la introducción
- Ingresa la refacción que necesitas
- Confirma la solicitud

## 📚 Estructura de archivos

```
src/app/
├── core/services/
│   └── voice-driver.service.ts          ← Aquí va la API Key
├── shared/components/
│   ├── voice-driver/
│   │   └── voice-driver.component.ts    ← Lógica principal
│   └── language-selector/
│       └── language-selector.component.ts ← Modal de idioma
└── app.ts                               ← Botón agregado
```

## 🔧 Configuración típica

**API Key** (required)
```typescript
private readonly ELEVENLABS_API_KEY = 'tu_key_aqui';
```

**Voice ID** (opcional, por defecto Bella)
```typescript
voiceId: 'dlGxemPxFMTY7iXagmOj' // Bella - Neutral
```

## 📖 4 Pasos del Driver

| # | Paso | Descripción |
|---|------|-------------|
| 1 | **Intro** | Explicación del sistema + audio |
| 2 | **Request** | Input para solicitar refacción |
| 3 | **Confirm** | Resumen y confirmación |
| 4 | **Complete** | Pantalla de éxito ✅ |

## 🌍 Idiomas (4 soportados)

- 🇪🇸 **Español** - Bienvenido al Sistema
- 🇬🇧 **English** - Welcome to the System
- 🇫🇷 **Français** - Bienvenue au Système
- 🇵🇹 **Português** - Bem-vindo ao Sistema

## ⚠️ Errores comunes

| Error | Solución |
|-------|----------|
| Botón no aparece | `npm install`, recarga página |
| No se reproduce audio | Verifica API Key, volumen activo |
| Error 401 | API Key inválida, copia nuevamente |
| Error 402 | Límite excedido, upgrade plan |

## 🎯 Próximas características

- Más drivers (refacciones, herramientas, mantenimiento)
- Historial de solicitudes
- Integración con backend
- Dashboard admin
- Reportes y estadísticas

## 📞 Soporte

- Docs: `DRIVER-README.md` (usuarios)
- Docs: `VOICE-DRIVER-DOCS.md` (desarrolladores)
- API: https://elevenlabs.io/docs

---

**¡Listo para usar!** 🚀
