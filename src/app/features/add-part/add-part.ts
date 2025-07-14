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
import { PartService } from '../../core/services/part';
import { MachineService } from '../../core/services/machine';
import { DatabaseService } from '../../core/services/database';
import { Machine, PartCategory } from '../../core/models';

@Component({
  selector: 'app-add-part',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TouchButtonComponent],
  template: `
    <div class="add-part-container slide-up">
      <!-- Header -->
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
                ➕ Agregar Refacción
              </h2>
              <p class="text-xl text-gray-600 font-medium">
                🔧 {{ machine?.name || 'Cargando máquina...' }}
                <span *ngIf="isPreselected()" class="ml-2">
                  • {{ getSelectedCategoryLabel() }}
                </span>
              </p>
            </div>
          </div>

          <!-- Mostrar badge de categoría si está preseleccionada -->
          <div *ngIf="isPreselected()" class="category-badge">
            <span class="text-2xl mr-2">{{ getSelectedCategoryIcon() }}</span>
            <span class="font-bold">{{ getSelectedCategoryLabel() }}</span>
          </div>
        </div>
      </div>

      <!-- Formulario principal -->
      <div class="max-w-4xl mx-auto">
        <form [formGroup]="partForm" (ngSubmit)="onSubmit()" class="space-y-8">
          <!-- Información de la máquina -->
          <div class="machine-info-card glass-effect rounded-2xl p-6 mb-8">
            <div class="flex items-center justify-center mb-4">
              <span class="text-6xl">{{ getAreaIcon() }}</span>
            </div>
            <div class="text-center">
              <h3 class="text-2xl font-bold text-gray-800 mb-2">
                {{ machine?.name }}
              </h3>
              <p class="text-gray-600">{{ getAreaLabel() }}</p>
            </div>
          </div>

          <!-- Grid de campos principales -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <!-- Lado izquierdo: Identificación -->
            <div class="identification-section">
              <h3 class="section-title">📋 Identificación</h3>

              <!-- SAP Number -->
              <div class="form-group">
                <label class="form-label"> 📦 Número SAP * </label>
                <input
                  type="text"
                  formControlName="sapNumber"
                  placeholder="Ej: 123456789"
                  class="form-input"
                  [class.error]="isFieldInvalid('sapNumber')"
                  [class.success]="isFieldValid('sapNumber')"
                />

                <div *ngIf="isFieldInvalid('sapNumber')" class="field-error">
                  <div *ngIf="partForm.get('sapNumber')?.errors?.['required']">
                    El número SAP es obligatorio
                  </div>
                  <div *ngIf="partForm.get('sapNumber')?.errors?.['minlength']">
                    Debe tener al menos 3 caracteres
                  </div>
                  <div *ngIf="partForm.get('sapNumber')?.errors?.['sapExists']">
                    Ya existe una refacción con este SAP
                  </div>
                </div>

                <div *ngIf="isFieldValid('sapNumber')" class="field-success">
                  ✓ SAP disponible
                </div>
              </div>

              <!-- Part Number -->
              <div class="form-group">
                <label class="form-label"> 🔖 Part Number * </label>
                <input
                  type="text"
                  formControlName="partNumber"
                  placeholder="Ej: ABC-123-XYZ"
                  class="form-input"
                  [class.error]="isFieldInvalid('partNumber')"
                  [class.success]="isFieldValid('partNumber')"
                />

                <div *ngIf="isFieldInvalid('partNumber')" class="field-error">
                  <div *ngIf="partForm.get('partNumber')?.errors?.['required']">
                    El Part Number es obligatorio
                  </div>
                  <div
                    *ngIf="partForm.get('partNumber')?.errors?.['minlength']"
                  >
                    Debe tener al menos 2 caracteres
                  </div>
                </div>

                <div *ngIf="isFieldValid('partNumber')" class="field-success">
                  ✓ Part Number válido
                </div>
              </div>

              <!-- Categoría -->
              <div class="form-group">
                <label class="form-label">
                  📂 Categoría *
                  <span *ngIf="isPreselected()" class="text-sm text-blue-600">
                    (Preseleccionada)
                  </span>
                </label>
                <select
                  formControlName="category"
                  class="form-select"
                  [class.error]="isFieldInvalid('category')"
                  [class.success]="isFieldValid('category')"
                  [disabled]="isPreselected()"
                >
                  <option value="">Selecciona una categoría</option>
                  <option value="mecanica">🔩 Mecánica</option>
                  <option value="electronica">⚡ Electrónica</option>
                  <option value="consumible">🔄 Consumible</option>
                </select>

                <div *ngIf="isFieldInvalid('category')" class="field-error">
                  Debes seleccionar una categoría
                </div>

                <div *ngIf="isFieldValid('category')" class="field-success">
                  ✓ Categoría seleccionada
                </div>

                <!-- Mostrar info si está preseleccionada -->
                <div *ngIf="isPreselected()" class="text-sm text-blue-600 mt-2">
                  💡 Esta categoría fue seleccionada automáticamente desde la
                  navegación
                </div>
              </div>
            </div>

            <!-- Lado derecho: Descripción y Ubicación -->
            <div class="details-section">
              <h3 class="section-title">📝 Detalles</h3>

              <!-- Descripción -->
              <div class="form-group">
                <label class="form-label"> 📄 Descripción * </label>
                <textarea
                  formControlName="description"
                  placeholder="Describe la refacción detalladamente..."
                  rows="4"
                  class="form-textarea"
                  [class.error]="isFieldInvalid('description')"
                  [class.success]="isFieldValid('description')"
                >
                </textarea>

                <div *ngIf="isFieldInvalid('description')" class="field-error">
                  <div
                    *ngIf="partForm.get('description')?.errors?.['required']"
                  >
                    La descripción es obligatoria
                  </div>
                  <div
                    *ngIf="partForm.get('description')?.errors?.['minlength']"
                  >
                    Debe tener al menos 5 caracteres
                  </div>
                </div>

                <div *ngIf="isFieldValid('description')" class="field-success">
                  ✓ Descripción válida
                </div>
              </div>

              <!-- Ubicación -->
              <div class="form-group">
                <label class="form-label"> 📍 Ubicación * </label>
                <input
                  type="text"
                  formControlName="location"
                  placeholder="Ej: Estante A-3, Cajón 5"
                  class="form-input"
                  [class.error]="isFieldInvalid('location')"
                  [class.success]="isFieldValid('location')"
                />

                <div *ngIf="isFieldInvalid('location')" class="field-error">
                  <div *ngIf="partForm.get('location')?.errors?.['required']">
                    La ubicación es obligatoria
                  </div>
                  <div *ngIf="partForm.get('location')?.errors?.['minlength']">
                    Debe tener al menos 2 caracteres
                  </div>
                </div>

                <div *ngIf="isFieldValid('location')" class="field-success">
                  ✓ Ubicación válida
                </div>
              </div>

              <!-- Preview de la categoría -->
              <div
                *ngIf="partForm.get('category')?.value"
                class="category-preview"
              >
                <h4 class="text-lg font-semibold mb-3">Vista previa:</h4>
                <div
                  class="preview-card"
                  [class]="'preview-' + partForm.get('category')?.value"
                >
                  <div class="flex items-center">
                    <span class="text-3xl mr-3">{{
                      getCategoryIcon(partForm.get('category')?.value)
                    }}</span>
                    <div>
                      <div class="font-bold">
                        {{ getCategoryLabel(partForm.get('category')?.value) }}
                      </div>
                      <div class="text-sm opacity-75">
                        {{
                          getCategoryDescription(
                            partForm.get('category')?.value
                          )
                        }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Sección de imagen (opcional) -->
          <div class="image-section glass-effect rounded-2xl p-6">
            <h3 class="section-title">📸 Imagen (Opcional)</h3>

            <div class="form-group">
              <label class="form-label"> 🖼️ URL de Imagen </label>
              <input
                type="url"
                formControlName="image"
                placeholder="https://ejemplo.com/imagen.jpg"
                class="form-input"
              />

              <div class="text-sm text-gray-500 mt-2">
                💡 Puedes agregar una URL de imagen para ayudar a identificar la
                refacción
              </div>
            </div>
          </div>

          <!-- Botones de acción -->
          <div class="action-buttons glass-effect rounded-2xl p-6">
            <div class="flex gap-4">
              <app-touch-button
                type="button"
                variant="secondary"
                size="xl"
                icon="❌"
                [fullWidth]="true"
                (clicked)="goBack()"
              >
                Cancelar
              </app-touch-button>

              <app-touch-button
                type="submit"
                variant="success"
                size="xl"
                icon="💾"
                [fullWidth]="true"
                [disabled]="partForm.invalid || isSubmitting"
                [loading]="isSubmitting"
              >
                {{ isSubmitting ? 'Guardando...' : 'Guardar Refacción' }}
              </app-touch-button>
            </div>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [
    `
      .add-part-container {
        min-height: 70vh;
        padding: 2rem 0;
      }

      .category-badge {
        display: flex;
        align-items: center;
        padding: 0.75rem 1.5rem;
        background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
        border-radius: 9999px;
        border: 2px solid #cbd5e1;
      }

      .machine-info-card {
        background: linear-gradient(145deg, #f8fafc 0%, #e2e8f0 100%);
      }

      .section-title {
        font-size: 1.5rem;
        font-weight: 700;
        color: #1f2937;
        margin-bottom: 1.5rem;
        padding-bottom: 0.5rem;
        border-bottom: 3px solid #e5e7eb;
      }

      .form-group {
        margin-bottom: 2rem;
      }

      .form-label {
        display: block;
        font-size: 1.25rem;
        font-weight: 600;
        color: #374151;
        margin-bottom: 0.75rem;
      }

      .form-input,
      .form-select,
      .form-textarea {
        width: 100%;
        padding: 1rem 1.5rem;
        font-size: 1.125rem;
        border: 3px solid #d1d5db;
        border-radius: 1rem;
        background: white;
        transition: all 0.3s ease;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .form-input:focus,
      .form-select:focus,
      .form-textarea:focus {
        outline: none;
        border-color: #3b82f6;
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        transform: translateY(-1px);
      }

      .form-input.error,
      .form-select.error,
      .form-textarea.error {
        border-color: #ef4444;
        box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
      }

      .form-input.success,
      .form-select.success,
      .form-textarea.success {
        border-color: #10b981;
        box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
      }

      .form-select[disabled] {
        background-color: #f3f4f6;
        cursor: not-allowed;
        opacity: 0.8;
      }

      .field-error {
        color: #dc2626;
        font-size: 1rem;
        font-weight: 600;
        margin-top: 0.5rem;
      }

      .field-success {
        color: #059669;
        font-size: 1rem;
        font-weight: 600;
        margin-top: 0.5rem;
      }

      .category-preview {
        margin-top: 2rem;
        padding: 1.5rem;
        border-radius: 1rem;
        background: white;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      }

      .preview-card {
        padding: 1rem;
        border-radius: 0.75rem;
        border-left: 4px solid;
      }

      .preview-mecanica {
        background: #dbeafe;
        border-left-color: #3b82f6;
        color: #1e40af;
      }

      .preview-electronica {
        background: #fef3c7;
        border-left-color: #f59e0b;
        color: #d97706;
      }

      .preview-consumible {
        background: #d1fae5;
        border-left-color: #10b981;
        color: #065f46;
      }

      .image-section,
      .action-buttons {
        background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);
      }

      /* Responsive */
      @media (max-width: 1024px) {
        .grid-cols-1.lg\\:grid-cols-2 {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 768px) {
        .add-part-container {
          padding: 1rem 0;
        }

        .glass-effect {
          padding: 1.5rem !important;
        }

        .form-input,
        .form-select,
        .form-textarea {
          font-size: 1rem;
          padding: 0.875rem 1.25rem;
        }

        .section-title {
          font-size: 1.25rem;
        }

        .form-label {
          font-size: 1.125rem;
        }
      }
    `,
  ],
})
export class AddPartComponent implements OnInit {
  partForm: FormGroup;
  machineId!: number;
  machine: Machine | null = null;
  isSubmitting = false;
  selectedArea: string = 'costura';
  selectedCategory: string = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private partService: PartService,
    private machineService: MachineService,
    private databaseService: DatabaseService
  ) {
    this.partForm = this.fb.group({
      sapNumber: ['', [Validators.required, Validators.minLength(3)]],
      partNumber: ['', [Validators.required, Validators.minLength(2)]],
      description: ['', [Validators.required, Validators.minLength(5)]],
      category: ['', [Validators.required]],
      location: ['', [Validators.required, Validators.minLength(2)]],
      image: [''],
    });
  }

  async ngOnInit() {
    // Obtener parámetros de la URL
    this.route.params.subscribe((params) => {
      this.machineId = +params['machineId'];
      this.selectedArea = params['area'] || 'costura';
      this.selectedCategory = params['category'] || '';

      // Preseleccionar categoría si viene en la URL
      if (this.selectedCategory && this.selectedCategory !== 'all') {
        this.partForm.patchValue({ category: this.selectedCategory });
      }

      this.loadMachine();
    });

    // Inicializar base de datos
    try {
      await this.databaseService.initializeDatabase();
    } catch (error) {
      console.error('Error initializing database:', error);
    }

    // Validación de SAP único
    this.setupSapValidation();
  }

  loadMachine() {
    this.machineService.getMachineById(this.machineId).subscribe({
      next: (machine) => {
        this.machine = machine || null;
      },
      error: (error) => {
        console.error('Error loading machine:', error);
      },
    });
  }

  setupSapValidation() {
    const sapControl = this.partForm.get('sapNumber');

    sapControl?.valueChanges.subscribe(async (sapNumber: string) => {
      if (sapNumber && sapNumber.length >= 3) {
        const isUnique = await this.partService.isSapNumberUnique(sapNumber);

        if (!isUnique) {
          sapControl.setErrors({ ...sapControl.errors, sapExists: true });
        } else {
          // Quitar error de sapExists si existe
          if (sapControl.errors) {
            delete sapControl.errors['sapExists'];
            if (Object.keys(sapControl.errors).length === 0) {
              sapControl.setErrors(null);
            }
          }
        }
      }
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.partForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  isFieldValid(fieldName: string): boolean {
    const field = this.partForm.get(fieldName);
    return !!(field && field.valid && field.touched);
  }

  isPreselected(): boolean {
    return !!(this.selectedCategory && this.selectedCategory !== 'all');
  }

  getAreaIcon(): string {
    return this.machine?.area === 'corte' ? '✂️' : '🧵';
  }

  getAreaLabel(): string {
    return this.machine?.area === 'corte'
      ? 'Corte Industrial'
      : 'Costura Industrial';
  }

  getCategoryIcon(category: PartCategory): string {
    const icons = {
      mecanica: '🔩',
      electronica: '⚡',
      consumible: '🔄',
    };
    return icons[category];
  }

  getCategoryLabel(category: PartCategory): string {
    const labels = {
      mecanica: 'Mecánica',
      electronica: 'Electrónica',
      consumible: 'Consumible',
    };
    return labels[category];
  }

  getCategoryDescription(category: PartCategory): string {
    const descriptions = {
      mecanica: 'Piezas físicas, tornillos, engranes, etc.',
      electronica: 'Componentes eléctricos y electrónicos',
      consumible: 'Materiales que se gastan con el uso',
    };
    return descriptions[category];
  }

  getSelectedCategoryIcon(): string {
    if (this.isPreselected()) {
      return this.getCategoryIcon(this.selectedCategory as PartCategory);
    }
    return '';
  }

  getSelectedCategoryLabel(): string {
    if (this.isPreselected()) {
      return this.getCategoryLabel(this.selectedCategory as PartCategory);
    }
    return '';
  }

  goBack() {
    if (this.isPreselected()) {
      this.router.navigate([
        '/machines',
        this.selectedArea,
        this.machineId,
        'parts',
        this.selectedCategory,
      ]);
    } else {
      this.router.navigate([
        '/machines',
        this.selectedArea,
        this.machineId,
        'parts',
      ]);
    }
  }

  async onSubmit() {
    if (this.partForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;

      try {
        const partData = {
          sapNumber: this.partForm.value.sapNumber.trim(),
          partNumber: this.partForm.value.partNumber.trim(),
          description: this.partForm.value.description.trim(),
          category: this.partForm.value.category,
          location: this.partForm.value.location.trim(),
          machineId: this.machineId,
          image: this.partForm.value.image?.trim() || '',
        };

        await this.partService.createPart(partData).toPromise();

        console.log('✅ Part created successfully');
        alert(`Refacción "${partData.description}" agregada exitosamente`);

        // Navegar a la lista de la categoría creada
        this.router.navigate([
          '/machines',
          this.selectedArea,
          this.machineId,
          'parts',
          partData.category,
        ]);
      } catch (error) {
        console.error('Error creating part:', error);
        alert('Error al agregar la refacción. Intenta nuevamente.');
        this.isSubmitting = false;
      }
    }
  }
}
