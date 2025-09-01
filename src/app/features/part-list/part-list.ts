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
            <app-touch-button
              *ngIf="isAdminMode"
              variant="warning"
              size="sm"
              icon="🔧"
              (clicked)="forceUpdatePartsWithImageField()"
              class="debug-btn"
              title="Fix Image Field"
              style="margin-right: 0.5rem;"
            >
              Fix Images
            </app-touch-button>

            <app-touch-button
              *ngIf="!isAdminMode"
              variant="secondary"
              size="sm"
              icon="⚙️"
              (clicked)="openAdminModal()"
              class="admin-btn"
              title="Modo Administrador"
            >
            </app-touch-button>

            <app-touch-button
              *ngIf="isAdminMode"
              variant="warning"
              size="sm"
              icon="🔓"
              (clicked)="exitAdminMode()"
              class="admin-btn-active"
              title="Salir Modo Admin"
            >
              Admin
            </app-touch-button>

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

        <div *ngIf="paginatedParts.length > 0" class="parts-grid">
          <div
            *ngFor="let part of paginatedParts; let i = index"
            class="part-card"
          >
            <div class="part-header">
              <div class="part-sap">{{ part.sapNumber }}</div>
              <div class="part-category">
                {{ getCategoryIcon(part.category) }}
                {{ getCategoryName(part.category) }}
              </div>
            </div>

            <div class="part-image-container">
              <img
                *ngIf="part.image && part.image.trim()"
                [src]="part.image"
                [alt]="part.description"
                (error)="onImageError($event)"
                (load)="onImageLoad(part)"
                class="part-image"
              />
              <div
                *ngIf="!part.image || !part.image.trim()"
                class="part-image-placeholder"
                [attr.data-category]="part.category"
              >
                <span class="placeholder-icon">{{
                  getCategoryIcon(part.category)
                }}</span>
                <span class="placeholder-text">{{
                  getCategoryName(part.category)
                }}</span>
              </div>
            </div>

            <div class="part-content">
              <h3 class="part-title">{{ part.description }}</h3>

              <div class="part-details">
                <div class="detail-row">
                  <span class="detail-label">📍 Ubicación:</span>
                  <span class="detail-value">{{
                    part.location || 'No especificada'
                  }}</span>
                </div>

                <div class="detail-row">
                  <span class="detail-label">🔧 Parte:</span>
                  <span class="detail-value">{{ part.partNumber }}</span>
                </div>

                <div class="detail-row">
                  <span class="detail-label">🏭 Máquina:</span>
                  <span class="detail-value">{{ machine?.name || 'N/A' }}</span>
                </div>
              </div>

              <!-- Botones de admin si está en modo admin -->
              <div *ngIf="isAdminMode" class="admin-controls">
                <div class="add-image-btn" (click)="addImageToPart(part)">
                  <span class="add-icon">📷</span>
                  <span class="add-text"
                    >{{ part.image ? 'Cambiar' : 'Agregar' }} imagen</span
                  >
                </div>

                <div class="action-buttons">
                  <app-touch-button
                    variant="warning"
                    size="sm"
                    icon="✏️"
                    (clicked)="editPart(part)"
                  >
                    Editar
                  </app-touch-button>

                  <app-touch-button
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

        <div *ngIf="isLoading" class="loading-professional">
          <div class="loading-spinner-pro"></div>
          <span class="loading-text">Cargando refacciones...</span>
        </div>

        <div
          *ngIf="paginatedParts.length > 0 && totalPages > 1"
          class="page-navigation-sidebar"
        >
          <div class="page-info-sidebar">
            <span class="current-page">{{ currentPage }}</span>
            <span class="page-separator">/</span>
            <span class="total-pages">{{ totalPages }}</span>
          </div>

          <div class="page-numbers-vertical">
            <div
              *ngFor="let page of getVisiblePages()"
              class="page-number-vertical"
              [class.active]="page === currentPage"
              [class.ellipsis]="page === '...'"
              (click)="page !== '...' && goToPage(page)"
              [title]="page !== '...' ? 'Ir a página ' + page : ''"
            >
              {{ page }}
            </div>
          </div>

          <div class="navigation-controls-vertical">
            <button
              class="nav-btn nav-btn-first"
              [disabled]="currentPage === 1"
              (click)="goToFirstPage()"
              title="Primera página"
            >
              ⏮️
            </button>

            <button
              class="nav-btn nav-btn-prev"
              [disabled]="currentPage === 1"
              (click)="previousPage()"
              title="Página anterior"
            >
              ⬅️
            </button>

            <button
              class="nav-btn nav-btn-next"
              [disabled]="currentPage === totalPages"
              (click)="nextPage()"
              title="Página siguiente"
            >
              ➡️
            </button>

            <button
              class="nav-btn nav-btn-last"
              [disabled]="currentPage === totalPages"
              (click)="goToLastPage()"
              title="Última página"
            >
              ⏭️
            </button>
          </div>

          <div class="total-info">
            <span class="total-count">{{ filteredParts.length }}</span>
            <span class="total-label">refacciones</span>
          </div>
        </div>

        <div
          *ngIf="paginatedParts.length > 0 && totalPages > 1"
          class="pagination-mobile"
        >
          <div class="pagination-mobile-info">
            <span class="page-info-mobile">
              Página {{ currentPage }} de {{ totalPages }} ({{
                filteredParts.length
              }}
              refacciones)
            </span>
          </div>

          <div class="pagination-mobile-controls">
            <button
              class="mobile-nav-btn"
              [disabled]="currentPage === 1"
              (click)="previousPage()"
            >
              ⬅️ Anterior
            </button>

            <div class="mobile-page-numbers">
              <span
                *ngFor="let page of getVisiblePages().slice(0, 5)"
                class="mobile-page-number"
                [class.active]="page === currentPage"
                [class.ellipsis]="page === '...'"
                (click)="page !== '...' && goToPage(page)"
              >
                {{ page }}
              </span>
            </div>

            <button
              class="mobile-nav-btn"
              [disabled]="currentPage === totalPages"
              (click)="nextPage()"
            >
              Siguiente ➡️
            </button>
          </div>
        </div>
      </div>

      <div
        *ngIf="showSuccessNotification"
        class="success-notification animate-slideInRight"
      >
        <div class="notification-content">
          <span class="notification-icon">✅</span>
          <span class="notification-text">{{ successMessage }}</span>
        </div>
      </div>

      <div
        *ngIf="showErrorNotification"
        class="error-notification animate-slideInRight"
      >
        <div class="notification-content">
          <span class="notification-icon">❌</span>
          <span class="notification-text">{{ errorMessage }}</span>
        </div>
      </div>

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
        background: #f8fafc;
        padding: 2rem 0 0 0;
        margin: 0;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      }

      .professional-header {
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(10px);
        border-bottom: 1px solid rgba(0, 0, 0, 0.1);
        padding: 1rem 1.5rem;
        position: relative;
        z-index: 10;
        margin-bottom: 1rem;
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
        gap: 1rem;
      }

      .header-text {
        display: flex;
        flex-direction: column;
      }

      .header-title {
        font-size: 1.5rem;
        font-weight: 700;
        color: #2d3748;
        margin: 0;
      }

      .header-subtitle {
        font-size: 0.9rem;
        color: #718096;
        margin: 0;
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

      .filters-section {
        margin-bottom: 2rem;
      }

      .filters-grid {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 1rem;
      }

      .parts-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
        gap: 1.5rem;
        margin-bottom: 2rem;
      }

      .part-card {
        background: #f7fafc;
        border: 1px solid #e2e8f0;
        border-radius: 1rem;
        overflow: hidden;
      }

      .part-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem;
        background: #edf2f7;
        border-bottom: 1px solid #e2e8f0;
      }

      .part-sap {
        font-weight: 700;
        color: #2d3748;
        font-size: 1.1rem;
      }

      .part-category {
        font-size: 0.8rem;
        color: #718096;
        font-weight: 600;
      }

      .part-image-container {
        height: 200px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #f7fafc;
        overflow: hidden;
      }

      .part-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .part-image-placeholder {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        background: linear-gradient(135deg, #f7fafc, #edf2f7);
        color: #718096;
        text-align: center;
        padding: 0.5rem;
      }

      .placeholder-icon {
        font-size: 2rem;
        opacity: 0.7;
      }

      .placeholder-text {
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.025em;
        line-height: 1.2;
      }

      .part-content {
        padding: 1rem;
      }

      .part-title {
        font-size: 1.1rem;
        font-weight: 600;
        color: #2d3748;
        margin: 0 0 1rem 0;
        line-height: 1.4;
      }

      .part-details {
        margin-bottom: 1rem;
      }

      .detail-row {
        display: flex;
        justify-content: space-between;
        padding: 0.25rem 0;
        font-size: 0.9rem;
      }

      .detail-label {
        color: #718096;
        font-weight: 500;
      }

      .detail-value {
        color: #2d3748;
        font-weight: 600;
      }

      .admin-controls {
        margin-top: 1rem;
        padding-top: 1rem;
        border-top: 1px solid #e2e8f0;
      }

      .add-image-btn {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem;
        background: #e2e8f0;
        border-radius: 0.5rem;
        cursor: pointer;
        margin-bottom: 0.5rem;
        transition: background 0.2s ease;
      }

      .add-image-btn:hover {
        background: #cbd5e0;
      }

      .add-icon {
        font-size: 1rem;
      }

      .add-text {
        font-size: 0.8rem;
        font-weight: 600;
      }

      .action-buttons {
        display: flex;
        gap: 0.5rem;
        margin-top: 0.5rem;
      }

      .admin-controls {
        margin-top: 1rem;
        padding-top: 1rem;
        border-top: 1px solid #e2e8f0;
      }

      .add-image-btn {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem;
        background: #e2e8f0;
        border-radius: 0.5rem;
        cursor: pointer;
        margin-bottom: 0.5rem;
        transition: background 0.2s ease;
      }

      .add-image-btn:hover {
        background: #cbd5e0;
      }

      .add-icon {
        font-size: 1rem;
      }

      .add-text {
        font-size: 0.8rem;
        font-weight: 600;
      }

      .action-buttons {
        display: flex;
        gap: 0.5rem;
        margin-top: 0.5rem;
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
        gap: 0.75rem;
      }

      .admin-actions {
        display: flex;
        gap: 0.75rem;
      }

      .admin-actions app-touch-button {
        flex: 1;
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

      .error-notification {
        position: fixed;
        top: 2rem;
        right: 2rem;
        z-index: 1100;
        background: linear-gradient(135deg, #dc2626, #ef4444);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: var(--border-radius-lg);
        box-shadow: var(--shadow-xl);
        border: 2px solid #b91c1c;
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

        .error-notification {
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

      .page-navigation-sidebar {
        position: fixed;
        right: 20px;
        top: 50%;
        transform: translateY(-50%);
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(10px);
        border-radius: var(--border-radius-lg);
        box-shadow: var(--shadow-lg);
        border: 1px solid var(--gray-200);
        padding: 1rem 0.75rem;
        z-index: 100;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
        min-width: 60px;
        max-height: 80vh;
        overflow-y: auto;
      }

      .page-info-sidebar {
        display: flex;
        flex-direction: column;
        align-items: center;
        font-size: 0.875rem;
        font-weight: 600;
        color: var(--gray-700);
        text-align: center;
        line-height: 1.2;
      }

      .current-page {
        font-size: 1.25rem;
        color: var(--primary-600);
        font-weight: bold;
      }

      .page-separator {
        color: var(--gray-400);
        margin: 0 2px;
      }

      .total-pages {
        font-size: 0.875rem;
        color: var(--gray-500);
      }

      .page-numbers-vertical {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        align-items: center;
        max-height: 200px;
        overflow-y: auto;
        padding: 0.25rem;
      }

      .page-number-vertical {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: #f7fafc;
        color: #4a5568;
        font-size: 0.875rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
        user-select: none;
      }

      .page-number-vertical:hover:not(.ellipsis):not(.active) {
        background: #e2e8f0;
        transform: scale(1.05);
      }

      .page-number-vertical.active {
        background: #4299e1;
        color: white;
        box-shadow: 0 2px 8px rgba(66, 153, 225, 0.3);
      }

      .page-number-vertical.ellipsis {
        cursor: default;
        background: transparent;
        color: #a0aec0;
      }

      .page-number-vertical.ellipsis:hover {
        background: transparent;
        transform: none;
      }

      .navigation-controls-vertical {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .nav-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        border: 1px solid #e2e8f0;
        background: white;
        color: #4a5568;
        font-size: 0.875rem;
        cursor: pointer;
        transition: all 0.2s ease;
        user-select: none;
        touch-action: manipulation;
      }

      .nav-btn:hover:not(:disabled) {
        background: #e2e8f0;
        border-color: #cbd5e0;
        transform: scale(1.05);
      }

      .nav-btn:active:not(:disabled) {
        transform: scale(0.95);
      }

      .nav-btn:disabled {
        opacity: 0.4;
        cursor: not-allowed;
        color: #a0aec0;
      }

      .nav-btn:disabled:hover {
        background: white;
        border-color: #e2e8f0;
        transform: none;
      }

      .total-info {
        display: flex;
        flex-direction: column;
        align-items: center;
        font-size: 0.75rem;
        color: var(--gray-500);
        text-align: center;
        line-height: 1.2;
        padding-top: 0.5rem;
        border-top: 1px solid var(--gray-200);
      }

      .total-count {
        font-weight: 600;
        color: var(--gray-700);
        font-size: 0.875rem;
      }

      .total-label {
        color: var(--gray-500);
      }

      .pagination-mobile {
        display: none;
        margin-top: 2rem;
        padding: 1rem;
        background: white;
        border-radius: var(--border-radius-lg);
        box-shadow: var(--shadow-sm);
        border: 1px solid var(--gray-200);
      }

      .pagination-mobile-info {
        text-align: center;
        margin-bottom: 1rem;
      }

      .page-info-mobile {
        font-size: 0.875rem;
        color: var(--gray-600);
        font-weight: 500;
      }

      .pagination-mobile-controls {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 1rem;
      }

      .mobile-nav-btn {
        padding: 0.75rem 1rem;
        border-radius: var(--border-radius-md);
        border: 1px solid var(--gray-300);
        background: white;
        color: var(--gray-700);
        font-size: 0.875rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
        touch-action: manipulation;
        min-width: 90px;
      }

      .mobile-nav-btn:hover:not(:disabled) {
        background: var(--primary-50);
        border-color: var(--primary-300);
        color: var(--primary-700);
      }

      .mobile-nav-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .mobile-page-numbers {
        display: flex;
        gap: 0.5rem;
        align-items: center;
      }

      .mobile-page-number {
        min-width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: var(--border-radius-sm);
        font-weight: 600;
        font-size: 0.875rem;
        cursor: pointer;
        transition: all 0.2s ease;
        border: 1px solid transparent;
        background: var(--gray-100);
        color: var(--gray-600);
        touch-action: manipulation;
      }

      .mobile-page-number:hover:not(.ellipsis):not(.active) {
        background: var(--primary-100);
        color: var(--primary-700);
        border-color: var(--primary-200);
      }

      .mobile-page-number.active {
        background: var(--primary-600);
        color: white;
        border-color: var(--primary-600);
      }

      .mobile-page-number.ellipsis {
        cursor: default;
        background: transparent;
        color: var(--gray-400);
      }

      @media (max-width: 1024px) {
        .page-navigation-sidebar {
          right: 10px;
          padding: 0.75rem 0.5rem;
          min-width: 50px;
        }

        .page-number-vertical,
        .nav-btn {
          min-width: 32px;
          min-height: 32px;
          font-size: 0.8rem;
        }

        .current-page {
          font-size: 1.125rem;
        }
      }

      @media (max-width: 768px) {
        .page-navigation-sidebar {
          display: none;
        }

        .pagination-mobile {
          display: block;
        }

        .pagination-mobile-controls {
          flex-direction: column;
          gap: 1rem;
        }

        .mobile-page-numbers {
          order: -1;
          justify-content: center;
        }
      }

      @media (max-width: 480px) {
        .mobile-nav-btn {
          min-width: 80px;
          font-size: 0.8rem;
          padding: 0.5rem 0.75rem;
        }

        .mobile-page-number {
          min-width: 28px;
          height: 28px;
          font-size: 0.8rem;
        }

        .page-info-mobile {
          font-size: 0.8rem;
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

  /** Configuración de paginación */
  currentPage = 1;
  itemsPerPage = 12;
  totalPages = 1;
  paginatedParts: Part[] = [];

  partToDelete: Part | null = null;
  isDeleting = false;

  /** Estado del modo administrador */
  isAdminMode = false;
  showAdminModal = false;
  adminPassword = '';
  private adminTimeout: any;

  showPasswordDeleteModal = false;
  deletePassword = '';

  /** Control de notificaciones */
  showSuccessNotification = false;
  successMessage = '';
  showErrorNotification = false;
  errorMessage = '';

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

          parts.forEach((part, index) => {
            if (part.image && part.image.trim()) {
              console.log(
                `🖼️ Part ${index + 1} HAS IMAGE: ${part.description}`
              );
              console.log(`  - Image URL: "${part.image}"`);
            } else {
              console.log(`� Part ${index + 1} NO IMAGE: ${part.description}`);
            }
          });
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

    this.currentPage = 1;
    this.updatePagination();
  }

  /** Actualizar paginación y elementos visibles */
  updatePagination() {
    this.totalPages = Math.ceil(this.filteredParts.length / this.itemsPerPage);

    if (this.currentPage > this.totalPages) {
      this.currentPage = Math.max(1, this.totalPages);
    }

    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;

    this.paginatedParts = this.filteredParts.slice(startIndex, endIndex);

    this.restartGridAnimation();
  }

  /** Reiniciar animación del grid para transiciones visuales */
  private restartGridAnimation() {
    setTimeout(() => {
      const partsGrid = document.querySelector('.parts-grid') as HTMLElement;
      if (partsGrid) {
        partsGrid.style.animation = 'none';
        partsGrid.offsetHeight;
        partsGrid.style.animation = 'fadeInContent 0.4s ease-out';
      }
    }, 50);
  }

  /** Hacer scroll suave hacia el header */
  private scrollToTop() {
    setTimeout(() => {
      const header = document.querySelector('.professional-header');
      if (header) {
        header.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      } else {
        window.scrollTo({
          top: 0,
          behavior: 'smooth',
        });
      }
    }, 100);
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
      this.scrollToTop();
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
      this.scrollToTop();
    }
  }

  goToPage(page: number | string) {
    if (typeof page === 'number' && page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
      this.scrollToTop();
    }
  }

  goToFirstPage() {
    this.currentPage = 1;
    this.updatePagination();
    this.scrollToTop();
  }

  goToLastPage() {
    this.currentPage = this.totalPages;
    this.updatePagination();
    this.scrollToTop();
  }

  getVisiblePages(): (number | string)[] {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;

    if (this.totalPages <= maxVisiblePages) {
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      const startPage = Math.max(1, this.currentPage - 2);
      const endPage = Math.min(this.totalPages, this.currentPage + 2);

      if (startPage > 1) {
        pages.push(1);
        if (startPage > 2) {
          pages.push('...');
        }
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      if (endPage < this.totalPages) {
        if (endPage < this.totalPages - 1) {
          pages.push('...');
        }
        pages.push(this.totalPages);
      }
    }

    return pages;
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

  getCategoryName(category: PartCategory): string {
    const names = {
      mecanica: 'Mecánica',
      electronica: 'Electrónica',
      consumible: 'Consumible',
    };
    return names[category] || category;
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

  goBack() {
    this.router.navigate(['/machine-list', this.selectedArea]);
  }

  /** Métodos de administración */
  openAdminModal() {
    this.showAdminModal = true;
    this.adminPassword = '';
  }

  closeAdminModal() {
    this.showAdminModal = false;
    this.adminPassword = '';
  }

  exitAdminMode() {
    this.isAdminMode = false;
    if (this.adminTimeout) {
      clearTimeout(this.adminTimeout);
    }
  }

  checkAdminPassword() {
    if (this.adminPassword === 'Mantenimiento1.') {
      this.isAdminMode = true;
      this.showAdminModal = false;
      this.adminPassword = '';

      this.adminTimeout = setTimeout(() => {
        this.exitAdminMode();
      }, 5 * 60 * 1000);
    } else {
      this.showError('Contraseña incorrecta');
      this.adminPassword = '';
    }
  }

  onInputInteraction(event: any) {
    if (event.type === 'focus' || event.type === 'click') {
      return;
    }

    if (event.type === 'keydown') {
      return;
    }
  }

  /** Gestión de refacciones */
  addPart() {
    const category =
      this.selectedCategory !== 'all' ? this.selectedCategory : 'mecanica';
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
    this.router.navigate([
      '/machines',
      this.selectedArea,
      this.machineId,
      'parts',
      part.category,
      part.id,
      'edit',
    ]);
  }

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

  confirmDeletePart() {
    if (this.deletePassword === 'Mantenimiento1.' && this.partToDelete) {
      this.isDeleting = true;
      this.partService.deletePart(this.partToDelete.id!).subscribe({
        next: () => {
          this.showSuccess('Refacción eliminada exitosamente');
          this.loadParts();
          this.closePasswordDeleteModal();
          this.isDeleting = false;
        },
        error: (error) => {
          console.error('Error deleting part:', error);
          this.showError('Error al eliminar la refacción');
          this.isDeleting = false;
        },
      });
    } else {
      this.showError('Contraseña incorrecta');
      this.deletePassword = '';
    }
  }

  confirmPasswordDelete() {
    this.confirmDeletePart();
  }

  onImageError(event: any) {
    const imgElement = event.target;
    const imageUrl = imgElement.src;

    if (!imageUrl || imageUrl === '' || imageUrl.includes('404')) {
      imgElement.style.display = 'none';

      const container = imgElement.closest('.part-image-container');
      if (container) {
        const placeholder = container.querySelector('.part-image-placeholder');
        if (placeholder) {
          placeholder.style.display = 'flex';

          if (
            this.isAdminMode &&
            !placeholder.querySelector('.add-image-btn')
          ) {
            const addImageBtn = document.createElement('div');
            addImageBtn.className = 'add-image-btn';
            addImageBtn.innerHTML =
              '<span class="add-icon">📷</span><span class="add-text">Cambiar imagen</span>';
            addImageBtn.addEventListener('click', () => {
              const partCard = container.closest('.part-card');
              if (partCard) {
                const partIndex = Array.from(
                  partCard.parentNode!.children
                ).indexOf(partCard);
                if (this.filteredParts[partIndex]) {
                  this.addImageToPart(this.filteredParts[partIndex]);
                }
              }
            });
            placeholder.appendChild(addImageBtn);
          }
        }
      }
    }
  }

  onImageLoad(part: Part) {}

  addImageToPart(part: Part) {
    const imageUrl = prompt(
      `Ingresa la URL completa de la imagen para "${part.description}":\n\nEjemplo: https://ejemplo.com/imagen.jpg\n\nAsegúrate de que la URL termine en .jpg, .png, .gif o .webp`
    );

    if (imageUrl && imageUrl.trim()) {
      const updatedPart = {
        ...part,
        image: imageUrl.trim(),
        updatedAt: new Date(),
      };

      this.partService.updatePart(part.id!, updatedPart).subscribe({
        next: () => {
          const partIndex = this.allParts.findIndex((p) => p.id === part.id);
          if (partIndex !== -1) {
            this.allParts[partIndex] = {
              ...this.allParts[partIndex],
              image: imageUrl.trim(),
            };
            this.applyFilter();
          }

          this.showSuccess('Imagen agregada exitosamente');

          setTimeout(() => {
            this.loadParts();
          }, 500);
        },
        error: (error) => {
          console.error('❌ Error updating part image:', error);
          this.showError('Error al agregar la imagen. Intenta nuevamente.');
        },
      });
    }
  }

  /** Actualizar refacciones con campo imagen (herramienta de mantenimiento) */
  async forceUpdatePartsWithImageField() {
    try {
      const allParts = await this.databaseService.parts.toArray();

      for (const part of allParts) {
        if (!part.hasOwnProperty('image') || part.image === undefined) {
          await this.databaseService.parts.update(part.id!, { image: '' });
        }
      }

      this.loadParts();
    } catch (error) {
      console.error('❌ Error updating parts:', error);
    }
  }

  /** Validar formato de URL de imagen */
  isValidImageUrl(url: string): boolean {
    if (!url || !url.trim()) {
      return false;
    }

    try {
      new URL(url);
    } catch {
      return false;
    }

    const imageExtensions = /\.(jpg|jpeg|png|gif|bmp|webp|svg)(\?|$|#)/i;
    const hasImageExtension = imageExtensions.test(url);

    const imageKeywords = /(image|img|photo|picture|pic)/i;
    const hasImageKeyword = imageKeywords.test(url);

    return hasImageExtension || hasImageKeyword;
  }

  /** Métodos de notificación */
  showSuccess(message: string) {
    this.successMessage = message;
    this.showSuccessNotification = true;
    setTimeout(() => {
      this.showSuccessNotification = false;
    }, 3000);
  }

  showError(message: string) {
    this.errorMessage = message;
    this.showErrorNotification = true;
    setTimeout(() => {
      this.showErrorNotification = false;
    }, 3000);
  }
}
