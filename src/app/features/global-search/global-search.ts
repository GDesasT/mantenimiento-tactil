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
    <div class="global-search-container slide-up">
      <!-- Header -->
      <div class="glass-effect rounded-3xl p-8 mb-12">
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
              <h2 class="text-4xl font-black gradient-text mb-2">
                🔍 Búsqueda Global
              </h2>
              <p class="text-xl text-gray-600 font-medium">
                Encuentra refacciones por SAP, descripción, ubicación o máquina
              </p>
            </div>
          </div>

          <!-- Estadísticas de búsqueda -->
          <div class="search-stats text-right">
            <div class="text-2xl font-bold text-blue-600">
              {{ filteredParts.length }}
            </div>
            <div class="text-sm text-gray-600">
              {{ filteredParts.length === 1 ? 'resultado' : 'resultados' }}
            </div>
            <div class="text-xs text-gray-500">
              de {{ allParts.length }} total
            </div>
          </div>
        </div>
      </div>

      <!-- Formulario de búsqueda -->
      <div class="search-form glass-effect rounded-2xl p-8 mb-8">
        <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <!-- Búsqueda por texto -->
          <div class="search-field lg:col-span-2">
            <label class="field-label">🔎 Buscar por texto</label>
            <input
              type="text"
              [(ngModel)]="filters.searchText"
              (input)="onSearchChange()"
              placeholder="SAP, descripción, ubicación..."
              class="search-input"
              #searchInput
            />
            <div class="field-hint">
              Busca en SAP, descripción, ubicación y número de parte
            </div>
          </div>

          <!-- Filtro por categoría -->
          <div class="search-field">
            <label class="field-label">📂 Categoría</label>
            <select
              [(ngModel)]="filters.category"
              (change)="onFilterChange()"
              class="search-select"
            >
              <option value="all">Todas las categorías</option>
              <option value="mecanica">🔩 Mecánica</option>
              <option value="electronica">⚡ Electrónica</option>
              <option value="consumible">🔄 Consumible</option>
            </select>
          </div>

          <!-- Filtro por área -->
          <div class="search-field">
            <label class="field-label">🏭 Área</label>
            <select
              [(ngModel)]="filters.area"
              (change)="onFilterChange()"
              class="search-select"
            >
              <option value="all">Todas las áreas</option>
              <option value="corte">✂️ Corte</option>
              <option value="costura">🧵 Costura</option>
            </select>
          </div>
        </div>

        <!-- Filtro por máquina (segunda fila) -->
        <div class="mt-6" *ngIf="availableMachines.length > 0">
          <div class="search-field">
            <label class="field-label">🔧 Máquina específica</label>
            <select
              [(ngModel)]="filters.machineId"
              (change)="onFilterChange()"
              class="search-select"
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
        <div class="quick-actions mt-8 flex gap-4">
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

      <!-- Resultados de búsqueda -->
      <div class="search-results">
        <!-- Resultados encontrados -->
        <div *ngIf="filteredParts.length > 0" class="results-grid">
          <div
            *ngFor="let part of filteredParts; let i = index"
            class="result-card bounce-in"
            [style.animation-delay]="i * 0.05 + 's'"
            (click)="viewPartDetails(part)"
          >
            <!-- Header de la refacción -->
            <div class="result-header">
              <div
                class="category-indicator"
                [class]="'indicator-' + part.category"
              >
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
            <div class="result-content">
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
              <div class="flex gap-2">
                <app-touch-button
                  variant="primary"
                  size="sm"
                  icon="👁️"
                  (clicked)="viewPartDetailsButton(part)"
                  class="flex-1"
                >
                  Ver
                </app-touch-button>

                <app-touch-button
                  variant="success"
                  size="sm"
                  icon="📋"
                  (clicked)="goToPartListButton(part)"
                  class="flex-1"
                >
                  Lista
                </app-touch-button>
              </div>
            </div>
          </div>
        </div>

        <!-- Estado vacío -->
        <div
          *ngIf="filteredParts.length === 0 && !isLoading"
          class="empty-results"
        >
          <div class="glass-effect rounded-3xl p-16 text-center">
            <div class="empty-icon mb-8">
              <span class="text-9xl icon-glow">{{ getEmptyIcon() }}</span>
            </div>
            <h3 class="text-3xl font-black text-gray-800 mb-6">
              {{ getEmptyTitle() }}
            </h3>
            <p class="text-xl text-gray-600 mb-8 max-w-md mx-auto">
              {{ getEmptyMessage() }}
            </p>
            <div class="flex gap-4 justify-center">
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
        </div>

        <!-- Loading state -->
        <div *ngIf="isLoading" class="loading-state">
          <div class="glass-effect rounded-3xl p-16 text-center">
            <div class="loading-spinner mb-6">
              <span class="text-6xl animate-spin">🔍</span>
            </div>
            <span class="text-2xl font-bold text-gray-700"
              >Buscando refacciones...</span
            >
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .global-search-container {
        min-height: 70vh;
        padding: 2rem 0;
      }

      .search-stats {
        text-align: center;
        padding: 1rem;
        background: rgba(59, 130, 246, 0.1);
        border-radius: 1rem;
        border: 2px solid rgba(59, 130, 246, 0.2);
      }

      .search-form {
        background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);
        border-left: 4px solid #3b82f6;
      }

      .search-field {
        margin-bottom: 1rem;
      }

      .field-label {
        display: block;
        font-size: 1.125rem;
        font-weight: 600;
        color: #374151;
        margin-bottom: 0.75rem;
      }

      .search-input,
      .search-select {
        width: 100%;
        padding: 1rem 1.5rem;
        font-size: 1.125rem;
        border: 3px solid #d1d5db;
        border-radius: 1rem;
        background: white;
        transition: all 0.3s ease;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .search-input:focus,
      .search-select:focus {
        outline: none;
        border-color: #3b82f6;
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        transform: translateY(-1px);
      }

      .field-hint {
        font-size: 0.875rem;
        color: #6b7280;
        margin-top: 0.5rem;
      }

      .results-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
        gap: 2rem;
        margin-top: 2rem;
      }

      .result-card {
        background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);
        border-radius: 1.5rem;
        padding: 2rem;
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
        transition: all 0.3s ease;
        cursor: pointer;
        border-left: 4px solid;
        display: flex;
        flex-direction: column;
        min-height: 300px;
      }

      .result-card:hover {
        transform: translateY(-4px) scale(1.02);
        box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.2);
      }

      .result-card[class*='mecanica'] {
        border-left-color: #3b82f6;
      }

      .result-card[class*='electronica'] {
        border-left-color: #f59e0b;
      }

      .result-card[class*='consumible'] {
        border-left-color: #10b981;
      }

      .result-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
      }

      .category-indicator {
        display: flex;
        align-items: center;
        padding: 0.5rem 1rem;
        border-radius: 9999px;
        font-size: 0.875rem;
        font-weight: 600;
      }

      .indicator-mecanica {
        background: rgba(59, 130, 246, 0.1);
        color: #1e40af;
      }

      .indicator-electronica {
        background: rgba(245, 158, 11, 0.1);
        color: #d97706;
      }

      .indicator-consumible {
        background: rgba(16, 185, 129, 0.1);
        color: #065f46;
      }

      .category-icon {
        font-size: 1.25rem;
        margin-right: 0.5rem;
      }

      .result-content {
        flex: 1;
        margin-bottom: 1.5rem;
      }

      .part-description {
        font-size: 1.25rem;
        font-weight: 700;
        color: #1f2937;
        margin-bottom: 1rem;
        line-height: 1.4;
      }

      .part-details {
        space-y: 0.75rem;
      }

      .detail-row {
        display: flex;
        align-items: center;
        margin-bottom: 0.75rem;
      }

      .detail-label {
        font-size: 0.875rem;
        font-weight: 600;
        color: #6b7280;
        min-width: 100px;
        flex-shrink: 0;
      }

      .detail-value {
        font-size: 0.875rem;
        color: #374151;
        font-weight: 500;
      }

      .sap-highlight {
        background: rgba(59, 130, 246, 0.1);
        color: #1e40af;
        padding: 0.25rem 0.5rem;
        border-radius: 0.375rem;
        font-weight: 700;
      }

      .location-highlight {
        background: rgba(16, 185, 129, 0.1);
        color: #065f46;
        padding: 0.25rem 0.5rem;
        border-radius: 0.375rem;
        font-weight: 600;
      }

      .machine-highlight {
        background: rgba(245, 158, 11, 0.1);
        color: #d97706;
        padding: 0.25rem 0.5rem;
        border-radius: 0.375rem;
        font-weight: 600;
      }

      .result-footer {
        margin-top: auto;
      }

      .empty-results,
      .loading-state {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 400px;
        margin: 2rem 0;
      }

      .animate-spin {
        animation: spin 2s linear infinite;
      }

      @keyframes spin {
        from {
          transform: rotate(0deg);
        }
        to {
          transform: rotate(360deg);
        }
      }

      /* Responsive */
      @media (max-width: 1024px) {
        .grid-cols-1.lg\\:grid-cols-4 {
          grid-template-columns: 1fr;
        }

        .grid-cols-1.lg\\:grid-cols-2 {
          grid-template-columns: 1fr;
        }

        .results-grid {
          grid-template-columns: 1fr;
          gap: 1.5rem;
        }
      }

      @media (max-width: 768px) {
        .global-search-container {
          padding: 1rem 0;
        }

        .glass-effect {
          padding: 1.5rem !important;
        }

        .result-card {
          min-height: 250px;
          padding: 1.5rem;
        }

        .search-input,
        .search-select {
          font-size: 1rem;
          padding: 0.875rem 1.25rem;
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
      // Cargar todas las refacciones
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

      // Cargar todas las máquinas
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
    // Búsqueda en tiempo real con un pequeño delay
    setTimeout(() => {
      this.applyFilters();
    }, 300);
  }

  onFilterChange() {
    this.applyFilters();
  }

  applyFilters() {
    let filtered = [...this.allParts];

    // Filtro por texto de búsqueda
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

    // Filtro por categoría
    if (this.filters.category !== 'all') {
      filtered = filtered.filter(
        (part) => part.category === this.filters.category
      );
    }

    // Filtro por área (a través de la máquina)
    if (this.filters.area !== 'all') {
      const machinesInArea = this.availableMachines
        .filter((machine) => machine.area === this.filters.area)
        .map((machine) => machine.id);

      filtered = filtered.filter((part) =>
        machinesInArea.includes(part.machineId)
      );
    }

    // Filtro por máquina específica
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

  clearFilters() {
    this.filters = {
      searchText: '',
      category: 'all',
      area: 'all',
      machineId: null,
    };
    this.applyFilters();
  }

  showSearchStats() {
    const stats = {
      total: this.allParts.length,
      mecanica: this.allParts.filter((p) => p.category === 'mecanica').length,
      electronica: this.allParts.filter((p) => p.category === 'electronica')
        .length,
      consumible: this.allParts.filter((p) => p.category === 'consumible')
        .length,
      machines: this.availableMachines.length,
    };

    alert(
      `📊 Estadísticas del Inventario:\n\n` +
        `📦 Total de refacciones: ${stats.total}\n` +
        `🔩 Mecánicas: ${stats.mecanica}\n` +
        `⚡ Electrónicas: ${stats.electronica}\n` +
        `🔄 Consumibles: ${stats.consumible}\n` +
        `🔧 Máquinas registradas: ${stats.machines}\n\n` +
        `🔍 Resultados actuales: ${this.filteredParts.length}`
    );
  }

  viewPartDetails(part: Part, event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    console.log('👁️ View part details:', part.description);
    alert(
      `📋 Detalles de la Refacción:\n\n` +
        `📦 SAP: ${part.sapNumber}\n` +
        `🔖 Part Number: ${part.partNumber}\n` +
        `📄 Descripción: ${part.description}\n` +
        `📂 Categoría: ${this.getCategoryLabel(part.category)}\n` +
        `📍 Ubicación: ${part.location}\n` +
        `🔧 Máquina: ${this.getMachineName(part.machineId)}`
    );
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

  goToExcelImport() {
    this.router.navigate(['/excel-import']);
  }

  goBack() {
    this.router.navigate(['/']);
  }
}
