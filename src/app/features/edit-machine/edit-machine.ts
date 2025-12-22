import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TouchButtonComponent } from '../../shared/components/touch-button/touch-button';
import { MachineService } from '../../core/services/machine';
import { DatabaseService } from '../../core/services/database';
import { Machine } from '../../core/models';

@Component({
  selector: 'app-edit-machine',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TouchButtonComponent],
  template: `
    <div class="edit-machine-container">
      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <div class="flex items-center">
          <app-touch-button
            variant="secondary"
            size="md"
            icon="←"
            (clicked)="goBack()"
            class="mr-4"
          >
            Atrás
          </app-touch-button>

          <div>
            <h2 class="text-3xl font-bold text-gray-800">Editar Máquina</h2>
            <p class="text-lg text-gray-600">
              {{ getAreaTitle() }}
            </p>
          </div>
        </div>
      </div>

      <!-- Formulario -->
      <div class="max-w-2xl mx-auto" *ngIf="machine">
        <form
          [formGroup]="machineForm"
          (ngSubmit)="onSubmit()"
          class="bg-white rounded-xl shadow-lg p-8"
        >
          <!-- Información actual -->
          <div class="mb-8">
            <div class="current-info">
              <div class="flex items-center justify-center mb-4">
                <span class="text-6xl">{{ getAreaIcon() }}</span>
              </div>
              <div class="text-center">
                <h3 class="text-2xl font-bold text-gray-800 mb-2">
                  Editando: {{ machine.name }}
                </h3>
                <p class="text-gray-600">{{ getAreaTitle() }}</p>
              </div>
            </div>
          </div>

          <!-- Campo: Nuevo nombre de la máquina -->
          <div class="mb-8">
            <label class="block text-xl font-semibold text-gray-700 mb-3">
              Nuevo Nombre de la Máquina *
            </label>
            <input
              type="text"
              formControlName="name"
              placeholder="Ej: BROTHER-001, MITSUBISHI-002"
              class="touch-input-field w-full h-16 px-6 text-xl border-2 rounded-lg focus:outline-none"
              [class.border-red-500]="
                machineForm.get('name')?.invalid &&
                machineForm.get('name')?.touched
              "
              [class.border-green-500]="
                machineForm.get('name')?.valid &&
                machineForm.get('name')?.touched
              "
              [class.border-gray-300]="machineForm.get('name')?.untouched"
            />

            <!-- Errores de validación -->
            <div
              *ngIf="
                machineForm.get('name')?.invalid &&
                machineForm.get('name')?.touched
              "
              class="text-red-600 text-lg mt-2"
            >
              <div *ngIf="machineForm.get('name')?.errors?.['required']">
                El nombre de la máquina es obligatorio
              </div>
              <div *ngIf="machineForm.get('name')?.errors?.['minlength']">
                El nombre debe tener al menos 2 caracteres
              </div>
              <div *ngIf="machineForm.get('name')?.errors?.['nameExists']">
                Ya existe otra máquina con este nombre en {{ selectedArea }}
              </div>
            </div>

            <!-- Indicador de éxito -->
            <div
              *ngIf="
                machineForm.get('name')?.valid &&
                machineForm.get('name')?.touched
              "
              class="text-green-600 text-lg mt-2"
            >
              ✓ Nombre disponible
            </div>
          </div>

          <!-- Botones de acción -->
          <div class="flex gap-4">
            <app-touch-button
              type="button"
              variant="secondary"
              size="lg"
              [fullWidth]="true"
              (clicked)="goBack()"
            >
              Cancelar
            </app-touch-button>

            <app-touch-button
              type="submit"
              variant="warning"
              size="lg"
              [fullWidth]="true"
              [disabled]="machineForm.invalid || isSubmitting"
              [loading]="isSubmitting"
            >
              {{ isSubmitting ? 'Guardando...' : 'Actualizar Máquina' }}
            </app-touch-button>
          </div>
        </form>
      </div>

      <!-- Loading -->
      <div *ngIf="isLoading" class="loading-state">
        <div class="loading-spinner"></div>
        <span class="loading-text">Cargando máquina...</span>
      </div>

      <!-- Error al cargar -->
      <div *ngIf="loadError" class="error-state">
        <div class="error-icon">❌</div>
        <h3 class="error-title">Error al cargar la máquina</h3>
        <p class="error-message">{{ loadError }}</p>

        <div class="error-actions">
          <app-touch-button
            variant="primary"
            size="lg"
            (clicked)="retryLoad()"
            class="mr-4"
          >
            Reintentar
          </app-touch-button>

          <app-touch-button variant="secondary" size="lg" (clicked)="goBack()">
            Volver
          </app-touch-button>
        </div>

        <!-- Debug info -->
        <div class="debug-info">
          <p><strong>Área:</strong> {{ selectedArea }}</p>
          <p><strong>Machine ID:</strong> {{ machineId }}</p>
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
    </div>
  `,
  styles: [
    `
      .edit-machine-container {
        min-height: 70vh;
        padding: 1rem 0;
      }

      .current-info {
        background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
        border-radius: 1rem;
        padding: 2rem;
        margin-bottom: 2rem;
        border: 2px solid #d1d5db;
      }

      .touch-input-field {
        transition: all 0.3s ease;
        background: white;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .touch-input-field:focus {
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        transform: translateY(-1px);
      }

      .touch-input-field.border-green-500 {
        box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
      }

      .touch-input-field.border-red-500 {
        box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
      }

      /* Estados de carga y error */
      .loading-state,
      .error-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 4rem 2rem;
        text-align: center;
        max-width: 2xl;
        margin: 0 auto;
      }

      .loading-spinner {
        width: 3rem;
        height: 3rem;
        border: 4px solid #e5e7eb;
        border-top: 4px solid #3b82f6;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin-bottom: 1.5rem;
      }

      .loading-text {
        color: #6b7280;
        font-size: 1.25rem;
        font-weight: 500;
      }

      .error-icon {
        font-size: 4rem;
        margin-bottom: 1.5rem;
      }

      .error-title {
        font-size: 1.875rem;
        font-weight: bold;
        color: #1f2937;
        margin-bottom: 1rem;
      }

      .error-message {
        color: #6b7280;
        font-size: 1.125rem;
        margin-bottom: 2rem;
      }

      .error-actions {
        display: flex;
        gap: 1rem;
        margin-bottom: 2rem;
        flex-wrap: wrap;
        justify-content: center;
      }

      .debug-info {
        background: #f9fafb;
        border: 1px solid #e5e7eb;
        border-radius: 0.5rem;
        padding: 1rem;
        margin-top: 1rem;
        font-size: 0.875rem;
        text-align: left;
        max-width: 300px;
      }

      .debug-info p {
        margin: 0.5rem 0;
        color: #6b7280;
      }

      @keyframes spin {
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(360deg);
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

      /* Animación para la notificación */
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

      /* Responsive */
      @media (max-width: 768px) {
        .edit-machine-container {
          padding: 0.5rem;
        }

        .current-info {
          padding: 1.5rem;
        }

        .notification {
          top: 1rem;
          right: 1rem;
          left: 1rem;
          max-width: none;
        }

        .error-actions {
          flex-direction: column;
          align-items: center;
        }

        .debug-info {
          max-width: 100%;
        }
      }
    `,
  ],
})
export class EditMachineComponent implements OnInit {
  machineForm: FormGroup;
  selectedArea: 'corte' | 'costura' = 'costura';
  machineId: number = 0;
  machine: Machine | null = null;
  isLoading = true;
  isSubmitting = false;
  loadError = '';

  // Variables para notificaciones
  showNotification = false;
  notificationMessage = '';
  notificationType: 'success' | 'error' = 'success';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private machineService: MachineService,
    private databaseService: DatabaseService
  ) {
    this.machineForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
    });
  }

  async ngOnInit() {
    // Obtener parámetros de la URL
    this.route.params.subscribe((params) => {
      this.selectedArea = params['area'] || 'costura';
      this.machineId = parseInt(params['machineId']); // Cambiar 'id' por 'machineId'

      console.log('🔧 Edit machine params:', {
        area: this.selectedArea,
        machineId: this.machineId,
        rawParams: params,
      });

      this.loadMachine();
    });

    // Inicializar base de datos
    try {
      await this.databaseService.initializeDatabase();
    } catch (error) {
      console.error('Error initializing database:', error);
      this.loadError = 'Error al inicializar la base de datos';
      this.isLoading = false;
    }
  }

  loadMachine() {
    this.isLoading = true;
    this.loadError = '';

    console.log('🔍 Loading machine with ID:', this.machineId);

    // Validar que el ID sea válido
    if (!this.machineId || isNaN(this.machineId)) {
      this.loadError = 'ID de máquina inválido';
      this.isLoading = false;
      console.error('❌ Invalid machine ID:', this.machineId);
      return;
    }

    this.machineService.getMachineById(this.machineId).subscribe({
      next: (machine) => {
        console.log('📦 Received machine data:', machine);

        if (machine && machine.area === this.selectedArea) {
          this.machine = machine;
          this.machineForm.patchValue({
            name: machine.name,
          });
          this.setupNameValidation();
          this.isLoading = false;
          console.log('✅ Machine loaded successfully:', machine.name);
        } else if (machine && machine.area !== this.selectedArea) {
          this.loadError = `Esta máquina pertenece al área de ${machine.area}, no a ${this.selectedArea}`;
          this.isLoading = false;
          console.error('❌ Machine area mismatch:', {
            expected: this.selectedArea,
            actual: machine.area,
          });
        } else {
          this.loadError = 'Máquina no encontrada';
          this.isLoading = false;
          console.error('❌ Machine not found with ID:', this.machineId);
        }
      },
      error: (error) => {
        console.error('❌ Error loading machine:', error);
        this.loadError = 'Error al cargar la máquina desde la base de datos';
        this.isLoading = false;
      },
    });
  }

  setupNameValidation() {
    const nameControl = this.machineForm.get('name');

    nameControl?.valueChanges.subscribe(async (name: string) => {
      if (name && name.length >= 2 && name !== this.machine?.name) {
        const isUnique = await this.machineService.isNameUnique(
          name,
          this.selectedArea,
          this.machineId // Excluir la máquina actual de la validación
        );

        if (!isUnique) {
          nameControl.setErrors({ ...nameControl.errors, nameExists: true });
        } else {
          // Quitar error de nameExists si existe
          if (nameControl.errors) {
            delete nameControl.errors['nameExists'];
            if (Object.keys(nameControl.errors).length === 0) {
              nameControl.setErrors(null);
            }
          }
        }
      }
    });
  }

  getAreaTitle(): string {
    return this.selectedArea === 'corte' ? 'ÁREA DE CORTE' : this.selectedArea === 'costura' ? 'ÁREA DE COSTURA' : 'ÁREA DE CONSUMIBLES';
  }

  getAreaIcon(): string {
    return this.selectedArea === 'corte' ? '✂️' : this.selectedArea === 'costura' ? '🧵' :  this.selectedArea === 'consumibles' ? '💡' : '';
  }

  goBack() {
    this.router.navigate(['/machines', this.selectedArea]);
  }

  retryLoad() {
    console.log('🔄 Retrying to load machine...');
    this.loadMachine();
  }

  // Métodos para notificaciones
  showNotificationMessage(
    message: string,
    type: 'success' | 'error' = 'success'
  ) {
    this.notificationMessage = message;
    this.notificationType = type;
    this.showNotification = true;

    // Auto ocultar después de 3 segundos
    setTimeout(() => {
      this.hideNotification();
    }, 3000);
  }

  hideNotification() {
    this.showNotification = false;
  }

  getNotificationIcon(): string {
    return this.notificationType === 'success' ? '✅' : '❌';
  }

  async onSubmit() {
    if (this.machineForm.valid && !this.isSubmitting && this.machine) {
      this.isSubmitting = true;

      try {
        const updatedData = {
          ...this.machine,
          name: this.machineForm.value.name.trim(),
        };

        await this.machineService
          .updateMachine(this.machineId, updatedData)
          .toPromise();

        console.log('✅ Machine updated successfully');
        this.showNotificationMessage(
          `Máquina actualizada exitosamente: "${updatedData.name}"`,
          'success'
        );

        // Esperar un momento para que se vea la notificación
        setTimeout(() => {
          // Regresar a la lista de máquinas
          this.router.navigate(['/machines', this.selectedArea]);
        }, 1500);
      } catch (error) {
        console.error('Error updating machine:', error);
        this.showNotificationMessage(
          'Error al actualizar la máquina. Intenta nuevamente.',
          'error'
        );
        this.isSubmitting = false;
      }
    }
  }
}
