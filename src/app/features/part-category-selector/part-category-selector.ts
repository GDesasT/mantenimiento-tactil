import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TouchButtonComponent } from '../../shared/components/touch-button/touch-button';
import { MachineService } from '../../core/services/machine';
import { PartService } from '../../core/services/part';
import { DatabaseService } from '../../core/services/database';
import { Machine, PartCategory } from '../../core/models';

@Component({
  selector: 'app-part-category-selector',
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
                Selecciona el tipo de refacción que deseas ver
              </p>
            </div>
          </div>

          <app-touch-button
            variant="primary"
            size="lg"
            icon="📋"
            (clicked)="viewAllParts()"
          >
            Ver Todas
          </app-touch-button>
        </div>
      </div>

      <div class="content-area">
        <!-- Información de la máquina -->
        <div class="machine-info-section">
          <div class="professional-card machine-info-card">
            <div class="professional-content machine-info-content">
              <div class="machine-icon">
                <span class="icon-large">{{ getAreaIcon() }}</span>
              </div>
              <h3 class="machine-name">{{ machine?.name }}</h3>
              <p class="machine-area">{{ getAreaLabel() }}</p>

              <!-- Estadísticas usando TU sistema -->
              <div class="machine-stats" *ngIf="stats">
                <div class="metric-card">
                  <div class="metric-value text-blue-600">
                    {{ stats.mecanica }}
                  </div>
                  <div class="metric-label">Mecánicas</div>
                </div>
                <div class="metric-card">
                  <div class="metric-value text-yellow-600">
                    {{ stats.electronica }}
                  </div>
                  <div class="metric-label">Electrónicas</div>
                </div>
                <div class="metric-card">
                  <div class="metric-value text-green-600">
                    {{ stats.consumible }}
                  </div>
                  <div class="metric-label">Consumibles</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Selector de categorías -->
        <div class="categories-section">
          <div class="categories-grid">
            <!-- Refacciones Mecánicas -->
            <div
              class="category-card mechanical-card"
              (click)="selectCategory('mecanica')"
            >
              <div class="professional-content">
                <div class="category-header">
                  <div class="category-icon">
                    <span class="icon-category">🔩</span>
                  </div>
                  <div class="category-badge mechanical-badge">MECÁNICA</div>
                </div>

                <div class="category-content">
                  <h3 class="category-title">Refacciones Mecánicas</h3>
                  <p class="category-description">
                    Piezas físicas, tornillos, engranes, rodamientos, bandas,
                    poleas y componentes estructurales
                  </p>

                  <div class="category-examples">
                    <div class="example-tag">⚙️ Engranes</div>
                    <div class="example-tag">🔧 Tornillería</div>
                    <div class="example-tag">🎯 Rodamientos</div>
                    <div class="example-tag">🔗 Bandas</div>
                  </div>
                </div>

                <div class="category-footer">
                  <app-touch-button
                    variant="primary"
                    size="xl"
                    icon="🔩"
                    [fullWidth]="true"
                    (clicked)="selectCategory('mecanica')"
                  >
                    Ver Refacciones Mecánicas
                  </app-touch-button>
                </div>
              </div>
            </div>

            <!-- Refacciones Electrónicas -->
            <div
              class="category-card electronic-card"
              (click)="selectCategory('electronica')"
            >
              <div class="professional-content">
                <div class="category-header">
                  <div class="category-icon">
                    <span class="icon-category">⚡</span>
                  </div>
                  <div class="category-badge electronic-badge">ELECTRÓNICA</div>
                </div>

                <div class="category-content">
                  <h3 class="category-title">Refacciones Electrónicas</h3>
                  <p class="category-description">
                    Componentes eléctricos, sensores, motores, controladores,
                    cables y dispositivos electrónicos
                  </p>

                  <div class="category-examples">
                    <div class="example-tag">🔌 Sensores</div>
                    <div class="example-tag">⚡ Motores</div>
                    <div class="example-tag">🎛️ Controladores</div>
                    <div class="example-tag">🔋 Componentes</div>
                  </div>
                </div>

                <div class="category-footer">
                  <app-touch-button
                    variant="warning"
                    size="xl"
                    icon="⚡"
                    [fullWidth]="true"
                    (clicked)="selectCategory('electronica')"
                  >
                    Ver Refacciones Electrónicas
                  </app-touch-button>
                </div>
              </div>
            </div>

            <!-- Refacciones Consumibles -->
            <div
              class="category-card consumable-card"
              (click)="selectCategory('consumible')"
            >
              <div class="professional-content">
                <div class="category-header">
                  <div class="category-icon">
                    <span class="icon-category">🔄</span>
                  </div>
                  <div class="category-badge consumable-badge">CONSUMIBLE</div>
                </div>

                <div class="category-content">
                  <h3 class="category-title">Refacciones Consumibles</h3>
                  <p class="category-description">
                    Materiales que se desgastan con el uso, lubricantes,
                    filtros, sellos y elementos de reemplazo frecuente
                  </p>

                  <div class="category-examples">
                    <div class="example-tag">🛢️ Lubricantes</div>
                    <div class="example-tag">🔍 Filtros</div>
                    <div class="example-tag">🔒 Sellos</div>
                    <div class="example-tag">🧽 Limpieza</div>
                  </div>
                </div>

                <div class="category-footer">
                  <app-touch-button
                    variant="success"
                    size="xl"
                    icon="🔄"
                    [fullWidth]="true"
                    (clicked)="selectCategory('consumible')"
                  >
                    Ver Refacciones Consumibles
                  </app-touch-button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Acciones adicionales -->
        <div class="actions-section">
          <div class="professional-card">
            <div class="professional-content">
              <h3 class="actions-title">Acciones Rápidas</h3>
              <div class="actions-grid">
                <app-touch-button
                  variant="success"
                  size="lg"
                  icon="➕"
                  (clicked)="addNewPart()"
                >
                  Agregar Refacción
                </app-touch-button>

                <app-touch-button
                  variant="secondary"
                  size="lg"
                  icon="🔍"
                  (clicked)="searchParts()"
                >
                  Buscar Refacción
                </app-touch-button>

                <app-touch-button
                  variant="primary"
                  size="lg"
                  icon="📊"
                  (clicked)="viewStats()"
                >
                  Ver Estadísticas
                </app-touch-button>
              </div>
            </div>
          </div>
        </div>

        <!-- Loading state -->
        <div *ngIf="isLoading" class="loading-professional">
          <div class="loading-spinner-pro"></div>
          <span class="loading-text">Cargando información...</span>
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

      /* Información de máquina */
      .machine-info-section {
        margin-bottom: 3rem;
      }

      .machine-info-card {
        background: var(--gradient-secondary);
        border-left: 4px solid var(--primary-600);
      }

      .machine-info-content {
        text-align: center;
      }

      .icon-large {
        font-size: 5rem;
        margin-bottom: 1rem;
        display: block;
        filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
      }

      .machine-name {
        font-size: 2rem;
        font-weight: bold;
        color: var(--gray-900);
        margin: 0 0 0.5rem 0;
      }

      .machine-area {
        font-size: 1.125rem;
        color: var(--gray-600);
        margin: 0 0 2rem 0;
      }

      .machine-stats {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
        max-width: 400px;
        margin: 0 auto;
      }

      /* Categorías */
      .categories-section {
        margin-bottom: 3rem;
      }

      .categories-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
        gap: 2rem;
      }

      .category-card {
        background: white;
        border-radius: var(--border-radius-lg);
        box-shadow: var(--shadow-md);
        border: 2px solid transparent;
        cursor: pointer;
        transition: all 0.3s ease;
        overflow: hidden;
        min-height: 500px;
        display: flex;
        flex-direction: column;
      }

      .category-card:hover {
        transform: translateY(-4px);
        box-shadow: var(--shadow-xl);
      }

      .mechanical-card {
        border-left: 6px solid var(--primary-600);
      }

      .mechanical-card:hover {
        border-color: var(--primary-600);
        box-shadow: 0 25px 50px -12px rgba(59, 130, 246, 0.3);
      }

      .electronic-card {
        border-left: 6px solid #f59e0b;
      }

      .electronic-card:hover {
        border-color: #f59e0b;
        box-shadow: 0 25px 50px -12px rgba(245, 158, 11, 0.3);
      }

      .consumable-card {
        border-left: 6px solid #10b981;
      }

      .consumable-card:hover {
        border-color: #10b981;
        box-shadow: 0 25px 50px -12px rgba(16, 185, 129, 0.3);
      }

      .category-header {
        text-align: center;
        margin-bottom: 1.5rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid var(--gray-200);
      }

      .category-icon {
        margin-bottom: 1rem;
      }

      .icon-category {
        font-size: 4rem;
        filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
      }

      .category-badge {
        display: inline-block;
        padding: 0.5rem 1rem;
        border-radius: var(--border-radius-sm);
        font-size: 0.75rem;
        font-weight: bold;
        letter-spacing: 0.1em;
      }

      .mechanical-badge {
        background: var(--primary-100);
        color: var(--primary-800);
      }

      .electronic-badge {
        background: #fef3c7;
        color: #d97706;
      }

      .consumable-badge {
        background: #ecfdf5;
        color: #065f46;
      }

      .category-content {
        flex: 1;
        text-align: center;
        margin-bottom: 1.5rem;
      }

      .category-title {
        font-size: 1.5rem;
        font-weight: bold;
        color: var(--gray-900);
        margin: 0 0 1rem 0;
      }

      .category-description {
        color: var(--gray-600);
        line-height: 1.6;
        margin-bottom: 1.5rem;
      }

      .category-examples {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        justify-content: center;
      }

      .example-tag {
        background: var(--primary-50);
        color: var(--primary-700);
        padding: 0.375rem 0.75rem;
        border-radius: var(--border-radius-sm);
        font-size: 0.875rem;
        font-weight: 500;
      }

      .electronic-card .example-tag {
        background: #fef3c7;
        color: #d97706;
      }

      .consumable-card .example-tag {
        background: #ecfdf5;
        color: #065f46;
      }

      .category-footer {
        margin-top: auto;
      }

      /* Acciones adicionales */
      .actions-section {
        margin-bottom: 2rem;
      }

      .actions-title {
        text-align: center;
        font-size: 1.5rem;
        font-weight: bold;
        color: var(--gray-900);
        margin-bottom: 1.5rem;
      }

      .actions-grid {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 1rem;
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

        .categories-grid {
          grid-template-columns: 1fr;
          gap: 1.5rem;
        }

        .category-card {
          min-height: 400px;
        }

        .machine-stats {
          grid-template-columns: 1fr;
          gap: 0.75rem;
        }

        .actions-grid {
          flex-direction: column;
          align-items: center;
        }

        .actions-grid app-touch-button {
          width: 100%;
          max-width: 300px;
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

        .machine-name {
          font-size: 1.5rem;
        }

        .category-title {
          font-size: 1.25rem;
        }
      }
    `,
  ],
})
export class PartCategorySelectorComponent implements OnInit {
  machineId!: number;
  machine: Machine | null = null;
  stats: { [key in PartCategory]: number } | null = null;
  isLoading = true;
  selectedArea: 'corte' | 'costura' = 'costura';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private machineService: MachineService,
    private partService: PartService,
    private databaseService: DatabaseService
  ) {}

  async ngOnInit() {
    this.route.params.subscribe((params) => {
      this.machineId = +params['machineId'];
      this.selectedArea = params['area'] || 'costura';
      this.loadMachine();
      this.loadStats();
    });

    try {
      await this.databaseService.initializeDatabase();
    } catch (error) {
      console.error('Error initializing database:', error);
    }
  }

  loadMachine() {
    this.machineService.getMachineById(this.machineId).subscribe({
      next: (machine) => {
        this.machine = machine || null;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading machine:', error);
        this.isLoading = false;
      },
    });
  }

  async loadStats() {
    try {
      this.stats = await this.partService.getPartStats(this.machineId);
    } catch (error) {
      console.error('Error loading stats:', error);
      this.stats = { mecanica: 0, electronica: 0, consumible: 0 };
    }
  }

  getAreaIcon(): string {
    return this.machine?.area === 'corte' ? '✂️' : '🧵';
  }

  getAreaLabel(): string {
    return this.machine?.area === 'corte'
      ? 'Corte Industrial'
      : 'Costura Industrial';
  }

  selectCategory(category: PartCategory) {
    console.log(`📋 Selected category: ${category}`);
    this.router.navigate([
      '/machines',
      this.machine?.area,
      this.machineId,
      'parts',
      category,
    ]);
  }

  viewAllParts() {
    console.log('📋 View all parts');
    this.router.navigate([
      '/machines',
      this.machine?.area,
      this.machineId,
      'parts',
      'all',
    ]);
  }

  addNewPart() {
    console.log('➕ Add new part');
    alert('Selecciona primero una categoría para agregar la refacción');
  }

  searchParts() {
    console.log('🔍 Search parts');
    this.router.navigate(['/search']);
  }

  viewStats() {
    console.log('📊 View stats');
    alert(
      `Estadísticas de ${this.machine?.name}:\n\n🔩 Mecánicas: ${
        this.stats?.mecanica || 0
      }\n⚡ Electrónicas: ${this.stats?.electronica || 0}\n🔄 Consumibles: ${
        this.stats?.consumible || 0
      }\n\n📦 Total: ${
        (this.stats?.mecanica || 0) +
        (this.stats?.electronica || 0) +
        (this.stats?.consumible || 0)
      }`
    );
  }

  goBack() {
    this.router.navigate(['/machines', this.machine?.area]);
  }
}
