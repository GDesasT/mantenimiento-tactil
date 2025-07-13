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

@Component({
  selector: 'app-add-machine',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TouchButtonComponent],
  template: `
    <div class="add-machine-container">
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
            <h2 class="text-3xl font-bold text-gray-800">
              Agregar Nueva Máquina
            </h2>
            <p class="text-lg text-gray-600">
              {{ getAreaTitle() }}
            </p>
          </div>
        </div>
      </div>

      <!-- Formulario -->
      <div class="max-w-2xl mx-auto">
        <form
          [formGroup]="machineForm"
          (ngSubmit)="onSubmit()"
          class="bg-white rounded-xl shadow-lg p-8"
        >
          <!-- Área seleccionada (solo información) -->
          <div class="mb-8">
            <div class="area-indicator">
              <div class="flex items-center justify-center mb-4">
                <span class="text-6xl">{{ getAreaIcon() }}</span>
              </div>
              <div class="text-center">
                <h3 class="text-2xl font-bold text-gray-800 mb-2">
                  {{ getAreaTitle() }}
                </h3>
                <p class="text-gray-600">La máquina se agregará a esta área</p>
              </div>
            </div>
          </div>

          <!-- Campo: Nombre de la máquina -->
          <div class="mb-8">
            <label class="block text-xl font-semibold text-gray-700 mb-3">
              Nombre de la Máquina *
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
                Ya existe una máquina con este nombre en {{ selectedArea }}
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
              variant="success"
              size="lg"
              [fullWidth]="true"
              [disabled]="machineForm.invalid || isSubmitting"
              [loading]="isSubmitting"
            >
              {{ isSubmitting ? 'Guardando...' : 'Guardar Máquina' }}
            </app-touch-button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [
    `
      .add-machine-container {
        min-height: 70vh;
        padding: 1rem 0;
      }

      .area-indicator {
        background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
        border-radius: 1rem;
        padding: 2rem;
        margin-bottom: 2rem;
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
    `,
  ],
})
export class AddMachineComponent implements OnInit {
  machineForm: FormGroup;
  selectedArea: 'corte' | 'costura' = 'costura';
  isSubmitting = false;

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
    // Obtener área de la URL
    this.route.params.subscribe((params) => {
      this.selectedArea = params['area'] || 'costura';
    });

    // Inicializar base de datos
    try {
      await this.databaseService.initializeDatabase();
    } catch (error) {
      console.error('Error initializing database:', error);
    }

    // Validación de nombre único
    this.setupNameValidation();
  }

  setupNameValidation() {
    const nameControl = this.machineForm.get('name');

    nameControl?.valueChanges.subscribe(async (name: string) => {
      if (name && name.length >= 2) {
        const isUnique = await this.machineService.isNameUnique(
          name,
          this.selectedArea
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
    return this.selectedArea === 'corte' ? 'ÁREA DE CORTE' : 'ÁREA DE COSTURA';
  }

  getAreaIcon(): string {
    return this.selectedArea === 'corte' ? '✂️' : '🧵';
  }

  goBack() {
    this.router.navigate(['/machines', this.selectedArea]);
  }

  async onSubmit() {
    if (this.machineForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;

      try {
        const machineData = {
          name: this.machineForm.value.name.trim(),
          area: this.selectedArea,
        };

        await this.machineService.createMachine(machineData).toPromise();

        console.log('✅ Machine created successfully');
        alert(
          `Máquina "${machineData.name}" agregada exitosamente a ${this.selectedArea}`
        );

        // Regresar a la lista de máquinas
        this.router.navigate(['/machines', this.selectedArea]);
      } catch (error) {
        console.error('Error creating machine:', error);
        alert('Error al agregar la máquina. Intenta nuevamente.');
        this.isSubmitting = false;
      }
    }
  }
}
