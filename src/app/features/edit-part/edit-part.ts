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
import { Machine, PartCategory, Part } from '../../core/models';

@Component({
  selector: 'app-edit-part',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TouchButtonComponent],
  template: `
    <div class="edit-part-container slide-up">
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
                ✏️ Editar Refacción
              </h2>
              <p class="text-xl text-gray-600 font-medium">
                🔧 {{ machine?.name || 'Cargando máquina...' }}
                <span *ngIf="selectedCategory" class="ml-2">
                  • {{ getCategoryLabel(selectedCategory) }}
                </span>
              </p>
            </div>
          </div>

          <!-- Badge de categoría -->
          <div *ngIf="selectedCategory" class="category-badge">
            <span class="text-2xl mr-2">{{
              getCategoryIcon(selectedCategory)
            }}</span>
            <span class="font-bold">{{
              getCategoryLabel(selectedCategory)
            }}</span>
          </div>
        </div>
      </div>

      <!-- Loading state -->
      <div *ngIf="isLoadingPart" class="loading-state">
        <div class="glass-effect rounded-3xl p-16 text-center">
          <div class="loading-spinner mb-6">
            <span class="text-6xl animate-spin">⚙️</span>
          </div>
          <span class="text-2xl font-bold text-gray-700"
            >Cargando refacción...</span
          >
        </div>
      </div>

      <!-- Formulario principal -->
      <div *ngIf="!isLoadingPart" class="max-w-4xl mx-auto">
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

          <!-- Indicador de modo edición -->
          <div class="edit-indicator glass-effect rounded-2xl p-6 mb-8">
            <div class="text-center">
              <span class="text-4xl mb-4 block">✏️</span>
              <h3 class="text-2xl font-bold text-blue-600 mb-2">
                Modo Edición
              </h3>
              <p class="text-gray-600">
                Modificando refacción:
                <strong>{{ currentPart?.description }}</strong>
              </p>
              <p class="text-sm text-gray-500 mt-2">
                SAP: {{ currentPart?.sapNumber }} | Creada:
                {{ getCreatedDate() }}
              </p>
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
                  ✓ SAP válido
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
                <label class="form-label"> 📂 Categoría * </label>
                <select
                  formControlName="category"
                  class="form-select"
                  [class.error]="isFieldInvalid('category')"
                  [class.success]="isFieldValid('category')"
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

              <!-- Mostrar imagen actual si existe -->
              <div *ngIf="currentPart?.image" class="current-image mt-4">
                <p class="text-sm font-semibold text-gray-700 mb-2">
                  Imagen actual:
                </p>
                <img
                  [src]="currentPart?.image"
                  [alt]="currentPart?.description"
                  class="w-24 h-24 object-cover rounded-lg border-2 border-gray-300"
                  (error)="onImageError($event)"
                />
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
                variant="warning"
                size="xl"
                icon="💾"
                [fullWidth]="true"
                [disabled]="partForm.invalid || isSubmitting"
                [loading]="isSubmitting"
              >
                {{ isSubmitting ? 'Guardando...' : 'Actualizar Refacción' }}
              </app-touch-button>
            </div>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [
    `
      .edit-part-container {
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

      .edit-indicator {
        background: linear-gradient(145deg, #eff6ff 0%, #dbeafe 100%);
        border: 2px solid #93c5fd;
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
        border-color: #f59e0b;
        box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
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

      .loading-state {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 400px;
        margin: 2rem 0;
      }

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

      .current-image img {
        transition: transform 0.2s ease;
      }

      .current-image img:hover {
        transform: scale(1.1);
      }

      /* Responsive */
      @media (max-width: 1024px) {
        .grid-cols-1.lg\\:grid-cols-2 {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 768px) {
        .edit-part-container {
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
export class EditPartComponent implements OnInit {
  partForm: FormGroup;
  machineId!: number;
  partId!: number;
  machine: Machine | null = null;
  currentPart: Part | null = null;
  isSubmitting = false;
  isLoadingPart = true;
  selectedArea: string = 'costura';
  selectedCategory: PartCategory | null = null;

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
      this.partId = +params['partId'];
      this.selectedArea = params['area'] || 'costura';
      this.selectedCategory = params['category'] as PartCategory;

      this.loadMachine();
      this.loadPart();
    });

    // Inicializar base de datos
    try {
      await this.databaseService.initializeDatabase();
    } catch (error) {
      console.error('Error initializing database:', error);
    }
  }

  async loadMachine() {
    try {
      this.machineService.getMachineById(this.machineId).subscribe({
        next: (machine) => {
          this.machine = machine || null;
        },
        error: (error) => {
          console.error('Error loading machine:', error);
        },
      });
    } catch (error) {
      console.error('Error loading machine:', error);
    }
  }

  async loadPart() {
    this.isLoadingPart = true;
    try {
      this.partService.getPartById(this.partId).subscribe({
        next: (part) => {
          this.currentPart = part || null;
          if (this.currentPart) {
            // Precargar el formulario con los datos existentes
            this.partForm.patchValue({
              sapNumber: this.currentPart.sapNumber,
              partNumber: this.currentPart.partNumber,
              description: this.currentPart.description,
              category: this.currentPart.category,
              location: this.currentPart.location,
              image: this.currentPart.image || '',
            });

            // Actualizar la categoría seleccionada
            this.selectedCategory = this.currentPart.category;

            // Configurar validación de SAP único (excluyendo el actual)
            this.setupSapValidation();
          }
          this.isLoadingPart = false;
        },
        error: (error) => {
          console.error('Error loading part:', error);
          this.isLoadingPart = false;
          alert('Error al cargar la refacción');
          this.goBack();
        },
      });
    } catch (error) {
      console.error('Error loading part:', error);
      this.isLoadingPart = false;
    }
  }

  setupSapValidation() {
    const sapControl = this.partForm.get('sapNumber');

    sapControl?.valueChanges.subscribe(async (sapNumber: string) => {
      if (sapNumber && sapNumber.length >= 3) {
        // Excluir el SAP actual de la validación
        const isUnique = await this.partService.isSapNumberUnique(
          sapNumber,
          this.partId
        );

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

  getCreatedDate(): string {
    if (this.currentPart?.createdAt) {
      return new Date(this.currentPart.createdAt).toLocaleDateString('es-ES');
    }
    return 'No disponible';
  }

  onImageError(event: any) {
    console.warn('Error loading image:', event);
    event.target.style.display = 'none';
  }

  goBack() {
    this.router.navigate([
      '/machines',
      this.selectedArea,
      this.machineId,
      'parts',
      this.selectedCategory || 'all',
    ]);
  }

  async onSubmit() {
    if (this.partForm.valid && !this.isSubmitting && this.currentPart) {
      this.isSubmitting = true;

      try {
        const partData = {
          sapNumber: this.partForm.value.sapNumber.trim(),
          partNumber: this.partForm.value.partNumber.trim(),
          description: this.partForm.value.description.trim(),
          category: this.partForm.value.category,
          location: this.partForm.value.location.trim(),
          image: this.partForm.value.image?.trim() || '',
        };

        await this.partService.updatePart(this.partId, partData).toPromise();

        console.log('✅ Part updated successfully');
        alert(`Refacción "${partData.description}" actualizada exitosamente`);

        // Navegar de vuelta a la lista de la categoría
        this.goBack();
      } catch (error) {
        console.error('Error updating part:', error);
        alert('Error al actualizar la refacción. Intenta nuevamente.');
        this.isSubmitting = false;
      }
    }
  }
}
