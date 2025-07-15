import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TouchButtonComponent } from '../../shared/components/touch-button/touch-button';
import { PartService } from '../../core/services/part';
import { MachineService } from '../../core/services/machine';
import { DatabaseService } from '../../core/services/database';
import { Part, PartCategory, Machine } from '../../core/models';

@Component({
  selector: 'app-part-list',
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
              <h2 class="header-title">
                🔧 {{ machine?.name || 'Cargando...' }}
              </h2>
              <p class="header-subtitle">
                {{ getAreaTitle() }} • {{ getCategoryPageTitle() }}
              </p>
            </div>
          </div>

          <div class="header-right">
            <!-- Admin mode toggle -->
            <div class="admin-section">
              <app-touch-button
                *ngIf="!isAdminMode"
                variant="secondary"
                size="md"
                icon="⚙️"
                (clicked)="openAdminModal()"
                class="admin-gear"
              >
                Admin
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
              (clicked)="addPart()"
              [disabled]="!machine"
            >
              Agregar Refacción
            </app-touch-button>
          </div>
        </div>
      </div>

      <div class="content-area">
        <!-- Filtros por categoría -->
        <div class="filters-section">
          <div class="professional-card">
            <div class="professional-content">
              <div class="filters-grid">
                <app-touch-button
                  [variant]="
                    selectedCategory === 'all' ? 'primary' : 'secondary'
                  "
                  size="md"
                  icon="🔍"
                  (clicked)="filterByCategory('all')"
                >
                  Todas ({{ getTotalParts() }})
                </app-touch-button>

                <app-touch-button
                  [variant]="
                    selectedCategory === 'mecanica' ? 'primary' : 'secondary'
                  "
                  size="md"
                  icon="⚙️"
                  (clicked)="filterByCategory('mecanica')"
                >
                  Mecánica ({{ getPartsByCategory('mecanica').length }})
                </app-touch-button>

                <app-touch-button
                  [variant]="
                    selectedCategory === 'electronica' ? 'warning' : 'secondary'
                  "
                  size="md"
                  icon="⚡"
                  (clicked)="filterByCategory('electronica')"
                >
                  Electrónica ({{ getPartsByCategory('electronica').length }})
                </app-touch-button>

                <app-touch-button
                  [variant]="
                    selectedCategory === 'consumible' ? 'success' : 'secondary'
                  "
                  size="md"
                  icon="📦"
                  (clicked)="filterByCategory('consumible')"
                >
                  Consumible ({{ getPartsByCategory('consumible').length }})
                </app-touch-button>
              </div>
            </div>
          </div>
        </div>

        <!-- Lista de refacciones -->
        <div *ngIf="filteredParts.length > 0" class="parts-grid">
          <div
            *ngFor="let part of filteredParts; let i = index"
            class="part-card professional-card animate-fadeInUp"
            [style.animation-delay]="i * 0.1 + 's'"
            [class]="'part-card-' + part.category"
          >
            <div class="professional-content part-content">
              <!-- Header de la refacción -->
              <div class="part-header">
                <div class="part-category-badge">
                  <span class="category-icon">{{
                    getCategoryIcon(part.category)
                  }}</span>
                  <span class="category-label">{{
                    getCategoryLabel(part.category)
                  }}</span>
                </div>

                <div class="part-info">
                  <h3 class="part-description">{{ part.description }}</h3>
                  <div class="part-numbers">
                    <div class="part-detail">
                      <span class="detail-label">SAP:</span>
                      <span class="detail-value sap-value">{{
                        part.sapNumber
                      }}</span>
                    </div>
                    <div class="part-detail">
                      <span class="detail-label">Parte:</span>
                      <span class="detail-value">{{ part.partNumber }}</span>
                    </div>
                    <div class="part-detail">
                      <span class="detail-label">Ubicación:</span>
                      <span class="detail-value location-value">{{
                        part.location
                      }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Las imágenes NO se muestran aquí - solo en el modal -->

              <!-- Acciones -->
              <div class="part-actions">
                <app-touch-button
                  variant="primary"
                  size="md"
                  [fullWidth]="true"
                  icon="👁️"
                  (clicked)="viewPartDetail(part)"
                  class="main-action"
                >
                  Ver Detalle
                </app-touch-button>

                <div class="secondary-actions">
                  <app-touch-button
                    *ngIf="isAdminMode"
                    variant="warning"
                    size="sm"
                    icon="✏️"
                    (clicked)="editPart(part)"
                  >
                    Editar
                  </app-touch-button>

                  <app-touch-button
                    *ngIf="isAdminMode"
                    variant="danger"
                    size="sm"
                    icon="🗑️"
                    (clicked)="requestDeletePart(part)"
                  >
                    Eliminar
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
          <div class="empty-icon-pro">{{ getEmptyStateIcon() }}</div>
          <h3 class="empty-title-pro">{{ getEmptyStateTitle() }}</h3>
          <p class="empty-description-pro">{{ getEmptyStateMessage() }}</p>
          <app-touch-button
            variant="success"
            size="xl"
            icon="🚀"
            (clicked)="addPart()"
          >
            {{ getAddButtonText() }}
          </app-touch-button>
        </div>

        <!-- Loading state -->
        <div *ngIf="isLoading" class="loading-professional">
          <div class="loading-spinner-pro"></div>
          <span class="loading-text">Cargando refacciones...</span>
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
                      machine?.name
                    }}</span>
                  </div>
                </div>

                <div class="detail-item">
                  <div class="detail-icon">🏭</div>
                  <div class="detail-info">
                    <span class="detail-title">Área</span>
                    <span class="detail-data area-highlight">{{
                      getAreaTitle()
                    }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Imagen si existe - SOLO AQUÍ SE MUESTRA -->
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
              *ngIf="isAdminMode"
              variant="warning"
              size="lg"
              icon="✏️"
              (clicked)="editPartFromModal()"
            >
              Editar Refacción
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

      <!-- Modal de administrador -->
      <div
        *ngIf="showAdminModal"
        class="modal-overlay"
        (click)="closeAdminModal()"
      >
        <div
          class="modal-container admin-modal"
          (click)="$event.stopPropagation()"
        >
          <div class="modal-header">
            <div class="modal-title">
              <span class="modal-icon">🔐</span>
              <h3>Modo Administrador</h3>
            </div>
            <button class="modal-close" (click)="closeAdminModal()">✕</button>
          </div>

          <div class="modal-content">
            <div class="admin-form" (click)="$event.stopPropagation()">
              <p class="admin-description">
                Ingresa la contraseña de administrador para acceder a las
                funciones de edición y eliminación.
              </p>

              <div class="input-group">
                <label class="input-label">Contraseña:</label>
                <input
                  type="password"
                  [(ngModel)]="adminPassword"
                  class="admin-input"
                  placeholder="Ingresa la contraseña"
                  (click)="onInputInteraction($event)"
                  (focus)="onInputInteraction($event)"
                  (input)="onInputInteraction($event)"
                  (keydown)="onInputInteraction($event)"
                  (keypress)="
                    $event.key === 'Enter' && checkAdminPassword();
                    onInputInteraction($event)
                  "
                  autocomplete="off"
                />
              </div>
            </div>
          </div>

          <div class="modal-actions">
            <app-touch-button
              variant="primary"
              size="lg"
              icon="🔓"
              (clicked)="checkAdminPassword()"
              [disabled]="!adminPassword.trim()"
            >
              Activar Modo Admin
            </app-touch-button>

            <app-touch-button
              variant="secondary"
              size="lg"
              icon="✕"
              (clicked)="closeAdminModal()"
            >
              Cancelar
            </app-touch-button>
          </div>
        </div>
      </div>

      <!-- Modal de eliminación con contraseña -->
      <div
        *ngIf="showPasswordDeleteModal"
        class="modal-overlay"
        (click)="closePasswordDeleteModal()"
      >
        <div
          class="modal-container delete-modal"
          (click)="$event.stopPropagation()"
        >
          <div class="modal-header danger-header">
            <div class="modal-title">
              <span class="modal-icon danger-icon">⚠️</span>
              <h3>Confirmar Eliminación</h3>
            </div>
            <button class="modal-close" (click)="closePasswordDeleteModal()">
              ✕
            </button>
          </div>

          <div class="modal-content" *ngIf="partToDelete">
            <div class="delete-warning" (click)="$event.stopPropagation()">
              <div class="warning-content">
                <h4 class="warning-title">
                  ¿Estás seguro de eliminar esta refacción?
                </h4>
                <p class="warning-description">
                  Se eliminará permanentemente la refacción:
                </p>
                <div class="part-to-delete">
                  <div class="part-preview">
                    <span class="preview-icon">{{
                      getCategoryIcon(partToDelete.category)
                    }}</span>
                    <div class="preview-info">
                      <span class="preview-name">{{
                        partToDelete.description
                      }}</span>
                      <span class="preview-sap"
                        >SAP: {{ partToDelete.sapNumber }}</span
                      >
                    </div>
                  </div>
                </div>

                <div class="password-section">
                  <label class="input-label"
                    >Ingresa tu contraseña para confirmar:</label
                  >
                  <input
                    type="password"
                    [(ngModel)]="deletePassword"
                    class="admin-input"
                    placeholder="Contraseña requerida"
                    (click)="onInputInteraction($event)"
                    (focus)="onInputInteraction($event)"
                    (input)="onInputInteraction($event)"
                    (keydown)="onInputInteraction($event)"
                    (keypress)="
                      $event.key === 'Enter' && confirmPasswordDelete();
                      onInputInteraction($event)
                    "
                    autocomplete="off"
                  />
                </div>

                <p class="warning-notice">
                  <strong>Esta acción no se puede deshacer.</strong>
                </p>
              </div>
            </div>
          </div>

          <div class="modal-actions">
            <app-touch-button
              variant="danger"
              size="lg"
              icon="🗑️"
              (clicked)="confirmPasswordDelete()"
              [loading]="isDeleting"
              [disabled]="!deletePassword.trim() || isDeleting"
            >
              {{ isDeleting ? 'Eliminando...' : 'Sí, Eliminar' }}
            </app-touch-button>

            <app-touch-button
              variant="secondary"
              size="lg"
              icon="✕"
              (clicked)="closePasswordDeleteModal()"
              [disabled]="isDeleting"
            >
              Cancelar
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

      .header-right {
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

      /* Filtros */
      .filters-section {
        margin-bottom: 2rem;
      }

      .filters-grid {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 1rem;
      }

      /* Lista de refacciones */
      .parts-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
        gap: 2rem;
      }

      .part-card {
        min-height: 400px;
        display: flex;
        flex-direction: column;
        border: 2px solid transparent;
        border-left: 6px solid;
        transition: all 0.3s ease;
      }

      .part-card-mecanica {
        border-left-color: var(--primary-600);
      }

      .part-card-electronica {
        border-left-color: #f59e0b;
      }

      .part-card-consumible {
        border-left-color: #10b981;
      }

      .part-card:hover {
        transform: translateY(-4px);
        box-shadow: var(--shadow-xl);
      }

      .part-content {
        display: flex;
        flex-direction: column;
        height: 100%;
      }

      .part-header {
        margin-bottom: 1.5rem;
      }

      .part-category-badge {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.75rem;
        padding: 1rem;
        background: var(--gray-100);
        border-radius: var(--border-radius-md);
        margin-bottom: 1rem;
      }

      .category-icon {
        font-size: 2rem;
        filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
      }

      .category-label {
        font-size: 0.875rem;
        font-weight: bold;
        color: var(--gray-700);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .part-info {
        text-align: center;
      }

      .part-description {
        font-size: 1.25rem;
        font-weight: bold;
        color: var(--gray-900);
        margin: 0 0 1rem 0;
        line-height: 1.4;
      }

      .part-numbers {
        background: var(--gray-50);
        padding: 1rem;
        border-radius: var(--border-radius-md);
        border: 1px solid var(--gray-200);
      }

      .part-detail {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.5rem;
      }

      .part-detail:last-child {
        margin-bottom: 0;
      }

      .detail-label {
        font-size: 0.875rem;
        font-weight: 600;
        color: var(--gray-600);
      }

      .detail-value {
        font-size: 0.875rem;
        color: var(--gray-900);
        font-weight: 500;
      }

      .sap-value {
        background: var(--primary-100);
        color: var(--primary-800);
        padding: 0.25rem 0.5rem;
        border-radius: var(--border-radius-sm);
        font-weight: bold;
      }

      .location-value {
        background: #ecfdf5;
        color: #065f46;
        padding: 0.25rem 0.5rem;
        border-radius: var(--border-radius-sm);
        font-weight: 600;
      }

      .part-actions {
        margin-top: auto;
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

      .delete-modal {
        max-width: 500px;
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

      .danger-icon {
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
        font-weight: bold;
      }

      .machine-highlight {
        background: #fef3c7;
        color: #d97706;
        padding: 0.25rem 0.5rem;
        border-radius: var(--border-radius-sm);
        font-weight: bold;
      }

      .area-highlight {
        background: #f3e8ff;
        color: #7c3aed;
        padding: 0.25rem 0.5rem;
        border-radius: var(--border-radius-sm);
        font-weight: bold;
      }

      /* SECCIÓN DE IMAGEN - SOLO EN MODAL */
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

      .modal-actions {
        display: flex;
        gap: 1rem;
        padding: 1rem 2rem 2rem;
      }

      .modal-actions app-touch-button {
        flex: 1;
      }

      /* Modal de eliminación */
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

      .part-to-delete {
        margin: 1.5rem 0;
        padding: 1rem;
        background: #fef2f2;
        border: 2px solid #fecaca;
        border-radius: var(--border-radius-md);
      }

      .part-preview {
        display: flex;
        align-items: center;
        gap: 1rem;
      }

      .preview-icon {
        font-size: 2rem;
        flex-shrink: 0;
      }

      .preview-info {
        flex: 1;
        text-align: left;
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
      }

      .preview-name {
        font-size: 1rem;
        font-weight: bold;
        color: var(--gray-900);
      }

      .preview-sap {
        font-size: 0.875rem;
        color: var(--gray-600);
      }

      .warning-notice {
        font-size: 0.875rem;
        color: #dc2626;
        font-weight: 600;
        margin-top: 1rem;
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

      .loading-text {
        color: var(--gray-600);
        font-size: 1.125rem;
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

      /* Admin Modal */
      .admin-modal {
        max-width: 500px;
      }

      .admin-form {
        text-align: center;
      }

      .admin-description {
        font-size: 1rem;
        color: var(--gray-600);
        margin-bottom: 2rem;
        line-height: 1.6;
      }

      .input-group {
        margin-bottom: 1.5rem;
      }

      .input-label {
        display: block;
        font-size: 0.875rem;
        font-weight: 600;
        color: var(--gray-700);
        margin-bottom: 0.5rem;
        text-align: left;
      }

      .admin-input {
        width: 100%;
        padding: 1rem;
        border: 2px solid var(--gray-300);
        border-radius: var(--border-radius-md);
        font-size: 1rem;
        transition: all 0.3s ease;
        background: white;
      }

      .admin-input:focus {
        outline: none;
        border-color: var(--primary-500);
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
      }

      .admin-input::placeholder {
        color: var(--gray-400);
      }

      .password-section {
        margin: 1.5rem 0;
        padding: 1rem;
        background: #fef2f2;
        border: 2px solid #fecaca;
        border-radius: var(--border-radius-md);
      }

      .password-section .input-label {
        color: #dc2626;
        font-weight: bold;
        margin-bottom: 0.75rem;
        text-align: center;
      }

      .password-section .admin-input {
        border-color: #fca5a5;
        background: white;
      }

      .password-section .admin-input:focus {
        border-color: #dc2626;
        box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
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

        .header-right {
          flex-direction: column;
          gap: 1rem;
          width: 100%;
        }

        .admin-section {
          order: -1;
        }

        .content-area {
          padding: 1rem;
        }

        .parts-grid {
          grid-template-columns: 1fr;
          gap: 1.5rem;
        }

        .part-card {
          min-height: 350px;
        }

        .filters-grid {
          flex-direction: column;
          align-items: center;
        }

        .filters-grid app-touch-button {
          width: 100%;
          max-width: 250px;
        }

        .secondary-actions {
          flex-direction: column;
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

        .detail-grid {
          gap: 1rem;
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
export class PartListComponent implements OnInit {
  selectedArea: 'corte' | 'costura' = 'costura';
  machineId!: number;
  machine: Machine | null = null;
  allParts: Part[] = [];
  filteredParts: Part[] = [];
  selectedCategory: 'all' | PartCategory = 'all';
  isLoading = true;

  // Modal states
  showDetailModal = false;
  selectedPart: Part | null = null;
  partToDelete: Part | null = null;
  isDeleting = false;

  // Admin mode
  isAdminMode = false;
  showAdminModal = false;
  adminPassword = '';
  private adminTimeout: any;

  // Password delete modal
  showPasswordDeleteModal = false;
  deletePassword = '';

  // Notificación
  showSuccessNotification = false;
  successMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private partService: PartService,
    private machineService: MachineService,
    private databaseService: DatabaseService
  ) {}

  async ngOnInit() {
    this.route.params.subscribe(async (params) => {
      this.selectedArea = params['area'] || 'costura';
      this.machineId = +params['machineId'];
      const categoryParam = params['category'] || 'all';

      this.selectedCategory = categoryParam as 'all' | PartCategory;

      if (this.machineId) {
        await this.loadMachine();
        await this.loadParts();
      }
    });

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
          console.log('🔧 Loaded machine:', this.machine);
        },
        error: (error) => {
          console.error('Error loading machine:', error);
        },
      });
    } catch (error) {
      console.error('Error loading machine:', error);
    }
  }

  async loadParts() {
    this.isLoading = true;
    try {
      this.partService.getPartsByMachine(this.machineId).subscribe({
        next: (parts) => {
          this.allParts = parts;
          this.applyFilter();
          this.isLoading = false;
          console.log('📦 Loaded parts:', parts);
        },
        error: (error) => {
          console.error('Error loading parts:', error);
          this.isLoading = false;
        },
      });
    } catch (error) {
      console.error('Error loading parts:', error);
      this.isLoading = false;
    }
  }

  filterByCategory(category: 'all' | PartCategory) {
    this.selectedCategory = category;
    this.applyFilter();
  }

  applyFilter() {
    if (this.selectedCategory === 'all') {
      this.filteredParts = [...this.allParts];
    } else {
      this.filteredParts = this.allParts.filter(
        (part) => part.category === this.selectedCategory
      );
    }
  }

  getPartsByCategory(category: PartCategory): Part[] {
    return this.allParts.filter((part) => part.category === category);
  }

  getTotalParts(): number {
    return this.allParts.length;
  }

  getCategoryIcon(category: PartCategory): string {
    const icons = {
      mecanica: '⚙️',
      electronica: '⚡',
      consumible: '📦',
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

  getAreaTitle(): string {
    return this.selectedArea === 'corte' ? 'ÁREA DE CORTE' : 'ÁREA DE COSTURA';
  }

  getCategoryPageTitle(): string {
    if (this.selectedCategory === 'all') {
      return 'Todas las Refacciones';
    }
    return `Refacciones ${this.getCategoryLabel(
      this.selectedCategory as PartCategory
    )}`;
  }

  getEmptyStateTitle(): string {
    if (this.selectedCategory === 'all') {
      return 'No hay refacciones registradas';
    }
    return `No hay refacciones de ${this.getCategoryLabel(
      this.selectedCategory as PartCategory
    )}`;
  }

  getEmptyStateMessage(): string {
    if (this.selectedCategory === 'all') {
      return `Comienza agregando la primera refacción para ${
        this.machine?.name || 'esta máquina'
      }`;
    }
    return `No se encontraron refacciones de tipo ${this.getCategoryLabel(
      this.selectedCategory as PartCategory
    )} para esta máquina`;
  }

  getEmptyStateIcon(): string {
    if (this.selectedCategory === 'all') {
      return '📦';
    }
    return this.getCategoryIcon(this.selectedCategory as PartCategory);
  }

  getAddButtonText(): string {
    if (this.selectedCategory === 'all') {
      return 'Agregar Primera Refacción';
    }
    return `Agregar ${this.getCategoryLabel(
      this.selectedCategory as PartCategory
    )}`;
  }

  onImageError(event: any) {
    console.warn('Error loading image:', event);
    event.target.style.display = 'none';
  }

  // Modal de detalle
  viewPartDetail(part: Part) {
    console.log('👁️ View part detail:', part.description);
    this.selectedPart = part;
    this.showDetailModal = true;
  }

  closeDetailModal() {
    this.showDetailModal = false;
    this.selectedPart = null;
  }

  editPartFromModal() {
    if (this.selectedPart) {
      this.closeDetailModal();
      this.editPart(this.selectedPart);
    }
  }

  // Notificación de éxito
  showSuccess(message: string) {
    this.successMessage = message;
    this.showSuccessNotification = true;

    setTimeout(() => {
      this.showSuccessNotification = false;
    }, 4000);
  }

  goBack() {
    this.router.navigate([
      '/machines',
      this.selectedArea,
      this.machineId,
      'parts',
    ]);
  }

  addPart() {
    console.log('➕ Add new part to machine:', this.machineId);
    const category =
      this.selectedCategory === 'all' ? 'mecanica' : this.selectedCategory;
    this.router.navigate([
      '/machines',
      this.selectedArea,
      this.machineId,
      'parts',
      category,
      'add',
    ]);
  }

  editPart(part: Part) {
    console.log('✏️ Edit part:', part.description);
    this.router.navigate([
      '/machines',
      this.selectedArea,
      this.machineId,
      'parts',
      this.selectedCategory,
      part.id,
      'edit',
    ]);
  }

  // Admin mode methods
  openAdminModal() {
    this.showAdminModal = true;
    this.adminPassword = '';

    // Focus the input after modal opens
    setTimeout(() => {
      const input = document.querySelector('.admin-input') as HTMLInputElement;
      if (input) {
        input.focus();
      }
    }, 100);
  }

  closeAdminModal() {
    this.showAdminModal = false;
    this.adminPassword = '';
  }

  // Prevent modal close on input interaction
  onInputInteraction(event: Event) {
    event.stopPropagation();
    event.stopImmediatePropagation();
  }

  checkAdminPassword() {
    if (this.adminPassword === 'Mantenimiento1.') {
      this.isAdminMode = true;
      this.closeAdminModal();
      this.showSuccess('Modo administrador activado');

      // Auto logout after 5 minutes
      this.adminTimeout = setTimeout(() => {
        this.exitAdminMode();
      }, 5 * 60 * 1000);
    } else {
      this.showSuccess('Contraseña incorrecta');
      this.adminPassword = '';
    }
  }

  exitAdminMode() {
    this.isAdminMode = false;
    if (this.adminTimeout) {
      clearTimeout(this.adminTimeout);
    }
    this.showSuccess('Modo administrador desactivado');
  }

  // Password delete methods
  requestDeletePart(part: Part) {
    this.partToDelete = part;
    this.showPasswordDeleteModal = true;
    this.deletePassword = '';
  }

  closePasswordDeleteModal() {
    this.showPasswordDeleteModal = false;
    this.partToDelete = null;
    this.deletePassword = '';
  }

  confirmPasswordDelete() {
    if (this.deletePassword !== 'Mantenimiento1.') {
      this.showSuccess('Contraseña incorrecta');
      this.deletePassword = '';
      return;
    }

    if (!this.partToDelete) return;

    this.isDeleting = true;
    const partName = this.partToDelete.description;

    this.partService.deletePart(this.partToDelete.id!).subscribe({
      next: () => {
        console.log('🗑️ Part deleted:', partName);
        this.closePasswordDeleteModal();
        this.showSuccess(`Refacción "${partName}" eliminada exitosamente`);
        this.loadParts();
      },
      error: (error) => {
        console.error('Error deleting part:', error);
        this.isDeleting = false;
        this.showSuccess('Error al eliminar la refacción. Intenta nuevamente.');
      },
    });
  }
}
