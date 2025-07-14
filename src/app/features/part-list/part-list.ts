import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TouchButtonComponent } from '../../shared/components/touch-button/touch-button';
import { PartService } from '../../core/services/part';
import { MachineService } from '../../core/services/machine';
import { DatabaseService } from '../../core/services/database';
import { Part, PartCategory, Machine } from '../../core/models';

@Component({
  selector: 'app-part-list',
  standalone: true,
  imports: [CommonModule, TouchButtonComponent],
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

              <!-- Imagen si existe -->
              <div *ngIf="part.image" class="part-image">
                <img
                  [src]="part.image"
                  [alt]="part.description"
                  class="part-img"
                  (error)="onImageError($event)"
                />
              </div>

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
                    (clicked)="deletePart(part)"
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
    </div>
  `,
  styles: [
    `
      .app-container {
        min-height: 100vh;
        background: var(--gray-50);
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

      .part-image {
        margin: 1rem 0;
        text-align: center;
      }

      .part-img {
        width: 100%;
        height: 120px;
        object-fit: cover;
        border-radius: var(--border-radius-md);
        border: 2px solid var(--gray-200);
        transition: transform 0.2s ease;
      }

      .part-img:hover {
        transform: scale(1.05);
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

      .loading-text {
        color: var(--gray-600);
        font-size: 1.125rem;
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

  viewPartDetail(part: Part) {
    console.log('👁️ View part detail:', part.description);
    alert(
      `📋 Detalle de Refacción:\n\n` +
        `📄 Descripción: ${part.description}\n` +
        `📦 SAP: ${part.sapNumber}\n` +
        `🔖 Part Number: ${part.partNumber}\n` +
        `📂 Categoría: ${this.getCategoryLabel(part.category)}\n` +
        `📍 Ubicación: ${part.location}\n` +
        `🔧 Máquina: ${this.machine?.name}`
    );
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

  deletePart(part: Part) {
    if (
      confirm(
        `¿Estás seguro de eliminar la refacción "${part.description}"?\n\nEsta acción no se puede deshacer.`
      )
    ) {
      this.partService.deletePart(part.id!).subscribe({
        next: () => {
          console.log('🗑️ Part deleted:', part.description);
          alert(`Refacción "${part.description}" eliminada exitosamente`);
          this.loadParts();
        },
        error: (error) => {
          console.error('Error deleting part:', error);
          alert('Error al eliminar la refacción. Intenta nuevamente.');
        },
      });
    }
  }
}
