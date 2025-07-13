import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TouchButtonComponent } from '../../shared/components/touch-button/touch-button';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, TouchButtonComponent],
  template: `
    <div class="home-container slide-up">
      <div class="text-center mb-16">
        <h2 class="text-5xl font-black gradient-text mb-6 text-shadow">
          Sistema de Mantenimiento Táctil
        </h2>
        <p class="text-2xl text-gray-600 font-medium">
          Selecciona el área de trabajo
        </p>
      </div>

      <div
        class="area-selector grid grid-cols-1 md:grid-cols-2 gap-12 max-w-6xl mx-auto"
      >
        <!-- Área de Corte -->
        <div
          class="area-card bounce-in"
          (click)="selectArea('corte')"
          style="animation-delay: 0.1s;"
        >
          <div class="area-icon mb-8">
            <span class="text-9xl icon-glow pulse-animation">✂️</span>
          </div>
          <div class="area-info mb-8">
            <h3
              class="area-title text-4xl font-black text-gray-800 mb-4 tracking-tight"
            >
              ÁREA DE CORTE
            </h3>
            <p class="area-description text-xl text-gray-600 font-medium">
              Máquinas de corte industrial
            </p>
          </div>
          <app-touch-button
            variant="primary"
            size="xl"
            [fullWidth]="true"
            icon="🚀"
            (clicked)="selectArea('corte')"
            class="transform transition-all duration-300"
          >
            INGRESAR A CORTE
          </app-touch-button>
        </div>

        <!-- Área de Costura -->
        <div
          class="area-card bounce-in"
          (click)="selectArea('costura')"
          style="animation-delay: 0.3s;"
        >
          <div class="area-icon mb-8">
            <span class="text-9xl icon-glow pulse-animation">🧵</span>
          </div>
          <div class="area-info mb-8">
            <h3
              class="area-title text-4xl font-black text-gray-800 mb-4 tracking-tight"
            >
              ÁREA DE COSTURA
            </h3>
            <p class="area-description text-xl text-gray-600 font-medium">
              Máquinas de costura industrial
            </p>
          </div>
          <app-touch-button
            variant="primary"
            size="xl"
            [fullWidth]="true"
            icon="⚡"
            (clicked)="selectArea('costura')"
            class="transform transition-all duration-300"
          >
            INGRESAR A COSTURA
          </app-touch-button>
        </div>
      </div>

      <div class="quick-actions mt-20 slide-up" style="animation-delay: 0.5s;">
        <div class="glass-effect rounded-3xl p-8 mx-auto max-w-4xl">
          <h3 class="text-2xl font-bold text-center text-gray-800 mb-8">
            Acciones Rápidas
          </h3>
          <div class="flex flex-wrap justify-center gap-6">
            <app-touch-button
              variant="success"
              size="lg"
              icon="➕"
              (clicked)="addMachine()"
            >
              Agregar Máquina
            </app-touch-button>

            <app-touch-button
              variant="warning"
              size="lg"
              icon="🔍"
              (clicked)="globalSearch()"
            >
              Búsqueda Global
            </app-touch-button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .home-container {
        padding: 3rem 0;
        min-height: 85vh;
      }

      .area-card {
        min-height: 500px;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        padding: 4rem 3rem;
        cursor: pointer;
      }

      .area-icon {
        filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
      }

      .quick-actions {
        border-top: 3px solid rgba(59, 130, 246, 0.2);
        padding-top: 3rem;
      }

      @media (max-width: 768px) {
        .area-card {
          min-height: 400px;
          padding: 2rem;
        }

        .text-5xl {
          font-size: 2.5rem;
        }

        .text-9xl {
          font-size: 4rem;
        }
      }
    `,
  ],
})
export class HomeComponent {
  constructor(private router: Router) {}

  selectArea(area: 'corte' | 'costura') {
    console.log(`📍 Navigating to ${area} machines`);
    this.router.navigate(['/machines', area]);
  }

  addMachine() {
    console.log('➕ Add machine - showing area selector');
    alert(
      'Selecciona primero un área (Corte o Costura) y luego usa el botón "Agregar Máquina"'
    );
  }

  globalSearch() {
    console.log('🔍 Global search');
    alert('Función: Búsqueda global (próximamente)');
  }
}
