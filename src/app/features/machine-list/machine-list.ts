import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TouchButtonComponent } from '../../shared/components/touch-button/touch-button';
import { MachineService } from '../../core/services/machine';
import { PartService } from '../../core/services/part';
import { DatabaseService } from '../../core/services/database';
import { Machine, PartCategory } from '../../core/models';

@Component({
  selector: 'app-machine-list',
  standalone: true,
  imports: [CommonModule, FormsModule, TouchButtonComponent],
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

          <div class="header-actions">
            <!-- Admin mode toggle -->
            <div class="admin-section">
              <app-touch-button
                *ngIf="!isAdminMode"
                variant="secondary"
                size="md"
                icon="⚙️"
                (clicked)="toggleAdminMode()"
                class="admin-gear"
              >
                Modo Admin
              </app-touch-button>

              <app-touch-button
                *ngIf="isAdminMode"
                variant="warning"
                size="md"
                icon="🔓"
                (clicked)="exitAdminMode()"
                class="admin-active"
              >
                Salir Admin
              </app-touch-button>
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
                  *ngIf="isAdminMode"
                  variant="warning"
                  size="md"
                  icon="✏️"
                  (clicked)="editMachine(machine)"
                >
                  Editar
                </app-touch-button>

                <app-touch-button
                  *ngIf="isAdminMode"
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

      <!-- Notificaciones -->
      <div
        *ngIf="showNotification"
        class="notification"
        [class]="notificationType + '-notification'"
      >
        <div class="notification-content">
          <span class="notification-icon">{{ getNotificationIcon() }}</span>
          <span class="notification-text">{{ notificationMessage }}</span>
        </div>
      </div>

      <!-- Modal de confirmación -->
      <div *ngIf="showConfirmation" class="confirmation-overlay">
        <div class="confirmation-modal">
          <div class="confirmation-header">
            <h3 class="confirmation-title">{{ confirmationTitle }}</h3>
            <span class="confirmation-icon">⚠️</span>
          </div>

          <div class="confirmation-content">
            <p class="confirmation-message">{{ confirmationMessage }}</p>
          </div>

          <div class="confirmation-actions">
            <app-touch-button
              variant="secondary"
              size="lg"
              (clicked)="hideConfirmation()"
              [fullWidth]="true"
            >
              Cancelar
            </app-touch-button>

            <app-touch-button
              variant="danger"
              size="lg"
              (clicked)="confirmDelete()"
              [fullWidth]="true"
            >
              Eliminar
            </app-touch-button>
          </div>
        </div>
      </div>

      <!-- Modal de contraseña de administrador -->
      <div *ngIf="showAdminModal" class="confirmation-overlay">
        <div class="confirmation-modal admin-modal">
          <div class="confirmation-header admin-header">
            <h3 class="confirmation-title">Modo Administrador</h3>
            <span class="confirmation-icon">🔐</span>
          </div>

          <div class="confirmation-content">
            <p class="confirmation-message">
              Ingresa la contraseña de administrador para habilitar las opciones
              de edición y eliminación de máquinas.
            </p>

            <!-- Campo de contraseña -->
            <div class="password-section">
              <label class="password-label">
                <span class="password-icon">🔒</span>
                Contraseña de administrador:
              </label>
              <input
                type="password"
                [(ngModel)]="adminPassword"
                placeholder="Ingresa la contraseña"
                class="password-input"
                [class.error]="adminPasswordError"
                (keyup.enter)="confirmAdminAccess()"
                autofocus
              />

              <!-- Error de contraseña -->
              <div *ngIf="adminPasswordError" class="password-error">
                <span class="error-icon">❌</span>
                {{ adminPasswordError }}
              </div>
            </div>
          </div>

          <div class="confirmation-actions">
            <app-touch-button
              variant="secondary"
              size="lg"
              (clicked)="hideAdminModal()"
              [fullWidth]="true"
            >
              Cancelar
            </app-touch-button>

            <app-touch-button
              variant="success"
              size="lg"
              (clicked)="confirmAdminAccess()"
              [fullWidth]="true"
            >
              Activar Modo Admin
            </app-touch-button>
          </div>
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

      .header-actions {
        display: flex;
        align-items: center;
        gap: 1rem;
      }

      .admin-section {
        display: flex;
        align-items: center;
      }

      .admin-gear {
        background: rgba(255, 255, 255, 0.2) !important;
        border: 2px solid rgba(255, 255, 255, 0.3) !important;
        color: white !important;
        transition: all 0.3s ease;
      }

      .admin-gear:hover {
        background: rgba(255, 255, 255, 0.3) !important;
        border-color: rgba(255, 255, 255, 0.5) !important;
      }

      .admin-active {
        background: linear-gradient(135deg, #f59e0b, #d97706) !important;
        border: 2px solid #b45309 !important;
        color: white !important;
        animation: adminPulse 2s infinite;
      }

      @keyframes adminPulse {
        0%,
        100% {
          box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.7);
        }
        50% {
          box-shadow: 0 0 0 10px rgba(245, 158, 11, 0);
        }
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

        .header-actions {
          width: 100%;
          justify-content: center;
          flex-direction: column;
          gap: 1rem;
        }

        .admin-section {
          order: -1;
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

      /* Notificaciones */
      .notification {
        position: fixed;
        top: 2rem;
        right: 2rem;
        z-index: 1100;
        padding: 1rem 1.5rem;
        border-radius: 0.75rem;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
          0 10px 10px -5px rgba(0, 0, 0, 0.04);
        max-width: 400px;
        animation: slideInRight 0.5s ease-out;
      }

      .success-notification {
        background: linear-gradient(135deg, #10b981, #34d399);
        color: white;
        border: 2px solid #059669;
      }

      .error-notification {
        background: linear-gradient(135deg, #ef4444, #f87171);
        color: white;
        border: 2px solid #dc2626;
      }

      .notification-content {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }

      .notification-icon {
        font-size: 1.5rem;
        flex-shrink: 0;
      }

      .notification-text {
        font-size: 1rem;
        font-weight: 600;
        line-height: 1.4;
      }

      /* Modal de confirmación */
      .confirmation-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.6);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1200;
        animation: fadeIn 0.3s ease-out;
      }

      .confirmation-modal {
        background: white;
        border-radius: 1rem;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        max-width: 500px;
        width: 90%;
        max-height: 90vh;
        overflow: hidden;
        animation: scaleIn 0.3s ease-out;
      }

      .confirmation-header {
        background: linear-gradient(135deg, #fbbf24, #f59e0b);
        color: white;
        padding: 1.5rem;
        text-align: center;
        position: relative;
      }

      .admin-header {
        background: linear-gradient(135deg, #10b981, #059669);
      }

      .confirmation-title {
        font-size: 1.5rem;
        font-weight: bold;
        margin: 0;
      }

      .confirmation-icon {
        position: absolute;
        top: 1rem;
        right: 1.5rem;
        font-size: 2rem;
      }

      .confirmation-content {
        padding: 2rem;
        text-align: center;
      }

      .confirmation-message {
        font-size: 1.125rem;
        color: var(--gray-700);
        line-height: 1.6;
        margin: 0 0 1.5rem 0;
        white-space: pre-line;
      }

      /* Sección de contraseña */
      .password-section {
        margin-top: 1.5rem;
        text-align: left;
      }

      .password-label {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 1rem;
        font-weight: 600;
        color: var(--gray-700);
        margin-bottom: 0.75rem;
      }

      .password-icon {
        font-size: 1.25rem;
      }

      .password-input {
        width: 100%;
        padding: 0.875rem 1rem;
        border: 2px solid var(--gray-300);
        border-radius: 0.5rem;
        font-size: 1rem;
        transition: all 0.2s ease;
        background: white;
      }

      .password-input:focus {
        outline: none;
        border-color: var(--primary-500);
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
      }

      .password-input.error {
        border-color: #ef4444;
        background: #fef2f2;
      }

      .password-input.error:focus {
        border-color: #ef4444;
        box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
      }

      .password-error {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-top: 0.5rem;
        color: #ef4444;
        font-size: 0.875rem;
        font-weight: 500;
      }

      .error-icon {
        font-size: 1rem;
      }

      .confirmation-actions {
        padding: 1.5rem;
        display: flex;
        gap: 1rem;
        background: var(--gray-50);
      }

      /* Animaciones */
      @keyframes slideInRight {
        from {
          opacity: 0;
          transform: translateX(100%);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }

      @keyframes scaleIn {
        from {
          opacity: 0;
          transform: scale(0.9);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }

      /* Responsive para notificaciones y modales */
      @media (max-width: 768px) {
        .notification {
          top: 1rem;
          right: 1rem;
          left: 1rem;
          max-width: none;
        }

        .confirmation-modal {
          width: 95%;
          margin: 1rem;
        }

        .confirmation-actions {
          flex-direction: column;
        }

        .password-label {
          font-size: 0.875rem;
        }

        .password-input {
          padding: 0.75rem;
          font-size: 0.875rem;
        }
      }
    `,
  ],
})
export class MachineListComponent implements OnInit, OnDestroy {
  selectedArea: 'corte' | 'costura' = 'costura';
  machines: Machine[] = [];
  machineStats: { [key: number]: { [key in PartCategory]: number } } = {};
  isLoading = true;

  // Variables para notificaciones
  showNotification = false;
  notificationMessage = '';
  notificationType: 'success' | 'error' = 'success';

  // Variables para confirmación
  showConfirmation = false;
  confirmationMessage = '';
  confirmationTitle = '';
  machineToDelete: Machine | null = null;

  // Variables para contraseña
  deletePassword = '';
  passwordError = '';
  readonly ADMIN_PASSWORD = 'Mantenimiento1.';

  // Variables para modo administrador
  isAdminMode = false;
  showAdminModal = false;
  adminPassword = '';
  adminPasswordError = '';
  private adminTimeout: any;

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

  ngOnDestroy() {
    // Limpiar timeout del modo admin al destruir el componente
    if (this.adminTimeout) {
      clearTimeout(this.adminTimeout);
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
    this.router.navigate(['/machines', this.selectedArea, 'add']);
  }

  // Métodos para notificaciones
  showNotificationMessage(
    message: string,
    type: 'success' | 'error' = 'success'
  ) {
    this.notificationMessage = message;
    this.notificationType = type;
    this.showNotification = true;

    // Auto ocultar después de 4 segundos
    setTimeout(() => {
      this.hideNotification();
    }, 4000);
  }

  hideNotification() {
    this.showNotification = false;
  }

  getNotificationIcon(): string {
    return this.notificationType === 'success' ? '✅' : '❌';
  }

  // Métodos para confirmación
  showConfirmationDialog(title: string, message: string, machine: Machine) {
    this.confirmationTitle = title;
    this.confirmationMessage = message;
    this.machineToDelete = machine;
    this.showConfirmation = true;
  }

  hideConfirmation() {
    this.showConfirmation = false;
    this.machineToDelete = null;
  }

  confirmDelete() {
    // En modo admin, proceder directamente con la eliminación
    if (this.machineToDelete) {
      this.performDelete(this.machineToDelete);
      this.hideConfirmation();
    }
  }

  editMachine(machine: Machine) {
    console.log('✏️ Edit machine:', machine.name);
    this.router.navigate(['/machines', this.selectedArea, machine.id, 'edit']);
  }

  deleteMachine(machine: Machine) {
    // En modo admin, mostrar confirmación simple sin contraseña adicional
    this.showConfirmationDialog(
      'Confirmar Eliminación',
      `¿Estás seguro de eliminar la máquina "${machine.name}"?\n\nEsta acción también eliminará todas sus refacciones asociadas.`,
      machine
    );
  }

  performDelete(machine: Machine) {
    this.machineService.deleteMachine(machine.id!).subscribe({
      next: () => {
        console.log('🗑️ Machine deleted:', machine.name);
        this.showNotificationMessage(
          `Máquina "${machine.name}" eliminada exitosamente`,
          'success'
        );
        this.loadMachines();
      },
      error: (error) => {
        console.error('Error deleting machine:', error);
        this.showNotificationMessage(
          'Error al eliminar la máquina. Intenta nuevamente.',
          'error'
        );
      },
    });
  }

  // Métodos para modo administrador
  toggleAdminMode() {
    if (this.isAdminMode) {
      this.exitAdminMode();
    } else {
      // Si no está en modo admin, mostrar modal de contraseña
      this.showAdminModal = true;
      this.adminPassword = '';
      this.adminPasswordError = '';
    }
  }

  exitAdminMode() {
    this.isAdminMode = false;
    // Limpiar timeout si existe
    if (this.adminTimeout) {
      clearTimeout(this.adminTimeout);
      this.adminTimeout = null;
    }
    this.showNotificationMessage('Modo administrador desactivado', 'success');
  }

  hideAdminModal() {
    this.showAdminModal = false;
    this.adminPassword = '';
    this.adminPasswordError = '';
  }

  confirmAdminAccess() {
    // Limpiar errores previos
    this.adminPasswordError = '';

    // Validar que se ingresó una contraseña
    if (!this.adminPassword.trim()) {
      this.adminPasswordError = 'La contraseña es obligatoria';
      return;
    }

    // Validar contraseña
    if (this.adminPassword !== this.ADMIN_PASSWORD) {
      this.adminPasswordError = 'Contraseña incorrecta';
      this.adminPassword = '';
      return;
    }

    // Si la contraseña es correcta, activar modo admin
    this.isAdminMode = true;
    this.hideAdminModal();
    this.showNotificationMessage('Modo administrador activado', 'success');

    // Auto-desactivar modo admin después de 10 minutos por seguridad
    this.adminTimeout = setTimeout(() => {
      if (this.isAdminMode) {
        this.isAdminMode = false;
        this.showNotificationMessage(
          'Modo administrador desactivado automáticamente por seguridad',
          'success'
        );
      }
    }, 10 * 60 * 1000); // 10 minutos
  }
}
