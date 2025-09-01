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
        <!-- Información compacta de la máquina -->
        <div class="machine-info-compact">
          <div class="compact-card">
            <!-- Layout horizontal: nombre a la izquierda, estadísticas a la derecha -->
            <div class="compact-layout">
              <div class="compact-left">
                <span class="compact-icon">{{ getAreaIcon() }}</span>
                <div class="compact-text">
                  <h3 class="compact-name">{{ machine?.name }}</h3>
                  <span class="compact-area">{{ getAreaLabel() }}</span>
                </div>
              </div>

              <!-- Estadísticas a la derecha -->
              <div class="compact-right" *ngIf="stats">
                <div class="compact-stat blue">
                  <span class="stat-value">{{ stats.mecanica }}</span>
                  <span class="stat-label">Mecánicas</span>
                </div>
                <div class="compact-stat yellow">
                  <span class="stat-value">{{ stats.electronica }}</span>
                  <span class="stat-label">Electrónicas</span>
                </div>
                <div class="compact-stat green">
                  <span class="stat-value">{{ stats.consumible }}</span>
                  <span class="stat-label">Consumibles</span>
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
                  <div class="tap-hint-category">
                    <span class="tap-text">👆 Toca para ver refacciones</span>
                  </div>
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
                  <div class="tap-hint-category">
                    <span class="tap-text">👆 Toca para ver refacciones</span>
                  </div>
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
                  <div class="tap-hint-category">
                    <span class="tap-text">👆 Toca para ver refacciones</span>
                  </div>
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
        position: relative;
        padding: 2rem;
        max-width: 1400px;
        margin: 0 auto;
      }

      .machine-info-compact {
        margin-bottom: 24px;
      }

      .compact-card {
        background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
        border: 2px solid #e2e8f0;
        border-radius: 16px;
        padding: 16px 20px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      .compact-layout {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 20px;
      }

      .compact-left {
        display: flex;
        align-items: center;
        gap: 12px;
        flex: 1;
      }

      .compact-right {
        display: flex;
        gap: 20px;
        flex-shrink: 0;
      }

      .compact-icon {
        font-size: 32px;
        color: #2d3748;
        flex-shrink: 0;
      }

      .compact-text {
        flex: 1;
      }

      .compact-name {
        font-size: 18px;
        font-weight: 700;
        color: #2d3748;
        margin: 0 0 2px 0;
        line-height: 1.2;
      }

      .compact-area {
        font-size: 13px;
        color: #718096;
        font-weight: 500;
      }

      .compact-stat {
        display: flex;
        flex-direction: column;
        align-items: center;
        min-width: 80px;
      }

      .compact-stat .stat-value {
        font-size: 20px;
        font-weight: 700;
        margin-bottom: 2px;
      }

      .compact-stat .stat-label {
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        text-align: center;
      }

      .compact-stat.blue .stat-value {
        color: #3182ce;
      }

      .compact-stat.yellow .stat-value {
        color: #d69e2e;
      }

      .compact-stat.green .stat-value {
        color: #38a169;
      }

      .compact-stat.blue .stat-label,
      .compact-stat.yellow .stat-label,
      .compact-stat.green .stat-label {
        color: #718096;
      }

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
        position: relative;
        user-select: none;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        touch-action: manipulation;
        -webkit-tap-highlight-color: transparent;
      }

      .category-card::before {
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

      .category-card:hover {
        transform: translateY(-4px);
        box-shadow: var(--shadow-xl);
      }

      .category-card:hover::before {
        opacity: 1;
      }

      .category-card:active {
        transform: translateY(-2px) scale(0.99);
        box-shadow: var(--shadow-lg);
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
        padding: 1rem;
        text-align: center;
      }

      .tap-hint-category {
        padding: 0.75rem;
        background: rgba(255, 255, 255, 0.8);
        border: 2px dashed rgba(0, 0, 0, 0.2);
        border-radius: var(--border-radius-md);
        backdrop-filter: blur(10px);
      }

      .tap-text {
        font-size: 0.875rem;
        font-weight: 600;
        color: rgba(0, 0, 0, 0.7);
        animation: pulse-tap-category 2s infinite;
      }

      @keyframes pulse-tap-category {
        0%,
        100% {
          opacity: 0.7;
        }
        50% {
          opacity: 1;
          transform: scale(1.02);
        }
      }

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

        .compact-layout {
          flex-direction: column;
          gap: 16px;
          align-items: flex-start;
        }

        .compact-right {
          width: 100%;
          justify-content: space-around;
        }

        .compact-stat {
          min-width: 70px;
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

      @media (hover: hover) {
        .category-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-xl);
        }

        .category-card:hover::before {
          opacity: 1;
        }

        .mechanical-card:hover {
          border-color: var(--primary-600);
          box-shadow: 0 25px 50px -12px rgba(59, 130, 246, 0.3);
        }

        .electronic-card:hover {
          border-color: #f59e0b;
          box-shadow: 0 25px 50px -12px rgba(245, 158, 11, 0.3);
        }

        .consumable-card:hover {
          border-color: #10b981;
          box-shadow: 0 25px 50px -12px rgba(16, 185, 129, 0.3);
        }
      }

      @media (hover: none) {
        .category-card:hover {
          transform: none;
          box-shadow: var(--shadow-md);
        }

        .category-card:hover::before {
          opacity: 0;
        }

        .category-card:active {
          transform: scale(0.97);
          box-shadow: var(--shadow-lg);
        }

        .mechanical-card:active {
          border-color: var(--primary-600);
        }

        .electronic-card:active {
          border-color: #f59e0b;
        }

        .consumable-card:active {
          border-color: #10b981;
        }

        .tap-hint-category {
          background: rgba(255, 255, 255, 0.9);
          border-color: rgba(0, 0, 0, 0.3);
        }

        .tap-text {
          animation: pulse-tap-category 1.5s infinite;
        }
      }

      .admin-toggle-corner {
        position: absolute;
        top: 16px;
        right: 16px;
        z-index: 50;
      }

      .admin-corner-btn {
        width: 40px !important;
        height: 40px !important;
        border-radius: 50% !important;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        opacity: 0.7;
        transition: all 0.3s ease;
      }

      .admin-corner-btn:hover {
        opacity: 1;
        transform: scale(1.1);
      }

      .admin-corner-btn.active {
        background: linear-gradient(135deg, #f59e0b, #fbbf24) !important;
        color: white !important;
        opacity: 1;
        animation: pulse-admin 2s ease-in-out infinite;
      }

      @keyframes pulse-admin {
        0%,
        100% {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }
        50% {
          box-shadow: 0 4px 16px rgba(245, 158, 11, 0.4);
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
