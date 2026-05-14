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
  'corte': { icon: 'bi-scissors', cls: 'pro-area-card' },
  'costura': { icon: 'bi-hexagon', cls: 'pro-area-card' },
  'consumibles': { icon: 'bi-lightbulb-fill', cls: 'pro-area-card' },
  'mantenimiento': { icon: 'bi-tools', cls: 'pro-area-card' },
  'calidad': { icon: 'bi-search', cls: 'pro-area-card' },
  'limpieza': { icon: 'bi-droplet-fill', cls: 'pro-area-card' },
  'herramientas': { icon: 'bi-briefcase-fill', cls: 'pro-area-card' },
  'soldadura': { icon: 'bi-fire', cls: 'pro-area-card' },
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
          <i class="bi bi-box-seam-fill text-blue-600"></i> Inventario General
        </h3>
        <div class="professional-grid grid-2 mb-8">
          <div class="area-card inventario-general" (click)="goToGeneral()">
             <div class="area-content justify-center select-none">
                <div class="area-icon mb-4">
                  <i class="bi bi-clipboard-data-fill area-bi-icon"></i>
                </div>
                <h2 class="area-title text-3xl">Todas las Refacciones</h2>
                <p class="area-subtitle">Catálogo general (Búsqueda global)</p>
             </div>
          </div>
          
          <div class="area-card manuales-area" (click)="goToManuals()">
             <div class="area-content justify-center select-none">
                <div class="area-icon mb-4">
                  <i class="bi bi-book-half area-bi-icon"></i>
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
          <i class="bi bi-building text-blue-600"></i> Áreas Operativas
        </h3>
        
        <div class="professional-grid grid-3" *ngIf="areas$ | async as areas">
          <!-- Mostrar items desde el backend si existen -->
          <div *ngFor="let area of areas; let i = index" 
               class="area-card" 
               [ngClass]="getVisualClass(area.name)"
               (click)="selectArea(area.name)">
            <div class="area-content">
              <div class="area-icon">
                <i class="bi" [ngClass]="getVisualIcon(area.name)" style="font-size: 3rem;"></i>
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
             <div class="area-card pro-area-card" (click)="selectArea('Corte')">
               <div class="area-content">
                 <div class="area-icon"><i class="bi bi-scissors area-bi-icon"></i></div>
                 <h2 class="area-title">CORTE</h2>
                 <p class="area-subtitle">Fallback offline</p>
               </div>
             </div>
             <div class="area-card pro-area-card" (click)="selectArea('Costura')">
               <div class="area-content">
                 <div class="area-icon"><i class="bi bi-hexagon area-bi-icon"></i></div>
                 <h2 class="area-title">COSTURA</h2>
                 <p class="area-subtitle">Fallback offline</p>
               </div>
             </div>
             <div class="area-card pro-area-card" (click)="selectArea('Consumibles')">
               <div class="area-content">
                 <div class="area-icon"><i class="bi bi-lightbulb-fill area-bi-icon"></i></div>
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
        border-radius: 1.5rem;
        padding: 2.5rem 2rem;
        cursor: pointer;
        transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
        position: relative;
        overflow: hidden;
        background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
        border: 1px solid rgba(226, 232, 240, 0.8);
        user-select: none;
      }
      .area-card:hover { 
        transform: translateY(-8px) scale(1.02); 
        box-shadow: 0 25px 35px -5px rgba(15, 23, 42, 0.1), 0 15px 15px -5px rgba(15, 23, 42, 0.04);
        border-color: rgba(59, 130, 246, 0.5); /* blue-500 */
      }
      
      .inventario-general {
        background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%); /* slate-900 to blue-900 */
        color: white;
        border: 1px solid rgba(255, 255, 255, 0.1);
      }
      .inventario-general .area-title { color: white; }
      .inventario-general .area-subtitle, .manuales-area .area-subtitle {
        color: rgba(255, 255, 255, 0.8);
      }
      .manuales-area {
        background: linear-gradient(135deg, #1e1b4b 0%, #4338ca 100%); /* indigo-950 to indigo-700 */
        color: white;
        border: 1px solid rgba(255, 255, 255, 0.1);
      }
      .manuales-area .area-title { color: white; }
      
      .pro-area-card { 
        background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
        color: #0f172a;
      }

      .area-content {
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        z-index: 1;
      }
      .area-icon {
        padding: 1.25rem;
        background: #f1f5f9; /* slate-100 */
        border-radius: 1rem;
        box-shadow: inset 0 2px 4px 0 rgba(0,0,0,0.02);
        margin-bottom: 1.5rem;
        color: #3b82f6;
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      }
      .area-card:hover .area-icon {
        background: #3b82f6;
        color: white;
        transform: scale(1.05) translateY(-5px);
        box-shadow: 0 10px 20px -5px rgba(59, 130, 246, 0.4);
      }
      
      .inventario-general .area-icon, .manuales-area .area-icon {
        background: rgba(255, 255, 255, 0.2);
        color: white;
      }
      .inventario-general:hover .area-icon, .manuales-area:hover .area-icon {
        background: white;
        color: #1e3a8a;
      }
      
      .area-bi-icon { font-size: 3rem; display: block; line-height: 1; }
      .area-title { font-size: 1.5rem; font-weight: 800; letter-spacing: -0.025em; margin-bottom: 0.5rem; color: #0f172a; }
      .area-subtitle { font-size: 1rem; color: #64748b; margin-bottom: 1.5rem; line-height: 1.5; font-weight: 500; }
      .area-action-btn { margin-top: auto; }

      .professional-grid {
        display: grid;
        gap: 2rem;
      }
      .grid-2 { grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); }
      .grid-3 { grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); }
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
    return VISUAL_MAPPINGS[key]?.cls || 'pro-area-card';
  }

  getVisualIcon(name: string): string {
    const key = this.normalizeKey(name);
    return VISUAL_MAPPINGS[key]?.icon || 'bi-box-seam-fill';
  }

  goToGeneral() {
    this.router.navigate(['/search']);
  }

  goToManuals() {
    this.router.navigate(['/manuales']);
  }

  selectArea(areaName: string) {
    const segment = areaName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    this.router.navigate(['/areas', segment, 'parts']);
  }
}
