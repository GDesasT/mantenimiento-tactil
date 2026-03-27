# 🛠️ Guía para Agregar Nuevos Drivers

Este documento explica cómo crear nuevos drivers (componentes de voz) para diferentes casos de uso.

## 📋 Casos de uso planeados

### 1. Driver de Refacciones
Para solicitar piezas del inventario con búsqueda avanzada

### 2. Driver de Herramientas
Para solicitar herramientas con disponibilidad en tiempo real

### 3. Driver de Mantenimiento
Para reportar problemas de mantenimiento con prioridades

### 4. Driver Admin
Para gestionar solicitudes y asignar técnicos

---

## 🏗️ Estructura Base

Primero, crear una **clase base abstracta**:

**Archivo**: `src/app/shared/components/drivers/base-driver.component.ts`

```typescript
import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { VoiceDriverService, LanguageCode } from '../../core/services/voice-driver.service';
import { LanguageSelectorComponent } from '../language-selector/language-selector.component';

export type DriverStep = 'intro' | 'action' | 'confirm' | 'complete';

export abstract class BaseDriverComponent {
  isOpen = false;
  currentStep: DriverStep = 'intro';
  currentLanguage: LanguageCode = 'es';

  constructor(
    protected voiceDriver: VoiceDriverService,
    protected dialog: MatDialog
  ) {}

  abstract openDriver(): void;
  abstract closeDriver(): void;
  
  // Métodos comunes
  protected selectLanguage(): void {
    const dialogRef = this.dialog.open(LanguageSelectorComponent, {
      width: '400px',
      disableClose: false,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.currentLanguage = result;
      } else {
        this.closeDriver();
      }
    });
  }

  protected async playAudio(text: string): Promise<void> {
    await this.voiceDriver.synthesizeAndPlay(text, this.currentLanguage);
  }

  protected getCurrentDate(): string {
    const now = new Date();
    return now.toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
```

---

## 📦 Ejemplo: Driver de Refacciones

### 1. Crear componente

**Archivo**: `src/app/shared/components/drivers/spare-parts-driver/spare-parts-driver.component.ts`

```typescript
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { BaseDriverComponent } from '../base-driver.component';
import { VoiceDriverService } from '../../../core/services/voice-driver.service';

@Component({
  selector: 'app-spare-parts-driver',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatInputModule,
    MatSelectModule,
    MatAutocompleteModule,
  ],
  template: `
    <div class="driver-container" *ngIf="isOpen">
      <div class="driver-modal">
        <!-- Intro Step -->
        <div *ngIf="currentStep === 'intro'" class="step">
          <h2>📦 Solicitar Refacción</h2>
          <p>{{ getIntroText() }}</p>
          <button (click)="playAudio(getIntroText())">Escuchar</button>
          <button (click)="nextStep()">Continuar</button>
        </div>

        <!-- Action Step -->
        <div *ngIf="currentStep === 'action'" class="step">
          <h2>🔍 Buscar Refacción</h2>
          <input
            matInput
            [(ngModel)]="partName"
            placeholder="Nombre de la refacción"
            [matAutocomplete]="auto"
          />
          <mat-autocomplete #auto="matAutocomplete">
            <mat-option
              *ngFor="let part of filteredParts"
              [value]="part.name"
            >
              {{ part.name }} - Stock: {{ part.stock }}
            </mat-option>
          </mat-autocomplete>
          <button (click)="nextStep()" [disabled]="!partName">
            Confirmar
          </button>
        </div>

        <!-- Confirm Step -->
        <div *ngIf="currentStep === 'confirm'" class="step">
          <h2>✓ Confirmar Solicitud</h2>
          <p>Refacción: {{ partName }}</p>
          <p>Disponible: {{ selectedPart?.stock }} unidades</p>
          <button (click)="submitRequest()">Enviar</button>
        </div>

        <!-- Complete Step -->
        <div *ngIf="currentStep === 'complete'" class="step success">
          <h2>✅ ¡Solicitud registrada!</h2>
          <p>Tu solicitud ha sido procesada correctamente.</p>
          <button (click)="closeDriver()">Cerrar</button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      /* Similar a voice-driver.component.ts */
    `,
  ],
})
export class SparePartsDriverComponent extends BaseDriverComponent implements OnInit, OnDestroy {
  partName = '';
  selectedPart: any = null;
  filteredParts: any[] = [];
  private destroy$ = new Subject<void>();

  // Simulación de inventario
  private inventory = [
    { id: 1, name: 'Válvula de presión', stock: 5 },
    { id: 2, name: 'Motor de arranque', stock: 3 },
    { id: 3, name: 'Cilindro neumático', stock: 8 },
    { id: 4, name: 'Filtro de aire', stock: 12 },
    { id: 5, name: 'Sensor de temperatura', stock: 0 },
  ];

  constructor(voiceDriver: VoiceDriverService, dialog: MatDialog) {
    super(voiceDriver, dialog);
  }

  ngOnInit(): void {
    // Inicializar
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  openDriver(): void {
    this.isOpen = true;
    this.currentStep = 'intro';
    this.selectLanguage();
  }

  closeDriver(): void {
    this.isOpen = false;
  }

  getIntroText(): string {
    const intros: Record<string, string> = {
      es: 'Selecciona una refacción del inventario disponible.',
      en: 'Select a spare part from available inventory.',
      fr: 'Sélectionnez une pièce de rechange du stock disponible.',
      pt: 'Selecione uma peça de reposição do inventário disponível.',
    };
    return intros[this.currentLanguage];
  }

  nextStep(): void {
    if (this.currentStep === 'intro') this.currentStep = 'action';
    else if (this.currentStep === 'action') this.currentStep = 'confirm';
  }

  submitRequest(): void {
    console.log('Solicitud de refacción:', {
      part: this.partName,
      language: this.currentLanguage,
      timestamp: this.getCurrentDate(),
    });
    this.currentStep = 'complete';
  }

  // Filtrar refacciones según input
  filterParts(searchTerm: string): void {
    this.filteredParts = this.inventory.filter((part) =>
      part.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }
}
```

### 2. Agregar en app.ts

```typescript
import { SparePartsDriverComponent } from './shared/components/drivers/spare-parts-driver/spare-parts-driver.component';

@Component({
  imports: [..., SparePartsDriverComponent],
  template: `
    <app-voice-driver #voiceDriver></app-voice-driver>
    <app-spare-parts-driver #sparePartsDriver></app-spare-parts-driver>
    
    <!-- En navbar -->
    <app-touch-button
      icon="📦"
      (clicked)="openSparePartsDriver()"
    >
      Refacciones
    </app-touch-button>
  `,
})
export class AppComponent {
  @ViewChild('sparePartsDriver') sparePartsDriver!: SparePartsDriverComponent;

  openSparePartsDriver(): void {
    this.sparePartsDriver.openDriver();
  }
}
```

---

## 🎯 Patrón General para Nuevos Drivers

### 1. Extender BaseDriverComponent
```typescript
export class MyDriverComponent extends BaseDriverComponent {
  // ...
}
```

### 2. Implementar métodos abstractos
```typescript
openDriver(): void { /* ... */ }
closeDriver(): void { /* ... */ }
```

### 3. Definir pasos (steps)
```typescript
currentStep: DriverStep = 'intro' | 'action' | 'confirm' | 'complete';
```

### 4. Usar métodos comunes
```typescript
this.playAudio(text);
this.selectLanguage();
this.getCurrentDate();
```

### 5. Agregar en app.ts
- Importar componente
- Agregar a imports
- Crear @ViewChild
- Crear método para abrir
- Agregar botón en navbar

---

## 📊 Comparación de Drivers

| Driver | Intro | Action | Confirm | Complete |
|--------|-------|--------|---------|----------|
| **Voice** | Intro del sistema | Solicitar refacción | Confirmar | Éxito |
| **SpareParts** | Bienvenida | Buscar en inventario | Verificar stock | Éxito |
| **Tools** | Herramientas disponibles | Buscar herramienta | Verificar dispo | Éxito |
| **Maintenance** | Reporte problemas | Describir problema | Prioridad | Éxito |
| **Admin** | Gestionar solicitudes | Asignar técnico | Confirmar | Actualizado |

---

## 🎨 Styling consistente

Todos los drivers deben usar:
- Misma estructura de modal
- Mismos colores de estado
- Mismo sistema de pasos
- Mismo tamaño de botones
- Mismo spacing y padding

Usa variables CSS para consistencia:

```css
:root {
  --driver-modal-width: 600px;
  --driver-border-radius: 16px;
  --driver-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  --color-intro: #2196f3;
  --color-action: #9c27b0;
  --color-confirm: #ff9800;
  --color-complete: #4caf50;
}
```

---

## ✅ Checklist para nuevo driver

- [ ] Crear archivo componente en `src/app/shared/components/drivers/`
- [ ] Extender `BaseDriverComponent`
- [ ] Implementar métodos abstractos
- [ ] Agregar template con 4 steps
- [ ] Agregar estilos consistentes
- [ ] Importar en `app.ts`
- [ ] Agregar `@ViewChild`
- [ ] Crear método para abrir
- [ ] Agregar botón en navbar
- [ ] Documentar en README
- [ ] Probar en desarrollo
- [ ] Verificar multiidioma

---

## 🚀 Orden recomendado de implementación

### Fase 2 (Semana 1-2)
1. ✅ IntroDriver (actual)
2. SparePartsDriver (refacciones)

### Fase 3 (Semana 3-4)
3. ToolsDriver (herramientas)
4. Backend API para persistencia

### Fase 4 (Semana 5-6)
5. MaintenanceDriver (mantenimiento)
6. Dashboard de solicitudes

### Fase 5 (Semana 7+)
7. AdminDriver (gestión)
8. Reportes y estadísticas

---

## 📚 Referencias

- Base Driver: Clase abstracta reutilizable
- VoiceDriverService: Para síntesis y audio
- Material Design: Para UI consistente
- RxJS: Para manejo reactivo

---

**¡Éxito creando nuevos drivers!** 🚀
