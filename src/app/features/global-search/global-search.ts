import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TouchButtonComponent } from '../../shared/components/touch-button/touch-button';
import { PartService } from '../../core/services/part';
import { MachineService } from '../../core/services/machine';
import { DatabaseService } from '../../core/services/database';
import { Part, Machine, PartCategory } from '../../core/models';

interface SearchFilters {
  searchText: string;
  category: 'all' | PartCategory;
  area: 'all' | 'corte' | 'costura';
  machineId: number | null;
}

@Component({
  selector: 'app-global-search',
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
              <h2 class="header-title">🔍 Búsqueda Global</h2>
              <p class="header-subtitle">
                Encuentra refacciones por SAP, descripción, ubicación o máquina
              </p>
            </div>
          </div>

          <!-- Estadísticas de búsqueda -->
          <div class="search-stats">
            <div class="stats-number">{{ filteredParts.length }}</div>
            <div class="stats-label">
              {{ filteredParts.length === 1 ? 'resultado' : 'resultados' }}
            </div>
            <div class="stats-total">de {{ allParts.length }} total</div>
          </div>
        </div>
      </div>

      <div class="content-area">
        <!-- Formulario de búsqueda -->
        <div class="search-section">
          <div class="professional-card">
            <div class="professional-content">
              <div class="search-grid">
                <!-- Búsqueda por texto -->
                <div class="search-field search-field-wide">
                  <label class="professional-label">🔎 Buscar por texto</label>
                  <input
                    type="text"
                    [(ngModel)]="filters.searchText"
                    (input)="onSearchChange()"
                    placeholder="SAP, descripción, ubicación..."
                    class="professional-input"
                  />
                  <div class="field-hint">
                    Busca en SAP, descripción, ubicación y número de parte
                  </div>
                </div>

                <!-- Filtro por categoría -->
                <div class="search-field">
                  <label class="professional-label">📂 Categoría</label>
                  <select
                    [(ngModel)]="filters.category"
                    (change)="onFilterChange()"
                    class="professional-input"
                  >
                    <option value="all">Todas las categorías</option>
                    <option value="mecanica">🔩 Mecánica</option>
                    <option value="electronica">⚡ Electrónica</option>
                    <option value="consumible">🔄 Consumible</option>
                  </select>
                </div>

                <!-- Filtro por área -->
                <div class="search-field">
                  <label class="professional-label">🏭 Área</label>
                  <select
                    [(ngModel)]="filters.area"
                    (change)="onFilterChange()"
                    class="professional-input"
                  >
                    <option value="all">Todas las áreas</option>
                    <option value="corte">✂️ Corte</option>
                    <option value="costura">🧵 Costura</option>
                  </select>
                </div>
              </div>

              <!-- Filtro por máquina -->
              <div class="machine-filter" *ngIf="availableMachines.length > 0">
                <div class="search-field">
                  <label class="professional-label"
                    >🔧 Máquina específica</label
                  >
                  <select
                    [(ngModel)]="filters.machineId"
                    (change)="onFilterChange()"
                    class="professional-input"
                  >
                    <option [ngValue]="null">Todas las máquinas</option>
                    <option
                      *ngFor="let machine of getFilteredMachines()"
                      [ngValue]="machine.id"
                    >
                      {{ getMachineLabel(machine) }}
                    </option>
                  </select>
                </div>
              </div>

              <!-- Acciones rápidas -->
              <div class="search-actions">
                <app-touch-button
                  variant="secondary"
                  size="md"
                  icon="🗑️"
                  (clicked)="clearFilters()"
                >
                  Limpiar Filtros
                </app-touch-button>

                <app-touch-button
                  variant="primary"
                  size="md"
                  icon="📊"
                  (clicked)="showSearchStats()"
                >
                  Estadísticas
                </app-touch-button>
              </div>
            </div>
          </div>
        </div>

        <!-- Resultados de búsqueda -->
        <div class="results-section">
          <!-- Resultados encontrados -->
          <div *ngIf="filteredParts.length > 0" class="results-grid">
            <div
              *ngFor="let part of filteredParts; let i = index"
              class="result-card professional-card animate-fadeInUp"
              [style.animation-delay]="i * 0.05 + 's'"
              [class]="'result-card-' + part.category"
              (click)="viewPartDetails(part)"
            >
              <div class="professional-content result-content">
                <!-- Header de la refacción -->
                <div class="result-header">
                  <div class="category-indicator">
                    <span class="category-icon">{{
                      getCategoryIcon(part.category)
                    }}</span>
                    <span class="category-label">{{
                      getCategoryLabel(part.category)
                    }}</span>
                  </div>

                  <div class="result-actions">
                    <app-touch-button
                      variant="warning"
                      size="sm"
                      icon="✏️"
                      (clicked)="editPartButton(part)"
                    >
                      Editar
                    </app-touch-button>
                  </div>
                </div>

                <!-- Información principal -->
                <div class="result-body">
                  <h3 class="part-description">{{ part.description }}</h3>

                  <div class="part-details">
                    <div class="detail-row">
                      <span class="detail-label">📦 SAP:</span>
                      <span class="detail-value sap-highlight">{{
                        part.sapNumber
                      }}</span>
                    </div>

                    <div class="detail-row">
                      <span class="detail-label">🔖 Parte:</span>
                      <span class="detail-value">{{ part.partNumber }}</span>
                    </div>

                    <div class="detail-row">
                      <span class="detail-label">📍 Ubicación:</span>
                      <span class="detail-value location-highlight">{{
                        part.location
                      }}</span>
                    </div>

                    <div class="detail-row">
                      <span class="detail-label">🔧 Máquina:</span>
                      <span class="detail-value machine-highlight">{{
                        getMachineName(part.machineId)
                      }}</span>
                    </div>
                  </div>
                </div>

                <!-- Footer con acciones -->
                <div class="result-footer">
                  <div class="footer-actions">
                    <app-touch-button
                      variant="primary"
                      size="sm"
                      icon="👁️"
                      (clicked)="viewPartDetailsButton(part)"
                    >
                      Ver
                    </app-touch-button>

                    <app-touch-button
                      variant="success"
                      size="sm"
                      icon="📋"
                      (clicked)="goToPartListButton(part)"
                    >
                      Lista
                    </app-touch-button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Estado vacío -->
          <div
            *ngIf="filteredParts.length === 0 && !isLoading"
            class="empty-state-pro"
          >
            <div class="empty-icon-pro">{{ getEmptyIcon() }}</div>
            <h3 class="empty-title-pro">{{ getEmptyTitle() }}</h3>
            <p class="empty-description-pro">{{ getEmptyMessage() }}</p>
            <div class="empty-actions">
              <app-touch-button
                variant="primary"
                size="lg"
                icon="🗑️"
                (clicked)="clearFilters()"
              >
                Limpiar Filtros
              </app-touch-button>

              <app-touch-button
                variant="success"
                size="lg"
                icon="📊"
                (clicked)="goToExcelImport()"
              >
                Importar Datos
              </app-touch-button>
            </div>
          </div>

          <!-- Loading state -->
          <div *ngIf="isLoading" class="loading-professional">
            <div class="loading-spinner-pro"></div>
            <span class="loading-text">Buscando refacciones...</span>
          </div>
        </div>
      </div>

      <!-- Modal de detalle de refacción -->
      <div
        *ngIf="showDetailModal"
        class="modal-overlay"
        (click)="closeDetailModal()"
      >
        <div class="modal-container" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <div class="modal-title">
              <span class="modal-icon">👁️</span>
              <h3>Detalle de Refacción</h3>
            </div>
            <button class="modal-close" (click)="closeDetailModal()">✕</button>
          </div>

          <div class="modal-content" *ngIf="selectedPart">
            <!-- Categoria y descripción -->
            <div class="modal-section">
              <div
                class="modal-category-badge"
                [class]="'badge-' + selectedPart.category"
              >
                <span class="badge-icon">{{
                  getCategoryIcon(selectedPart.category)
                }}</span>
                <span class="badge-label">{{
                  getCategoryLabel(selectedPart.category)
                }}</span>
              </div>
              <h2 class="modal-description">{{ selectedPart.description }}</h2>
            </div>

            <!-- Información detallada -->
            <div class="modal-section">
              <div class="detail-grid">
                <div class="detail-item">
                  <div class="detail-icon">📦</div>
                  <div class="detail-info">
                    <span class="detail-title">Número SAP</span>
                    <span class="detail-data sap-highlight">{{
                      selectedPart.sapNumber
                    }}</span>
                  </div>
                </div>

                <div class="detail-item">
                  <div class="detail-icon">🔖</div>
                  <div class="detail-info">
                    <span class="detail-title">Número de Parte</span>
                    <span class="detail-data">{{
                      selectedPart.partNumber
                    }}</span>
                  </div>
                </div>

                <div class="detail-item">
                  <div class="detail-icon">📍</div>
                  <div class="detail-info">
                    <span class="detail-title">Ubicación</span>
                    <span class="detail-data location-highlight">{{
                      selectedPart.location
                    }}</span>
                  </div>
                </div>

                <div class="detail-item">
                  <div class="detail-icon">🔧</div>
                  <div class="detail-info">
                    <span class="detail-title">Máquina</span>
                    <span class="detail-data machine-highlight">{{
                      getMachineName(selectedPart.machineId)
                    }}</span>
                  </div>
                </div>

                <div class="detail-item">
                  <div class="detail-icon">🏭</div>
                  <div class="detail-info">
                    <span class="detail-title">Área</span>
                    <span class="detail-data area-highlight">{{
                      getMachineArea(selectedPart.machineId)
                    }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Imagen si existe -->
            <div *ngIf="selectedPart.image" class="modal-section">
              <h4 class="image-section-title">📸 Imagen de la Refacción</h4>
              <div class="modal-image-container">
                <img
                  [src]="selectedPart.image"
                  [alt]="selectedPart.description"
                  class="modal-image"
                  (error)="onImageError($event)"
                />
                <div class="image-caption">
                  <span class="caption-text">{{
                    selectedPart.description
                  }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Acciones del modal -->
          <div class="modal-actions">
            <app-touch-button
              variant="warning"
              size="lg"
              icon="✏️"
              (clicked)="editPartFromModal()"
            >
              Editar Refacción
            </app-touch-button>

            <app-touch-button
              variant="success"
              size="lg"
              icon="📋"
              (clicked)="goToPartListFromModal()"
            >
              Ver Lista
            </app-touch-button>

            <app-touch-button
              variant="secondary"
              size="lg"
              icon="✕"
              (clicked)="closeDetailModal()"
            >
              Cerrar
            </app-touch-button>
          </div>
        </div>
      </div>

      <!-- Modal de estadísticas -->
      <div
        *ngIf="showStatsModal"
        class="modal-overlay"
        (click)="closeStatsModal()"
      >
        <div
          class="modal-container stats-modal"
          (click)="$event.stopPropagation()"
        >
          <div class="modal-header">
            <div class="modal-title">
              <span class="modal-icon">📊</span>
              <h3>Estadísticas del Inventario</h3>
            </div>
            <button class="modal-close" (click)="closeStatsModal()">✕</button>
          </div>

          <div class="modal-content">
            <div class="stats-grid">
              <!-- Total de refacciones -->
              <div class="stat-card total-parts">
                <div class="stat-icon">📦</div>
                <div class="stat-info">
                  <div class="stat-number">{{ getStats().total }}</div>
                  <div class="stat-label">Total de Refacciones</div>
                </div>
              </div>

              <!-- Por categoría -->
              <div class="stat-card category-mecanica">
                <div class="stat-icon">🔩</div>
                <div class="stat-info">
                  <div class="stat-number">{{ getStats().mecanica }}</div>
                  <div class="stat-label">Mecánicas</div>
                </div>
              </div>

              <div class="stat-card category-electronica">
                <div class="stat-icon">⚡</div>
                <div class="stat-info">
                  <div class="stat-number">{{ getStats().electronica }}</div>
                  <div class="stat-label">Electrónicas</div>
                </div>
              </div>

              <div class="stat-card category-consumible">
                <div class="stat-icon">🔄</div>
                <div class="stat-info">
                  <div class="stat-number">{{ getStats().consumible }}</div>
                  <div class="stat-label">Consumibles</div>
                </div>
              </div>

              <!-- Máquinas -->
              <div class="stat-card machines-total">
                <div class="stat-icon">🔧</div>
                <div class="stat-info">
                  <div class="stat-number">{{ getStats().machines }}</div>
                  <div class="stat-label">Máquinas Registradas</div>
                </div>
              </div>

              <!-- Resultados actuales -->
              <div class="stat-card current-results">
                <div class="stat-icon">🔍</div>
                <div class="stat-info">
                  <div class="stat-number">{{ filteredParts.length }}</div>
                  <div class="stat-label">Resultados Actuales</div>
                </div>
              </div>
            </div>

            <!-- Distribución por área -->
            <div class="area-distribution">
              <h4 class="distribution-title">🏭 Distribución por Área</h4>
              <div class="distribution-grid">
                <div class="distribution-item">
                  <span class="distribution-icon">✂️</span>
                  <span class="distribution-label">Corte:</span>
                  <span class="distribution-value"
                    >{{ getStats().corte }} refacciones</span
                  >
                </div>
                <div class="distribution-item">
                  <span class="distribution-icon">🧵</span>
                  <span class="distribution-label">Costura:</span>
                  <span class="distribution-value"
                    >{{ getStats().costura }} refacciones</span
                  >
                </div>
              </div>
            </div>
          </div>

          <div class="modal-actions">
            <app-touch-button
              variant="secondary"
              size="lg"
              icon="✕"
              (clicked)="closeStatsModal()"
            >
              Cerrar
            </app-touch-button>
          </div>
        </div>
      </div>

      <!-- Notificación de éxito -->
      <div
        *ngIf="showSuccessNotification"
        class="success-notification animate-slideInRight"
      >
        <div class="notification-content">
          <span class="notification-icon">✅</span>
          <span class="notification-text">{{ successMessage }}</span>
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

      .search-stats {
        text-align: center;
        padding: 1rem;
        background: rgba(255, 255, 255, 0.2);
        border-radius: var(--border-radius-md);
        border: 1px solid rgba(255, 255, 255, 0.3);
      }

      .stats-number {
        font-size: 1.5rem;
        font-weight: bold;
        margin-bottom: 0.25rem;
      }

      .stats-label {
        font-size: 0.875rem;
        margin-bottom: 0.125rem;
      }

      .stats-total {
        font-size: 0.75rem;
        opacity: 0.8;
      }

      .content-area {
        padding: 2rem;
        max-width: 1400px;
        margin: 0 auto;
      }

      /* Búsqueda */
      .search-section {
        margin-bottom: 2rem;
      }

      .search-grid {
        display: grid;
        grid-template-columns: 2fr 1fr 1fr;
        gap: 1.5rem;
        margin-bottom: 1.5rem;
      }

      .search-field-wide {
        grid-column: span 1;
      }

      .machine-filter {
        margin-bottom: 1.5rem;
      }

      .field-hint {
        font-size: 0.875rem;
        color: var(--gray-500);
        margin-top: 0.5rem;
      }

      .search-actions {
        display: flex;
        gap: 1rem;
        justify-content: center;
      }

      /* Resultados */
      .results-section {
        margin-top: 2rem;
      }

      .results-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
        gap: 2rem;
      }

      .result-card {
        min-height: 350px;
        border: 2px solid transparent;
        border-left: 6px solid;
        cursor: pointer;
        transition: all 0.3s ease;
      }

      .result-card-mecanica {
        border-left-color: var(--primary-600);
      }

      .result-card-electronica {
        border-left-color: #f59e0b;
      }

      .result-card-consumible {
        border-left-color: #10b981;
      }

      .result-card:hover {
        transform: translateY(-4px);
        box-shadow: var(--shadow-xl);
      }

      .result-content {
        display: flex;
        flex-direction: column;
        height: 100%;
      }

      .result-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid var(--gray-200);
      }

      .category-indicator {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 1rem;
        border-radius: var(--border-radius-sm);
        background: var(--gray-100);
      }

      .category-icon {
        font-size: 1.25rem;
      }

      .category-label {
        font-size: 0.875rem;
        font-weight: 600;
        color: var(--gray-700);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .result-body {
        flex: 1;
        margin-bottom: 1.5rem;
      }

      .part-description {
        font-size: 1.25rem;
        font-weight: bold;
        color: var(--gray-900);
        margin-bottom: 1rem;
        line-height: 1.4;
      }

      .part-details {
        background: var(--gray-50);
        padding: 1rem;
        border-radius: var(--border-radius-md);
        border: 1px solid var(--gray-200);
      }

      .detail-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.75rem;
      }

      .detail-row:last-child {
        margin-bottom: 0;
      }

      .detail-label {
        font-size: 0.875rem;
        font-weight: 600;
        color: var(--gray-600);
        min-width: 80px;
      }

      .detail-value {
        font-size: 0.875rem;
        color: var(--gray-900);
        font-weight: 500;
      }

      .sap-highlight {
        background: var(--primary-100);
        color: var(--primary-800);
        padding: 0.25rem 0.5rem;
        border-radius: var(--border-radius-sm);
        font-weight: bold;
      }

      .location-highlight {
        background: #ecfdf5;
        color: #065f46;
        padding: 0.25rem 0.5rem;
        border-radius: var(--border-radius-sm);
        font-weight: 600;
      }

      .machine-highlight {
        background: #fef3c7;
        color: #d97706;
        padding: 0.25rem 0.5rem;
        border-radius: var(--border-radius-sm);
        font-weight: 600;
      }

      .area-highlight {
        background: #f3e8ff;
        color: #7c3aed;
        padding: 0.25rem 0.5rem;
        border-radius: var(--border-radius-sm);
        font-weight: bold;
      }

      .result-footer {
        margin-top: auto;
      }

      .footer-actions {
        display: flex;
        gap: 0.75rem;
      }

      .footer-actions app-touch-button {
        flex: 1;
      }

      .empty-actions {
        display: flex;
        gap: 1rem;
        justify-content: center;
        margin-top: 2rem;
      }

      .loading-text {
        color: var(--gray-600);
        font-size: 1.125rem;
      }

      /* Modal */
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

      .stats-modal {
        max-width: 800px;
      }

      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 2rem 2rem 1rem;
        border-bottom: 2px solid var(--gray-100);
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

      .modal-section {
        margin-bottom: 2rem;
      }

      .modal-section:last-child {
        margin-bottom: 0;
      }

      .modal-category-badge {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 1rem;
        padding: 1rem 2rem;
        border-radius: var(--border-radius-lg);
        margin-bottom: 1.5rem;
      }

      .badge-mecanica {
        background: linear-gradient(
          135deg,
          var(--primary-100),
          var(--primary-200)
        );
        border: 2px solid var(--primary-300);
      }

      .badge-electronica {
        background: linear-gradient(135deg, #fef3c7, #fde68a);
        border: 2px solid #f59e0b;
      }

      .badge-consumible {
        background: linear-gradient(135deg, #d1fae5, #a7f3d0);
        border: 2px solid #10b981;
      }

      .badge-icon {
        font-size: 2.5rem;
      }

      .badge-label {
        font-size: 1rem;
        font-weight: bold;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--gray-700);
      }

      .modal-description {
        font-size: 1.5rem;
        font-weight: bold;
        color: var(--gray-900);
        text-align: center;
        line-height: 1.4;
        margin: 0;
      }

      .detail-grid {
        display: grid;
        gap: 1.5rem;
      }

      .detail-item {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1rem;
        background: var(--gray-50);
        border-radius: var(--border-radius-md);
        border: 1px solid var(--gray-200);
      }

      .detail-icon {
        font-size: 1.5rem;
        width: 3rem;
        height: 3rem;
        display: flex;
        align-items: center;
        justify-content: center;
        background: white;
        border-radius: var(--border-radius-md);
        border: 2px solid var(--gray-200);
        flex-shrink: 0;
      }

      .detail-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
      }

      .detail-title {
        font-size: 0.875rem;
        font-weight: 600;
        color: var(--gray-600);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .detail-data {
        font-size: 1rem;
        font-weight: 600;
        color: var(--gray-900);
      }

      /* Imagen */
      .image-section-title {
        font-size: 1.125rem;
        font-weight: bold;
        color: var(--gray-800);
        margin-bottom: 1rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .modal-image-container {
        text-align: center;
        padding: 1.5rem;
        background: var(--gray-50);
        border-radius: var(--border-radius-lg);
        border: 2px solid var(--gray-200);
        position: relative;
        overflow: hidden;
      }

      .modal-image {
        max-width: 100%;
        max-height: 400px;
        object-fit: contain;
        border-radius: var(--border-radius-md);
        box-shadow: var(--shadow-lg);
        transition: transform 0.3s ease;
      }

      .modal-image:hover {
        transform: scale(1.05);
      }

      .image-caption {
        margin-top: 1rem;
        padding: 0.75rem 1rem;
        background: rgba(255, 255, 255, 0.9);
        border-radius: var(--border-radius-md);
        border: 1px solid var(--gray-300);
      }

      .caption-text {
        font-size: 0.875rem;
        color: var(--gray-700);
        font-weight: 500;
        line-height: 1.4;
      }

      /* Modal de estadísticas */
      .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1.5rem;
        margin-bottom: 2rem;
      }

      .stat-card {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1.5rem;
        border-radius: var(--border-radius-lg);
        border: 2px solid;
        transition: transform 0.2s ease;
      }

      .stat-card:hover {
        transform: scale(1.02);
      }

      .total-parts {
        background: linear-gradient(
          135deg,
          var(--primary-50),
          var(--primary-100)
        );
        border-color: var(--primary-300);
      }

      .category-mecanica {
        background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
        border-color: #0ea5e9;
      }

      .category-electronica {
        background: linear-gradient(135deg, #fffbeb, #fef3c7);
        border-color: #f59e0b;
      }

      .category-consumible {
        background: linear-gradient(135deg, #ecfdf5, #d1fae5);
        border-color: #10b981;
      }

      .machines-total {
        background: linear-gradient(135deg, #fef7ff, #f3e8ff);
        border-color: #8b5cf6;
      }

      .current-results {
        background: linear-gradient(135deg, #f8fafc, #f1f5f9);
        border-color: #64748b;
      }

      .stat-icon {
        font-size: 2rem;
        width: 3.5rem;
        height: 3.5rem;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(255, 255, 255, 0.8);
        border-radius: var(--border-radius-md);
        flex-shrink: 0;
      }

      .stat-info {
        flex: 1;
      }

      .stat-number {
        font-size: 1.75rem;
        font-weight: bold;
        color: var(--gray-900);
        margin-bottom: 0.25rem;
      }

      .stat-label {
        font-size: 0.875rem;
        font-weight: 600;
        color: var(--gray-600);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .area-distribution {
        background: var(--gray-50);
        padding: 1.5rem;
        border-radius: var(--border-radius-lg);
        border: 1px solid var(--gray-200);
      }

      .distribution-title {
        font-size: 1.125rem;
        font-weight: bold;
        color: var(--gray-800);
        margin-bottom: 1rem;
        text-align: center;
      }

      .distribution-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
      }

      .distribution-item {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 1rem;
        background: white;
        border-radius: var(--border-radius-md);
        border: 1px solid var(--gray-300);
      }

      .distribution-icon {
        font-size: 1.5rem;
      }

      .distribution-label {
        font-weight: 600;
        color: var(--gray-700);
      }

      .distribution-value {
        font-weight: 500;
        color: var(--gray-900);
        margin-left: auto;
      }

      .modal-actions {
        display: flex;
        gap: 1rem;
        padding: 1rem 2rem 2rem;
      }

      .modal-actions app-touch-button {
        flex: 1;
      }

      /* Notificación de éxito */
      .success-notification {
        position: fixed;
        top: 2rem;
        right: 2rem;
        z-index: 1100;
        background: linear-gradient(135deg, #10b981, #34d399);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: var(--border-radius-lg);
        box-shadow: var(--shadow-xl);
        border: 2px solid #059669;
        max-width: 400px;
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
      }

      /* Animaciones */
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

      .animate-fadeInUp {
        animation: fadeInUp 0.6s ease-out;
      }

      .animate-slideInRight {
        animation: slideInRight 0.5s ease-out;
      }

      /* Responsive */
      @media (max-width: 1024px) {
        .search-grid {
          grid-template-columns: 1fr;
          gap: 1rem;
        }

        .results-grid {
          grid-template-columns: 1fr;
          gap: 1.5rem;
        }

        .stats-grid {
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 1rem;
        }

        .distribution-grid {
          grid-template-columns: 1fr;
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

        .result-card {
          min-height: 300px;
        }

        .search-actions {
          flex-direction: column;
          align-items: center;
        }

        .search-actions app-touch-button {
          width: 100%;
          max-width: 250px;
        }

        .footer-actions {
          flex-direction: column;
        }

        .empty-actions {
          flex-direction: column;
          align-items: center;
        }

        .empty-actions app-touch-button {
          width: 100%;
          max-width: 250px;
        }

        .modal-container {
          margin: 1rem;
          max-height: calc(100vh - 2rem);
        }

        .modal-header,
        .modal-content,
        .modal-actions {
          padding-left: 1rem;
          padding-right: 1rem;
        }

        .stats-grid {
          grid-template-columns: 1fr;
        }

        .modal-actions {
          flex-direction: column;
        }

        .success-notification {
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

        .part-description {
          font-size: 1.125rem;
        }

        .modal-title h3 {
          font-size: 1.25rem;
        }

        .modal-description {
          font-size: 1.25rem;
        }
      }
    `,
  ],
})
export class GlobalSearchComponent implements OnInit {
  allParts: Part[] = [];
  filteredParts: Part[] = [];
  availableMachines: Machine[] = [];
  isLoading = true;

  // Modal states
  showDetailModal = false;
  showStatsModal = false;
  selectedPart: Part | null = null;

  // Notificación
  showSuccessNotification = false;
  successMessage = '';

  filters: SearchFilters = {
    searchText: '',
    category: 'all',
    area: 'all',
    machineId: null,
  };

  constructor(
    private router: Router,
    private partService: PartService,
    private machineService: MachineService,
    private databaseService: DatabaseService
  ) {}

  async ngOnInit() {
    try {
      await this.databaseService.initializeDatabase();
      await this.loadAllData();
    } catch (error) {
      console.error('Error initializing search:', error);
    }
  }

  async loadAllData() {
    this.isLoading = true;
    try {
      this.partService.loadParts().subscribe({
        next: (parts) => {
          this.allParts = parts || [];
          this.filteredParts = [...this.allParts];
          console.log(`🔍 Loaded ${this.allParts.length} parts for search`);
        },
        error: (error) => {
          console.error('Error loading parts:', error);
          this.allParts = [];
          this.filteredParts = [];
        },
      });

      this.machineService.loadMachines().subscribe({
        next: (machines) => {
          this.availableMachines = machines || [];
          console.log(
            `🔧 Loaded ${this.availableMachines.length} machines for search`
          );
        },
        error: (error) => {
          console.error('Error loading machines:', error);
          this.availableMachines = [];
        },
      });
    } catch (error) {
      console.error('Error loading search data:', error);
    } finally {
      this.isLoading = false;
    }
  }

  onSearchChange() {
    setTimeout(() => {
      this.applyFilters();
    }, 300);
  }

  onFilterChange() {
    this.applyFilters();
  }

  applyFilters() {
    let filtered = [...this.allParts];

    if (this.filters.searchText && this.filters.searchText.trim()) {
      const searchText = this.filters.searchText.toLowerCase().trim();
      filtered = filtered.filter(
        (part) =>
          part.sapNumber.toLowerCase().includes(searchText) ||
          part.partNumber.toLowerCase().includes(searchText) ||
          part.description.toLowerCase().includes(searchText) ||
          part.location.toLowerCase().includes(searchText)
      );
    }

    if (this.filters.category !== 'all') {
      filtered = filtered.filter(
        (part) => part.category === this.filters.category
      );
    }

    if (this.filters.area !== 'all') {
      const machinesInArea = this.availableMachines
        .filter((machine) => machine.area === this.filters.area)
        .map((machine) => machine.id);

      filtered = filtered.filter((part) =>
        machinesInArea.includes(part.machineId)
      );
    }

    if (this.filters.machineId !== null) {
      filtered = filtered.filter(
        (part) => part.machineId === this.filters.machineId
      );
    }

    this.filteredParts = filtered;
    console.log(`🔍 Search results: ${this.filteredParts.length} parts found`);
  }

  getFilteredMachines(): Machine[] {
    if (this.filters.area === 'all') {
      return this.availableMachines;
    }
    return this.availableMachines.filter(
      (machine) => machine.area === this.filters.area
    );
  }

  getMachineName(machineId: number): string {
    const machine = this.availableMachines.find((m) => m.id === machineId);
    return machine ? machine.name : 'Máquina desconocida';
  }

  getMachineArea(machineId: number): string {
    const machine = this.availableMachines.find((m) => m.id === machineId);
    if (!machine) return 'Área desconocida';
    return machine.area === 'corte' ? 'ÁREA DE CORTE' : 'ÁREA DE COSTURA';
  }

  getMachineLabel(machine: Machine): string {
    const areaIcon = machine.area === 'corte' ? '✂️' : '🧵';
    return `${areaIcon} ${machine.name}`;
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

  getEmptyIcon(): string {
    if (
      this.filters.searchText ||
      this.filters.category !== 'all' ||
      this.filters.area !== 'all' ||
      this.filters.machineId !== null
    ) {
      return '🔍';
    }
    return '📦';
  }

  getEmptyTitle(): string {
    if (this.allParts.length === 0) {
      return 'No hay refacciones en el sistema';
    }
    return 'No se encontraron resultados';
  }

  getEmptyMessage(): string {
    if (this.allParts.length === 0) {
      return 'Importa refacciones desde Excel o agrégalas manualmente para comenzar a usar la búsqueda.';
    }
    return 'Intenta ajustar los filtros de búsqueda o usar términos diferentes.';
  }

  getStats() {
    const corteRefacciones = this.allParts.filter((part) => {
      const machine = this.availableMachines.find(
        (m) => m.id === part.machineId
      );
      return machine?.area === 'corte';
    }).length;

    const costuraRefacciones = this.allParts.filter((part) => {
      const machine = this.availableMachines.find(
        (m) => m.id === part.machineId
      );
      return machine?.area === 'costura';
    }).length;

    return {
      total: this.allParts.length,
      mecanica: this.allParts.filter((p) => p.category === 'mecanica').length,
      electronica: this.allParts.filter((p) => p.category === 'electronica')
        .length,
      consumible: this.allParts.filter((p) => p.category === 'consumible')
        .length,
      machines: this.availableMachines.length,
      corte: corteRefacciones,
      costura: costuraRefacciones,
    };
  }

  clearFilters() {
    this.filters = {
      searchText: '',
      category: 'all',
      area: 'all',
      machineId: null,
    };
    this.applyFilters();
    this.showSuccess('Filtros limpiados correctamente');
  }

  // Modal de estadísticas
  showSearchStats() {
    console.log('📊 Show search statistics');
    this.showStatsModal = true;
  }

  closeStatsModal() {
    this.showStatsModal = false;
  }

  // Modal de detalles
  viewPartDetails(part: Part, event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    console.log('👁️ View part details:', part.description);
    this.selectedPart = part;
    this.showDetailModal = true;
  }

  closeDetailModal() {
    this.showDetailModal = false;
    this.selectedPart = null;
  }

  onImageError(event: any) {
    console.warn('Error loading image:', event);
    event.target.style.display = 'none';
  }

  editPartFromModal() {
    if (this.selectedPart) {
      this.closeDetailModal();
      this.editPart(this.selectedPart);
    }
  }

  goToPartListFromModal() {
    if (this.selectedPart) {
      this.closeDetailModal();
      this.goToPartList(this.selectedPart);
    }
  }

  editPart(part: Part, event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    console.log('✏️ Edit part:', part.description);

    const machine = this.availableMachines.find((m) => m.id === part.machineId);
    if (machine) {
      this.router.navigate([
        '/machines',
        machine.area,
        part.machineId,
        'parts',
        part.category,
        part.id,
        'edit',
      ]);
    }
  }

  editPartButton(part: Part) {
    this.editPart(part);
  }

  goToPartList(part: Part, event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    console.log('📋 Go to part list:', part.category);

    const machine = this.availableMachines.find((m) => m.id === part.machineId);
    if (machine) {
      this.router.navigate([
        '/machines',
        machine.area,
        part.machineId,
        'parts',
        part.category,
      ]);
    }
  }

  goToPartListButton(part: Part) {
    this.goToPartList(part);
  }

  viewPartDetailsButton(part: Part) {
    this.viewPartDetails(part);
  }

  // Notificación de éxito
  showSuccess(message: string) {
    this.successMessage = message;
    this.showSuccessNotification = true;

    setTimeout(() => {
      this.showSuccessNotification = false;
    }, 4000);
  }

  goToExcelImport() {
    this.router.navigate(['/excel-import']);
  }

  goBack() {
    this.router.navigate(['/']);
  }
}
