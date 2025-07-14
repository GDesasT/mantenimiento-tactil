import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TouchButtonComponent } from '../../shared/components/touch-button/touch-button';
import { MachineService } from '../../core/services/machine';
import { PartService } from '../../core/services/part';
import { DatabaseService } from '../../core/services/database';
import { Machine, PartCategory } from '../../core/models';

@Component({
  selector: 'app-machine-list',
  standalone: true,
  imports: [CommonModule, TouchButtonComponent],
  template: `
    <div class="app-container">
      <!-- Header profesional -->
      <div class="professional-header">
        <div class="header-content">
          <div class="header-left">
            <app-touch-button
              variant="secondary"
              size="md"
              icon="←"
              (clicked)="goBack()"
              class="back-btn"
            >
              Atrás
            </app-touch-button>

            <div class="header-text">
              <h2 class="header-title">{{ getAreaTitle() }}</h2>
              <p class="header-subtitle">Gestión de máquinas industriales</p>
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

      <div class="content-area">
        <!-- Lista de máquinas -->
        <div *ngIf="machines.length > 0" class="machines-container">
          <div
            *ngFor="let machine of machines; let i = index"
            class="machine-card"
          >
            <!-- Header de máquina -->
            <div class="machine-header">
              <div class="machine-icon">{{ getAreaIcon() }}</div>
              <h3 class="machine-name">{{ machine.name }}</h3>
              <span class="machine-badge">{{ getAreaLabel() }}</span>
            </div>

            <!-- Estadísticas -->
            <div class="machine-stats" *ngIf="machineStats[machine.id!]">
              <div class="stat-item stat-blue">
                <div class="stat-number">
                  {{ machineStats[machine.id!].mecanica }}
                </div>
                <div class="stat-label">MECÁNICAS</div>
              </div>
              <div class="stat-item stat-yellow">
                <div class="stat-number">
                  {{ machineStats[machine.id!].electronica }}
                </div>
                <div class="stat-label">ELECTRÓNICAS</div>
              </div>
              <div class="stat-item stat-green">
                <div class="stat-number">
                  {{ machineStats[machine.id!].consumible }}
                </div>
                <div class="stat-label">CONSUMIBLES</div>
              </div>
            </div>

            <!-- Estadísticas placeholder -->
            <div class="machine-stats" *ngIf="!machineStats[machine.id!]">
              <div class="stat-item stat-gray">
                <div class="stat-number">0</div>
                <div class="stat-label">MECÁNICAS</div>
              </div>
              <div class="stat-item stat-gray">
                <div class="stat-number">0</div>
                <div class="stat-label">ELECTRÓNICAS</div>
              </div>
              <div class="stat-item stat-gray">
                <div class="stat-number">0</div>
                <div class="stat-label">CONSUMIBLES</div>
              </div>
            </div>

            <!-- Botones de acción -->
            <div class="machine-actions">
              <app-touch-button
                variant="primary"
                size="lg"
                icon="🔧"
                [fullWidth]="true"
                (clicked)="viewParts(machine)"
                class="main-action"
              >
                Ver Refacciones
              </app-touch-button>

              <div class="secondary-actions">
                <app-touch-button
                  variant="warning"
                  size="md"
                  icon="✏️"
                  (clicked)="editMachine(machine)"
                >
                  Editar
                </app-touch-button>

                <app-touch-button
                  variant="danger"
                  size="md"
                  icon="🗑️"
                  (clicked)="deleteMachine(machine)"
                >
                  Eliminar
                </app-touch-button>
              </div>
            </div>
          </div>
        </div>

        <!-- Estado vacío -->
        <div *ngIf="machines.length === 0 && !isLoading" class="empty-state">
          <div class="empty-icon">{{ getAreaIcon() }}</div>
          <h3 class="empty-title">No hay máquinas registradas</h3>
          <p class="empty-message">
            Comienza agregando la primera máquina en
            {{ getAreaLabel().toLowerCase() }}
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

        <!-- Loading -->
        <div *ngIf="isLoading" class="loading-state">
          <div class="loading-spinner"></div>
          <span class="loading-text">Cargando máquinas...</span>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .app-container {
        min-height: 100vh;
        background: var(--gray-50);
      }

      .professional-header {
        background: var(--gradient-primary);
        color: white;
        padding: 1.5rem 2rem;
        border-bottom: 3px solid var(--primary-700);
      }

      .header-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        max-width: 1400px;
        margin: 0 auto;
      }

      .header-left {
        display: flex;
        align-items: center;
        gap: 1.5rem;
      }

      .header-title {
        font-size: 2rem;
        font-weight: bold;
        margin: 0 0 0.25rem 0;
      }

      .header-subtitle {
        color: rgba(255, 255, 255, 0.9);
        margin: 0;
        font-size: 1rem;
      }

      .content-area {
        padding: 2rem;
        max-width: 1400px;
        margin: 0 auto;
      }

      .machines-container {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
        gap: 2rem;
      }

      .machine-card {
        background: white;
        border-radius: var(--border-radius-lg);
        box-shadow: var(--shadow-md);
        border: 1px solid var(--gray-200);
        padding: 1.5rem;
        transition: all 0.2s ease;
      }

      .machine-card:hover {
        box-shadow: var(--shadow-lg);
        transform: translateY(-2px);
      }

      .machine-header {
        text-align: center;
        margin-bottom: 1.5rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid var(--gray-200);
      }

      .machine-icon {
        font-size: 4rem;
        margin-bottom: 1rem;
      }

      .machine-name {
        font-size: 1.5rem;
        font-weight: bold;
        color: var(--gray-900);
        margin: 0 0 0.5rem 0;
      }

      .machine-badge {
        background: var(--primary-100);
        color: var(--primary-800);
        padding: 0.25rem 0.75rem;
        border-radius: 9999px;
        font-size: 0.875rem;
        font-weight: 600;
      }

      .machine-stats {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 0.5rem;
        margin-bottom: 1.5rem;
      }

      .stat-item {
        text-align: center;
        padding: 1rem 0.5rem;
        border-radius: var(--border-radius-md);
        background: var(--gray-50);
      }

      .stat-blue {
        background: var(--primary-50);
      }

      .stat-yellow {
        background: #fef3c7;
      }

      .stat-green {
        background: #ecfdf5;
      }

      .stat-gray {
        background: var(--gray-100);
      }

      .stat-number {
        font-size: 2rem;
        font-weight: bold;
        margin-bottom: 0.25rem;
      }

      .stat-blue .stat-number {
        color: var(--primary-600);
      }

      .stat-yellow .stat-number {
        color: #d97706;
      }

      .stat-green .stat-number {
        color: #059669;
      }

      .stat-gray .stat-number {
        color: var(--gray-500);
      }

      .stat-label {
        font-size: 0.75rem;
        font-weight: 600;
        color: var(--gray-600);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .machine-actions {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .secondary-actions {
        display: flex;
        gap: 0.75rem;
      }

      .secondary-actions app-touch-button {
        flex: 1;
      }

      .empty-state {
        text-align: center;
        padding: 4rem 2rem;
        background: white;
        border-radius: var(--border-radius-lg);
        box-shadow: var(--shadow-md);
        border: 2px dashed var(--gray-300);
      }

      .empty-icon {
        font-size: 6rem;
        margin-bottom: 1.5rem;
        opacity: 0.6;
      }

      .empty-title {
        font-size: 1.5rem;
        font-weight: bold;
        color: var(--gray-900);
        margin-bottom: 1rem;
      }

      .empty-message {
        color: var(--gray-600);
        margin-bottom: 2rem;
        font-size: 1.125rem;
      }

      .loading-state {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 1rem;
        padding: 4rem;
        text-align: center;
      }

      .loading-spinner {
        width: 2rem;
        height: 2rem;
        border: 3px solid var(--gray-300);
        border-top: 3px solid var(--primary-600);
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }

      .loading-text {
        color: var(--gray-600);
        font-size: 1.125rem;
      }

      @keyframes spin {
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(360deg);
        }
      }

      /* Responsive */
      @media (max-width: 768px) {
        .header-content {
          flex-direction: column;
          gap: 1rem;
          text-align: center;
        }

        .header-left {
          flex-direction: column;
          gap: 1rem;
        }

        .content-area {
          padding: 1rem;
        }

        .machines-container {
          grid-template-columns: 1fr;
          gap: 1.5rem;
        }

        .machine-stats {
          grid-template-columns: 1fr;
          gap: 0.75rem;
        }

        .secondary-actions {
          flex-direction: column;
        }
      }

      @media (max-width: 480px) {
        .professional-header {
          padding: 1rem;
        }

        .machine-card {
          padding: 1rem;
        }
      }
    `,
  ],
})
export class MachineListComponent implements OnInit {
  selectedArea: 'corte' | 'costura' = 'costura';
  machines: Machine[] = [];
  machineStats: { [key: number]: { [key in PartCategory]: number } } = {};
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private machineService: MachineService,
    private partService: PartService,
    private databaseService: DatabaseService
  ) {}

  async ngOnInit() {
    this.route.params.subscribe((params) => {
      this.selectedArea = params['area'] || 'costura';
      this.loadMachines();
    });

    try {
      await this.databaseService.initializeDatabase();
    } catch (error) {
      console.error('Error initializing database:', error);
    }
  }

  loadMachines() {
    this.isLoading = true;
    this.machineService.getMachinesByArea(this.selectedArea).subscribe({
      next: async (machines) => {
        this.machines = machines;

        for (const machine of this.machines) {
          if (machine.id) {
            try {
              const stats = await this.partService.getPartStats(machine.id);
              this.machineStats[machine.id] = stats;
            } catch (error) {
              console.error(
                `Error loading stats for machine ${machine.id}:`,
                error
              );
              this.machineStats[machine.id] = {
                mecanica: 0,
                electronica: 0,
                consumible: 0,
              };
            }
          }
        }

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
    this.router.navigate(['/machines', this.selectedArea, machine.id, 'parts']);
  }

  addMachine() {
    console.log('➕ Add new machine to:', this.selectedArea);
    alert(
      `Funcionalidad de agregar máquina en ${this.selectedArea} pendiente de implementar`
    );
  }

  editMachine(machine: Machine) {
    console.log('✏️ Edit machine:', machine.name);
    alert(
      `Editar máquina: ${machine.name}\n\nFuncionalidad pendiente de implementar`
    );
  }

  deleteMachine(machine: Machine) {
    if (
      confirm(
        `¿Estás seguro de eliminar la máquina "${machine.name}"?\n\nEsta acción también eliminará todas sus refacciones asociadas.`
      )
    ) {
      this.machineService.deleteMachine(machine.id!).subscribe({
        next: () => {
          console.log('🗑️ Machine deleted:', machine.name);
          alert(`Máquina "${machine.name}" eliminada exitosamente`);
          this.loadMachines();
        },
        error: (error) => {
          console.error('Error deleting machine:', error);
          alert('Error al eliminar la máquina. Intenta nuevamente.');
        },
      });
    }
  }
}
