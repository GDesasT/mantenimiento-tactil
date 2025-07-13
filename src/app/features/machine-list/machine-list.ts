import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TouchButtonComponent } from '../../shared/components/touch-button/touch-button';
import { MachineService } from '../../core/services/machine';
import { DatabaseService } from '../../core/services/database';
import { Machine } from '../../core/models';

@Component({
  selector: 'app-machine-list',
  standalone: true,
  imports: [CommonModule, TouchButtonComponent],
  template: `
    <div class="machine-list-container slide-up">
      <!-- Header con navegación mejorado -->
      <div class="glass-effect rounded-3xl p-8 mb-12">
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <app-touch-button
              variant="secondary"
              size="md"
              icon="←"
              (clicked)="goBack()"
              class="mr-6"
            >
              Atrás
            </app-touch-button>

            <div>
              <h2 class="text-4xl font-black gradient-text mb-2">
                {{ getAreaTitle() }}
              </h2>
              <p class="text-xl text-gray-600 font-medium">
                Gestión de máquinas de {{ selectedArea }}
              </p>
            </div>
          </div>

          <app-touch-button
            variant="success"
            size="lg"
            icon="+"
            (clicked)="addMachine()"
          >
            Agregar Máquina
          </app-touch-button>
        </div>
      </div>

      <!-- Lista de máquinas con mejor diseño -->
      <div *ngIf="machines.length > 0" class="machines-grid">
        <div
          *ngFor="let machine of machines; let i = index"
          class="machine-card bounce-in"
          [style.animation-delay]="i * 0.1 + 's'"
        >
          <div class="machine-header mb-6">
            <div class="machine-icon mb-4">
              <span class="text-7xl icon-glow">{{ getAreaIcon() }}</span>
            </div>

            <div class="machine-info text-center">
              <h3 class="machine-name text-2xl font-black text-gray-800 mb-2">
                {{ machine.name }}
              </h3>
              <p class="machine-area text-lg text-gray-600 font-medium">
                {{ getAreaLabel() }}
              </p>
            </div>
          </div>

          <div class="machine-actions space-y-4">
            <app-touch-button
              variant="primary"
              size="lg"
              [fullWidth]="true"
              icon="🔧"
              (clicked)="viewParts(machine)"
            >
              Ver Refacciones
            </app-touch-button>

            <div class="flex gap-4">
              <app-touch-button
                variant="warning"
                size="md"
                icon="✏️"
                (clicked)="editMachine(machine)"
                class="flex-1"
              >
                Editar
              </app-touch-button>

              <app-touch-button
                variant="danger"
                size="md"
                icon="🗑️"
                (clicked)="deleteMachine(machine)"
                class="flex-1"
              >
                Eliminar
              </app-touch-button>
            </div>
          </div>
        </div>
      </div>

      <!-- Estado vacío mejorado -->
      <div *ngIf="machines.length === 0" class="empty-state">
        <div class="glass-effect rounded-3xl p-16 text-center bounce-in">
          <div class="empty-icon mb-8">
            <span class="text-9xl icon-glow pulse-animation">{{
              getAreaIcon()
            }}</span>
          </div>
          <h3 class="text-3xl font-black text-gray-800 mb-6">
            No hay máquinas registradas
          </h3>
          <p class="text-xl text-gray-600 mb-12 max-w-md mx-auto">
            Comienza agregando la primera máquina de {{ selectedArea }} para
            gestionar sus refacciones
          </p>
          <app-touch-button
            variant="success"
            size="xl"
            icon="🚀"
            (clicked)="addMachine()"
          >
            Agregar Primera Máquina
          </app-touch-button>
        </div>
      </div>

      <!-- Loading state mejorado -->
      <div *ngIf="isLoading" class="loading-state">
        <div class="glass-effect rounded-3xl p-16 text-center">
          <div class="loading-spinner mb-6">
            <span class="text-6xl animate-spin">⚙️</span>
          </div>
          <span class="text-2xl font-bold text-gray-700"
            >Cargando máquinas...</span
          >
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .machine-list-container {
        min-height: 70vh;
        padding: 2rem 0;
      }

      .machines-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
        gap: 2rem;
        margin-top: 2rem;
      }

      .machine-card {
        min-height: 400px;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        padding: 2.5rem;
        background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);
        border-left: 6px solid #3b82f6;
        transition: all 0.3s ease;
      }

      .machine-card:hover {
        border-left-color: #1d4ed8;
        transform: translateY(-4px) scale(1.02);
      }

      .machine-header {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
      }

      .machine-icon {
        filter: drop-shadow(0 4px 8px rgba(59, 130, 246, 0.2));
      }

      .machine-actions {
        width: 100%;
        margin-top: auto;
      }

      .empty-state,
      .loading-state {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 400px;
        margin: 2rem 0;
      }

      .empty-icon {
        filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.1));
      }

      .loading-spinner {
        filter: drop-shadow(0 4px 8px rgba(59, 130, 246, 0.3));
      }

      /* Animaciones */
      .animate-spin {
        animation: spin 2s linear infinite;
      }

      @keyframes spin {
        from {
          transform: rotate(0deg);
        }
        to {
          transform: rotate(360deg);
        }
      }

      /* Responsive */
      @media (max-width: 768px) {
        .machines-grid {
          grid-template-columns: 1fr;
          gap: 1.5rem;
        }

        .machine-card {
          min-height: 350px;
          padding: 2rem;
        }

        .glass-effect {
          padding: 1.5rem !important;
        }

        .flex {
          flex-direction: column;
        }

        .flex > * {
          margin-bottom: 0.5rem;
        }
      }
    `,
  ],
})
export class MachineListComponent implements OnInit {
  selectedArea: 'corte' | 'costura' = 'costura';
  machines: Machine[] = [];
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private machineService: MachineService,
    private databaseService: DatabaseService
  ) {}

  async ngOnInit() {
    // Obtener área de la URL
    this.route.params.subscribe((params) => {
      this.selectedArea = params['area'] || 'costura';
      this.loadMachines();
    });

    // Inicializar base de datos
    try {
      await this.databaseService.initializeDatabase();
    } catch (error) {
      console.error('Error initializing database:', error);
    }
  }

  loadMachines() {
    this.isLoading = true;
    this.machineService.getMachinesByArea(this.selectedArea).subscribe({
      next: (machines) => {
        this.machines = machines;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading machines:', error);
        this.isLoading = false;
      },
    });
  }

  getAreaTitle(): string {
    return this.selectedArea === 'corte' ? 'ÁREA DE CORTE' : 'ÁREA DE COSTURA';
  }

  getAreaLabel(): string {
    return this.selectedArea === 'corte'
      ? 'Corte Industrial'
      : 'Costura Industrial';
  }

  getAreaIcon(): string {
    return this.selectedArea === 'corte' ? '✂️' : '🧵';
  }

  goBack() {
    this.router.navigate(['/']);
  }

  viewParts(machine: Machine) {
    console.log('🔧 View parts for:', machine.name);
    alert(`Ver refacciones de: ${machine.name}`);
    // TODO: Navegar a lista de refacciones
  }

  addMachine() {
    console.log('➕ Add new machine to:', this.selectedArea);
    this.router.navigate(['/machines', this.selectedArea, 'add']);
  }

  editMachine(machine: Machine) {
    console.log('✏️ Edit machine:', machine.name);
    alert(`Editar máquina: ${machine.name}`);
    // TODO: Navegar a formulario de editar
  }

  deleteMachine(machine: Machine) {
    if (confirm(`¿Estás seguro de eliminar la máquina "${machine.name}"?`)) {
      this.machineService.deleteMachine(machine.id!).subscribe({
        next: () => {
          console.log('🗑️ Machine deleted');
          this.loadMachines(); // Recargar lista
        },
        error: (error) => {
          console.error('Error deleting machine:', error);
          alert('Error al eliminar la máquina');
        },
      });
    }
  }
}
