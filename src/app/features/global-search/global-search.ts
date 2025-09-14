import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TouchButtonComponent } from '../../shared/components/touch-button/touch-button';
import { VirtualKeyboardComponent } from '../../shared/components/virtual-keyboard/virtual-keyboard';
import { PartService } from '../../core/services/part';
import { MachineService } from '../../core/services/machine';
import { DatabaseService } from '../../core/services/database';
import { Part, Machine, PartCategory } from '../../core/models';
import { EmployeeService } from '../../core/services/employee';
import { PetitionService } from '../../core/services/petition';
import { firstValueFrom } from 'rxjs';

interface SearchFilters {
  searchText: string;
  category: 'all' | PartCategory;
  area: 'all' | 'corte' | 'costura';
}

@Component({
  selector: 'app-global-search',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TouchButtonComponent,
    VirtualKeyboardComponent,
  ],
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
              <h2 class="header-title">🔍 Búsqueda Global</h2>
              <p class="header-subtitle">
                {{ filteredParts.length }} de {{ allParts.length }} refacciones
              </p>
            </div>
          </div>

          <div class="header-right">
            <div class="search-stats">
              <div class="stats-chip">
                📊 {{ filteredParts.length }} resultados
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="content-area">
        <!-- Barra de búsqueda principal -->
        <div class="search-section">
          <div class="search-container">
            <div class="search-input-group">
              <input
                #searchInput
                type="text"
                [(ngModel)]="searchQuery"
                (input)="onSearchInput()"
                (focus)="showKeyboard()"
                placeholder="🔎 Buscar por SAP, descripción, ubicación o máquina..."
                class="search-input"
              />
            </div>

            <!-- Filtros rápidos -->
            <div class="quick-filters">
              <app-touch-button
                [variant]="filters.category === 'all' ? 'primary' : 'secondary'"
                size="sm"
                (clicked)="setFilter('category', 'all')"
              >
                Todos
              </app-touch-button>
              <app-touch-button
                [variant]="
                  filters.category === 'mecanica' ? 'primary' : 'secondary'
                "
                size="sm"
                (clicked)="setFilter('category', 'mecanica')"
              >
                🔩 Mecánica
              </app-touch-button>
              <app-touch-button
                [variant]="
                  filters.category === 'electronica' ? 'primary' : 'secondary'
                "
                size="sm"
                (clicked)="setFilter('category', 'electronica')"
              >
                ⚡ Electrónica
              </app-touch-button>
              <app-touch-button
                [variant]="
                  filters.category === 'consumible' ? 'primary' : 'secondary'
                "
                size="sm"
                (clicked)="setFilter('category', 'consumible')"
              >
                🔄 Consumible
              </app-touch-button>
            </div>

            <!-- Filtros de área -->
            <div class="area-filters">
              <app-touch-button
                [variant]="filters.area === 'all' ? 'primary' : 'secondary'"
                size="sm"
                (clicked)="setFilter('area', 'all')"
              >
                Todas las áreas
              </app-touch-button>
              <app-touch-button
                [variant]="filters.area === 'corte' ? 'primary' : 'secondary'"
                size="sm"
                (clicked)="setFilter('area', 'corte')"
              >
                ✂️ Corte
              </app-touch-button>
              <app-touch-button
                [variant]="filters.area === 'costura' ? 'primary' : 'secondary'"
                size="sm"
                (clicked)="setFilter('area', 'costura')"
              >
                🧵 Costura
              </app-touch-button>
            </div>
          </div>
        </div>

        <!-- Resultados con paginación -->
        <div class="results-section" *ngIf="paginatedParts.length > 0">
          <div class="parts-grid">
            <div *ngFor="let part of paginatedParts" class="part-card">
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
                  (error)="onImageError(part)"
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
                    <span class="detail-label">� Parte:</span>
                    <span class="detail-value">{{ part.partNumber }}</span>
                  </div>

                  <div class="detail-row">
                    <span class="detail-label">🏭 Máquina:</span>
                    <span class="detail-value">{{
                      getMachineName(part.machineId)
                    }}</span>
                  </div>
                  <app-touch-button
                    variant="success"
                    size="sm"
                    icon="🛒"
                    (clicked)="openPetitionModal(part)"
                  >
                    Pedir Refacción
                  </app-touch-button>
                </div>
              </div>
            </div>
          </div>

          <!-- Sidebar de navegación -->
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
                *ngFor="let page of getVisiblePages().slice(0, 7)"
                class="page-number-vertical"
                [class.active]="page === currentPage"
                (click)="goToPage(page)"
                [title]="'Ir a página ' + page"
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

          <!-- Paginación móvil -->
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
                  (click)="goToPage(page)"
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

        <!-- Estado vacío -->
        <div
          class="empty-state"
          *ngIf="paginatedParts.length === 0 && !isLoading"
        >
          <div class="empty-icon">🔍</div>
          <h3 class="empty-title">No se encontraron resultados</h3>
          <p class="empty-message">
            Intenta modificar tu búsqueda o filtros para encontrar refacciones.
          </p>
          <app-touch-button
            variant="primary"
            size="md"
            (clicked)="clearAllFilters()"
          >
            Limpiar filtros
          </app-touch-button>
        </div>

        <!-- Estado de carga -->
        <div class="loading-state" *ngIf="isLoading">
          <div class="loading-spinner">🔄</div>
          <p>Cargando refacciones...</p>
        </div>
      </div>

      <!-- Teclado virtual -->
      <app-virtual-keyboard
        [visible]="keyboardVisible"
        [showEnter]="false"
        (keyPressed)="onKeyPressed($event)"
        (backspacePressed)="onBackspacePressed()"
        (clearPressed)="onClearPressed()"
        (closed)="hideKeyboard()"
      ></app-virtual-keyboard>

      <!-- Overlay para cerrar teclado -->
      <div
        *ngIf="keyboardVisible"
        class="keyboard-overlay"
        (click)="hideKeyboard()"
      ></div>

      <!-- Notificaciones -->
      <div *ngIf="showSuccessNotification" class="success-notification">
        ✅ {{ successMessage }}
      </div>
      <div *ngIf="showErrorNotification" class="error-notification">
        ❌ {{ errorMessage }}
      </div>

      <!-- Modal: Pedir Refacción (Empleado) -->
      <div
        *ngIf="showPetitionModal"
        class="modal-overlay"
        (click)="closePetitionModal()"
      >
        <div class="modal-container" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <div class="modal-title">
              <span>🛒</span>
              <h3>Pedir refacción</h3>
            </div>
            <button class="modal-close" (click)="closePetitionModal()">
              ✕
            </button>
          </div>
          <div class="modal-content" *ngIf="selectedPartForPetition as p">
            <p class="modal-description">{{ p.description }}</p>
            <div class="detail-row">
              <span class="detail-label">SAP:</span>
              <span class="detail-value">{{ p.sapNumber }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Parte:</span>
              <span class="detail-value">{{ p.partNumber }}</span>
            </div>

            <div class="input-group">
              <label class="input-label">Número de empleado</label>

              <!-- Display del número -->
              <div class="employee-number-display">
                {{ employeeNumberInput || '0000' }}
              </div>

              <!-- Teclado numérico -->
              <div class="numpad">
                <div class="numpad-row">
                  <button class="numpad-key" (click)="onNumberPressed('1')">
                    1
                  </button>
                  <button class="numpad-key" (click)="onNumberPressed('2')">
                    2
                  </button>
                  <button class="numpad-key" (click)="onNumberPressed('3')">
                    3
                  </button>
                </div>
                <div class="numpad-row">
                  <button class="numpad-key" (click)="onNumberPressed('4')">
                    4
                  </button>
                  <button class="numpad-key" (click)="onNumberPressed('5')">
                    5
                  </button>
                  <button class="numpad-key" (click)="onNumberPressed('6')">
                    6
                  </button>
                </div>
                <div class="numpad-row">
                  <button class="numpad-key" (click)="onNumberPressed('7')">
                    7
                  </button>
                  <button class="numpad-key" (click)="onNumberPressed('8')">
                    8
                  </button>
                  <button class="numpad-key" (click)="onNumberPressed('9')">
                    9
                  </button>
                </div>
                <div class="numpad-row">
                  <button
                    class="numpad-key numpad-clear"
                    (click)="onNumpadClear()"
                  >
                    🗑️
                  </button>
                  <button class="numpad-key" (click)="onNumberPressed('0')">
                    0
                  </button>
                  <button
                    class="numpad-key numpad-backspace"
                    (click)="onNumpadBackspace()"
                  >
                    ⌫
                  </button>
                </div>
              </div>

              <div *ngIf="employeeExists" class="employee-recognized">
                ✅ Empleado: {{ employeeNameInput }} (reconocido)
              </div>
            </div>
          </div>
          <div class="modal-actions">
            <app-touch-button
              variant="primary"
              size="lg"
              icon="✅"
              (clicked)="submitPetition()"
              [loading]="isSubmittingPetition"
              [disabled]="!employeeNumberInput.trim() || isSubmittingPetition"
            >
              {{ isSubmittingPetition ? 'Enviando...' : 'Confirmar petición' }}
            </app-touch-button>
            <app-touch-button
              variant="secondary"
              size="lg"
              icon="✕"
              (clicked)="closePetitionModal()"
              [disabled]="isSubmittingPetition"
              >Cancelar</app-touch-button
            >
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

      .stats-chip {
        background: #4299e1;
        color: white;
        padding: 0.5rem 1rem;
        border-radius: 1rem;
        font-size: 0.9rem;
        font-weight: 600;
      }

      .content-area {
        max-width: 1400px;
        margin: 0 auto;
        padding: 1.5rem;
      }

      .search-section {
        margin-bottom: 2rem;
      }

      .search-container {
        background: white;
        border-radius: 1rem;
        padding: 1.5rem;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      }

      .search-input-group {
        display: flex;
        gap: 0.5rem;
        margin-bottom: 1rem;
      }

      .search-input {
        flex: 1;
        padding: 1rem;
        border: 2px solid #e2e8f0;
        border-radius: 0.75rem;
        font-size: 1rem;
        transition: all 0.2s ease;
      }

      .search-input:focus {
        outline: none;
        border-color: #4299e1;
        box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1);
      }

      .quick-filters,
      .area-filters {
        display: flex;
        gap: 0.5rem;
        margin-bottom: 1rem;
        flex-wrap: wrap;
      }

      .results-section {
        background: white;
        border-radius: 1rem;
        padding: 1.5rem;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
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

      .part-card.out-of-stock {
        border-color: #f56565;
        background: #fed7d7;
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

      .detail-value.low-stock {
        color: #f56565;
      }

      .pagination-mobile {
        margin-top: 2rem;
        padding: 1rem;
        background: white;
        border-radius: 1rem;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        border: 1px solid #e2e8f0;
      }

      .pagination-mobile-info {
        text-align: center;
        margin-bottom: 1rem;
      }

      .page-info-mobile {
        font-size: 0.875rem;
        color: #718096;
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
        border-radius: 0.75rem;
        border: 1px solid #e2e8f0;
        background: white;
        color: #4a5568;
        font-size: 0.875rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
        touch-action: manipulation;
        min-width: 90px;
      }

      .mobile-nav-btn:hover:not(:disabled) {
        background: #edf2f7;
        border-color: #cbd5e0;
        color: #2d3748;
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
        border-radius: 50%;
        background: #f7fafc;
        color: #4a5568;
        cursor: pointer;
        transition: all 0.2s ease;
        font-weight: 600;
        font-size: 0.875rem;
      }

      .mobile-page-number:hover {
        background: #e2e8f0;
      }

      .mobile-page-number.active {
        background: #4299e1;
        color: white;
      }

      /* Sidebar de navegación */
      .page-navigation-sidebar {
        position: fixed;
        right: 1rem;
        top: 50%;
        transform: translateY(-50%);
        background: white;
        border-radius: 1rem;
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        padding: 1rem;
        z-index: 50;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
        min-width: 80px;
        border: 1px solid #e2e8f0;
      }

      .page-info-sidebar {
        display: flex;
        flex-direction: column;
        align-items: center;
        font-size: 0.875rem;
        font-weight: 600;
        color: #4a5568;
        text-align: center;
        line-height: 1.2;
      }

      .current-page {
        font-size: 1.25rem;
        color: #4299e1;
        font-weight: 700;
      }

      .page-separator {
        color: #a0aec0;
        margin: 0.125rem 0;
      }

      .total-pages {
        color: #718096;
      }

      .page-numbers-vertical {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        max-height: 300px;
        overflow-y: hidden;
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

      .page-number-vertical:hover {
        background: #e2e8f0;
        transform: scale(1.05);
      }

      .page-number-vertical.active {
        background: #4299e1;
        color: white;
        box-shadow: 0 2px 8px rgba(66, 153, 225, 0.3);
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
      }

      .nav-btn:hover:not(:disabled) {
        background: #edf2f7;
        border-color: #cbd5e0;
        transform: translateY(-1px);
      }

      .nav-btn:disabled {
        opacity: 0.4;
        cursor: not-allowed;
        transform: none;
      }

      .total-info {
        display: flex;
        flex-direction: column;
        align-items: center;
        font-size: 0.75rem;
        color: #718096;
        text-align: center;
        border-top: 1px solid #e2e8f0;
        padding-top: 0.75rem;
        margin-top: 0.5rem;
        width: 100%;
      }

      .total-count {
        font-size: 1rem;
        font-weight: 700;
        color: #4299e1;
        line-height: 1;
      }

      .total-label {
        color: #a0aec0;
        font-size: 0.75rem;
      }

      .keyboard-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.2);
        z-index: 999;
        animation: fadeIn 0.3s ease-out;
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }

      .empty-state,
      .loading-state {
        text-align: center;
        padding: 3rem;
        color: #718096;
      }

      .empty-icon,
      .loading-spinner {
        font-size: 4rem;
        margin-bottom: 1rem;
      }

      .loading-spinner {
        animation: spin 1s linear infinite;
      }

      @keyframes spin {
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(360deg);
        }
      }

      .empty-title {
        font-size: 1.5rem;
        font-weight: 600;
        color: #4a5568;
        margin-bottom: 0.5rem;
      }

      .empty-message {
        margin-bottom: 1.5rem;
      }

      /* Responsive */
      @media (max-width: 768px) {
        .header-content {
          flex-direction: column;
          gap: 1rem;
        }

        .parts-grid {
          grid-template-columns: 1fr;
          gap: 1rem;
        }

        .quick-filters,
        .area-filters {
          justify-content: center;
        }

        .pagination-mobile-controls {
          flex-direction: column;
          gap: 1rem;
        }

        .mobile-page-numbers {
          order: 2;
        }

        .page-navigation-sidebar {
          display: none;
        }

        .pagination-mobile {
          display: block;
        }
      }

      @media (min-width: 769px) {
        .pagination-mobile {
          display: none;
        }
      }

      /* Notificaciones simples */
      .success-notification,
      .error-notification {
        position: fixed;
        top: 1rem;
        right: 1rem;
        padding: 0.75rem 1rem;
        border-radius: 0.5rem;
        color: #fff;
        z-index: 1000;
      }
      .success-notification {
        background: #10b981;
      }
      .error-notification {
        background: #ef4444;
      }

      /* Modal básico */
      .modal-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        padding: 1rem;
      }
      .modal-container {
        background: #fff;
        border-radius: 0.75rem;
        width: 100%;
        max-width: 520px;
        overflow: hidden;
      }
      .modal-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1rem 1.25rem;
        border-bottom: 1px solid #e5e7eb;
      }
      .modal-title {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-weight: 700;
        color: #111827;
      }
      .modal-close {
        border: none;
        background: #f3f4f6;
        border-radius: 999px;
        width: 36px;
        height: 36px;
        cursor: pointer;
      }
      .modal-content {
        padding: 1rem 1.25rem;
      }
      .modal-actions {
        display: flex;
        gap: 0.5rem;
        padding: 1rem 1.25rem;
      }
      .input-group {
        margin: 0.75rem 0;
      }
      .input-label {
        display: block;
        margin-bottom: 0.25rem;
        font-weight: 600;
        color: #374151;
      }
      .admin-input {
        width: 100%;
        padding: 0.75rem;
        border: 2px solid #e5e7eb;
        border-radius: 0.5rem;
      }
      .hint-ok {
        margin-top: 0.25rem;
        color: #059669;
        font-weight: 600;
      }

      /* Estilos para el teclado numérico */
      .employee-number-display {
        background: #f9fafb;
        border: 2px solid #e5e7eb;
        border-radius: 0.75rem;
        padding: 1rem;
        font-size: 2rem;
        font-weight: bold;
        text-align: center;
        font-family: 'Courier New', monospace;
        letter-spacing: 0.2em;
        color: #111827;
        min-height: 4rem;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 1rem;
        transition: all 0.2s ease;
      }

      .numpad {
        display: grid;
        gap: 0.75rem;
        padding: 1rem;
        background: #f8fafc;
        border-radius: 1rem;
        border: 1px solid #e5e7eb;
        margin-bottom: 1rem;
      }

      .numpad-row {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 0.75rem;
      }

      .numpad-key {
        background: white;
        border: 2px solid #e5e7eb;
        border-radius: 0.75rem;
        padding: 1.2rem;
        font-size: 1.5rem;
        font-weight: 700;
        color: #374151;
        cursor: pointer;
        transition: all 0.2s ease;
        user-select: none;
        min-height: 4rem;
        display: flex;
        align-items: center;
        justify-content: center;

        &:hover {
          background: #f3f4f6;
          border-color: #d1d5db;
          transform: translateY(-1px);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        &:active {
          background: #e5e7eb;
          transform: translateY(0);
          box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.1);
        }

        &:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
      }

      .numpad-clear {
        background: #fee2e2 !important;
        border-color: #fecaca !important;
        color: #dc2626 !important;

        &:hover {
          background: #fecaca !important;
          border-color: #f87171 !important;
        }
      }

      .numpad-backspace {
        background: #fef3c7 !important;
        border-color: #fde68a !important;
        color: #d97706 !important;

        &:hover {
          background: #fde68a !important;
          border-color: #fbbf24 !important;
        }
      }

      .employee-recognized {
        margin-top: 1rem;
        padding: 0.75rem;
        background: #d1fae5;
        border: 1px solid #10b981;
        border-radius: 0.5rem;
        color: #065f46;
        font-weight: 600;
        text-align: center;
      }

      /* Responsive para móviles */
      @media (max-width: 480px) {
        .numpad-key {
          padding: 1rem;
          font-size: 1.25rem;
          min-height: 3.5rem;
        }

        .employee-number-display {
          font-size: 1.5rem;
          min-height: 3rem;
          padding: 0.75rem;
        }
      }
    `,
  ],
})
export class GlobalSearchComponent implements OnInit {
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  allParts: Part[] = [];
  filteredParts: Part[] = [];
  paginatedParts: Part[] = [];
  machines: Machine[] = [];
  isLoading = true;

  searchQuery = '';
  filters: SearchFilters = {
    searchText: '',
    category: 'all',
    area: 'all',
  };

  currentPage = 1;
  itemsPerPage = 12;
  totalPages = 1;

  keyboardVisible = false;

  // Estado del modal de petición
  showPetitionModal = false;
  selectedPartForPetition: Part | null = null;
  employeeNumberInput = '';
  employeeNameInput = '';
  employeeExists = false;
  isSubmittingPetition = false;
  showSuccessNotification = false;
  successMessage = '';
  showErrorNotification = false;
  errorMessage = '';

  // Teclado numérico para número de empleado
  showNumericKeyboard = false;

  constructor(
    private router: Router,
    private partService: PartService,
    private machineService: MachineService,
    private databaseService: DatabaseService,
    private employeeService: EmployeeService,
    private petitionService: PetitionService
  ) {}

  async ngOnInit() {
    await this.loadData();
  }

  // ----- Petición de refacción -----
  openPetitionModal(part: Part) {
    this.selectedPartForPetition = part;
    this.employeeNumberInput = '';
    this.employeeNameInput = '';
    this.employeeExists = false;
    this.showPetitionModal = true;
  }

  closePetitionModal() {
    if (this.isSubmittingPetition) return;
    this.showPetitionModal = false;
    this.selectedPartForPetition = null;
  }

  // ----- Métodos para teclado numérico -----
  onNumberPressed(num: string) {
    if (this.employeeNumberInput.length < 4) {
      // Límite de 4 dígitos
      this.employeeNumberInput += num;
      this.onEmployeeNumberChange();
    }
  }

  onNumpadBackspace() {
    this.employeeNumberInput = this.employeeNumberInput.slice(0, -1);
    this.onEmployeeNumberChange();
  }

  onNumpadClear() {
    this.employeeNumberInput = '';
    this.onEmployeeNumberChange();
  }

  onEmployeeNumberChange() {
    const num = this.employeeNumberInput.trim();
    if (!num) {
      this.employeeExists = false;
      this.employeeNameInput = '';
      return;
    }
    this.employeeService.getByEmployeeNumber(num).subscribe((emp: any) => {
      if (emp) {
        this.employeeExists = true;
        this.employeeNameInput = emp.name;
      } else {
        this.employeeExists = false;
        this.employeeNameInput = '';
      }
    });
  }

  async submitPetition() {
    if (!this.selectedPartForPetition) return;
    const num = this.employeeNumberInput.trim();
    if (!num) {
      this.errorMessage = 'Ingresa el número de empleado';
      this.showErrorNotification = true;
      setTimeout(() => (this.showErrorNotification = false), 3000);
      return;
    }

    this.isSubmittingPetition = true;
    try {
      const existing = await firstValueFrom(
        this.employeeService.getByEmployeeNumber(num)
      );
      let name = '';
      if (existing) {
        name = existing.name;
      } else {
        // Si el empleado no existe, usar el número como nombre temporal
        name = `Empleado ${num}`;
        // Crear el empleado con nombre temporal
        await firstValueFrom(
          this.employeeService.create({ employeeNumber: num, name: name })
        );
      }

      await firstValueFrom(
        this.petitionService.create({
          partId: this.selectedPartForPetition.id!,
          machineId: this.selectedPartForPetition.machineId,
          employeeNumber: num,
          employeeName: name,
        })
      );

      this.successMessage = 'Petición enviada correctamente';
      this.showSuccessNotification = true;
      setTimeout(() => (this.showSuccessNotification = false), 3000);
      this.closePetitionModal();
    } catch (e) {
      console.error(e);
      this.errorMessage = 'No se pudo enviar la petición';
      this.showErrorNotification = true;
      setTimeout(() => (this.showErrorNotification = false), 3000);
    } finally {
      this.isSubmittingPetition = false;
    }
  }

  async loadData() {
    this.isLoading = true;
    try {
      await this.databaseService.initializeDatabase();
      const [parts, machines] = await Promise.all([
        this.partService.loadParts().toPromise(),
        this.machineService.loadMachines().toPromise(),
      ]);

      this.allParts = parts || [];
      this.machines = machines || [];
      this.applyFilters();
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      this.isLoading = false;
    }
  }

  onSearchInput() {
    this.filters.searchText = this.searchQuery;
    this.applyFilters();
  }

  setFilter(filterType: keyof SearchFilters, value: any) {
    this.filters[filterType] = value;
    this.applyFilters();
  }

  applyFilters() {
    let filtered = [...this.allParts];

    if (this.filters.searchText) {
      const searchText = this.filters.searchText.toLowerCase();
      filtered = filtered.filter(
        (part) =>
          part.sapNumber.toLowerCase().includes(searchText) ||
          part.description.toLowerCase().includes(searchText) ||
          (part.location && part.location.toLowerCase().includes(searchText)) ||
          (part.partNumber &&
            part.partNumber.toLowerCase().includes(searchText)) ||
          this.getMachineName(part.machineId).toLowerCase().includes(searchText)
      );
    }

    if (this.filters.category !== 'all') {
      filtered = filtered.filter(
        (part) => part.category === this.filters.category
      );
    }

    if (this.filters.area !== 'all') {
      const machinesInArea = this.machines
        .filter((machine) => machine.area === this.filters.area)
        .map((machine) => machine.id);
      filtered = filtered.filter((part) =>
        machinesInArea.includes(part.machineId)
      );
    }

    this.filteredParts = filtered;
    this.updatePagination();
  }

  updatePagination() {
    this.totalPages = Math.ceil(this.filteredParts.length / this.itemsPerPage);
    this.currentPage = Math.min(this.currentPage, this.totalPages || 1);
    this.updatePaginatedParts();
  }

  updatePaginatedParts() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedParts = this.filteredParts.slice(startIndex, endIndex);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePaginatedParts();
      this.scrollToTop();
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePaginatedParts();
      this.scrollToTop();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePaginatedParts();
      this.scrollToTop();
    }
  }

  goToFirstPage() {
    this.currentPage = 1;
    this.updatePaginatedParts();
    this.scrollToTop();
  }

  goToLastPage() {
    this.currentPage = this.totalPages;
    this.updatePaginatedParts();
    this.scrollToTop();
  }

  private scrollToTop() {
    setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }, 100);
  }

  getVisiblePages(): number[] {
    const pages: number[] = [];
    const maxPages = 7; // Máximo 7 páginas para evitar scroll
    const start = Math.max(1, this.currentPage - Math.floor(maxPages / 2));
    const end = Math.min(this.totalPages, start + maxPages - 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  clearAllFilters() {
    this.searchQuery = '';
    this.filters = {
      searchText: '',
      category: 'all',
      area: 'all',
    };
    this.applyFilters();
  }

  getCategoryIcon(category: PartCategory): string {
    const icons = {
      mecanica: '🔩',
      electronica: '⚡',
      consumible: '🔄',
    };
    return icons[category] || '📦';
  }

  getCategoryName(category: PartCategory): string {
    const names = {
      mecanica: 'Mecánica',
      electronica: 'Electrónica',
      consumible: 'Consumible',
    };
    return names[category] || category;
  }

  getMachineName(machineId: number): string {
    const machine = this.machines.find((m) => m.id === machineId);
    return machine
      ? `${machine.name} (${machine.area})`
      : 'Máquina no encontrada';
  }

  onImageError(part: Part) {
    part.image = '';
  }

  onImageLoad(part: Part) {
    // Imagen cargada correctamente
  }

  navigateToPartMachine(part: Part) {
    const machine = this.machines.find((m) => m.id === part.machineId);
    if (machine) {
      this.router.navigate(['/machines', machine.area], {
        queryParams: { machineId: machine.id, partId: part.id },
      });
    }
  }

  toggleKeyboard() {
    this.keyboardVisible = !this.keyboardVisible;
  }

  showKeyboard() {
    this.keyboardVisible = true;
  }

  hideKeyboard() {
    this.keyboardVisible = false;
  }

  onKeyPressed(key: string) {
    this.searchQuery += key;
    this.onSearchInput();
  }

  onBackspacePressed() {
    this.searchQuery = this.searchQuery.slice(0, -1);
    this.onSearchInput();
  }

  onClearPressed() {
    this.searchQuery = '';
    this.onSearchInput();
  }

  goBack() {
    this.router.navigate(['/']);
  }
}
