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
              <h2 class="header-title">
                <span *ngIf="!isEditMode">➕ Agregar Refacción</span>
                <span *ngIf="isEditMode">✏️ Editar Refacción</span>
              </h2>
              <p class="header-subtitle">
                🔧 {{ machine?.name || 'Cargando máquina...' }}
                <span *ngIf="isPreselected()">
                  • {{ getSelectedCategoryLabel() }}
                </span>
              </p>
            </div>
          </div>

          <!-- Badge de categoría si está preseleccionada -->
          <div *ngIf="isPreselected()" class="category-badge">
            <span class="badge-icon">{{ getSelectedCategoryIcon() }}</span>
            <span class="badge-label">{{ getSelectedCategoryLabel() }}</span>
          </div>
        </div>
      </div>

      <div class="content-area">
        <!-- Información de la máquina -->
        <div class="machine-section">
          <div class="professional-card animate-fadeInUp">
            <div class="professional-content">
              <div class="machine-info">
                <div class="machine-icon">{{ getAreaIcon() }}</div>
                <div class="machine-details">
                  <h3 class="machine-name">{{ machine?.name }}</h3>
                  <p class="machine-area">{{ getAreaLabel() }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Formulario principal -->
        <form [formGroup]="partForm" (ngSubmit)="onSubmit()">
          <div class="form-grid">
            <!-- Lado izquierdo: Identificación -->
            <div
              class="form-section animate-fadeInUp"
              style="animation-delay: 0.1s"
            >
              <div class="professional-card">
                <div class="professional-content">
                  <h3 class="section-title">📋 Identificación</h3>

                  <!-- SAP Number -->
                  <div class="form-group">
                    <label class="form-label">📦 Número SAP *</label>
                    <input
                      type="text"
                      formControlName="sapNumber"
                      placeholder="Ej: 123456789"
                      class="form-input"
                      [class.error]="isFieldInvalid('sapNumber')"
                      [class.success]="isFieldValid('sapNumber')"
                    />
                    <div
                      *ngIf="isFieldInvalid('sapNumber')"
                      class="field-error"
                    >
                      <div
                        *ngIf="partForm.get('sapNumber')?.errors?.['required']"
                      >
                        El número SAP es obligatorio
                      </div>
                      <div
                        *ngIf="partForm.get('sapNumber')?.errors?.['minlength']"
                      >
                        Debe tener al menos 3 caracteres
                      </div>
                      <div
                        *ngIf="partForm.get('sapNumber')?.errors?.['sapExists']"
                      >
                        Ya existe una refacción con este SAP
                      </div>
                    </div>
                    <div
                      *ngIf="isFieldValid('sapNumber')"
                      class="field-success"
                    >
                      ✓ SAP disponible
                    </div>
                  </div>

                  <!-- Part Number -->
                  <div class="form-group">
                    <label class="form-label">🔖 Part Number *</label>
                    <input
                      type="text"
                      formControlName="partNumber"
                      placeholder="Ej: ABC-123-XYZ"
                      class="form-input"
                      [class.error]="isFieldInvalid('partNumber')"
                      [class.success]="isFieldValid('partNumber')"
                    />
                    <div
                      *ngIf="isFieldInvalid('partNumber')"
                      class="field-error"
                    >
                      <div
                        *ngIf="partForm.get('partNumber')?.errors?.['required']"
                      >
                        El Part Number es obligatorio
                      </div>
                      <div
                        *ngIf="partForm.get('partNumber')?.errors?.['minlength']"
                      >
                        Debe tener al menos 2 caracteres
                      </div>
                    </div>
                    <div
                      *ngIf="isFieldValid('partNumber')"
                      class="field-success"
                    >
                      ✓ Part Number válido
                    </div>
                  </div>

                  <!-- Categoría -->
                  <div class="form-group">
                    <label class="form-label">
                      📂 Categoría *
                      <span *ngIf="isPreselected()" class="preselected-label">
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
                    <div *ngIf="isPreselected()" class="preselected-info">
                      💡 Esta categoría fue seleccionada automáticamente
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Lado derecho: Descripción y Ubicación -->
            <div
              class="form-section animate-fadeInUp"
              style="animation-delay: 0.2s"
            >
              <div class="professional-card">
                <div class="professional-content">
                  <h3 class="section-title">📝 Detalles</h3>

                  <!-- Descripción -->
                  <div class="form-group">
                    <label class="form-label">📄 Descripción *</label>
                    <textarea
                      formControlName="description"
                      placeholder="Describe la refacción detalladamente..."
                      rows="4"
                      class="form-textarea"
                      [class.error]="isFieldInvalid('description')"
                      [class.success]="isFieldValid('description')"
                    ></textarea>
                    <div
                      *ngIf="isFieldInvalid('description')"
                      class="field-error"
                    >
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
                    <div
                      *ngIf="isFieldValid('description')"
                      class="field-success"
                    >
                      ✓ Descripción válida
                    </div>
                  </div>

                  <!-- Ubicación -->
                  <div class="form-group">
                    <label class="form-label">📍 Ubicación *</label>
                    <input
                      type="text"
                      formControlName="location"
                      placeholder="Ej: Estante A-3, Cajón 5"
                      class="form-input"
                      [class.error]="isFieldInvalid('location')"
                      [class.success]="isFieldValid('location')"
                    />
                    <div *ngIf="isFieldInvalid('location')" class="field-error">
                      <div
                        *ngIf="partForm.get('location')?.errors?.['required']"
                      >
                        La ubicación es obligatoria
                      </div>
                      <div
                        *ngIf="partForm.get('location')?.errors?.['minlength']"
                      >
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
                    <h4 class="preview-title">Vista previa:</h4>
                    <div
                      class="preview-card"
                      [class]="'preview-' + partForm.get('category')?.value"
                    >
                      <div class="preview-content">
                        <span class="preview-icon">{{
                          getCategoryIcon(partForm.get('category')?.value)
                        }}</span>
                        <div class="preview-info">
                          <div class="preview-name">
                            {{
                              getCategoryLabel(partForm.get('category')?.value)
                            }}
                          </div>
                          <div class="preview-description">
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
            </div>
          </div>

          <!-- Sección de imagen -->
          <div
            class="image-section animate-fadeInUp"
            style="animation-delay: 0.3s"
          >
            <div class="professional-card">
              <div class="professional-content">
                <h3 class="section-title">📸 Imagen (Opcional)</h3>
                <div class="form-group">
                  <label class="form-label">🖼️ URL de Imagen</label>
                  <input
                    type="url"
                    formControlName="image"
                    placeholder="https://ejemplo.com/imagen.jpg"
                    class="form-input"
                  />
                  <div class="field-hint">
                    💡 Puedes agregar una URL de imagen para ayudar a
                    identificar la refacción
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Botones de acción -->
          <div
            class="actions-section animate-fadeInUp"
            style="animation-delay: 0.4s"
          >
            <div class="professional-card">
              <div class="professional-content">
                <div class="action-buttons">
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
            </div>
          </div>
        </form>
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
      .app-container {
        min-height: 100vh;
        background: var(--gray-50);
        position: relative;
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

      .category-badge {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 1rem 1.5rem;
        background: rgba(255, 255, 255, 0.2);
        border-radius: var(--border-radius-lg);
        border: 2px solid rgba(255, 255, 255, 0.3);
        backdrop-filter: blur(10px);
      }

      .badge-icon {
        font-size: 1.5rem;
      }

      .badge-label {
        font-weight: bold;
        font-size: 1rem;
      }

      .content-area {
        padding: 2rem;
        max-width: 1400px;
        margin: 0 auto;
      }

      .machine-section {
        margin-bottom: 2rem;
      }

      .machine-info {
        display: flex;
        align-items: center;
        gap: 1.5rem;
        text-align: center;
        justify-content: center;
      }

      .machine-icon {
        font-size: 4rem;
        padding: 1rem;
        background: var(--gray-100);
        border-radius: var(--border-radius-xl);
        border: 2px solid var(--gray-200);
      }

      .machine-name {
        font-size: 1.5rem;
        font-weight: bold;
        color: var(--gray-900);
        margin: 0 0 0.5rem 0;
      }

      .machine-area {
        color: var(--gray-600);
        margin: 0;
        font-size: 1rem;
      }

      .form-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 2rem;
        margin-bottom: 2rem;
      }

      .form-section,
      .image-section,
      .actions-section {
        margin-bottom: 2rem;
      }

      .section-title {
        font-size: 1.25rem;
        font-weight: bold;
        color: var(--gray-900);
        margin-bottom: 1.5rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .form-group {
        margin-bottom: 1.5rem;
      }

      .form-label {
        display: block;
        font-size: 1rem;
        font-weight: 600;
        color: var(--gray-700);
        margin-bottom: 0.75rem;
      }

      .preselected-label {
        font-size: 0.875rem;
        color: var(--primary-600);
        font-weight: normal;
      }

      .form-input,
      .form-select,
      .form-textarea {
        width: 100%;
        padding: 0.75rem 1rem;
        font-size: 1rem;
        border: 2px solid var(--gray-300);
        border-radius: var(--border-radius-md);
        background: white;
        transition: all 0.3s ease;
      }

      .form-input:focus,
      .form-select:focus,
      .form-textarea:focus {
        outline: none;
        border-color: var(--primary-500);
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
      }

      .form-input.error,
      .form-select.error,
      .form-textarea.error {
        border-color: #ef4444;
        box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
      }

      .form-input.success,
      .form-select.success,
      .form-textarea.success {
        border-color: #10b981;
        box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
      }

      .form-select[disabled] {
        background-color: var(--gray-100);
        cursor: not-allowed;
        opacity: 0.8;
      }

      .field-error {
        color: #dc2626;
        font-size: 0.875rem;
        font-weight: 500;
        margin-top: 0.5rem;
      }

      .field-success {
        color: #059669;
        font-size: 0.875rem;
        font-weight: 500;
        margin-top: 0.5rem;
      }

      .field-hint {
        font-size: 0.875rem;
        color: var(--gray-500);
        margin-top: 0.5rem;
      }

      .preselected-info {
        font-size: 0.875rem;
        color: var(--primary-600);
        margin-top: 0.5rem;
      }

      .category-preview {
        margin-top: 1.5rem;
        padding: 1rem;
        background: var(--gray-50);
        border-radius: var(--border-radius-md);
        border: 1px solid var(--gray-200);
      }

      .preview-title {
        font-size: 1rem;
        font-weight: 600;
        color: var(--gray-700);
        margin-bottom: 0.75rem;
      }

      .preview-card {
        padding: 1rem;
        border-radius: var(--border-radius-md);
        border-left: 4px solid;
      }

      .preview-mecanica {
        background: var(--primary-50);
        border-left-color: var(--primary-500);
      }

      .preview-electronica {
        background: #fef3c7;
        border-left-color: #f59e0b;
      }

      .preview-consumible {
        background: #ecfdf5;
        border-left-color: #10b981;
      }

      .preview-content {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }

      .preview-icon {
        font-size: 1.5rem;
      }

      .preview-name {
        font-weight: bold;
        color: var(--gray-900);
        margin-bottom: 0.25rem;
      }

      .preview-description {
        font-size: 0.875rem;
        color: var(--gray-600);
      }

      .action-buttons {
        display: flex;
        gap: 1rem;
      }

      .action-buttons app-touch-button {
        flex: 1;
      }

      /* Notificaciones */
      .notification {
        position: fixed;
        top: 2rem;
        right: 2rem;
        z-index: 1100;
        padding: 1rem 1.5rem;
        border-radius: var(--border-radius-lg);
        box-shadow: var(--shadow-xl);
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

      /* Animaciones */
      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

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

      .animate-fadeInUp {
        animation: fadeInUp 0.6s ease-out;
      }

      /* Responsive */
      @media (max-width: 1024px) {
        .form-grid {
          grid-template-columns: 1fr;
          gap: 1.5rem;
        }
      }

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

        .machine-info {
          flex-direction: column;
          text-align: center;
        }

        .machine-icon {
          font-size: 3rem;
        }

        .action-buttons {
          flex-direction: column;
        }

        .notification {
          top: 1rem;
          right: 1rem;
          left: 1rem;
          max-width: none;
        }
      }

      @media (max-width: 480px) {
        .professional-header {
          padding: 1rem;
        }

        .professional-content {
          padding: 1rem;
        }

        .header-title {
          font-size: 1.5rem;
        }

        .form-input,
        .form-select,
        .form-textarea {
          font-size: 0.875rem;
          padding: 0.625rem 0.75rem;
        }
      }
    `,
  ],
})
export class AddPartComponent implements OnInit {
  partForm: FormGroup;
  machineId!: number;
  partId?: number; // Para edición
  machine: Machine | null = null;
  isSubmitting = false;
  selectedArea: string = 'costura';
  selectedCategory: string = '';
  isEditMode = false; // Indica si estamos editando
  originalPart: any = null; // Datos originales de la refacción

  // Notificaciones
  showNotification = false;
  notificationMessage = '';
  notificationType: 'success' | 'error' = 'success';

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
      this.partId = params['partId'] ? +params['partId'] : undefined;

      // Determinar si estamos en modo edición
      this.isEditMode = !!this.partId;

      // Preseleccionar categoría si viene en la URL
      if (this.selectedCategory && this.selectedCategory !== 'all') {
        this.partForm.patchValue({ category: this.selectedCategory });
      }

      this.loadMachine();

      // Si estamos editando, cargar los datos de la refacción
      if (this.isEditMode && this.partId) {
        this.loadPartForEdit(this.partId);
      }
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
        // En modo edición, excluir el ID actual de la validación
        const excludeId =
          this.isEditMode && this.partId ? this.partId : undefined;
        const isUnique = await this.partService.isSapNumberUnique(
          sapNumber,
          excludeId
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

  getNotificationIcon(): string {
    return this.notificationType === 'success' ? '✅' : '❌';
  }

  showNotificationMessage(
    message: string,
    type: 'success' | 'error' = 'success'
  ) {
    this.notificationMessage = message;
    this.notificationType = type;
    this.showNotification = true;

    setTimeout(() => {
      this.showNotification = false;
    }, 4000);
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

        if (this.isEditMode && this.partId) {
          // Actualizar refacción existente
          await this.partService.updatePart(this.partId, partData).toPromise();
          console.log('✅ Part updated successfully');
          this.showNotificationMessage(
            `Refacción "${partData.description}" actualizada exitosamente`,
            'success'
          );
        } else {
          // Crear nueva refacción
          await this.partService.createPart(partData).toPromise();
          console.log('✅ Part created successfully');
          this.showNotificationMessage(
            `Refacción "${partData.description}" agregada exitosamente`,
            'success'
          );
        }

        // Esperar un momento para que se vea la notificación
        setTimeout(() => {
          // Navegar a la lista de la categoría
          this.router.navigate([
            '/machines',
            this.selectedArea,
            this.machineId,
            'parts',
            partData.category,
          ]);
        }, 1500);
      } catch (error) {
        console.error('Error saving part:', error);
        const action = this.isEditMode ? 'actualizar' : 'agregar';
        this.showNotificationMessage(
          `Error al ${action} la refacción. Intenta nuevamente.`,
          'error'
        );
        this.isSubmitting = false;
      }
    }
  }

  loadPartForEdit(partId: number) {
    this.partService.getPartById(partId).subscribe({
      next: (part) => {
        if (part) {
          this.originalPart = part;

          // Cargar los datos en el formulario
          this.partForm.patchValue({
            sapNumber: part.sapNumber,
            partNumber: part.partNumber,
            description: part.description,
            category: part.category,
            location: part.location,
            image: part.image || '',
          });

          // Actualizar la categoría seleccionada
          this.selectedCategory = part.category;

          console.log('✅ Refacción cargada para editar:', part);
        }
      },
      error: (error) => {
        console.error('Error loading part for edit:', error);
        this.showNotificationMessage('Error al cargar la refacción', 'error');
      },
    });
  }
}
