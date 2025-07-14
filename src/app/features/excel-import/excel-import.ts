import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TouchButtonComponent } from '../../shared/components/touch-button/touch-button';
import { MachineService } from '../../core/services/machine';
import { PartService } from '../../core/services/part';
import { DatabaseService } from '../../core/services/database';
import {
  Machine,
  Part,
  CreateMachineDto,
  CreatePartDto,
} from '../../core/models';
import * as XLSX from 'xlsx';

interface ExcelRow {
  [key: string]: any;
}

interface ImportResult {
  success: number;
  errors: string[];
  duplicates: number;
}

@Component({
  selector: 'app-excel-import',
  standalone: true,
  imports: [CommonModule, FormsModule, TouchButtonComponent],
  template: `
    <div class="excel-import-container">
      <!-- Header -->
      <div class="professional-card mb-8">
        <div class="professional-content">
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
                <h2 class="text-4xl font-bold text-gray-900 mb-2">
                  📊 Importación de Excel
                </h2>
                <p class="text-xl text-gray-600">
                  Importar máquinas y refacciones desde archivos Excel
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Instrucciones -->
      <div class="professional-card mb-8">
        <div class="professional-content">
          <h3 class="text-2xl font-bold text-gray-900 mb-4">
            📋 Tu Excel es Compatible
          </h3>

          <div class="format-notes">
            <p class="text-sm text-gray-600 mb-2">
              <strong>✅ Detección automática:</strong>
            </p>
            <ul class="text-sm text-gray-600 space-y-1">
              <li>• <strong>SAP:</strong> Detectado automáticamente</li>
              <li>• <strong>#PARTE:</strong> Se usará como Part Number</li>
              <li>
                • <strong>DESCRIPCION:</strong> Descripción de la refacción
              </li>
              <li>• <strong>UBICACION:</strong> Ubicación física</li>
              <li>
                • <strong>Categoría:</strong> Se detectará por hoja/posición
              </li>
              <li>
                • <strong>Máquinas:</strong> Se crearán automáticamente al
                detectar nombres en descripciones
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Controles globales -->
      <div class="global-controls professional-card mb-8">
        <div class="professional-content">
          <h3 class="text-xl font-bold text-gray-900 mb-6">
            ⚙️ Configuración de Importación
          </h3>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Selector de área para refacciones -->
            <div class="control-group">
              <label class="form-label">
                🏭 Área por defecto para nuevas máquinas
              </label>
              <select [(ngModel)]="selectedAreaForParts" class="form-select">
                <option value="costura">🧵 Área de Costura</option>
                <option value="corte">✂️ Área de Corte</option>
              </select>
              <p class="text-sm text-gray-600 mt-2">
                Las máquinas detectadas en las refacciones se crearán en esta
                área
              </p>
            </div>

            <!-- Botón de limpieza -->
            <div class="control-group">
              <label class="form-label"> 🗑️ Limpiar datos importados </label>
              <app-touch-button
                variant="danger"
                size="lg"
                icon="🗑️"
                [fullWidth]="true"
                [disabled]="isDeleting"
                [loading]="isDeleting"
                (clicked)="clearAllImports()"
              >
                {{
                  isDeleting
                    ? 'Eliminando...'
                    : 'Borrar Todas las Importaciones'
                }}
              </app-touch-button>
              <p class="text-sm text-gray-600 mt-2">
                ⚠️ Elimina todas las máquinas y refacciones del sistema
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Área de importación -->
      <div class="import-section">
        <div class="professional-grid grid-2">
          <!-- Importar Refacciones -->
          <div class="import-card professional-card">
            <div class="professional-content">
              <div class="import-header mb-6">
                <div class="import-icon bg-green-100 text-green-600 mb-4">
                  <svg
                    class="w-12 h-12"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M14 2H6C4.9 2 4 2.9 4 4v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6z"
                    ></path>
                    <path d="M14 2v6h6"></path>
                  </svg>
                </div>
                <h3 class="text-2xl font-bold text-gray-900 mb-2">
                  Importar Refacciones
                </h3>
                <p class="text-gray-600">
                  Cargar archivo Excel con listado de refacciones
                </p>
              </div>

              <div
                class="upload-area"
                [class.dragover]="isDragOverParts"
                (dragover)="onDragOver($event, 'parts')"
                (dragleave)="onDragLeave('parts')"
                (drop)="onDrop($event, 'parts')"
              >
                <div class="upload-content">
                  <svg
                    class="upload-icon"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    ></path>
                  </svg>
                  <p class="upload-text">
                    Arrastra tu archivo Excel aquí o
                    <button
                      class="upload-link"
                      (click)="triggerFileInput('parts')"
                    >
                      selecciona archivo
                    </button>
                  </p>
                  <p class="upload-hint">Solo archivos .xlsx, .xls</p>
                </div>
              </div>

              <input
                #partsFileInput
                type="file"
                accept=".xlsx,.xls"
                (change)="onFileSelected($event, 'parts')"
                class="hidden"
              />

              <div *ngIf="partsFile" class="file-selected mb-4">
                <div
                  class="flex items-center justify-between p-3 bg-green-50 rounded-lg"
                >
                  <div class="flex items-center">
                    <svg
                      class="w-5 h-5 text-green-600 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        d="M4 3C2.9 3 2 3.9 2 5v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2H4z"
                      ></path>
                    </svg>
                    <span class="text-sm font-medium text-green-900">{{
                      partsFile.name
                    }}</span>
                  </div>
                  <button
                    (click)="clearFile('parts')"
                    class="text-green-600 hover:text-green-800"
                  >
                    <svg
                      class="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"
                      ></path>
                    </svg>
                  </button>
                </div>
              </div>

              <app-touch-button
                variant="success"
                size="lg"
                [fullWidth]="true"
                [disabled]="!partsFile || isProcessing"
                [loading]="isProcessing && processingType === 'parts'"
                (clicked)="importParts()"
              >
                {{
                  isProcessing && processingType === 'parts'
                    ? 'Procesando...'
                    : 'Importar Refacciones'
                }}
              </app-touch-button>
            </div>
          </div>

          <!-- Importar Máquinas -->
          <div class="import-card professional-card">
            <div class="professional-content">
              <div class="import-header mb-6">
                <div class="import-icon bg-blue-100 text-blue-600 mb-4">
                  <svg
                    class="w-12 h-12"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M14 2H6C4.9 2 4 2.9 4 4v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6z"
                    ></path>
                    <path d="M14 2v6h6"></path>
                  </svg>
                </div>
                <h3 class="text-2xl font-bold text-gray-900 mb-2">
                  Importar Máquinas
                </h3>
                <p class="text-gray-600">
                  Cargar archivo Excel con listado de máquinas (Opcional)
                </p>
              </div>

              <div
                class="upload-area"
                [class.dragover]="isDragOverMachines"
                (dragover)="onDragOver($event, 'machines')"
                (dragleave)="onDragLeave('machines')"
                (drop)="onDrop($event, 'machines')"
              >
                <div class="upload-content">
                  <svg
                    class="upload-icon"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    ></path>
                  </svg>
                  <p class="upload-text">
                    Arrastra tu archivo Excel aquí o
                    <button
                      class="upload-link"
                      (click)="triggerFileInput('machines')"
                    >
                      selecciona archivo
                    </button>
                  </p>
                  <p class="upload-hint">
                    Solo archivos .xlsx, .xls (Columnas: Nombre, Area)
                  </p>
                </div>
              </div>

              <input
                #machinesFileInput
                type="file"
                accept=".xlsx,.xls"
                (change)="onFileSelected($event, 'machines')"
                class="hidden"
              />

              <div *ngIf="machinesFile" class="file-selected mb-4">
                <div
                  class="flex items-center justify-between p-3 bg-blue-50 rounded-lg"
                >
                  <div class="flex items-center">
                    <svg
                      class="w-5 h-5 text-blue-600 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        d="M4 3C2.9 3 2 3.9 2 5v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2H4z"
                      ></path>
                    </svg>
                    <span class="text-sm font-medium text-blue-900">{{
                      machinesFile.name
                    }}</span>
                  </div>
                  <button
                    (click)="clearFile('machines')"
                    class="text-blue-600 hover:text-blue-800"
                  >
                    <svg
                      class="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"
                      ></path>
                    </svg>
                  </button>
                </div>
              </div>

              <app-touch-button
                variant="primary"
                size="lg"
                [fullWidth]="true"
                [disabled]="!machinesFile || isProcessing"
                [loading]="isProcessing && processingType === 'machines'"
                (clicked)="importMachines()"
              >
                {{
                  isProcessing && processingType === 'machines'
                    ? 'Procesando...'
                    : 'Importar Máquinas'
                }}
              </app-touch-button>
            </div>
          </div>
        </div>
      </div>

      <!-- Resultados de importación -->
      <div *ngIf="importResults" class="results-section professional-card mt-8">
        <div class="professional-content">
          <h3 class="text-2xl font-bold text-gray-900 mb-6">
            📈 Resultados de Importación
          </h3>

          <div class="results-grid">
            <div class="result-item success">
              <div class="result-number">{{ importResults.success }}</div>
              <div class="result-label">Registros Importados</div>
            </div>

            <div
              class="result-item warning"
              *ngIf="importResults.duplicates > 0"
            >
              <div class="result-number">{{ importResults.duplicates }}</div>
              <div class="result-label">Duplicados Omitidos</div>
            </div>

            <div
              class="result-item error"
              *ngIf="importResults.errors.length > 0"
            >
              <div class="result-number">{{ importResults.errors.length }}</div>
              <div class="result-label">Errores</div>
            </div>
          </div>

          <div
            *ngIf="importResults.errors.length > 0"
            class="errors-section mt-6"
          >
            <h4 class="text-lg font-semibold text-red-600 mb-3">
              ⚠️ Errores Encontrados
            </h4>
            <div class="errors-list">
              <div
                *ngFor="let error of importResults.errors"
                class="error-item"
              >
                {{ error }}
              </div>
            </div>
          </div>

          <div class="mt-6">
            <app-touch-button
              variant="primary"
              size="lg"
              (clicked)="resetImport()"
            >
              Realizar Nueva Importación
            </app-touch-button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .excel-import-container {
        padding: 2rem 0;
        min-height: 70vh;
      }

      .control-group {
        padding: 1.5rem;
        background: #f8fafc;
        border-radius: 0.75rem;
        border: 2px solid #e2e8f0;
      }

      .form-label {
        display: block;
        font-size: 1rem;
        font-weight: 600;
        color: #374151;
        margin-bottom: 0.75rem;
      }

      .form-select {
        width: 100%;
        padding: 0.75rem 1rem;
        font-size: 1rem;
        border: 2px solid #d1d5db;
        border-radius: 0.5rem;
        background: white;
        transition: all 0.2s ease;
        margin-bottom: 0.5rem;
      }

      .form-select:focus {
        outline: none;
        border-color: #3b82f6;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
      }

      .global-controls {
        border-left: 4px solid #8b5cf6;
      }

      .format-notes {
        padding: 1rem;
        background: white;
        border-radius: 0.5rem;
        border: 1px solid #d1d5db;
      }

      .import-section {
        margin: 2rem 0;
      }

      .import-card {
        border-left: 4px solid transparent;
      }

      .import-card:nth-child(1) {
        border-left-color: #10b981;
      }

      .import-card:nth-child(2) {
        border-left-color: #3b82f6;
      }

      .import-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 4rem;
        height: 4rem;
        border-radius: 0.75rem;
        margin: 0 auto;
      }

      .upload-area {
        border: 2px dashed #d1d5db;
        border-radius: 0.75rem;
        padding: 3rem 2rem;
        text-align: center;
        background: #f9fafb;
        transition: all 0.3s ease;
        margin-bottom: 1.5rem;
        cursor: pointer;
      }

      .upload-area:hover {
        border-color: #3b82f6;
        background: #eff6ff;
      }

      .upload-area.dragover {
        border-color: #10b981;
        background: #ecfdf5;
        transform: scale(1.02);
      }

      .upload-content {
        pointer-events: none;
      }

      .upload-icon {
        width: 3rem;
        height: 3rem;
        color: #9ca3af;
        margin: 0 auto 1rem;
      }

      .upload-text {
        font-size: 1.125rem;
        color: #374151;
        margin-bottom: 0.5rem;
      }

      .upload-link {
        color: #3b82f6;
        font-weight: 600;
        text-decoration: underline;
        pointer-events: auto;
        cursor: pointer;
      }

      .upload-link:hover {
        color: #1d4ed8;
      }

      .upload-hint {
        font-size: 0.875rem;
        color: #6b7280;
      }

      .file-selected {
        animation: slideInDown 0.3s ease;
      }

      .results-section {
        border-left: 4px solid #10b981;
      }

      .results-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1.5rem;
        margin-bottom: 2rem;
      }

      .result-item {
        text-align: center;
        padding: 1.5rem;
        border-radius: 0.75rem;
        border: 2px solid;
      }

      .result-item.success {
        background: #ecfdf5;
        border-color: #10b981;
        color: #065f46;
      }

      .result-item.warning {
        background: #fffbeb;
        border-color: #f59e0b;
        color: #92400e;
      }

      .result-item.error {
        background: #fef2f2;
        border-color: #ef4444;
        color: #991b1b;
      }

      .result-number {
        font-size: 2.5rem;
        font-weight: 900;
        line-height: 1;
        margin-bottom: 0.5rem;
      }

      .result-label {
        font-size: 0.875rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .errors-section {
        padding: 1.5rem;
        background: #fef2f2;
        border-radius: 0.75rem;
        border: 1px solid #fecaca;
      }

      .errors-list {
        max-height: 200px;
        overflow-y: auto;
      }

      .error-item {
        padding: 0.5rem 1rem;
        margin-bottom: 0.5rem;
        background: white;
        border-radius: 0.375rem;
        border-left: 3px solid #ef4444;
        font-size: 0.875rem;
        color: #991b1b;
      }

      .hidden {
        display: none;
      }

      /* Animaciones */
      @keyframes slideInDown {
        from {
          opacity: 0;
          transform: translateY(-10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      /* Responsive */
      @media (max-width: 768px) {
        .excel-import-container {
          padding: 1rem 0;
        }

        .upload-area {
          padding: 2rem 1rem;
        }

        .upload-icon {
          width: 2rem;
          height: 2rem;
        }

        .upload-text {
          font-size: 1rem;
        }

        .results-grid {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class ExcelImportComponent implements OnInit {
  @ViewChild('machinesFileInput')
  machinesFileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('partsFileInput') partsFileInput!: ElementRef<HTMLInputElement>;

  machinesFile: File | null = null;
  partsFile: File | null = null;
  isDragOverMachines = false;
  isDragOverParts = false;
  isProcessing = false;
  processingType: 'machines' | 'parts' | null = null;
  importResults: ImportResult | null = null;

  // Nuevos controles
  selectedAreaForParts: 'corte' | 'costura' = 'costura';
  isDeleting = false;

  constructor(
    private router: Router,
    private machineService: MachineService,
    private partService: PartService,
    private databaseService: DatabaseService
  ) {}

  async ngOnInit() {
    try {
      await this.databaseService.initializeDatabase();
    } catch (error) {
      console.error('Error initializing database:', error);
    }
  }

  goBack() {
    this.router.navigate(['/']);
  }

  async clearAllImports() {
    const confirmation = confirm(
      '⚠️ ¿Estás seguro de eliminar TODAS las máquinas y refacciones?\n\n' +
        'Esta acción no se puede deshacer.\n\n' +
        '• Se eliminarán todas las máquinas\n' +
        '• Se eliminarán todas las refacciones\n' +
        '• El sistema quedará vacío\n\n' +
        'Escribir "ELIMINAR" para confirmar'
    );

    if (!confirmation) return;

    const secondConfirm = prompt('Para confirmar, escribe: ELIMINAR');
    if (secondConfirm !== 'ELIMINAR') {
      alert('❌ Cancelado. No se eliminó nada.');
      return;
    }

    this.isDeleting = true;

    try {
      console.log('🗑️ Iniciando eliminación completa...');

      // Eliminar todas las refacciones primero
      const allParts = await this.partService.loadParts().toPromise();
      if (allParts && allParts.length > 0) {
        for (const part of allParts) {
          if (part.id) {
            await this.partService.deletePart(part.id).toPromise();
          }
        }
        console.log(`🗑️ Eliminadas ${allParts.length} refacciones`);
      }

      // Eliminar todas las máquinas
      const allMachines = await this.machineService.loadMachines().toPromise();
      if (allMachines && allMachines.length > 0) {
        for (const machine of allMachines) {
          if (machine.id) {
            await this.machineService.deleteMachine(machine.id).toPromise();
          }
        }
        console.log(`🗑️ Eliminadas ${allMachines.length} máquinas`);
      }

      alert(
        '✅ Eliminación completada!\n\nTodas las máquinas y refacciones han sido eliminadas del sistema.'
      );

      // Limpiar resultados y archivos
      this.resetImport();
    } catch (error) {
      console.error('❌ Error eliminando datos:', error);
      alert(
        '❌ Error al eliminar los datos. Algunos elementos pueden no haberse eliminado.'
      );
    } finally {
      this.isDeleting = false;
    }
  }

  // Manejo de drag & drop
  onDragOver(event: DragEvent, type: 'machines' | 'parts') {
    event.preventDefault();
    if (type === 'machines') {
      this.isDragOverMachines = true;
    } else {
      this.isDragOverParts = true;
    }
  }

  onDragLeave(type: 'machines' | 'parts') {
    if (type === 'machines') {
      this.isDragOverMachines = false;
    } else {
      this.isDragOverParts = false;
    }
  }

  onDrop(event: DragEvent, type: 'machines' | 'parts') {
    event.preventDefault();
    if (type === 'machines') {
      this.isDragOverMachines = false;
    } else {
      this.isDragOverParts = false;
    }

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFile(files[0], type);
    }
  }

  triggerFileInput(type: 'machines' | 'parts') {
    if (type === 'machines' && this.machinesFileInput) {
      this.machinesFileInput.nativeElement.click();
    } else if (type === 'parts' && this.partsFileInput) {
      this.partsFileInput.nativeElement.click();
    }
  }

  onFileSelected(event: Event, type: 'machines' | 'parts') {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFile(input.files[0], type);
    }
  }

  private handleFile(file: File, type: 'machines' | 'parts') {
    if (!this.isValidExcelFile(file)) {
      alert('Por favor selecciona un archivo Excel válido (.xlsx o .xls)');
      return;
    }

    if (type === 'machines') {
      this.machinesFile = file;
    } else {
      this.partsFile = file;
    }

    console.log(`📁 ${type} file selected:`, file.name);
  }

  private isValidExcelFile(file: File): boolean {
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
    ];
    return (
      validTypes.includes(file.type) ||
      file.name.endsWith('.xlsx') ||
      file.name.endsWith('.xls')
    );
  }

  clearFile(type: 'machines' | 'parts') {
    if (type === 'machines') {
      this.machinesFile = null;
    } else {
      this.partsFile = null;
    }
  }

  async importMachines() {
    if (!this.machinesFile) return;

    this.isProcessing = true;
    this.processingType = 'machines';
    this.importResults = null;

    try {
      console.log('🔄 Iniciando importación de máquinas...');
      const data = await this.readExcelFile(this.machinesFile);
      const result = await this.processMachinesData(data);
      this.importResults = result;

      console.log('✅ Machines import completed:', result);
    } catch (error) {
      console.error('❌ Error importing machines:', error);
      alert('Error al procesar el archivo de máquinas');
    } finally {
      this.isProcessing = false;
      this.processingType = null;
    }
  }

  async importParts() {
    if (!this.partsFile) return;

    this.isProcessing = true;
    this.processingType = 'parts';
    this.importResults = null;

    try {
      console.log('🔄 Iniciando importación de refacciones...');
      const result = await this.processPartsFromAllSheets(this.partsFile);
      this.importResults = result;

      console.log('✅ Parts import completed:', result);

      if (result.success > 0) {
        alert(
          `✅ Importación completada!\n\n📊 Resumen:\n• ${result.success} refacciones importadas\n• ${result.duplicates} duplicados omitidos\n• ${result.errors.length} errores`
        );
      } else if (result.errors.length > 0) {
        alert(
          `⚠️ No se pudo importar ninguna refacción.\n\nVerifica:\n• Que las columnas tengan nombres: SAP, #PARTE, DESCRIPCION\n• Que no haya filas vacías\n• Que el formato sea correcto`
        );
      }
    } catch (error) {
      console.error('❌ Error importing parts:', error);
      alert(
        `❌ Error al procesar el archivo:\n\n${error}\n\nVerifica que el archivo Excel esté en el formato correcto.`
      );
    } finally {
      this.isProcessing = false;
      this.processingType = null;
    }
  }

  private async readExcelFile(file: File): Promise<ExcelRow[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          resolve(jsonData as ExcelRow[]);
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => reject(new Error('Error leyendo el archivo'));
      reader.readAsArrayBuffer(file);
    });
  }

  private async processMachinesData(data: ExcelRow[]): Promise<ImportResult> {
    const result: ImportResult = { success: 0, errors: [], duplicates: 0 };

    for (const [index, row] of data.entries()) {
      try {
        const name = this.extractValue(row, [
          'Nombre',
          'nombre',
          'NOMBRE',
          'Name',
          'name',
        ]);
        const area = this.extractValue(row, [
          'Area',
          'area',
          'AREA',
          'Área',
          'área',
        ]);

        if (!name || !area) {
          result.errors.push(
            `Fila ${index + 2}: Faltan datos obligatorios (Nombre, Area)`
          );
          continue;
        }

        const validArea = area.toString().toLowerCase();
        if (!['corte', 'costura'].includes(validArea)) {
          result.errors.push(
            `Fila ${index + 2}: Área "${area}" debe ser "corte" o "costura"`
          );
          continue;
        }

        const exists = await this.machineService.isNameUnique(
          name.toString(),
          validArea as any
        );
        if (!exists) {
          result.duplicates++;
          continue;
        }

        const machineData: CreateMachineDto = {
          name: name.toString().trim(),
          area: validArea as any,
        };

        await this.machineService.createMachine(machineData).toPromise();
        result.success++;
      } catch (error) {
        result.errors.push(`Fila ${index + 2}: ${error}`);
      }
    }

    return result;
  }

  private async processPartsFromAllSheets(file: File): Promise<ImportResult> {
    const result: ImportResult = { success: 0, errors: [], duplicates: 0 };

    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = async (e) => {
        try {
          console.log('📖 Leyendo archivo Excel...');
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });

          console.log('📊 Hojas encontradas:', workbook.SheetNames);

          if (workbook.SheetNames.length === 0) {
            throw new Error('El archivo Excel no contiene hojas');
          }

          const sheetCategoryMap: { [key: string]: string } = {
            REFACCIONES: 'auto',
            SENSORES: 'electronica',
            CONSUMIBLE: 'consumible',
            MISCELANEO: 'mecanica',
            LUBRICANTES: 'consumible',
            LIJAS: 'consumible',
            NEUMATICA: 'mecanica',
            ROFIN: 'electronica',
            ELECTRONICA: 'electronica',
            ELECTRONICO: 'electronica',
            MECANICA: 'mecanica',
            MECANICO: 'mecanica',
          };

          console.log('🔍 Buscando máquinas existentes...');
          const existingMachines: { [key: string]: number } = {};
          try {
            const allMachines = await this.machineService
              .loadMachines()
              .toPromise();
            if (allMachines && allMachines.length > 0) {
              allMachines.forEach((machine) => {
                existingMachines[machine.name] = machine.id!;
                console.log(
                  `✅ Máquina encontrada: ${machine.name} (ID: ${machine.id})`
                );
              });
            }
          } catch (error) {
            console.warn(
              '⚠️ No se pudieron cargar las máquinas existentes:',
              error
            );
          }

          for (const sheetName of workbook.SheetNames) {
            console.log(`\n🔄 Procesando hoja: "${sheetName}"`);

            const worksheet = workbook.Sheets[sheetName];
            const sheetData = XLSX.utils.sheet_to_json(worksheet, {
              header: 1,
              defval: '',
            }) as any[][];

            console.log(`📋 Filas en ${sheetName}:`, sheetData.length);

            if (sheetData.length < 2) {
              console.log(`⚠️ Hoja "${sheetName}" no tiene suficientes datos`);
              continue;
            }

            const headers = sheetData[0];
            const dataRows = sheetData.slice(1);

            console.log(`🏷️ Headers en ${sheetName}:`, headers);

            const sapIndex = this.findColumnIndex(headers, [
              'SAP',
              'sap',
              'Sap',
            ]);
            const partIndex = this.findColumnIndex(headers, [
              '#PARTE',
              'PARTE',
              'PartNumber',
              'partNumber',
              'Part Number',
            ]);
            const descIndex = this.findColumnIndex(headers, [
              'DESCRIPCION',
              'Descripcion',
              'descripcion',
              'DESCRIPTION',
              'Description',
            ]);
            const ubicIndex = this.findColumnIndex(headers, [
              'UBICACIÓN',
              'UBICACION',
              'Ubicación',
              'Ubicacion',
              'ubicación',
              'ubicacion',
              'LOCATION',
              'Location',
              'UBIC',
              'ubic',
            ]);

            console.log(`📍 Índices encontrados en ${sheetName}:`, {
              SAP: sapIndex,
              PARTE: partIndex,
              DESCRIPCION: descIndex,
              UBICACION: ubicIndex,
            });

            if (sapIndex === -1 || partIndex === -1 || descIndex === -1) {
              result.errors.push(
                `Hoja "${sheetName}": No se encontraron las columnas requeridas (SAP, #PARTE, DESCRIPCION)`
              );
              continue;
            }

            const category =
              sheetCategoryMap[sheetName.toUpperCase()] || 'mecanica';

            for (const [rowIndex, row] of dataRows.entries()) {
              try {
                const sap = row[sapIndex];
                const partNumber = row[partIndex];
                const description = row[descIndex];
                const ubicacion = ubicIndex >= 0 ? row[ubicIndex] : '';

                if (!sap || !partNumber || !description) {
                  if (sap || partNumber || description) {
                    result.errors.push(
                      `Hoja "${sheetName}", Fila ${
                        rowIndex + 2
                      }: Faltan datos obligatorios`
                    );
                  }
                  continue;
                }

                let finalCategory = category;
                if (category === 'auto') {
                  finalCategory = this.detectCategory(
                    description.toString(),
                    sheetName,
                    rowIndex
                  );
                }

                let machineId = await this.getOrCreateMachineForPart(
                  description.toString(),
                  finalCategory,
                  existingMachines,
                  this.selectedAreaForParts
                );

                console.log(
                  `🎯 Asignando "${description}" a máquina ID: ${machineId}`
                );

                const exists = await this.partService.isSapNumberUnique(
                  sap.toString()
                );
                if (!exists) {
                  result.duplicates++;
                  continue;
                }

                const partData: CreatePartDto = {
                  sapNumber: sap.toString().trim(),
                  partNumber: partNumber.toString().trim(),
                  description: description.toString().trim(),
                  category: finalCategory as any,
                  location: ubicacion
                    ? ubicacion.toString().trim()
                    : 'Sin ubicación',
                  machineId: machineId,
                  image: '',
                };

                console.log(
                  `✅ Creando refacción: ${partData.sapNumber} - ${partData.description}`
                );
                await this.partService.createPart(partData).toPromise();
                result.success++;
              } catch (error) {
                result.errors.push(
                  `Hoja "${sheetName}", Fila ${rowIndex + 2}: ${error}`
                );
                console.error(`❌ Error en fila ${rowIndex + 2}:`, error);
              }
            }
          }

          console.log('📊 Resultado final:', result);
          resolve(result);
        } catch (error) {
          console.error('❌ Error procesando archivo:', error);
          reject(error);
        }
      };

      reader.onerror = () => reject(new Error('Error leyendo el archivo'));
      reader.readAsArrayBuffer(file);
    });
  }

  private async getOrCreateMachineForPart(
    description: string,
    category: string,
    existingMachines: { [key: string]: number },
    defaultArea: 'corte' | 'costura'
  ): Promise<number> {
    const descLower = description.toLowerCase();

    const machineNames = this.extractMachineNames(description);

    if (category === 'consumible' && machineNames.length === 0) {
      if (!existingMachines['GENERAL']) {
        console.log('🏭 Creando máquina GENERAL para consumibles...');
        try {
          const generalMachine = await this.machineService
            .createMachine({
              name: 'GENERAL',
              area: defaultArea,
            })
            .toPromise();
          if (generalMachine) {
            existingMachines['GENERAL'] = generalMachine.id!;
            console.log(`✅ Máquina GENERAL creada (ID: ${generalMachine.id})`);
          }
        } catch (error) {
          console.error('❌ Error creando máquina GENERAL:', error);
        }
      }
      return existingMachines['GENERAL'] || Object.values(existingMachines)[0];
    }

    if (machineNames.length > 0) {
      for (const machineName of machineNames) {
        if (existingMachines[machineName]) {
          console.log(`✅ Usando máquina existente: ${machineName}`);
          return existingMachines[machineName];
        }

        console.log(`🏭 Creando nueva máquina: ${machineName}`);
        try {
          const newMachine = await this.machineService
            .createMachine({
              name: machineName,
              area: defaultArea,
            })
            .toPromise();
          if (newMachine) {
            existingMachines[machineName] = newMachine.id!;
            console.log(
              `✅ Máquina ${machineName} creada (ID: ${newMachine.id})`
            );
            return newMachine.id!;
          }
        } catch (error) {
          console.error(`❌ Error creando máquina ${machineName}:`, error);
        }
      }
    }

    if (!existingMachines['GENERAL']) {
      console.log('🏭 Creando máquina GENERAL...');
      try {
        const generalMachine = await this.machineService
          .createMachine({
            name: 'GENERAL',
            area: defaultArea,
          })
          .toPromise();
        if (generalMachine) {
          existingMachines['GENERAL'] = generalMachine.id!;
          console.log(`✅ Máquina GENERAL creada (ID: ${generalMachine.id})`);
        }
      } catch (error) {
        console.error('❌ Error creando máquina GENERAL:', error);
      }
    }

    return existingMachines['GENERAL'] || Object.values(existingMachines)[0];
  }

  private extractMachineNames(description: string): string[] {
    const descUpper = description.toUpperCase();
    const machineNames: string[] = [];

    const patterns = [
      /MITSUBISHI[^A-Z]*([A-Z0-9\-]+)?/g,
      /BROTHER[^A-Z]*([A-Z0-9\-]+)?/g,
      /JUKI[^A-Z]*([A-Z0-9\-]+)?/g,
      /SINGER[^A-Z]*([A-Z0-9\-]+)?/g,
      /PFAFF[^A-Z]*([A-Z0-9\-]+)?/g,
      /YAMATO[^A-Z]*([A-Z0-9\-]+)?/g,
      /PEGASUS[^A-Z]*([A-Z0-9\-]+)?/g,
      /KANSAI[^A-Z]*([A-Z0-9\-]+)?/g,
      /UNION\s*SPECIAL[^A-Z]*([A-Z0-9\-]+)?/g,
    ];

    patterns.forEach((pattern) => {
      let match;
      while ((match = pattern.exec(descUpper)) !== null) {
        let machineName = match[0].trim();

        machineName = machineName.replace(/[^A-Z0-9\-\s]/g, '').trim();

        if (machineName.length < 3) {
          const brand = match[0].split(/[^A-Z]/)[0];
          machineName = brand + '-01';
        }

        if (!machineNames.includes(machineName)) {
          machineNames.push(machineName);
          console.log(
            `🔍 Detectado nombre de máquina: "${machineName}" en "${description}"`
          );
        }
      }
    });

    return machineNames;
  }

  private findColumnIndex(headers: any[], possibleNames: string[]): number {
    for (let i = 0; i < headers.length; i++) {
      const header = headers[i];
      if (header) {
        const headerStr = header.toString().trim();
        for (const name of possibleNames) {
          if (headerStr.toLowerCase() === name.toLowerCase()) {
            return i;
          }
        }
      }
    }
    return -1;
  }

  private detectCategory(
    description: string,
    sheetName: string,
    rowIndex: number
  ): string {
    const desc = description.toLowerCase();

    if (sheetName === 'REFACCIONES') {
      if (rowIndex < 50) return 'mecanica';
      if (rowIndex < 100) return 'electronica';
      return 'consumible';
    }

    if (
      desc.includes('sensor') ||
      desc.includes('cable') ||
      desc.includes('pcb') ||
      desc.includes('motor') ||
      desc.includes('servo')
    ) {
      return 'electronica';
    }

    if (
      desc.includes('lubricante') ||
      desc.includes('aceite') ||
      desc.includes('filtro') ||
      desc.includes('lija') ||
      desc.includes('consumible')
    ) {
      return 'consumible';
    }

    return 'mecanica';
  }

  private extractValue(row: ExcelRow, possibleKeys: string[]): any {
    for (const key of possibleKeys) {
      if (row[key] !== undefined && row[key] !== null && row[key] !== '') {
        return row[key];
      }
    }
    return null;
  }

  resetImport() {
    this.importResults = null;
    this.machinesFile = null;
    this.partsFile = null;
    this.isDragOverMachines = false;
    this.isDragOverParts = false;
    this.isProcessing = false;
    this.processingType = null;
  }
}
