# Voice Driver System - Documentación Técnica

## 📋 Descripción General

Sistema integrado de asistentes de voz para solicitar refacciones/herramientas, con soporte multiidioma y estructura escalable para múltiples paneles.

## 🏗️ Arquitectura

### Estructura de Carpetas

```
src/app/
├── core/
│   └── services/
│       └── voice-driver.service.ts       # Servicio central de síntesis de voz
├── shared/
│   └── components/
│       ├── voice-driver/
│       │   └── voice-driver.component.ts # Componente principal del driver
│       └── language-selector/
│           └── language-selector.component.ts  # Selector de idioma
└── app.ts                                # Componente raíz (navbar + drivers)
```

## 🎯 Componentes Principales

### 1. **VoiceDriverService** (`core/services/voice-driver.service.ts`)

Servicio central que maneja:
- Integración con ElevenLabs API
- Síntesis de texto a voz
- Reproducción de audio en el navegador
- Gestión de idiomas

**Métodos públicos:**
```typescript
getSelectedLanguage$(): Observable<LanguageCode>
setSelectedLanguage(languageCode: LanguageCode): void
synthesizeAudio(text: string, languageCode: LanguageCode): Promise<Blob>
playAudio(audioBlob: Blob): Promise<void>
synthesizeAndPlay(text: string, languageCode: LanguageCode): Promise<void>
```

### 2. **LanguageSelectorComponent** (`shared/components/language-selector/`)

Modal para seleccionar idioma al iniciar el driver:
- 4 idiomas soportados (ES, EN, FR, PT)
- Interfaz simple y clara
- Material Design

### 3. **VoiceDriverComponent** (`shared/components/voice-driver/`)

Componente principal con flujo de 4 pasos:

1. **Intro Step** - Explicación del sistema
   - Reproducción de audio con introducción
   - Botón para escuchar instrucciones

2. **Request Step** - Solicitar refacción
   - Input de texto para nombre de refacción
   - Validación de entrada

3. **Confirm Step** - Confirmación
   - Resumen de la solicitud
   - Información de idioma y fecha

4. **Complete Step** - Confirmación exitosa
   - Animación de éxito
   - Opción para cerrar

## 🌍 Sistema de Idiomas

Configuración multiidioma en el servicio:

```typescript
readonly languages: Record<LanguageCode, Language> = {
  es: { /* Español */ },
  en: { /* English */ },
  fr: { /* Français */ },
  pt: { /* Português */ }
};
```

Cada idioma incluye:
- `name`: Nombre del idioma
- `voiceId`: ID de la voz en ElevenLabs
- `introduction`: Texto de introducción
- `instructions`: Instrucciones del sistema
- `requestPrompt`: Pregunta para solicitar refacción
- `placeholder`: Ejemplo de entrada

## 🔌 Integración en App

### En `app.ts`:

1. **Importar componente y servicio:**
```typescript
import { VoiceDriverComponent } from './shared/components/voice-driver/voice-driver.component';
import { HttpClientModule } from '@angular/common/http';

@Component({
  imports: [..., VoiceDriverComponent, HttpClientModule],
})
```

2. **Agregar en template:**
```html
<app-voice-driver #voiceDriver></app-voice-driver>
```

3. **Agregar botón en navbar:**
```html
<app-touch-button
  size="lg"
  icon="🎙️"
  (clicked)="openVoiceDriver()"
  class="nav-touch-button voice-driver-btn"
>
  Solicitar
</app-touch-button>
```

4. **Método en componente:**
```typescript
openVoiceDriver(): void {
  this.voiceDriver.openDriver();
}
```

## 🚀 Uso

### Para el usuario final:

1. Presionar botón "Solicitar" en navbar (🎙️)
2. Seleccionar idioma en modal
3. Ver introducción del sistema
4. Presionar botón para escuchar audio
5. Ingresar nombre de refacción
6. Confirmar solicitud
7. Ver confirmación de éxito

## 📱 Escalabilidad - Múltiples Drivers por Panel

### Estructura propuesta para futuro:

```
src/app/shared/components/drivers/
├── base-driver.component.ts           # Clase base abstracta
├── intro-driver/                      # Driver de introducción (actual)
├── spare-parts-driver/                # Driver para solicitar refacciones
├── tools-driver/                      # Driver para solicitar herramientas
├── maintenance-driver/                # Driver para solicitud de mantenimiento
└── admin-driver/                      # Driver admin para gestión
```

### Clase base (`base-driver.component.ts`):

```typescript
export abstract class BaseDriverComponent {
  abstract currentStep: DriverStep;
  abstract openDriver(): void;
  abstract closeDriver(): void;
  
  // Métodos comunes
  protected selectLanguage(): void { /* ... */ }
  protected playAudio(text: string): void { /* ... */ }
}
```

### Implementación de un nuevo driver:

```typescript
@Component({
  selector: 'app-tools-driver',
  standalone: true,
  imports: [CommonModule, ...],
  template: `...`
})
export class ToolsDriverComponent extends BaseDriverComponent {
  openDriver(): void {
    // Lógica específica para solicitar herramientas
  }
}
```

### Agregar múltiples drivers en app.ts:

```html
<app-voice-driver #introDriver></app-voice-driver>
<app-spare-parts-driver #sparePartsDriver></app-spare-parts-driver>
<app-tools-driver #toolsDriver></app-tools-driver>
```

```typescript
@ViewChild('introDriver') introDriver!: IntroDriverComponent;
@ViewChild('sparePartsDriver') sparePartsDriver!: SparePartsDriverComponent;
@ViewChild('toolsDriver') toolsDriver!: ToolsDriverComponent;

openIntroDriver(): void { this.introDriver.openDriver(); }
openSparePartsDriver(): void { this.sparePartsDriver.openDriver(); }
openToolsDriver(): void { this.toolsDriver.openDriver(); }
```

## 🔐 Configuración de ElevenLabs

### Obtener API Key:

1. Ir a [elevenlabs.io](https://elevenlabs.io)
2. Crear cuenta
3. Obtener API key en settings
4. Configurar en `voice-driver.service.ts`:

```typescript
private readonly ELEVENLABS_API_KEY = 'tu_api_key_aqui';
```

### Voces disponibles:

- `dlGxemPxFMTY7iXagmOj` - Bella (Neutral - Actual)
- `EXAVITQu4vr4xnSDxMaL` - Rachel (EN)
- `21m00Tcm4TlvDq8ikWAM` - Charlotte

## 🎨 Estilos

### Botón Voice Driver en navbar:

- Gradiente rojo dinámico
- Efecto pulse constante
- Hover con escala y sombra mejorada
- Altura mínima de 80px para táctil

### Modal del driver:

- Animación de entrada suave
- Responsive para móviles
- Material Design
- Colores coherentes con la app

## 📊 Flujo de datos

```
Usuario presiona botón
    ↓
Abre LanguageSelectorComponent
    ↓
Usuario selecciona idioma
    ↓
VoiceDriverComponent inicia con Intro Step
    ↓
VoiceDriverService sintetiza audio con ElevenLabs
    ↓
Audio se reproduce en el navegador
    ↓
Usuario ingresa refacción
    ↓
Confirmación y envío de solicitud
    ↓
Pantalla de éxito
```

## 🐛 Troubleshooting

### No se reproduce audio
- Verificar que ElevenLabs API key sea válida
- Revisar conexión a Internet
- Comprobar que el navegador tenga permisos de audio

### Error 401 en ElevenLabs
- Verificar que el API key sea correcto
- Asegurarse de no tener caracteres extra

### Error 402 en ElevenLabs
- Límite de caracteres excedido
- Upgrade a plan superior

## 📚 Referencias

- [ElevenLabs API Docs](https://elevenlabs.io/docs)
- [Angular Components](https://angular.io/guide/component-overview)
- [RxJS](https://rxjs.dev/)
- [Material Design](https://material.angular.io/)

## 🔄 Próximos pasos

1. ✅ Sistema básico de introducción
2. ⏳ Driver específico para refacciones
3. ⏳ Driver específico para herramientas
4. ⏳ Driver para solicitudes de mantenimiento
5. ⏳ Panel admin para gestionar solicitudes
6. ⏳ Integración con backend para almacenamiento
7. ⏳ Reportes y estadísticas de solicitudes
