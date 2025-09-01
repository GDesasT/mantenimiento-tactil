import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TouchButtonComponent } from '../../shared/components/touch-button/touch-button';
import { MachineService } from '../../core/services/machine';
import { PartService } from '../../core/services/part';
import { DatabaseService } from '../../core/services/database';
import { Machine, PartCategory } from '../../core/models';

@Component({
  selector: 'app-machine-list',
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
              <h2 class="header-title">{{ getAreaTitle() }}</h2>
              <p class="header-subtitle">Gestión de máquinas industriales</p>
            </div>
          </div>

          <div class="header-right">
            <app-touch-button
              variant="success"
              size="lg"
              icon="+"
              (clicked)="addMachine()"
            >
              Agregar Máquina
            </app-touch-button>
          </div>
        </div>
      </div>

      <div class="content-area">
        <!-- Lista de máquinas -->
        <div *ngIf="machines.length > 0" class="machines-container">
          <div
            *ngFor="let machine of machines; let i = index"
            class="machine-card"
            (click)="viewParts(machine)"
          >
            <!-- Header de máquina -->
            <div class="machine-header">
              <div class="machine-icon">{{ getAreaIcon() }}</div>
              <h3 class="machine-name">{{ machine.name }}</h3>
              <span class="machine-badge">{{ getAreaLabel() }}</span>
            </div>

            <!-- Estadísticas -->
            <div class="machine-stats" *ngIf="machineStats[machine.id!]">
              <div class="stat-item stat-blue">
                <div class="stat-number">
                  {{ machineStats[machine.id!].mecanica }}
                </div>
                <div class="stat-label">MEC</div>
              </div>
              <div class="stat-item stat-yellow">
                <div class="stat-number">
                  {{ machineStats[machine.id!].electronica }}
                </div>
                <div class="stat-label">ELEC</div>
              </div>
              <div class="stat-item stat-green">
                <div class="stat-number">
                  {{ machineStats[machine.id!].consumible }}
                </div>
                <div class="stat-label">CON</div>
              </div>
            </div>

            <!-- Estadísticas placeholder -->
            <div class="machine-stats" *ngIf="!machineStats[machine.id!]">
              <div class="stat-item stat-gray">
                <div class="stat-number">0</div>
                <div class="stat-label">MEC</div>
              </div>
              <div class="stat-item stat-gray">
                <div class="stat-number">0</div>
                <div class="stat-label">ELEC</div>
              </div>
              <div class="stat-item stat-gray">
                <div class="stat-number">0</div>
                <div class="stat-label">CON</div>
              </div>
            </div>

            <!-- Botones de acción -->
            <div class="machine-actions">
              <div class="main-action-info">
                <span class="tap-hint">👆 Toca para ver refacciones</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Estado vacío -->
        <div *ngIf="machines.length === 0 && !isLoading" class="empty-state">
          <div class="empty-icon">{{ getAreaIcon() }}</div>
          <h3 class="empty-title">No hay máquinas registradas</h3>
          <p class="empty-message">
            Comienza agregando la primera máquina en
            {{ getAreaLabel().toLowerCase() }}
          </p>
          <app-touch-button
            variant="success"
            size="xl"
            icon="🚀"
            (clicked)="addMachine()"
          >
            Agregar Primera Máquina
          </app-touch-button>
        </div>

        <!-- Loading -->
        <div *ngIf="isLoading" class="loading-state">
          <div class="loading-spinner"></div>
          <span class="loading-text">Cargando máquinas...</span>
        </div>
      </div>

      <!-- Modal de confirmación para eliminar máquina -->
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
              <h3>Confirmar Eliminación</h3>
            </div>
            <button class="modal-close" (click)="closeDeleteModal()">✕</button>
          </div>

          <div class="modal-content">
            <div class="delete-warning">
              <h4 class="warning-title">
                ¿Eliminar máquina "{{ machineToDelete?.name }}"?
              </h4>
              <p class="warning-description">
                Esta acción también eliminará todas las refacciones asociadas a
                esta máquina. Esta acción no se puede deshacer.
              </p>

              <div class="machine-stats-summary" *ngIf="machineToDelete">
                <div class="summary-item">
                  <span class="summary-icon">⚙️</span>
                  <span class="summary-count">{{
                    machineToDelete && machineStats[machineToDelete.id!]
                      ? machineStats[machineToDelete.id!].mecanica
                      : 0
                  }}</span>
                  <span class="summary-label">Mecánicas</span>
                </div>
                <div class="summary-item">
                  <span class="summary-icon">⚡</span>
                  <span class="summary-count">{{
                    machineToDelete && machineStats[machineToDelete.id!]
                      ? machineStats[machineToDelete.id!].electronica
                      : 0
                  }}</span>
                  <span class="summary-label">Electrónicas</span>
                </div>
                <div class="summary-item">
                  <span class="summary-icon">🛠️</span>
                  <span class="summary-count">{{
                    machineToDelete && machineStats[machineToDelete.id!]
                      ? machineStats[machineToDelete.id!].consumible
                      : 0
                  }}</span>
                  <span class="summary-label">Consumibles</span>
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
            </div>
          </div>

          <div class="modal-actions">
            <app-touch-button
              variant="danger"
              size="lg"
              icon="🗑️"
              [disabled]="!canConfirmDelete || isDeleting"
              [loading]="isDeleting"
              (clicked)="confirmDeleteMachine()"
            >
              {{ isDeleting ? 'Eliminando...' : 'Sí, Eliminar' }}
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
        -webkit-tap-highlight-color: transparent;
      }

      .admin-btn {
        opacity: 0.6;
        transition: all 0.3s ease;
        margin-right: 12px;
      }

      .admin-btn:hover {
        opacity: 1;
      }

      .admin-btn-active {
        background: linear-gradient(135deg, #f59e0b, #fbbf24) !important;
        color: white !important;
        margin-right: 12px;
        animation: subtle-glow 2s ease-in-out infinite alternate;
      }

      @keyframes subtle-glow {
        from {
          box-shadow: 0 2px 8px rgba(245, 158, 11, 0.3);
        }
        to {
          box-shadow: 0 4px 12px rgba(245, 158, 11, 0.5);
        }
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

      .header-right {
        display: flex;
        align-items: center;
        gap: 1rem;
      }

      .content-area {
        padding: 2rem;
        max-width: 1600px;
        margin: 0 auto;
      }

      .machines-container {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 1.25rem;
        max-width: 100%;
      }

      @media (min-width: 1600px) {
        .machines-container {
          grid-template-columns: repeat(6, 1fr);
        }
      }

      .machine-card {
        background: white;
        border-radius: var(--border-radius-lg);
        box-shadow: var(--shadow-md);
        border: 1px solid var(--gray-200);
        padding: 1rem;
        transition: all 0.2s ease;
        min-height: 280px;
        display: flex;
        flex-direction: column;
        touch-action: manipulation;
        -webkit-tap-highlight-color: transparent;
        cursor: pointer;
        position: relative;
        user-select: none;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
      }

      .machine-card:hover {
        box-shadow: var(--shadow-lg);
        transform: translateY(-2px);
        border-color: var(--primary-300);
      }

      .machine-card:active {
        transform: translateY(-1px) scale(0.99);
        box-shadow: var(--shadow-md);
        border-color: var(--primary-500);
      }

      .machine-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(
          135deg,
          rgba(59, 130, 246, 0.05),
          rgba(59, 130, 246, 0.02)
        );
        border-radius: var(--border-radius-lg);
        opacity: 0;
        transition: opacity 0.2s ease;
        pointer-events: none;
      }

      .machine-card:hover::before {
        opacity: 1;
      }

      .machine-header {
        text-align: center;
        margin-bottom: 1rem;
        padding-bottom: 0.75rem;
        border-bottom: 1px solid var(--gray-200);
      }

      .machine-icon {
        font-size: 2.5rem;
        margin-bottom: 0.5rem;
      }

      .machine-name {
        font-size: 1.125rem;
        font-weight: bold;
        color: var(--gray-900);
        margin: 0 0 0.375rem 0;
        line-height: 1.2;
      }

      .machine-badge {
        background: var(--primary-100);
        color: var(--primary-800);
        padding: 0.125rem 0.5rem;
        border-radius: 9999px;
        font-size: 0.75rem;
        font-weight: 600;
      }

      .machine-stats {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 0.375rem;
        margin-bottom: 1rem;
        flex: 1;
      }

      .stat-item {
        text-align: center;
        padding: 0.4rem 0.0625rem;
        border-radius: var(--border-radius-md);
        background: var(--gray-50);
        border: 1px solid var(--gray-100);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        min-height: 60px;
      }

      .stat-blue {
        background: var(--primary-50);
      }

      .stat-yellow {
        background: #fef3c7;
      }

      .stat-green {
        background: #ecfdf5;
      }

      .stat-gray {
        background: var(--gray-100);
      }

      .stat-number {
        font-size: 1.375rem;
        font-weight: 900;
        margin-bottom: 0.25rem;
        line-height: 1;
      }

      .stat-blue .stat-number {
        color: var(--primary-600);
      }

      .stat-yellow .stat-number {
        color: #d97706;
      }

      .stat-green .stat-number {
        color: #059669;
      }

      .stat-gray .stat-number {
        color: var(--gray-500);
      }

      .stat-label {
        font-size: 0.55rem;
        font-weight: 700;
        color: var(--gray-600);
        text-transform: uppercase;
        letter-spacing: 0.01em;
        line-height: 1;
        text-align: center;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        width: 100%;
        max-width: 100%;
      }

      .machine-actions {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        margin-top: auto;
      }

      .main-action-info {
        text-align: center;
        padding: 0.75rem;
        background: var(--primary-50);
        border: 2px dashed var(--primary-200);
        border-radius: var(--border-radius-md);
        margin-bottom: 0.5rem;
      }

      .tap-hint {
        font-size: 0.875rem;
        color: var(--primary-700);
        font-weight: 600;
        animation: pulse-tap 2s infinite;
      }

      @keyframes pulse-tap {
        0%,
        100% {
          opacity: 0.8;
        }
        50% {
          opacity: 1;
          transform: scale(1.02);
        }
      }

      .main-action {
        touch-action: manipulation;
        -webkit-tap-highlight-color: transparent;
      }

      .main-action:active {
        transform: scale(0.98);
      }

      .secondary-actions {
        display: flex;
        gap: 0.375rem;
      }

      .secondary-actions app-touch-button {
        flex: 1;
        min-width: 48px;
        min-height: 48px;
        position: relative;
        touch-action: manipulation;
        -webkit-tap-highlight-color: transparent;
      }

      .secondary-actions app-touch-button::before {
        content: '';
        position: absolute;
        top: -4px;
        left: -4px;
        right: -4px;
        bottom: -4px;
        z-index: -1;
      }

      .empty-state {
        text-align: center;
        padding: 4rem 2rem;
        background: white;
        border-radius: var(--border-radius-lg);
        box-shadow: var(--shadow-md);
        border: 2px dashed var(--gray-300);
      }

      .empty-icon {
        font-size: 6rem;
        margin-bottom: 1.5rem;
        opacity: 0.6;
      }

      .empty-title {
        font-size: 1.5rem;
        font-weight: bold;
        color: var(--gray-900);
        margin-bottom: 1rem;
      }

      .empty-message {
        color: var(--gray-600);
        margin-bottom: 2rem;
        font-size: 1.125rem;
      }

      .loading-state {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 1rem;
        padding: 4rem;
        text-align: center;
      }

      .loading-spinner {
        width: 2rem;
        height: 2rem;
        border: 3px solid var(--gray-300);
        border-top: 3px solid var(--primary-600);
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }

      .loading-text {
        color: var(--gray-600);
        font-size: 1.125rem;
      }

      @keyframes spin {
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(360deg);
        }
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

      .admin-modal {
        max-width: 400px;
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
        line-height: 1.5;
      }

      .machine-stats-summary {
        display: flex;
        gap: 1rem;
        justify-content: center;
        margin: 1.5rem 0;
        padding: 1.5rem;
        background: #fef2f2;
        border-radius: var(--border-radius-md);
        border: 2px solid #fecaca;
      }

      .summary-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.25rem;
      }

      .summary-icon {
        font-size: 1.5rem;
      }

      .summary-count {
        font-size: 1.25rem;
        font-weight: bold;
        color: #dc2626;
      }

      .summary-label {
        font-size: 0.75rem;
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
        font-weight: bold;
        text-align: center;
      }

      .confirmation-field:focus {
        outline: none;
        border-color: #ef4444;
        box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
      }

      .password-error {
        color: #ef4444;
        font-size: 0.875rem;
        margin-top: 0.5rem;
        font-weight: 500;
      }

      .admin-login {
        text-align: center;
      }

      .admin-description {
        font-size: 1rem;
        color: var(--gray-600);
        margin-bottom: 1.5rem;
        line-height: 1.5;
      }

      .password-section {
        text-align: left;
      }

      .password-label {
        display: block;
        font-size: 1rem;
        font-weight: 600;
        color: var(--gray-700);
        margin-bottom: 0.75rem;
      }

      .admin-input {
        width: 100%;
        padding: 0.75rem 1rem;
        font-size: 1rem;
        border: 2px solid var(--gray-300);
        border-radius: var(--border-radius-md);
        transition: all 0.2s ease;
      }

      .admin-input:focus {
        outline: none;
        border-color: var(--primary-500);
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
      }

      .admin-error {
        color: #ef4444;
        font-size: 0.875rem;
        margin-top: 0.5rem;
        font-weight: 500;
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

      @media (max-width: 1200px) {
        .machines-container {
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }
      }

      @media (max-width: 900px) {
        .machines-container {
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 1rem;
        }

        .machine-card {
          padding: 0.875rem;
          min-height: 260px;
        }

        .machine-name {
          font-size: 1rem;
        }

        .machine-icon {
          font-size: 2rem;
        }

        .stat-item {
          padding: 0.375rem 0.0625rem;
          min-height: 50px;
        }

        .stat-number {
          font-size: 1.125rem;
        }

        .stat-label {
          font-size: 0.5rem;
        }
      }

      @media (max-width: 768px) {
        .header-content {
          flex-direction: column;
          gap: 1rem;
          text-align: center;
        }

        .header-actions {
          width: 100%;
          justify-content: center;
          flex-direction: column;
          gap: 1rem;
        }

        .admin-section {
          order: -1;
        }

        .header-left {
          flex-direction: column;
          gap: 1rem;
        }

        .content-area {
          padding: 1rem;
        }

        .machines-container {
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          gap: 0.875rem;
        }

        .machine-card {
          padding: 0.75rem;
          min-height: 240px;
        }

        .machine-header {
          margin-bottom: 0.75rem;
          padding-bottom: 0.5rem;
        }

        .machine-name {
          font-size: 0.925rem;
          margin-bottom: 0.25rem;
        }

        .machine-badge {
          font-size: 0.625rem;
          padding: 0.1rem 0.375rem;
        }

        .machine-stats {
          gap: 0.25rem;
          margin-bottom: 0.75rem;
        }

        .stat-item {
          padding: 0.25rem 0.0625rem;
          min-height: 45px;
        }

        .stat-number {
          font-size: 1rem;
        }

        .stat-label {
          font-size: 0.45rem;
        }

        .machine-actions {
          gap: 0.375rem;
        }

        .secondary-actions {
          gap: 0.25rem;
        }
      }

      @media (max-width: 480px) {
        .professional-header {
          padding: 1rem;
        }

        .content-area {
          padding: 0.75rem;
        }

        .machines-container {
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 0.625rem;
        }

        .machine-card {
          padding: 0.625rem;
          min-height: 220px;
        }

        .machine-icon {
          font-size: 1.75rem;
          margin-bottom: 0.25rem;
        }

        .machine-name {
          font-size: 0.875rem;
        }

        .machine-badge {
          font-size: 0.5rem;
          padding: 0.075rem 0.25rem;
        }

        .machine-stats {
          grid-template-columns: 1fr;
          gap: 0.25rem;
          margin-bottom: 0.625rem;
        }

        .stat-item {
          padding: 0.1875rem 0.03125rem;
          min-height: 40px;
        }

        .stat-number {
          font-size: 0.875rem;
        }

        .stat-label {
          font-size: 0.4rem;
        }

        .secondary-actions {
          flex-direction: column;
          gap: 0.1875rem;
        }

        .modal-container {
          margin: 1rem;
          max-height: calc(100vh - 2rem);
        }

        .modal-actions {
          flex-direction: column;
        }

        .machine-stats-summary {
          flex-direction: column;
          gap: 1rem;
        }

        .notification {
          top: 1rem;
          right: 1rem;
          left: 1rem;
          max-width: none;
        }
      }

      @media (hover: hover) {
        .machine-card:hover {
          box-shadow: var(--shadow-xl);
          transform: translateY(-4px);
          border-color: var(--primary-300);
        }

        .machine-card:hover::before {
          opacity: 1;
        }
      }

      @media (hover: none) {
        .machine-card:hover {
          transform: none;
          box-shadow: var(--shadow-md);
          border-color: var(--gray-200);
        }

        .machine-card:hover::before {
          opacity: 0;
        }

        .machine-card:active {
          transform: scale(0.97);
          box-shadow: var(--shadow-lg);
          border-color: var(--primary-500);
        }

        .main-action-info {
          background: var(--primary-100);
          border-color: var(--primary-300);
        }

        .tap-hint {
          animation: pulse-tap 1.5s infinite;
        }
      }
    `,
  ],
})
export class MachineListComponent implements OnInit, OnDestroy {
  selectedArea: 'corte' | 'costura' = 'costura';
  machines: Machine[] = [];
  machineStats: { [key: number]: { [key in PartCategory]: number } } = {};
  isLoading = true;

  showNotification = false;
  notificationMessage = '';
  notificationType: 'success' | 'error' | 'warning' = 'success';

  showDeleteModal = false;
  machineToDelete: Machine | null = null;
  isDeleting = false;
  deletePassword = '';
  passwordError = '';
  canConfirmDelete = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private machineService: MachineService,
    private partService: PartService,
    private databaseService: DatabaseService
  ) {}

  async ngOnInit() {
    this.selectedArea =
      (this.route.snapshot.params['area'] as 'corte' | 'costura') || 'costura';
    await this.loadMachines();
  }

  ngOnDestroy() {}

  async loadMachines() {
    this.isLoading = true;
    try {
      this.machines =
        (await this.machineService
          .getMachinesByArea(this.selectedArea)
          .toPromise()) || [];

      for (const machine of this.machines) {
        if (machine.id) {
          const stats = await this.partService.getPartStats(machine.id);
          if (stats) {
            this.machineStats[machine.id] = stats;
          }
        }
      }
    } catch (error) {
      console.error('Error loading machines:', error);
      this.showNotificationMessage('Error al cargar las máquinas', 'error');
    } finally {
      this.isLoading = false;
    }
  }

  getAreaTitle(): string {
    return this.selectedArea === 'costura'
      ? '🧵 ÁREA DE COSTURA'
      : '✂️ ÁREA DE CORTE';
  }

  getAreaLabel(): string {
    return this.selectedArea === 'costura'
      ? 'Costura Industrial'
      : 'Corte Industrial';
  }

  getAreaIcon(): string {
    return this.selectedArea === 'costura' ? '🧵' : '✂️';
  }

  goBack() {
    this.router.navigate(['/']);
  }

  addMachine() {
    this.router.navigate(['/machines', this.selectedArea, 'add']);
  }

  viewParts(machine: Machine) {
    this.router.navigate(['/machines', this.selectedArea, machine.id, 'parts']);
  }

  editMachine(machine: Machine) {
    this.router.navigate(['/machines', this.selectedArea, machine.id, 'edit']);
  }

  deleteMachine(machine: Machine) {
    this.machineToDelete = machine;
    this.showDeleteModal = true;
    this.deletePassword = '';
    this.passwordError = '';
    this.canConfirmDelete = false;
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.machineToDelete = null;
    this.deletePassword = '';
    this.passwordError = '';
    this.canConfirmDelete = false;
  }

  onPasswordChange() {
    this.passwordError = '';
    this.canConfirmDelete = this.deletePassword === 'Mantenimiento1.';
  }

  async confirmDeleteMachine() {
    if (!this.machineToDelete || !this.canConfirmDelete) return;

    this.isDeleting = true;

    try {
      await this.machineService
        .deleteMachine(this.machineToDelete.id!)
        .toPromise();

      this.showNotificationMessage(
        `Máquina "${this.machineToDelete.name}" eliminada correctamente`,
        'success'
      );

      this.closeDeleteModal();
      await this.loadMachines();
    } catch (error) {
      console.error('Error deleting machine:', error);
      this.showNotificationMessage('Error al eliminar la máquina', 'error');
    } finally {
      this.isDeleting = false;
    }
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

  getNotificationIcon(): string {
    switch (this.notificationType) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      default:
        return '✅';
    }
  }
}
