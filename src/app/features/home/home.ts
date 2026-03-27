import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TouchButtonComponent } from '../../shared/components/touch-button/touch-button';
import { HomeTourService } from '../../core/services/home-tour.service';

// Declarar electron como variable global
declare global {
  interface Window {
    electron?: any;
  }
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, TouchButtonComponent],
  template: `
    <div class="app-container">
      <!-- Header profesional -->
      <div class="section-header text-center mb-8">
        <h1 class="text-4xl font-bold text-gradient-pro mb-4">
          Sistema de Gestión de Refacciones
        </h1>
        <p class="text-xl text-gray-600">Selecciona el área de trabajo</p>
      </div>

      <!-- Áreas principales usando tu sistema -->
      <div class="professional-grid grid-3 max-w-8xl mx-auto mb-12" #areasPanel>
        <!-- Área de Corte -->
        <div class="area-card corte-area" (click)="selectArea('corte')">
          <div class="area-content">
            <div class="area-icon">
              <span class="icon-emoji">✂️</span>
            </div>

            <h2 class="area-title">ÁREA DE CORTE</h2>
            <p class="area-subtitle">Máquinas de corte industrial</p>

            <app-touch-button
              variant="primary"
              size="xl"
              [fullWidth]="true"
              (clicked)="selectArea('corte')"
              class="area-action-btn"
            >
              INGRESAR A CORTE
            </app-touch-button>
          </div>
        </div>

        <!-- Área de Costura -->
        <div class="area-card costura-area" (click)="selectArea('costura')">
          <div class="area-content">
            <div class="area-icon">
              <span class="icon-emoji">🧵</span>
            </div>

            <h2 class="area-title">ÁREA DE COSTURA</h2>
            <p class="area-subtitle">Máquinas de costura industrial</p>

            <app-touch-button
              variant="success"
              size="xl"
              [fullWidth]="true"
              (clicked)="selectArea('costura')"
              class="area-action-btn"
            >
              INGRESAR A COSTURA
            </app-touch-button>
          </div>
        </div>
                      <!-- Área de Consumibles -->
        <div class="area-card consumible-area" (click)="selectArea('consumible')">
          <div class="area-content">
            <div class="area-icon">
              <span class="icon-emoji">💡</span>
            </div>

            <h2 class="area-title">ÁREA DE CONSUMIBLES</h2>
            <p class="area-subtitle">Consumibles industrial</p>

            <app-touch-button
              variant="warning"
              size="xl"
              [fullWidth]="true"
              (clicked)="selectArea('consumible')"
              class="area-action-btn"
            >
              INGRESAR A CONSUMIBLES
            </app-touch-button>
          </div>
        </div>

        <!-- Área de Herramienta -->
        <div class="area-card herramientas-area" (click)="selectArea('herramientas')">
          <div class="area-content">
            <div class="area-icon">
              <span class="icon-emoji">🛠️</span>
            </div>

            <h2 class="area-title">ÁREA DE HERRAMIENTAS</h2>
            <p class="area-subtitle">Herramientas industriales</p>

            <app-touch-button
              variant="info"
              size="xl"
              [fullWidth]="true"
              (clicked)="selectArea('herramientas')"
              class="area-action-btn"
            >
              INGRESAR A HERRAMIENTAS
            </app-touch-button>
          </div>
        </div>

        <!-- Área de Quimicos -->
        <div class="area-card quimicos-area" (click)="selectArea('quimicos')">
          <div class="area-content">
            <div class="area-icon">
              <span class="icon-emoji">🧪</span>
            </div>

            <h2 class="area-title">ÁREA DE QUÍMICOS</h2>
            <p class="area-subtitle">Químicos industriales</p>

            <app-touch-button
              variant="info"
              size="xl"
              [fullWidth]="true"
              (clicked)="selectArea('quimicos')"
              class="area-action-btn"
            >
              INGRESAR A QUÍMICOS
            </app-touch-button>
          </div>
        </div>

        <!-- Área de Tornillos -->
        <div class="area-card tornillos-area" (click)="selectArea('tornillos')">
          <div class="area-content">
            <div class="area-icon">
              <span class="icon-emoji">🔩</span>
            </div>

            <h2 class="area-title">ÁREA DE TORNILLOS</h2>
            <p class="area-subtitle">Tornillos y fasteners</p>

            <app-touch-button
              variant="info"
              size="xl"
              [fullWidth]="true"
              (clicked)="selectArea('tornillos')"
              class="area-action-btn"
            >
              INGRESAR A TORNILLOS
            </app-touch-button>
          </div>
        </div>
      </div>


      <!-- Herramientas adicionales usando tu sistema -->
      <div class="max-w-4xl mx-auto">
        <div class="section-header text-center mb-8">
          <h3 class="text-2xl font-bold text-gray-800 mb-2">
            Herramientas Adicionales
          </h3>
          <p class="text-lg text-gray-600">Gestión avanzada del sistema</p>
        </div>

        <div class="professional-grid grid-2 max-w-4xl mx-auto">
          <!-- Búsqueda Global -->
          <div class="professional-card hover:shadow-lg transition-all">
            <div class="professional-content text-center">
              <div class="tool-icon search-icon mb-4">
                <svg
                  class="w-12 h-12 mx-auto text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  ></path>
                </svg>
              </div>
              <h3 class="text-lg font-bold text-gray-900 mb-2">
                Búsqueda Global
              </h3>
              <p class="text-gray-600 mb-4 text-sm">
                Encuentra cualquier refacción rápidamente
              </p>

              <app-touch-button
                variant="primary"
                size="md"
                icon="🔍"
                [fullWidth]="true"
                (clicked)="globalSearch()"
              >
                BUSCAR
              </app-touch-button>
            </div>
          </div>

          <!-- Importar Excel -->
          <div class="professional-card hover:shadow-lg transition-all">
            <div class="professional-content text-center">
              <div class="tool-icon excel-icon mb-4">
                <svg
                  class="w-12 h-12 mx-auto text-yellow-600"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M14 2H6C4.9 2 4 2.9 4 4v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6z"
                  ></path>
                  <path d="M14 2v6h6"></path>
                </svg>
              </div>
              <h3 class="text-lg font-bold text-gray-900 mb-2">
                Importar Excel
              </h3>
              <p class="text-gray-600 mb-4 text-sm">
                Carga datos masivamente desde archivos
              </p>

              <app-touch-button
                variant="warning"
                size="md"
                icon="📊"
                [fullWidth]="true"
                (clicked)="goToExcelImport()"
              >
                IMPORTAR
              </app-touch-button>
            </div>
          </div>

          <!-- Manuales -->
          </div>
          

        <!-- Botón de verificar actualizaciones -->
        <div class="max-w-md mx-auto mt-8">
          <div class="professional-card hover:shadow-lg transition-all">
            <div class="professional-content text-center">
              <div class="tool-icon mb-4">
                <svg
                  class="w-12 h-12 mx-auto text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </div>

              <h4 class="text-xl font-bold text-gray-800 mb-2">
                Verificar Actualizaciones
              </h4>
              <p class="text-gray-600 text-sm mb-6">
                Busca e instala actualizaciones automáticamente
              </p>

              <app-touch-button
                variant="success"
                size="md"
                icon="🔄"
                [fullWidth]="true"
                (clicked)="checkForUpdates()"
              >
                VERIFICAR ACTUALIZACIONES
              </app-touch-button>
            </div>
          </div>
        </div>
      </div>

  `,
  styles: [
    `
      /* Usando TU sistema existente + complementos mínimos */

      .area-card {
        min-height: 500px;
        border-radius: var(--border-radius-xl);
        padding: 2rem;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: var(--shadow-lg);
        border: 2px solid transparent;
        position: relative;
        overflow: hidden;
        background: var(--gradient-surface);
        user-select: none;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        touch-action: manipulation;
        -webkit-tap-highlight-color: transparent;
      }

      .area-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(
          90deg,
          transparent,
          rgba(255, 255, 255, 0.2),
          transparent
        );
        transition: left 0.5s;
      }

      .area-card:hover::before {
        left: 100%;
      }

      .area-card:hover {
        transform: translateY(-8px) scale(1.02);
        box-shadow: var(--shadow-xl);
      }

      .area-card:active {
        transform: translateY(-4px) scale(0.99);
        box-shadow: var(--shadow-lg);
      }

      .corte-area {
        background: var(--gradient-primary);
        color: white;
      }

      .corte-area:hover {
        background: linear-gradient(
          135deg,
          var(--primary-700) 0%,
          var(--primary-900) 100%
        );
      }

      .costura-area {
        background: linear-gradient(
          135deg,
          #047857 0%,
          #10b981 50%,
          #34d399 100%
        );
        color: white;
      }

      .costura-area:hover {
        background: linear-gradient(
          135deg,
          #065f46 0%,
          #047857 50%,
          #10b981 100%
        );
      }
            .consumible-area {
        background: linear-gradient(
          135deg,
          #783004FF 0%,
          #B96210FF 50%,
          #FFD700FF 100%
        );
        color: white;
      }

      .consumible-area:hover {
        background: linear-gradient(
          135deg,
          #784404FF 0%,
          #B96210FF 50%,
          #FFD700FF 100%
        );
      }
      .herramientas-area {
        background: linear-gradient(
          135deg,
          #4B5563 0%,
          #6B7280 50%,
          #9CA3AF 100%
        );
        color: white;
      }

      .herramientas-area:hover {
        background: linear-gradient(
          135deg,
          #374151 0%,
          #4B5563 50%,
          #6B7280 100%
        );
      }
      .quimicos-area {
        background: linear-gradient(
          135deg,
          #6B21A8 0%,
          #A855F7 50%,
          #E0AAFF 100%
        );
        color: white;
      }

      .quimicos-area:hover {
        background: linear-gradient(
          135deg,
          #581C87 0%,
          #7E22CE 50%,
          #A855F7 100%
        );
      }
      .tornillos-area {
        background: linear-gradient(
          135deg,
          #374151 0%,
          #4B5563 50%,
          #6B7280 100%
        );
        color: white;
      }

      .tornillos-area:hover {
        background: linear-gradient(
          135deg,
          #1F2937 0%,
          #374151 50%,
          #4B5563 100%
        );
      }

      .area-content {
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        position: relative;
        z-index: 1;
      }

      .area-icon {
        margin-bottom: 2rem;
        padding: 1.5rem;
        background: rgba(255, 255, 255, 0.2);
        border-radius: var(--border-radius-xl);
        backdrop-filter: blur(10px);
        display: flex;
        align-items: center;
        justify-content: center;
        border: 1px solid rgba(255, 255, 255, 0.3);
      }

      .icon-emoji {
        font-size: 5rem;
        line-height: 1;
        filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
      }

      .area-title {
        font-size: 2.5rem;
        font-weight: 900;
        margin-bottom: 1rem;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        letter-spacing: 0.05em;
      }

      .area-subtitle {
        font-size: 1.25rem;
        margin-bottom: 3rem;
        opacity: 0.9;
        font-weight: 500;
      }

      .area-action-btn {
        margin-top: auto;
        background: rgba(255, 255, 255, 0.2) !important;
        border: 2px solid rgba(255, 255, 255, 0.3) !important;
        color: white !important;
        backdrop-filter: blur(10px);
        border-radius: var(--border-radius-lg);
      }

      .area-action-btn:hover {
        background: rgba(255, 255, 255, 0.3) !important;
        border-color: rgba(255, 255, 255, 0.5) !important;
        transform: translateY(-2px);
      }

      /* Responsive usando tu sistema */
      @media (max-width: 768px) {
        .professional-grid.grid-2 {
          grid-template-columns: 1fr;
        }

        .area-card {
          min-height: 400px;
          padding: 1.5rem;
        }

        .area-title {
          font-size: 2rem;
        }

        .area-subtitle {
          font-size: 1rem;
        }

        .icon-emoji {
          font-size: 4rem;
        }
      }

      /* Optimización táctil específica */
      @media (hover: hover) {
        .area-card:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: var(--shadow-xl);
        }

        .area-card:hover::before {
          left: 100%;
        }
      }

      @media (hover: none) {
        .area-card:hover {
          transform: none;
          box-shadow: var(--shadow-lg);
        }

        .area-card:hover::before {
          left: -100%;
        }

        .area-card:active {
          transform: scale(0.97);
          box-shadow: var(--shadow-lg);
        }
      }
    `,
  ],
})
export class HomeComponent {
  constructor(
    private router: Router,
    private tourService: HomeTourService
  ) {}

  startTour() {
    this.tourService.startTourWithLanguageSelection();
  }

  selectArea(area: 'corte' | 'costura' | 'consumible' | 'herramientas' | 'quimicos' | 'tornillos') {
    if (area === 'herramientas') {
      console.log(`📍 Navigating to tools`);
      this.router.navigate(['/tools']);
    } else if (area === 'tornillos') {
      console.log(`📍 Navigating to fasteners`);
      this.router.navigate(['/fasteners']);
    } else if (area === 'quimicos') {
      console.log(`📍 Navigating to chemicals`);
      this.router.navigate(['/chemicals']);
    } else {
      console.log(`📍 Navigating to ${area} machines`);
      this.router.navigate(['/machines', area]);
    }
  }

  globalSearch() {
    console.log('🔍 Navigating to global search');
    this.router.navigate(['/search']);
  }

  goToExcelImport() {
    console.log('📊 Navigating to Excel import');
    this.router.navigate(['/excel-import']);
  }

  goToManuales() {
    console.log('📚 Navigating to Manuales');
    this.router.navigate(['/manuales']);
  }

  checkForUpdates() {
    console.log('🔍 Verificando actualizaciones...');
    
    // En desarrollo, mostrar alerta
    if (typeof window !== 'undefined' && !window.electron) {
      alert('Esta función solo está disponible en la aplicación Electron');
      return;
    }

    // En Electron, usar IPC para verificar actualizaciones
    if (window.electron && window.electron.ipcRenderer) {
      window.electron.ipcRenderer.invoke('check-for-updates')
        .then(() => {
          console.log('✅ Verificación de actualizaciones iniciada');
        })
        .catch((error: any) => {
          console.error('❌ Error verificando actualizaciones:', error);
        });
    }
  }
}
