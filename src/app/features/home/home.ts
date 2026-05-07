import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TouchButtonComponent } from '../../shared/components/touch-button/touch-button';
import { AreaService } from '../../core/services/area';
import { Area } from '../../core/models/area.model';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

// Mapeos visuales para darle estilo family friendly a items dinámicos
const VISUAL_MAPPINGS: Record<string, { icon: string; cls: string }> = {
  'corte': { icon: '✂️', cls: 'corte-area' },
  'costura': { icon: '🧵', cls: 'costura-area' },
  'consumibles': { icon: '💡', cls: 'consumible-area' },
  'mantenimiento': { icon: '🛠️', cls: 'herramientas-area' },
  'calidad': { icon: '🔍', cls: 'quimicos-area' },
  'limpieza': { icon: '🧹', cls: 'consumible-area' },
  'herramientas': { icon: '🧰', cls: 'herramientas-area' },
  'soldadura': { icon: '🔥', cls: 'corte-area' },
};

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, TouchButtonComponent],
  template: `
    <div class="app-container">
      <div class="section-header text-center mb-8">
        <h1 class="text-4xl font-bold text-gradient-pro mb-4">
          Sistema de Gestión de Refacciones
        </h1>
        <p class="text-xl text-gray-600">Selecciona el área de inventario</p>
      </div>

      <!-- Inventario General Fijo -->
      <div class="max-w-6xl mx-auto mb-12">
        <h3 class="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <span class="text-blue-600">📦</span> Inventario General
        </h3>
        <div class="professional-grid grid-2 mb-8">
          <div class="area-card inventario-general" (click)="goToGeneral()">
             <div class="area-content justify-center select-none">
                <div class="area-icon mb-4">
                  <span class="icon-emoji">📋</span>
                </div>
                <h2 class="area-title text-3xl">Todas las Refacciones</h2>
                <p class="area-subtitle">Catálogo general (Búsqueda global)</p>
             </div>
          </div>
          
          <div class="area-card manuales-area" (click)="goToManuals()">
             <div class="area-content justify-center select-none">
                <div class="area-icon mb-4">
                  <span class="icon-emoji">📖</span>
                </div>
                <h2 class="area-title text-3xl">MANUALES</h2>
                <p class="area-subtitle">Documentación técnica de máquinas</p>
             </div>
          </div>
        </div>
      </div>

      <!-- Áreas Dinámicas desde API -->
      <div class="max-w-8xl mx-auto mb-12">
        <h3 class="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <span class="text-blue-600">🏭</span> Áreas Operativas
        </h3>
        
        <div class="professional-grid grid-3" *ngIf="areas$ | async as areas">
          <!-- Mostrar items desde el backend si existen -->
          <div *ngFor="let area of areas; let i = index" 
               class="area-card" 
               [ngClass]="getVisualClass(area.name)"
               (click)="selectArea(area.name)">
            <div class="area-content">
              <div class="area-icon">
                <span class="icon-emoji">{{ getVisualIcon(area.name) }}</span>
              </div>
              <h2 class="area-title">{{ area.name | uppercase }}</h2>
              <p class="area-subtitle">{{ area.description || 'Máquinas y Refacciones' }}</p>
              
              <app-touch-button
                variant="primary"
                size="xl"
                [fullWidth]="true"
                (clicked)="selectArea(area.name)"
                class="area-action-btn"
              >
                INGRESAR AL ÁREA
              </app-touch-button>
            </div>
          </div>

          <!-- Si el backend no contesta, o está vacío, fallback visual -->
          <ng-container *ngIf="areas.length === 0">
             <div class="area-card corte-area" (click)="selectArea('Corte')">
               <div class="area-content">
                 <div class="area-icon"><span class="icon-emoji">✂️</span></div>
                 <h2 class="area-title">CORTE</h2>
                 <p class="area-subtitle">Fallback offline</p>
               </div>
             </div>
             <div class="area-card costura-area" (click)="selectArea('Costura')">
               <div class="area-content">
                 <div class="area-icon"><span class="icon-emoji">🧵</span></div>
                 <h2 class="area-title">COSTURA</h2>
                 <p class="area-subtitle">Fallback offline</p>
               </div>
             </div>
             <div class="area-card consumible-area" (click)="selectArea('Consumibles')">
               <div class="area-content">
                 <div class="area-icon"><span class="icon-emoji">💡</span></div>
                 <h2 class="area-title">CONSUMIBLES</h2>
                 <p class="area-subtitle">Fallback offline</p>
               </div>
             </div>
          </ng-container>
        </div>
      </div>

    </div>
  `,
  styles: [
    `
      .area-card {
        min-height: 250px;
        border-radius: var(--border-radius-xl);
        padding: 2rem;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: var(--shadow-lg);
        position: relative;
        overflow: hidden;
        background: var(--gradient-surface);
        user-select: none;
      }
      .area-card:hover { transform: translateY(-5px) scale(1.02); }
      
      .inventario-general {
        background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
        color: white;
      }
      .manuales-area {
        background: linear-gradient(135deg, #4338ca 0%, #8b5cf6 100%);
        color: white;
      }
      .corte-area { background: var(--gradient-primary); color: white; }
      .costura-area { background: linear-gradient(135deg, #047857 0%, #34d399 100%); color: white; }
      .consumible-area { background: linear-gradient(135deg, #b45309 0%, #fbbf24 100%); color: white; }
      .herramientas-area { background: linear-gradient(135deg, #374151 0%, #9ca3af 100%); color: white; }
      .quimicos-area { background: linear-gradient(135deg, #6b21a8 0%, #d8b4fe 100%); color: white; }
      .default-area { background: linear-gradient(135deg, #0f766e 0%, #14b8a6 100%); color: white; }

      .area-content {
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        z-index: 1;
      }
      .area-icon {
        padding: 1rem;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 50%;
        backdrop-filter: blur(10px);
        margin-bottom: 1rem;
      }
      .icon-emoji { font-size: 3rem; }
      .area-title { font-size: 1.5rem; font-weight: 800; letter-spacing: 0.05em; margin-bottom: 0.5rem; }
      .area-subtitle { font-size: 1rem; opacity: 0.9; margin-bottom: 1.5rem; }
      .area-action-btn { margin-top: auto; }
    `
  ]
})
export class HomeComponent implements OnInit {
  areas$: Observable<Area[]> = of([]);

  constructor(
    private router: Router,
    private areaService: AreaService
  ) {}

  ngOnInit() {
    this.areas$ = this.areaService.loadAreas().pipe(
      catchError(err => {
        console.error('Cant load API areas, using fallback', err);
        return of([]);
      })
    );
  }

  // Normaliza el nombre para que "Áreas de Corte", "Corte", "Sala de corte" mapeen al visual correcto
  private normalizeKey(name: string): string {
    const lower = name.toLowerCase();
    for (const key of Object.keys(VISUAL_MAPPINGS)) {
      if (lower.includes(key)) return key;
    }
    return '';
  }

  getVisualClass(name: string): string {
    const key = this.normalizeKey(name);
    return VISUAL_MAPPINGS[key]?.cls || 'default-area';
  }

  getVisualIcon(name: string): string {
    const key = this.normalizeKey(name);
    return VISUAL_MAPPINGS[key]?.icon || '📦';
  }

  goToGeneral() {
    this.router.navigate(['/search']);
  }

  goToManuals() {
    this.router.navigate(['/manuales']);
  }

  selectArea(areaName: string) {
    const segment = areaName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    this.router.navigate(['/machines', segment]);
  }
}
