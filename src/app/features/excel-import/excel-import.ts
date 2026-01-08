import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TouchButtonComponent } from '../../shared/components/touch-button/touch-button';
import { MachineService } from '../../core/services/machine';
import { PartService } from '../../core/services/part';
import { ToolService } from '../../core/services/tool';
import { DatabaseService } from '../../core/services/database';
import {
  Machine,
  Part,
  CreateMachineDto,
  CreatePartDto,
  CreateToolDto,
} from '../../core/models';
import * as XLSX from 'xlsx';

interface ExcelRow {
  [key: string]: any;
}

interface ImportResult {
  success: number;
  errors: string[];
  duplicates: number;
  omittedRows: string[];
  duplicatedSaps: string[];
}

@Component({
  selector: 'app-excel-import',
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
              <h2 class="header-title">📊 Importación de Excel</h2>
              <p class="header-subtitle">
                Importar máquinas y refacciones desde archivos Excel
              </p>
            </div>
          </div>

          <!-- Estadísticas del sistema -->
          <div class="system-stats">
            <div class="stats-item">
              <div class="stats-icon">🔧</div>
              <div class="stats-info">
                <div class="stats-number">{{ machineCount }}</div>
                <div class="stats-label">Máquinas</div>
              </div>
            </div>
            <div class="stats-item">
              <div class="stats-icon">📦</div>
              <div class="stats-info">
                <div class="stats-number">{{ partCount }}</div>
                <div class="stats-label">Refacciones</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="content-area">
        <!-- Instrucciones -->
        <div class="instructions-section">
          <div class="professional-card animate-fadeInUp">
            <div class="professional-content">
              <h3 class="section-title">
                📋 Formatos Requeridos para tus Archivos Excel
              </h3>

              <div class="format-grid">
                <div class="format-item">
                  <div class="format-icon">📦</div>
                  <div class="format-content">
                    <h4 class="format-title">📦 Formato para Refacciones</h4>
                    <ul class="format-list">
                      <li><strong>SAP:</strong> Columna con código SAP</li>
                      <li><strong>#PARTE:</strong> Columna con Part Number</li>
                      <li>
                        <strong>DESCRIPCION:</strong> Columna con descripción de
                        la refacción
                      </li>
                      <li>
                        <strong>IMAGEN:</strong> Columna con URL completa de la
                        imagen (opcional) - Ejemplos:
                        https://ejemplo.com/imagen.jpg,
                        https://images.unsplash.com/photo-xxx
                      </li>
                      <li>
                        <strong>UBICACION:</strong> Columna con ubicación física
                        (opcional)
                      </li>
                      <li>
                        <strong>MAQUINA:</strong> Columna con nombre de la
                        máquina (opcional - si no se especifica, se asigna a
                        GENERAL)
                      </li>
                      <li>
                        <strong>⚠️ NOMBRES DE HOJAS OBLIGATORIOS:</strong>
                        <span style="color: #dc2626; font-weight: bold;"
                          >CONSUMIBLE</span
                        >,
                        <span style="color: #dc2626; font-weight: bold;"
                          >ELECTRONICA</span
                        >,
                        <span style="color: #dc2626; font-weight: bold;"
                          >MECANICA</span
                        >
                      </li>
                      <li>
                        <strong>Máquinas:</strong> Se crearán automáticamente
                        según la columna MAQUINA
                      </li>
                    </ul>
                  </div>
                </div>

                <div class="format-item">
                  <div class="format-icon">🔧</div>
                  <div class="format-content">
                    <h4 class="format-title">🔧 Formato para Máquinas</h4>
                    <ul class="format-list">
                      <li>
                        <strong>Nombre:</strong> Columna con nombre de la
                        máquina
                      </li>
                      <li>
                        <strong>Area:</strong> Columna con área (costura o
                        corte)
                      </li>
                      <li>
                        <strong>Una sola hoja:</strong> Las máquinas van en una
                        sola hoja de Excel
                      </li>
                      <li>
                        <strong>Opcional:</strong> Este archivo es completamente
                        opcional
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Instrucciones específicas para imágenes -->
        <div class="images-section">
          <div
            class="professional-card animate-fadeInUp"
            style="animation-delay: 0.05s"
          >
            <div class="professional-content">
              <h3 class="section-title">
                🖼️ Guía para Agregar Imágenes de Refacciones
              </h3>

              <div class="images-grid">
                <div class="image-info-card">
                  <div class="info-header">
                    <div class="info-icon">📝</div>
                    <h4 class="info-title">Cómo Incluir URLs de Imagen</h4>
                  </div>
                  <ul class="info-list">
                    <li>
                      <strong>Columna IMAGEN:</strong> Agrega una columna
                      llamada "IMAGEN" en tus hojas de Excel
                    </li>
                    <li>
                      <strong>URL Completa:</strong> Incluye la URL completa de
                      la imagen
                    </li>
                    <li>
                      <strong>Formatos Soportados:</strong> .jpg, .jpeg, .png,
                      .gif, .webp
                    </li>
                    <li>
                      <strong>Opcional:</strong> Las refacciones sin imagen
                      mostrarán un placeholder
                    </li>
                  </ul>
                </div>

                <div class="image-info-card">
                  <div class="info-header">
                    <div class="info-icon">💡</div>
                    <h4 class="info-title">Ejemplos de URLs Válidas</h4>
                  </div>
                  <div class="examples-container">
                    <div class="example-item">
                      <div class="example-label">🌐 URL Directa:</div>
                      <code class="example-code"
                        >https://ejemplo.com/refaccion.jpg</code
                      >
                    </div>
                    <div class="example-item">
                      <div class="example-label">📷 Unsplash:</div>
                      <code class="example-code"
                        >https://images.unsplash.com/photo-xxx</code
                      >
                    </div>
                    <div class="example-item">
                      <div class="example-label">🔧 Sitio del Fabricante:</div>
                      <code class="example-code"
                        >https://fabricante.com/productos/imagen.png</code
                      >
                    </div>
                  </div>
                </div>

                <div class="image-info-card">
                  <div class="info-header">
                    <div class="info-icon">⚠️</div>
                    <h4 class="info-title">Consejos Importantes</h4>
                  </div>
                  <ul class="info-list">
                    <li>
                      <strong>URLs Públicas:</strong> Usa solo URLs públicamente
                      accesibles
                    </li>
                    <li>
                      <strong>Tamaño Recomendado:</strong> Imágenes de 300x200
                      píxeles o superiores
                    </li>
                    <li>
                      <strong>Calidad:</strong> Imágenes claras que muestren
                      bien la refacción
                    </li>
                    <li>
                      <strong>Prueba:</strong> Verifica que la URL funcione
                      antes de importar
                    </li>
                  </ul>
                </div>
              </div>

              <div class="image-example-section">
                <h4 class="example-title">
                  📋 Ejemplo de Hoja Excel con Imágenes:
                </h4>
                <div class="excel-example">
                  <table class="example-table">
                    <thead>
                      <tr>
                        <th>SAP</th>
                        <th>#PARTE</th>
                        <th>DESCRIPCION</th>
                        <th>IMAGEN</th>
                        <th>UBICACION</th>
                        <th>MAQUINA</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>12345</td>
                        <td>BR-001</td>
                        <td>Aguja para Brother</td>
                        <td>https://ejemplo.com/aguja.jpg</td>
                        <td>A-01-B</td>
                        <td>BROTHER-001</td>
                      </tr>
                      <tr>
                        <td>12346</td>
                        <td>BR-002</td>
                        <td>Prensatelas Universal</td>
                        <td></td>
                        <td>A-02-C</td>
                        <td>BROTHER-001</td>
                      </tr>
                    </tbody>
                  </table>
                  <p class="example-note">
                    💡 <strong>Nota:</strong> La segunda fila no tiene imagen,
                    así que mostrará un placeholder automáticamente.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Controles globales -->
        <div class="controls-section">
          <div
            class="professional-card animate-fadeInUp"
            style="animation-delay: 0.1s"
          >
            <div class="professional-content">
              <h3 class="section-title">⚙️ Configuración de Importación</h3>

              <div class="controls-grid">
                <!-- Selector de área -->
                <div class="control-card area-control">
                  <div class="control-header">
                    <div class="control-icon">🏭</div>
                    <div class="control-title">Área por Defecto</div>
                  </div>
                  <select
                    [(ngModel)]="selectedAreaForParts"
                    class="professional-input"
                  >
                    <option value="costura">🧵 Área de Costura</option>
                    <option value="corte">✂️ Área de Corte</option>
                    <option value="consumible">💡 Área de Consumibles</option>
                  </select>
                  <p class="control-hint">
                    Las máquinas detectadas en las refacciones se crearán en
                    esta área
                  </p>
                </div>

                <!-- Botón de limpieza -->
                <div class="control-card cleanup-control">
                  <div class="control-header">
                    <div class="control-icon danger-icon">🗑️</div>
                    <div class="control-title">Limpiar Sistema</div>
                  </div>
                  <app-touch-button
                    variant="danger"
                    size="lg"
                    icon="🗑️"
                    [fullWidth]="true"
                    [disabled]="isDeleting"
                    [loading]="isDeleting"
                    (clicked)="showDeleteConfirmation()"
                  >
                    {{ isDeleting ? 'Eliminando...' : 'Borrar Todo' }}
                  </app-touch-button>
                  <p class="control-hint danger-hint">
                    ⚠️ Elimina todas las máquinas y refacciones del sistema
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Área de importación -->
        <div class="import-section">
          <div class="professional-grid grid-2">
            <!-- Importar Refacciones -->
            <div
              class="import-card professional-card parts-import animate-fadeInUp"
              style="animation-delay: 0.2s"
            >
              <div class="professional-content">
                <div class="import-header">
                  <div class="import-icon-container parts-icon">
                    <span class="import-emoji">📦</span>
                  </div>
                  <h3 class="import-title">Importar Refacciones</h3>
                  <p class="import-subtitle">
                    Cargar archivo Excel con listado de refacciones
                  </p>
                </div>

                <div
                  class="upload-area"
                  [class.dragover]="isDragOverParts"
                  [class.has-file]="partsFile"
                  (dragover)="onDragOver($event, 'parts')"
                  (dragleave)="onDragLeave('parts')"
                  (drop)="onDrop($event, 'parts')"
                  (click)="triggerFileInput('parts')"
                >
                  <div class="upload-content" *ngIf="!partsFile">
                    <div class="upload-icon">
                      <svg
                        class="w-12 h-12"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                    </div>
                    <p class="upload-text">
                      Arrastra tu archivo Excel aquí o
                      <span class="upload-link">selecciona archivo</span>
                    </p>
                    <p class="upload-hint">Solo archivos .xlsx, .xls</p>
                    <p
                      class="upload-hint"
                      style="color: #dc2626; font-weight: bold; margin-top: 0.5rem;"
                    >
                      ⚠️ Las hojas deben llamarse exactamente: CONSUMIBLE,
                      ELECTRONICA, MECANICA
                    </p>
                  </div>

                  <div class="file-preview" *ngIf="partsFile">
                    <div class="file-icon">📄</div>
                    <div class="file-info">
                      <div class="file-name">{{ partsFile.name }}</div>
                      <div class="file-size">{{ getFileSize(partsFile) }}</div>
                    </div>
                    <button
                      (click)="clearFile('parts'); $event.stopPropagation()"
                      class="file-remove"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                <input
                  #partsFileInput
                  type="file"
                  accept=".xlsx,.xls"
                  (change)="onFileSelected($event, 'parts')"
                  class="hidden"
                />

                <app-touch-button
                  variant="success"
                  size="xl"
                  icon="📦"
                  [fullWidth]="true"
                  [disabled]="!partsFile || isProcessing"
                  [loading]="isProcessing && processingType === 'parts'"
                  (clicked)="importParts()"
                  class="import-action-btn"
                >
                  {{
                    isProcessing && processingType === 'parts'
                      ? 'Procesando...'
                      : 'IMPORTAR REFACCIONES'
                  }}
                </app-touch-button>
              </div>
            </div>

            <!-- Importar Máquinas -->
            <div
              class="import-card professional-card machines-import animate-fadeInUp"
              style="animation-delay: 0.3s"
            >
              <div class="professional-content">
                <div class="import-header">
                  <div class="import-icon-container machines-icon">
                    <span class="import-emoji">🔧</span>
                  </div>
                  <h3 class="import-title">Importar Máquinas</h3>
                  <p class="import-subtitle">
                    Cargar archivo Excel con listado de máquinas (Opcional)
                  </p>
                </div>

                <div
                  class="upload-area"
                  [class.dragover]="isDragOverMachines"
                  [class.has-file]="machinesFile"
                  (dragover)="onDragOver($event, 'machines')"
                  (dragleave)="onDragLeave('machines')"
                  (drop)="onDrop($event, 'machines')"
                  (click)="triggerFileInput('machines')"
                >
                  <div class="upload-content" *ngIf="!machinesFile">
                    <div class="upload-icon">
                      <svg
                        class="w-12 h-12"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                    </div>
                    <p class="upload-text">
                      Arrastra tu archivo Excel aquí o
                      <span class="upload-link">selecciona archivo</span>
                    </p>
                    <p class="upload-hint">Columnas: Nombre, Area</p>
                    <p
                      class="upload-hint"
                      style="color: #059669; font-weight: bold; margin-top: 0.5rem;"
                    >
                      💡 Área debe ser: costura o corte
                    </p>
                  </div>

                  <div class="file-preview" *ngIf="machinesFile">
                    <div class="file-icon">📄</div>
                    <div class="file-info">
                      <div class="file-name">{{ machinesFile.name }}</div>
                      <div class="file-size">
                        {{ getFileSize(machinesFile) }}
                      </div>
                    </div>
                    <button
                      (click)="clearFile('machines'); $event.stopPropagation()"
                      class="file-remove"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                <input
                  #machinesFileInput
                  type="file"
                  accept=".xlsx,.xls"
                  (change)="onFileSelected($event, 'machines')"
                  class="hidden"
                />

                <app-touch-button
                  variant="primary"
                  size="xl"
                  icon="🔧"
                  [fullWidth]="true"
                  [disabled]="!machinesFile || isProcessing"
                  [loading]="isProcessing && processingType === 'machines'"
                  (clicked)="importMachines()"
                  class="import-action-btn"
                >
                  {{
                    isProcessing && processingType === 'machines'
                      ? 'Procesando...'
                      : 'IMPORTAR MÁQUINAS'
                  }}
                </app-touch-button>
              </div>
            </div>
          </div>
        </div>

        <!-- Importar Herramientas -->
        <div class="import-section" style="margin-top: 2rem;">
          <div class="professional-grid grid-1">
            <div
              class="import-card professional-card tools-import animate-fadeInUp"
              style="animation-delay: 0.4s"
            >
              <div class="professional-content">
                <div class="import-header">
                  <div class="import-icon-container tools-icon">
                    <span class="import-emoji">🛠️</span>
                  </div>
                  <h3 class="import-title">Importar Herramientas</h3>
                  <p class="import-subtitle">
                    Cargar archivo Excel con listado de herramientas y sus fotos
                  </p>
                </div>

                <div class="format-info" style="background: #f0f9ff; padding: 1.5rem; border-radius: 0.75rem; margin-bottom: 1.5rem; border-left: 4px solid #3b82f6;">
                  <h4 style="margin: 0 0 0.75rem 0; color: #1e40af;">📋 Formato Requerido para Herramientas</h4>
                  <ul style="margin: 0; padding-left: 1.5rem; color: #333;">
                    <li><strong>NOMBRE:</strong> Nombre de la herramienta (obligatorio)</li>
                    <li><strong>IMAGEN:</strong> URL completa de la imagen (opcional) - Ejemplos: https://ejemplo.com/herramienta.jpg, https://images.unsplash.com/photo-xxx</li>
                    <li><strong>UBICACION:</strong> Ubicación física de la herramienta (opcional) - Ejemplos: Caja A-01, Estante 3</li>
                    <li><strong>Nota:</strong> Las herramientas sin imagen mostrarán un icono de herramienta</li>
                  </ul>
                </div>

                <div
                  class="upload-area"
                  [class.dragover]="isDragOverTools"
                  [class.has-file]="toolsFile"
                  (dragover)="onDragOver($event, 'tools')"
                  (dragleave)="onDragLeave('tools')"
                  (drop)="onDrop($event, 'tools')"
                  (click)="triggerFileInput('tools')"
                >
                  <div class="upload-content" *ngIf="!toolsFile">
                    <div class="upload-icon">
                      <svg
                        class="w-12 h-12"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                    </div>
                    <p class="upload-text">
                      Arrastra tu archivo Excel aquí o
                      <span class="upload-link">selecciona archivo</span>
                    </p>
                    <p class="upload-hint">Solo archivos .xlsx, .xls</p>
                  </div>

                  <div class="file-preview" *ngIf="toolsFile">
                    <div class="file-icon">📄</div>
                    <div class="file-info">
                      <div class="file-name">{{ toolsFile.name }}</div>
                      <div class="file-size">{{ getFileSize(toolsFile) }}</div>
                    </div>
                    <button
                      (click)="clearFile('tools'); $event.stopPropagation()"
                      class="file-remove"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                <input
                  #toolsFileInput
                  type="file"
                  accept=".xlsx,.xls"
                  (change)="onFileSelected($event, 'tools')"
                  class="hidden"
                />

                <app-touch-button
                  variant="warning"
                  size="xl"
                  icon="🛠️"
                  [fullWidth]="true"
                  [disabled]="!toolsFile || isProcessing"
                  [loading]="isProcessing && processingType === 'tools'"
                  (clicked)="importTools()"
                  class="import-action-btn"
                >
                  {{
                    isProcessing && processingType === 'tools'
                      ? 'Procesando...'
                      : 'IMPORTAR HERRAMIENTAS'
                  }}
                </app-touch-button>
              </div>
            </div>
          </div>
        </div>

        <!-- Resultados de importación -->
        <div *ngIf="importResults" class="results-section">
          <div class="professional-card animate-fadeInUp results-card">
            <div class="professional-content">
              <h3 class="section-title">📈 Resultados de Importación</h3>

              <div class="results-grid">
                <div class="result-card success-card">
                  <div class="result-icon">✅</div>
                  <div class="result-content">
                    <div class="result-number">{{ importResults.success }}</div>
                    <div class="result-label">Registros Importados</div>
                  </div>
                </div>

                <div
                  class="result-card warning-card"
                  *ngIf="importResults.duplicates > 0"
                >
                  <div class="result-icon">⚠️</div>
                  <div class="result-content">
                    <div class="result-number">
                      {{ importResults.duplicates }}
                    </div>
                    <div class="result-label">Duplicados Omitidos</div>
                  </div>
                </div>

                <div
                  class="result-card error-card"
                  *ngIf="importResults.errors.length > 0"
                >
                  <div class="result-icon">❌</div>
                  <div class="result-content">
                    <div class="result-number">
                      {{ importResults.errors.length }}
                    </div>
                    <div class="result-label">Errores</div>
                  </div>
                </div>
              </div>

              <div
                *ngIf="importResults.errors.length > 0"
                class="errors-section"
              >
                <h4 class="errors-title">⚠️ Errores Encontrados</h4>
                <div class="errors-container">
                  <div
                    *ngFor="let error of importResults.errors; let i = index"
                    class="error-item"
                    [style.animation-delay]="i * 0.05 + 's'"
                  >
                    <span class="error-icon">❌</span>
                    <span class="error-text">{{ error }}</span>
                  </div>
                </div>
              </div>

              <div class="results-actions">
                <app-touch-button
                  variant="primary"
                  size="lg"
                  icon="🔄"
                  (clicked)="resetImport()"
                >
                  Nueva Importación
                </app-touch-button>

                <app-touch-button
                  variant="success"
                  size="lg"
                  icon="🔍"
                  (clicked)="goToSearch()"
                >
                  Buscar Refacciones
                </app-touch-button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal de confirmación de eliminación -->
      <div
        *ngIf="showDeleteModal"
        class="modal-overlay"
        (click)="closeDeleteModal()"
      >
        <div
          class="modal-container delete-modal"
          (click)="$event.stopPropagation()"
        >
          <div class="modal-header danger-header">
            <div class="modal-title">
              <span class="modal-icon danger-icon">⚠️</span>
              <h3>Confirmar Eliminación Total</h3>
            </div>
            <button class="modal-close" (click)="closeDeleteModal()">✕</button>
          </div>

          <div class="modal-content">
            <div class="delete-warning">
              <div class="warning-content">
                <h4 class="warning-title">
                  ¿Estás seguro de eliminar TODO el sistema?
                </h4>
                <p class="warning-description">
                  Esta acción eliminará permanentemente:
                </p>

                <div class="deletion-items">
                  <div class="deletion-item">
                    <span class="deletion-icon">🔧</span>
                    <div class="deletion-info">
                      <span class="deletion-count">{{ machineCount }}</span>
                      <span class="deletion-type">Máquinas</span>
                    </div>
                  </div>
                  <div class="deletion-item">
                    <span class="deletion-icon">📦</span>
                    <div class="deletion-info">
                      <span class="deletion-count">{{ partCount }}</span>
                      <span class="deletion-type">Refacciones</span>
                    </div>
                  </div>
                </div>

                <div class="confirmation-input">
                  <label class="confirmation-label">
                    <strong>Contraseña de administrador:</strong>
                  </label>
                  <input
                    type="password"
                    [(ngModel)]="deletePassword"
                    placeholder="Ingresa la contraseña"
                    class="confirmation-field"
                    (input)="onPasswordChange()"
                  />
                  <div *ngIf="passwordError" class="password-error">
                    {{ passwordError }}
                  </div>
                </div>

                <p class="warning-notice">
                  <strong>⚠️ Esta acción no se puede deshacer.</strong>
                </p>
              </div>
            </div>
          </div>

          <div class="modal-actions">
            <app-touch-button
              variant="danger"
              size="lg"
              icon="🗑️"
              [disabled]="!canConfirmDelete || isDeleting"
              [loading]="isDeleting"
              (clicked)="confirmDeleteAll()"
            >
              {{ isDeleting ? 'Eliminando...' : 'Sí, Eliminar Todo' }}
            </app-touch-button>

            <app-touch-button
              variant="secondary"
              size="lg"
              icon="✕"
              (clicked)="closeDeleteModal()"
              [disabled]="isDeleting"
            >
              Cancelar
            </app-touch-button>
          </div>
        </div>
      </div>

      <!-- Modal de resultados de importación -->
      <div
        *ngIf="showResultsModal"
        class="modal-overlay"
        (click)="closeResultsModal()"
      >
        <div
          class="modal-container results-modal"
          (click)="$event.stopPropagation()"
        >
          <div
            class="modal-header"
            [class]="importResults?.success ? 'success-header' : 'error-header'"
          >
            <div class="modal-title">
              <span class="modal-icon">{{
                importResults?.success ? '✅' : '❌'
              }}</span>
              <h3>{{ getResultsTitle() }}</h3>
            </div>
            <button class="modal-close" (click)="closeResultsModal()">✕</button>
          </div>

          <div class="modal-content" *ngIf="importResults">
            <div class="results-summary">
              <div class="summary-grid">
                <div class="summary-item success-item">
                  <div class="summary-icon">✅</div>
                  <div class="summary-info">
                    <div class="summary-number">
                      {{ importResults.success }}
                    </div>
                    <div class="summary-label">Importadas</div>
                  </div>
                </div>

                <div
                  class="summary-item warning-item"
                  *ngIf="importResults.duplicates > 0"
                >
                  <div class="summary-icon">⚠️</div>
                  <div class="summary-info">
                    <div class="summary-number">
                      {{ importResults.duplicates }}
                    </div>
                    <div class="summary-label">Duplicadas</div>
                  </div>
                </div>

                <div
                  class="summary-item error-item"
                  *ngIf="importResults.errors.length > 0"
                >
                  <div class="summary-icon">❌</div>
                  <div class="summary-info">
                    <div class="summary-number">
                      {{ importResults.errors.length }}
                    </div>
                    <div class="summary-label">Errores</div>
                  </div>
                </div>
              </div>

              <div class="summary-message">
                <p>{{ getResultsMessage() }}</p>
              </div>
            </div>
          </div>

          <div class="modal-actions">
            <app-touch-button
              variant="primary"
              size="lg"
              icon="👍"
              (clicked)="closeResultsModal()"
            >
              Entendido
            </app-touch-button>

            <app-touch-button
              variant="success"
              size="lg"
              icon="🔍"
              (clicked)="goToSearchFromModal()"
              *ngIf="importResults?.success"
            >
              Ver Refacciones
            </app-touch-button>
          </div>
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

      .system-stats {
        display: flex;
        gap: 2rem;
      }

      .stats-item {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 1rem 1.5rem;
        background: rgba(255, 255, 255, 0.2);
        border-radius: var(--border-radius-md);
        border: 1px solid rgba(255, 255, 255, 0.3);
        backdrop-filter: blur(10px);
      }

      .stats-icon {
        font-size: 1.5rem;
      }

      .stats-number {
        font-size: 1.25rem;
        font-weight: bold;
        margin-bottom: 0.125rem;
      }

      .stats-label {
        font-size: 0.75rem;
        opacity: 0.9;
      }

      .content-area {
        padding: 2rem;
        max-width: 1400px;
        margin: 0 auto;
      }

      .section-title {
        font-size: 1.5rem;
        font-weight: bold;
        color: var(--gray-900);
        margin-bottom: 1.5rem;
      }

      .instructions-section {
        margin-bottom: 2rem;
      }

      .format-grid {
        display: grid;
        gap: 1.5rem;
      }

      .format-item {
        display: flex;
        gap: 1rem;
        padding: 1.5rem;
        background: var(--gray-50);
        border-radius: var(--border-radius-md);
        border: 1px solid var(--gray-200);
      }

      .format-icon {
        font-size: 2rem;
        flex-shrink: 0;
      }

      .format-title {
        font-size: 1.125rem;
        font-weight: bold;
        color: var(--gray-900);
        margin-bottom: 0.75rem;
      }

      .format-list {
        margin: 0;
        padding-left: 1rem;
        list-style: none;
      }

      .format-list li {
        font-size: 0.875rem;
        color: var(--gray-600);
        margin-bottom: 0.5rem;
        position: relative;
        padding-left: 1rem;
      }

      .format-list li::before {
        content: '•';
        color: var(--primary-600);
        font-weight: bold;
        position: absolute;
        left: 0;
      }

      .images-section {
        margin-bottom: 2rem;
      }

      .images-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
        gap: 1.5rem;
        margin-bottom: 2rem;
      }

      .image-info-card {
        padding: 1.5rem;
        background: linear-gradient(135deg, #fef7ff, #f8fafc);
        border-radius: var(--border-radius-lg);
        border: 2px solid #e1d5e7;
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
      }

      .image-info-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: linear-gradient(90deg, #8b5cf6, #06b6d4);
      }

      .image-info-card:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-lg);
        border-color: #8b5cf6;
      }

      .info-header {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        margin-bottom: 1rem;
      }

      .info-icon {
        font-size: 1.5rem;
        padding: 0.5rem;
        background: rgba(139, 92, 246, 0.1);
        border-radius: var(--border-radius-sm);
      }

      .info-title {
        font-size: 1.125rem;
        font-weight: bold;
        color: var(--gray-900);
        margin: 0;
      }

      .info-list {
        margin: 0;
        padding-left: 1rem;
        list-style: none;
      }

      .info-list li {
        font-size: 0.875rem;
        color: var(--gray-600);
        margin-bottom: 0.75rem;
        position: relative;
        padding-left: 1rem;
        line-height: 1.5;
      }

      .info-list li::before {
        content: '📝';
        position: absolute;
        left: 0;
        font-size: 0.75rem;
      }

      .examples-container {
        space-y: 0.75rem;
      }

      .example-item {
        margin-bottom: 0.75rem;
        padding: 0.75rem;
        background: rgba(255, 255, 255, 0.8);
        border-radius: var(--border-radius-sm);
        border: 1px solid rgba(139, 92, 246, 0.2);
      }

      .example-label {
        font-size: 0.75rem;
        font-weight: 600;
        color: var(--gray-700);
        margin-bottom: 0.25rem;
      }

      .example-code {
        display: block;
        font-size: 0.75rem;
        color: #059669;
        background: #f0fdf4;
        padding: 0.5rem;
        border-radius: var(--border-radius-sm);
        border: 1px solid #bbf7d0;
        font-family: 'Courier New', monospace;
        word-break: break-all;
      }

      .image-example-section {
        background: #fafafa;
        padding: 1.5rem;
        border-radius: var(--border-radius-lg);
        border: 2px solid #e5e7eb;
      }

      .example-title {
        font-size: 1.125rem;
        font-weight: bold;
        color: var(--gray-900);
        margin-bottom: 1rem;
      }

      .excel-example {
        background: white;
        border-radius: var(--border-radius-md);
        padding: 1rem;
        border: 1px solid #d1d5db;
      }

      .example-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 0.875rem;
      }

      .example-table th,
      .example-table td {
        padding: 0.75rem;
        text-align: left;
        border: 1px solid #e5e7eb;
      }

      .example-table th {
        background: #f9fafb;
        font-weight: 600;
        color: var(--gray-700);
      }

      .example-table td {
        color: var(--gray-600);
      }

      .example-table td:nth-child(4) {
        font-family: 'Courier New', monospace;
        font-size: 0.75rem;
        color: #059669;
      }

      .example-note {
        margin-top: 1rem;
        font-size: 0.875rem;
        color: var(--gray-600);
        padding: 0.75rem;
        background: #fffbeb;
        border-left: 4px solid #f59e0b;
        border-radius: var(--border-radius-sm);
      }

      .controls-section {
        margin-bottom: 2rem;
      }

      .controls-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 2rem;
      }

      .control-card {
        padding: 1.5rem;
        background: var(--gray-50);
        border-radius: var(--border-radius-lg);
        border: 2px solid var(--gray-200);
        transition: all 0.3s ease;
      }

      .control-card:hover {
        border-color: var(--primary-300);
        box-shadow: var(--shadow-md);
      }

      .area-control {
        border-left: 4px solid var(--primary-600);
      }

      .cleanup-control {
        border-left: 4px solid #ef4444;
      }

      .control-header {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        margin-bottom: 1rem;
      }

      .control-icon {
        font-size: 1.5rem;
        padding: 0.5rem;
        background: var(--primary-100);
        border-radius: var(--border-radius-sm);
      }

      .danger-icon {
        background: #fef2f2;
      }

      .control-title {
        font-size: 1rem;
        font-weight: 600;
        color: var(--gray-900);
      }

      .control-hint {
        font-size: 0.875rem;
        color: var(--gray-500);
        margin-top: 0.75rem;
      }

      .danger-hint {
        color: #dc2626;
      }

      .import-section {
        margin-bottom: 2rem;
      }

      .import-card {
        border: 2px solid transparent;
        border-left: 6px solid;
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
      }

      .parts-import {
        border-left-color: #10b981;
      }

      .machines-import {
        border-left-color: var(--primary-600);
      }

      .import-card:hover {
        transform: translateY(-4px);
        box-shadow: var(--shadow-xl);
      }

      .import-header {
        text-align: center;
        margin-bottom: 2rem;
      }

      .import-icon-container {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 5rem;
        height: 5rem;
        border-radius: var(--border-radius-xl);
        margin: 0 auto 1rem;
        backdrop-filter: blur(10px);
        border: 2px solid rgba(255, 255, 255, 0.3);
      }

      .parts-icon {
        background: linear-gradient(135deg, #10b981, #34d399);
      }

      .machines-icon {
        background: var(--gradient-primary);
      }

      .import-emoji {
        font-size: 2rem;
        filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
      }

      .import-title {
        font-size: 1.5rem;
        font-weight: bold;
        color: var(--gray-900);
        margin-bottom: 0.5rem;
      }

      .import-subtitle {
        font-size: 1rem;
        color: var(--gray-600);
      }

      .upload-area {
        border: 3px dashed var(--gray-300);
        border-radius: var(--border-radius-lg);
        padding: 3rem 2rem;
        text-align: center;
        background: var(--gray-50);
        transition: all 0.3s ease;
        margin-bottom: 2rem;
        cursor: pointer;
        min-height: 200px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .upload-area:hover {
        border-color: var(--primary-400);
        background: var(--primary-50);
        transform: scale(1.02);
      }

      .upload-area.dragover {
        border-color: #10b981;
        background: #ecfdf5;
        transform: scale(1.05);
        box-shadow: var(--shadow-lg);
      }

      .upload-area.has-file {
        border-color: #10b981;
        background: #ecfdf5;
      }

      .upload-icon {
        color: var(--gray-400);
        margin-bottom: 1rem;
      }

      .upload-text {
        font-size: 1.125rem;
        color: var(--gray-700);
        margin-bottom: 0.5rem;
        font-weight: 500;
      }

      .upload-link {
        color: var(--primary-600);
        font-weight: bold;
        text-decoration: underline;
      }

      .upload-hint {
        font-size: 0.875rem;
        color: var(--gray-500);
      }

      .file-preview {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1rem 1.5rem;
        background: white;
        border-radius: var(--border-radius-md);
        border: 2px solid #10b981;
        box-shadow: var(--shadow-sm);
      }

      .file-icon {
        font-size: 2rem;
      }

      .file-info {
        flex: 1;
      }

      .file-name {
        font-size: 1rem;
        font-weight: 600;
        color: var(--gray-900);
        margin-bottom: 0.25rem;
      }

      .file-size {
        font-size: 0.875rem;
        color: var(--gray-500);
      }

      .file-remove {
        width: 2rem;
        height: 2rem;
        border-radius: 50%;
        border: 2px solid #ef4444;
        background: #fef2f2;
        color: #ef4444;
        font-size: 0.875rem;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .file-remove:hover {
        background: #ef4444;
        color: white;
      }

      .import-action-btn {
        font-size: 1rem;
        font-weight: bold;
        letter-spacing: 0.05em;
      }

      .results-section {
        margin-top: 2rem;
      }

      .results-card {
        border-left: 6px solid #10b981;
      }

      .results-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 1.5rem;
        margin-bottom: 2rem;
      }

      .result-card {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1.5rem;
        border-radius: var(--border-radius-lg);
        border: 2px solid;
        transition: all 0.3s ease;
      }

      .result-card:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-md);
      }

      .success-card {
        background: #ecfdf5;
        border-color: #10b981;
        color: #065f46;
      }

      .warning-card {
        background: #fffbeb;
        border-color: #f59e0b;
        color: #92400e;
      }

      .error-card {
        background: #fef2f2;
        border-color: #ef4444;
        color: #991b1b;
      }

      .result-icon {
        font-size: 2rem;
        flex-shrink: 0;
      }

      .result-number {
        font-size: 2rem;
        font-weight: 900;
        line-height: 1;
        margin-bottom: 0.25rem;
      }

      .result-label {
        font-size: 0.875rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        opacity: 0.9;
      }

      .errors-section {
        padding: 1.5rem;
        background: #fef2f2;
        border-radius: var(--border-radius-lg);
        border: 2px solid #fecaca;
        margin-bottom: 2rem;
      }

      .errors-title {
        font-size: 1.125rem;
        font-weight: bold;
        color: #dc2626;
        margin-bottom: 1rem;
      }

      .errors-container {
        max-height: 300px;
        overflow-y: auto;
      }

      .error-item {
        display: flex;
        align-items: flex-start;
        gap: 0.75rem;
        padding: 0.75rem 1rem;
        margin-bottom: 0.5rem;
        background: white;
        border-radius: var(--border-radius-md);
        border-left: 3px solid #ef4444;
        font-size: 0.875rem;
        animation: slideInLeft 0.3s ease;
      }

      .error-icon {
        flex-shrink: 0;
        margin-top: 0.125rem;
      }

      .error-text {
        color: #991b1b;
        line-height: 1.4;
      }

      .results-actions {
        display: flex;
        gap: 1rem;
        justify-content: center;
      }

      .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.6);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        padding: 1rem;
        backdrop-filter: blur(4px);
        animation: fadeIn 0.3s ease;
      }

      .modal-container {
        background: white;
        border-radius: var(--border-radius-xl);
        max-width: 600px;
        width: 100%;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: var(--shadow-2xl);
        animation: scaleIn 0.3s ease;
      }

      .delete-modal {
        max-width: 500px;
      }

      .results-modal {
        max-width: 450px;
      }

      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 2rem 2rem 1rem;
        border-bottom: 2px solid var(--gray-100);
      }

      .danger-header {
        border-bottom-color: #fecaca;
        background: linear-gradient(135deg, #fef2f2, #ffffff);
      }

      .success-header {
        border-bottom-color: #bbf7d0;
        background: linear-gradient(135deg, #ecfdf5, #ffffff);
      }

      .error-header {
        border-bottom-color: #fecaca;
        background: linear-gradient(135deg, #fef2f2, #ffffff);
      }

      .modal-title {
        display: flex;
        align-items: center;
        gap: 1rem;
      }

      .modal-title h3 {
        font-size: 1.5rem;
        font-weight: bold;
        color: var(--gray-900);
        margin: 0;
      }

      .modal-icon {
        font-size: 2rem;
        padding: 0.5rem;
        background: var(--primary-100);
        border-radius: var(--border-radius-md);
      }

      .modal-icon.danger-icon {
        background: #fef2f2;
      }

      .modal-close {
        width: 2.5rem;
        height: 2.5rem;
        border: none;
        background: var(--gray-100);
        border-radius: 50%;
        color: var(--gray-600);
        font-size: 1.25rem;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .modal-close:hover {
        background: var(--gray-200);
        color: var(--gray-800);
      }

      .modal-content {
        padding: 2rem;
      }

      .delete-warning {
        text-align: center;
      }

      .warning-content {
        padding: 1rem;
      }

      .warning-title {
        font-size: 1.25rem;
        font-weight: bold;
        color: #dc2626;
        margin-bottom: 1rem;
      }

      .warning-description {
        font-size: 1rem;
        color: var(--gray-600);
        margin-bottom: 1.5rem;
      }

      .deletion-items {
        display: flex;
        gap: 2rem;
        justify-content: center;
        margin: 1.5rem 0;
        padding: 1.5rem;
        background: #fef2f2;
        border-radius: var(--border-radius-md);
        border: 2px solid #fecaca;
      }

      .deletion-item {
        display: flex;
        align-items: center;
        gap: 1rem;
      }

      .deletion-icon {
        font-size: 2rem;
      }

      .deletion-count {
        font-size: 1.5rem;
        font-weight: bold;
        color: #dc2626;
        display: block;
      }

      .deletion-type {
        font-size: 0.875rem;
        color: var(--gray-600);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .confirmation-input {
        margin: 1.5rem 0;
        text-align: left;
      }

      .confirmation-label {
        display: block;
        font-size: 1rem;
        font-weight: 600;
        color: var(--gray-700);
        margin-bottom: 0.75rem;
      }

      .confirmation-field {
        width: 100%;
        padding: 0.75rem 1rem;
        font-size: 1rem;
        border: 2px solid var(--gray-300);
        border-radius: var(--border-radius-md);
        text-transform: uppercase;
        font-weight: bold;
        text-align: center;
      }

      .confirmation-field:focus {
        outline: none;
        border-color: #ef4444;
        box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
      }

      .warning-notice {
        font-size: 0.875rem;
        color: #dc2626;
        font-weight: 600;
        margin-top: 1rem;
      }

      .password-error {
        color: #ef4444;
        font-size: 0.875rem;
        margin-top: 0.5rem;
        font-weight: 500;
      }

      .results-summary {
        text-align: center;
      }

      .summary-grid {
        display: flex;
        gap: 1rem;
        justify-content: center;
        margin-bottom: 1.5rem;
      }

      .summary-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;
        padding: 1rem;
        border-radius: var(--border-radius-md);
        border: 2px solid;
        min-width: 100px;
      }

      .success-item {
        background: #ecfdf5;
        border-color: #10b981;
      }

      .warning-item {
        background: #fffbeb;
        border-color: #f59e0b;
      }

      .error-item {
        background: #fef2f2;
        border-color: #ef4444;
      }

      .summary-icon {
        font-size: 1.5rem;
      }

      .summary-number {
        font-size: 1.5rem;
        font-weight: bold;
        margin-bottom: 0.25rem;
      }

      .summary-label {
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        opacity: 0.8;
      }

      .summary-message {
        font-size: 1rem;
        color: var(--gray-700);
        line-height: 1.5;
      }

      .modal-actions {
        display: flex;
        gap: 1rem;
        padding: 1rem 2rem 2rem;
      }

      .modal-actions app-touch-button {
        flex: 1;
      }

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

      .warning-notification {
        background: linear-gradient(135deg, #f59e0b, #fbbf24);
        color: white;
        border: 2px solid #d97706;
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

      .hidden {
        display: none;
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
          transform: scale(0.95);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }

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

      @keyframes slideInLeft {
        from {
          opacity: 0;
          transform: translateX(-20px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
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

      @media (max-width: 1024px) {
        .controls-grid {
          grid-template-columns: 1fr;
        }

        .professional-grid.grid-2 {
          grid-template-columns: 1fr;
        }

        .system-stats {
          flex-direction: column;
          gap: 1rem;
        }
      }

      @media (max-width: 768px) {
        .header-content {
          flex-direction: column;
          gap: 1.5rem;
          text-align: center;
        }

        .header-left {
          flex-direction: column;
          gap: 1rem;
        }

        .content-area {
          padding: 1rem;
        }

        .upload-area {
          padding: 2rem 1rem;
          min-height: 150px;
        }

        .upload-icon {
          width: 2.5rem;
          height: 2.5rem;
        }

        .upload-text {
          font-size: 1rem;
        }

        .results-grid {
          grid-template-columns: 1fr;
        }

        .results-actions {
          flex-direction: column;
        }

        .system-stats {
          width: 100%;
        }

        .stats-item {
          padding: 0.75rem 1rem;
        }

        .modal-container {
          margin: 1rem;
          max-height: calc(100vh - 2rem);
        }

        .modal-actions {
          flex-direction: column;
        }

        .deletion-items {
          flex-direction: column;
          gap: 1rem;
        }

        .summary-grid {
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

        .import-title {
          font-size: 1.25rem;
        }

        .control-card {
          padding: 1rem;
        }
      }
    `,
  ],
})
export class ExcelImportComponent implements OnInit {
  @ViewChild('machinesFileInput')
  machinesFileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('partsFileInput') partsFileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('toolsFileInput') toolsFileInput!: ElementRef<HTMLInputElement>;

  machinesFile: File | null = null;
  partsFile: File | null = null;
  toolsFile: File | null = null;
  isDragOverMachines = false;
  isDragOverParts = false;
  isDragOverTools = false;
  isProcessing = false;
  processingType: 'machines' | 'parts' | 'tools' | null = null;
  importResults: ImportResult | null = null;

  machineCount = 0;
  partCount = 0;

  selectedAreaForParts: 'corte' | 'costura' = 'costura';
  isDeleting = false;

  showDeleteModal = false;
  showResultsModal = false;
  canConfirmDelete = false;
  deletePassword = '';
  passwordError = '';
  readonly ADMIN_PASSWORD = 'Mantenimiento1.';

  showNotification = false;
  notificationMessage = '';
  notificationType: 'success' | 'error' | 'warning' = 'success';

  constructor(
    private router: Router,
    private machineService: MachineService,
    private partService: PartService,
    private toolService: ToolService,
    private databaseService: DatabaseService
  ) {}

  async ngOnInit() {
    try {
      await this.databaseService.initializeDatabase();
      await this.loadSystemStats();
    } catch (error) {
      console.error('Error initializing database:', error);
    }
  }

  async loadSystemStats() {
    try {
      const machines = await this.machineService.loadMachines().toPromise();
      const parts = await this.partService.loadParts().toPromise();

      this.machineCount = machines?.length || 0;
      this.partCount = parts?.length || 0;

      console.log(
        `📊 System stats: ${this.machineCount} machines, ${this.partCount} parts`
      );
    } catch (error) {
      console.error('Error loading system stats:', error);
    }
  }

  getFileSize(file: File): string {
    const bytes = file.size;
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getNotificationIcon(): string {
    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
    };
    return icons[this.notificationType];
  }

  showNotificationMessage(
    message: string,
    type: 'success' | 'error' | 'warning' = 'success'
  ) {
    this.notificationMessage = message;
    this.notificationType = type;
    this.showNotification = true;

    setTimeout(() => {
      this.showNotification = false;
    }, 4000);
  }

  goBack() {
    // Reset scroll position before navigating
    window.scrollTo(0, 0);
    this.router.navigate(['/']);
  }

  goToSearch() {
    this.router.navigate(['/search']);
  }

  goToSearchFromModal() {
    this.closeResultsModal();
    this.goToSearch();
  }

  showDeleteConfirmation() {
    this.showDeleteModal = true;
    this.deletePassword = '';
    this.passwordError = '';
    this.canConfirmDelete = false;
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.deletePassword = '';
    this.passwordError = '';
    this.canConfirmDelete = false;
  }

  onPasswordChange() {
    this.passwordError = '';
    this.canConfirmDelete = this.deletePassword === this.ADMIN_PASSWORD;
  }

  async confirmDeleteAll() {
    this.passwordError = '';

    if (!this.deletePassword) {
      this.passwordError = 'La contraseña es obligatoria';
      return;
    }

    if (this.deletePassword !== this.ADMIN_PASSWORD) {
      this.passwordError = 'Contraseña incorrecta';
      this.deletePassword = '';
      return;
    }

    this.isDeleting = true;

    try {
      console.log('🗑️ Iniciando eliminación completa...');

      const allParts = await this.partService.loadParts().toPromise();
      if (allParts && allParts.length > 0) {
        for (const part of allParts) {
          if (part.id) {
            await this.partService.deletePart(part.id).toPromise();
          }
        }
        console.log(`🗑️ Eliminadas ${allParts.length} refacciones`);
      }

      const allMachines = await this.machineService.loadMachines().toPromise();
      if (allMachines && allMachines.length > 0) {
        for (const machine of allMachines) {
          if (machine.id) {
            await this.machineService.deleteMachine(machine.id).toPromise();
          }
        }
        console.log(`🗑️ Eliminadas ${allMachines.length} máquinas`);
      }

      await this.loadSystemStats();

      this.showNotificationMessage(
        'Eliminación completada! Todas las máquinas y refacciones han sido eliminadas del sistema.',
        'success'
      );

      this.resetImport();
      this.closeDeleteModal();
    } catch (error) {
      console.error('❌ Error eliminando datos:', error);
      this.showNotificationMessage(
        'Error al eliminar los datos. Algunos elementos pueden no haberse eliminado.',
        'error'
      );
    } finally {
      this.isDeleting = false;
    }
  }

  closeResultsModal() {
    this.showResultsModal = false;
  }

  getResultsTitle(): string {
    if (!this.importResults) return '';
    return this.importResults.success > 0
      ? 'Importación Completada'
      : 'Importación Fallida';
  }

  getResultsMessage(): string {
    if (!this.importResults) return '';

    if (this.importResults.success > 0) {
      return `Se importaron exitosamente ${
        this.importResults.success
      } refacciones. ${
        this.importResults.duplicates > 0
          ? `Se omitieron ${this.importResults.duplicates} duplicados. `
          : ''
      }${
        this.importResults.errors.length > 0
          ? `Se encontraron ${this.importResults.errors.length} errores.`
          : ''
      }`;
    } else {
      return 'No se pudo importar ninguna refacción. Verifica que las columnas tengan nombres: SAP, #PARTE, DESCRIPCION y que no haya filas vacías.';
    }
  }

  onDragOver(event: DragEvent, type: 'machines' | 'parts' | 'tools') {
    event.preventDefault();
    if (type === 'machines') {
      this.isDragOverMachines = true;
    } else if (type === 'parts') {
      this.isDragOverParts = true;
    } else if (type === 'tools') {
      this.isDragOverTools = true;
    }
  }

  onDragLeave(type: 'machines' | 'parts' | 'tools') {
    if (type === 'machines') {
      this.isDragOverMachines = false;
    } else if (type === 'parts') {
      this.isDragOverParts = false;
    } else if (type === 'tools') {
      this.isDragOverTools = false;
    }
  }

  onDrop(event: DragEvent, type: 'machines' | 'parts' | 'tools') {
    event.preventDefault();
    if (type === 'machines') {
      this.isDragOverMachines = false;
    } else if (type === 'parts') {
      this.isDragOverParts = false;
    } else if (type === 'tools') {
      this.isDragOverTools = false;
    }

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFile(files[0], type);
    }
  }

  triggerFileInput(type: 'machines' | 'parts' | 'tools') {
    if (type === 'machines' && this.machinesFileInput) {
      this.machinesFileInput.nativeElement.click();
    } else if (type === 'parts' && this.partsFileInput) {
      this.partsFileInput.nativeElement.click();
    } else if (type === 'tools' && this.toolsFileInput) {
      this.toolsFileInput.nativeElement.click();
    }
  }

  onFileSelected(event: Event, type: 'machines' | 'parts' | 'tools') {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFile(input.files[0], type);
    }
  }

  private handleFile(file: File, type: 'machines' | 'parts' | 'tools') {
    if (!this.isValidExcelFile(file)) {
      this.showNotificationMessage(
        'Por favor selecciona un archivo Excel válido (.xlsx o .xls)',
        'warning'
      );
      return;
    }

    if (type === 'machines') {
      this.machinesFile = file;
    } else if (type === 'parts') {
      this.partsFile = file;
    } else if (type === 'tools') {
      this.toolsFile = file;
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

  clearFile(type: 'machines' | 'parts' | 'tools') {
    if (type === 'machines') {
      this.machinesFile = null;
    } else if (type === 'parts') {
      this.partsFile = null;
    } else if (type === 'tools') {
      this.toolsFile = null;
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

      await this.loadSystemStats();

      console.log('✅ Machines import completed:', result);

      if (result.success > 0) {
        this.showNotificationMessage(
          `${result.success} máquinas importadas exitosamente`,
          'success'
        );
      } else {
        this.showNotificationMessage(
          'No se pudieron importar las máquinas',
          'error'
        );
      }
    } catch (error) {
      console.error('❌ Error importing machines:', error);
      this.showNotificationMessage(
        'Error al procesar el archivo de máquinas',
        'error'
      );
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

      await this.loadSystemStats();

      console.log('✅ Parts import completed:', result);

      let message = `✅ Importación completada: ${result.success} refacciones importadas exitosamente`;

      if (result.omittedRows.length > 0) {
        message += `\n\n⚠️ Filas omitidas por falta de datos (${
          result.omittedRows.length
        }):\n${result.omittedRows.join('\n')}`;
      }

      if (result.duplicatedSaps.length > 0) {
        message += `\n\n🔄 SAPs duplicados omitidos (${
          result.duplicatedSaps.length
        }):\n${result.duplicatedSaps.join('\n')}`;
      }

      if (result.errors.length > 0) {
        message += `\n\n❌ Otros errores:\n${result.errors
          .filter((error) => !result.omittedRows.includes(error))
          .join('\n')}`;
      }

      this.showNotificationMessage(
        message,
        result.success > 0 ? 'success' : 'error'
      );
    } catch (error) {
      console.error('❌ Error importing parts:', error);
      this.showNotificationMessage(
        `Error al procesar el archivo: ${error}\n\nVerifica que el archivo Excel esté en el formato correcto.`,
        'error'
      );
    } finally {
      this.isProcessing = false;
      this.processingType = null;
    }
  }

  async importTools() {
    if (!this.toolsFile) return;

    this.isProcessing = true;
    this.processingType = 'tools';
    this.importResults = null;

    try {
      console.log('🔄 Iniciando importación de herramientas...');
      const data = await this.readExcelFile(this.toolsFile);
      const result = await this.processToolsData(data);
      this.importResults = result;

      await this.loadSystemStats();

      console.log('✅ Tools import completed:', result);

      if (result.success > 0) {
        this.showNotificationMessage(
          `${result.success} herramientas importadas exitosamente`,
          'success'
        );
      } else {
        this.showNotificationMessage(
          'No se pudieron importar las herramientas',
          'error'
        );
      }
    } catch (error) {
      console.error('❌ Error importing tools:', error);
      this.showNotificationMessage(
        'Error al procesar el archivo de herramientas',
        'error'
      );
    } finally {
      this.isProcessing = false;
      this.processingType = null;
    }
  }

  private async processToolsData(
    data: ExcelRow[]
  ): Promise<ImportResult> {
    const result: ImportResult = {
      success: 0,
      errors: [],
      duplicates: 0,
      omittedRows: [],
      duplicatedSaps: [],
    };

    const existingToolNames = new Set<string>();

    try {
      for (let rowIndex = 0; rowIndex < data.length; rowIndex++) {
        const row = data[rowIndex];

        // Validar que tenga nombre
        const nombre = row['NOMBRE'] || row['Nombre'] || row['nombre'];
        if (!nombre || nombre.toString().trim() === '') {
          result.omittedRows.push(`Fila ${rowIndex + 2}: Falta el nombre`);
          continue;
        }

        const nombre_trimmed = nombre.toString().trim();

        // Validar nombre único
        if (existingToolNames.has(nombre_trimmed.toUpperCase())) {
          result.duplicates++;
          result.duplicatedSaps.push(
            `Fila ${rowIndex + 2}: "${nombre_trimmed}" (duplicado)`
          );
          continue;
        }

        const imagen = row['IMAGEN'] || row['Imagen'] || row['imagen'] || '';
        const ubicacion = row['UBICACION'] || row['Ubicación'] || row['ubicacion'] || '';

        try {
          const toolData: CreateToolDto = {
            name: nombre_trimmed,
            image: imagen ? imagen.toString().trim() : '',
            location: ubicacion ? ubicacion.toString().trim() : '',
          };

          await this.toolService.createTool(toolData).toPromise();
          existingToolNames.add(nombre_trimmed.toUpperCase());
          result.success++;

          console.log(
            `✅ Herramienta creada: ${toolData.name}`
          );
        } catch (error) {
          result.errors.push(
            `Hoja "HERRAMIENTAS", Fila ${rowIndex + 2}: ${error}`
          );
          console.error(`❌ Error en fila ${rowIndex + 2}:`, error);
        }
      }

      console.log('📊 Resultado final:', result);
      return result;
    } catch (error) {
      console.error('❌ Error procesando datos de herramientas:', error);
      throw error;
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
    const result: ImportResult = {
      success: 0,
      errors: [],
      duplicates: 0,
      omittedRows: [],
      duplicatedSaps: [],
    };

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
    const result: ImportResult = {
      success: 0,
      errors: [],
      duplicates: 0,
      omittedRows: [],
      duplicatedSaps: [],
    };

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
            CONSUMIBLE: 'consumible',
            ELECTRONICA: 'electronica',
            MECANICA: 'mecanica',
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
            const imageIndex = this.findColumnIndex(headers, [
              'IMAGEN',
              'Imagen',
              'imagen',
              'IMAGE',
              'Image',
              'image',
              'URL',
              'url',
              'Url',
            ]);
            const machineIndex = this.findColumnIndex(headers, [
              'MAQUINA',
              'MÁQUINA',
              'Maquina',
              'Máquina',
              'maquina',
              'máquina',
              'MACHINE',
              'Machine',
              'machine',
            ]);

            console.log(`📍 Índices encontrados en ${sheetName}:`, {
              SAP: sapIndex,
              PARTE: partIndex,
              DESCRIPCION: descIndex,
              IMAGEN: imageIndex,
              UBICACION: ubicIndex,
              MAQUINA: machineIndex,
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
                const image = imageIndex >= 0 ? row[imageIndex] : '';
                const ubicacion = ubicIndex >= 0 ? row[ubicIndex] : '';
                const machineName = machineIndex >= 0 ? row[machineIndex] : '';

                if (!sap || !partNumber || !description) {
                  if (sap || partNumber || description) {
                    const missingFields = [];
                    if (!sap) missingFields.push('SAP');
                    if (!partNumber) missingFields.push('#PARTE');
                    if (!description) missingFields.push('DESCRIPCION');

                    const omittedInfo = `Hoja "${sheetName}", Fila ${
                      rowIndex + 2
                    }: Faltan ${missingFields.join(', ')}`;
                    result.errors.push(omittedInfo);
                    result.omittedRows.push(omittedInfo);
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
                  machineName ? machineName.toString().trim() : '',
                  finalCategory,
                  existingMachines,
                  this.selectedAreaForParts
                );

                const machineNameForLog = machineName
                  ? machineName.toString().trim()
                  : 'GENERAL';
                console.log(
                  `🎯 Asignando "${description}" a máquina "${machineNameForLog}" (ID: ${machineId})`
                );

                const exists = await this.partService.isSapNumberUnique(
                  sap.toString()
                );
                if (!exists) {
                  result.duplicates++;
                  result.duplicatedSaps.push(
                    `SAP: ${sap.toString().trim()} (Hoja "${sheetName}", Fila ${
                      rowIndex + 2
                    })`
                  );
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
                  image: image ? image.toString().trim() : '',
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
    machineName: string,
    category: string,
    existingMachines: { [key: string]: number },
    defaultArea: 'corte' | 'costura'
  ): Promise<number> {
    if (machineName && machineName.trim() !== '') {
      const upperMachineName = machineName.trim().toUpperCase();

      if (existingMachines[upperMachineName]) {
        console.log(
          `🎯 Usando máquina existente: ${machineName} (ID: ${existingMachines[upperMachineName]})`
        );
        return existingMachines[upperMachineName];
      }

      console.log(`🏭 Creando nueva máquina: ${machineName}...`);
      try {
        const newMachine = await this.machineService
          .createMachine({
            name: machineName.trim(),
            area: defaultArea,
          })
          .toPromise();
        if (newMachine) {
          existingMachines[upperMachineName] = newMachine.id!;
          console.log(
            `✅ Máquina ${machineName} creada (ID: ${newMachine.id})`
          );
          return newMachine.id!;
        }
      } catch (error) {
        console.error(`❌ Error creando máquina ${machineName}:`, error);
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

    if (
      desc.includes('sensor') ||
      desc.includes('cable') ||
      desc.includes('pcb') ||
      desc.includes('motor') ||
      desc.includes('servo') ||
      desc.includes('electronico') ||
      desc.includes('electrico')
    ) {
      return 'electronica';
    }

    if (
      desc.includes('lubricante') ||
      desc.includes('aceite') ||
      desc.includes('filtro') ||
      desc.includes('lija') ||
      desc.includes('consumible') ||
      desc.includes('grasa') ||
      desc.includes('limpiador')
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

  private extractMachineNames(description: string): string[] {
    return [];
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
