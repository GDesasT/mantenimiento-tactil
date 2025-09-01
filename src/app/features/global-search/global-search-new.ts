import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
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
}

@Component({
  selector: 'app-global-search',
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
                placeholder="🔎 Buscar por SAP, descripción, ubicación o máquina..."
                class="search-input"
              />
              <app-touch-button
                variant="secondary"
                size="sm"
                icon="⌨️"
                (clicked)="toggleKeyboard()"
                class="keyboard-btn"
                title="Teclado virtual"
              >
              </app-touch-button>
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
                >
                  <span class="placeholder-icon">📦</span>
                  <span class="placeholder-text">Sin imagen</span>
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
                </div>

                <div class="part-actions">
                  <app-touch-button
                    variant="primary"
                    size="sm"
                    icon="👁️"
                    (clicked)="viewPartDetails(part)"
                    class="action-btn"
                  >
                    Ver detalles
                  </app-touch-button>
                </div>
              </div>
            </div>
          </div>

          <!-- Paginación -->
          <div class="pagination-container" *ngIf="totalPages > 1">
            <div class="pagination-info">
              <span>Página {{ currentPage }} de {{ totalPages }}</span>
              <span>({{ filteredParts.length }} resultados)</span>
            </div>

            <div class="pagination-controls">
              <app-touch-button
                variant="secondary"
                size="md"
                icon="⏮️"
                (clicked)="goToPage(1)"
                [disabled]="currentPage === 1"
              >
                Primera
              </app-touch-button>

              <app-touch-button
                variant="secondary"
                size="md"
                icon="⬅️"
                (clicked)="previousPage()"
                [disabled]="currentPage === 1"
              >
                Anterior
              </app-touch-button>

              <div class="page-numbers">
                <span
                  *ngFor="let page of getVisiblePages()"
                  class="page-number"
                  [class.active]="page === currentPage"
                  (click)="goToPage(page)"
                >
                  {{ page }}
                </span>
              </div>

              <app-touch-button
                variant="secondary"
                size="md"
                icon="➡️"
                (clicked)="nextPage()"
                [disabled]="currentPage === totalPages"
              >
                Siguiente
              </app-touch-button>

              <app-touch-button
                variant="secondary"
                size="md"
                icon="⏭️"
                (clicked)="goToPage(totalPages)"
                [disabled]="currentPage === totalPages"
              >
                Última
              </app-touch-button>
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
      <div class="virtual-keyboard" *ngIf="keyboardVisible">
        <div class="keyboard-container">
          <div class="keyboard-header">
            <h4>Teclado Virtual</h4>
            <app-touch-button
              variant="secondary"
              size="sm"
              icon="✕"
              (clicked)="hideKeyboard()"
            >
            </app-touch-button>
          </div>

          <div class="keyboard-grid">
            <div class="keyboard-row">
              <button
                *ngFor="let key of keyboardLayout.row1"
                class="key"
                (click)="typeKey(key)"
              >
                {{ key }}
              </button>
            </div>
            <div class="keyboard-row">
              <button
                *ngFor="let key of keyboardLayout.row2"
                class="key"
                (click)="typeKey(key)"
              >
                {{ key }}
              </button>
            </div>
            <div class="keyboard-row">
              <button
                *ngFor="let key of keyboardLayout.row3"
                class="key"
                (click)="typeKey(key)"
              >
                {{ key }}
              </button>
            </div>
            <div class="keyboard-row">
              <button class="key key-space" (click)="typeKey(' ')">
                Espacio
              </button>
              <button class="key key-backspace" (click)="backspace()">⌫</button>
              <button class="key key-clear" (click)="clearSearch()">
                Limpiar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .app-container {
        min-height: 100vh;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 0;
        margin: 0;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      }

      .professional-header {
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(10px);
        border-bottom: 1px solid rgba(0, 0, 0, 0.1);
        padding: 1rem 1.5rem;
        position: sticky;
        top: 0;
        z-index: 100;
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

      .keyboard-btn {
        flex-shrink: 0;
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
        transition: all 0.2s ease;
      }

      .part-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
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
        display: flex;
        flex-direction: column;
        align-items: center;
        color: #a0aec0;
      }

      .placeholder-icon {
        font-size: 3rem;
        margin-bottom: 0.5rem;
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

      .part-actions {
        display: flex;
        justify-content: center;
      }

      .action-btn {
        flex: 1;
      }

      .pagination-container {
        border-top: 1px solid #e2e8f0;
        padding-top: 1.5rem;
      }

      .pagination-info {
        text-align: center;
        margin-bottom: 1rem;
        color: #718096;
      }

      .pagination-controls {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 0.5rem;
        flex-wrap: wrap;
      }

      .page-numbers {
        display: flex;
        gap: 0.25rem;
        margin: 0 1rem;
      }

      .page-number {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: #f7fafc;
        color: #4a5568;
        cursor: pointer;
        transition: all 0.2s ease;
        font-weight: 600;
      }

      .page-number:hover {
        background: #e2e8f0;
      }

      .page-number.active {
        background: #4299e1;
        color: white;
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

      /* Teclado virtual */
      .virtual-keyboard {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        background: white;
        border-top: 1px solid #e2e8f0;
        z-index: 1000;
        box-shadow: 0 -4px 6px rgba(0, 0, 0, 0.1);
      }

      .keyboard-container {
        max-width: 800px;
        margin: 0 auto;
        padding: 1rem;
      }

      .keyboard-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
        padding-bottom: 0.5rem;
        border-bottom: 1px solid #e2e8f0;
      }

      .keyboard-header h4 {
        margin: 0;
        color: #2d3748;
      }

      .keyboard-grid {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .keyboard-row {
        display: flex;
        justify-content: center;
        gap: 0.25rem;
      }

      .key {
        min-width: 40px;
        height: 50px;
        border: 1px solid #e2e8f0;
        border-radius: 0.5rem;
        background: #f7fafc;
        color: #2d3748;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .key:hover {
        background: #e2e8f0;
        transform: translateY(-1px);
      }

      .key:active {
        transform: translateY(0);
        background: #cbd5e0;
      }

      .key-space {
        min-width: 200px;
      }

      .key-backspace,
      .key-clear {
        min-width: 80px;
        background: #fed7d7;
        color: #c53030;
      }

      .key-backspace:hover,
      .key-clear:hover {
        background: #feb2b2;
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

        .pagination-controls {
          flex-direction: column;
          gap: 1rem;
        }

        .page-numbers {
          margin: 0;
        }

        .quick-filters,
        .area-filters {
          justify-content: center;
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
  keyboardLayout = {
    row1: ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    row2: ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ñ'],
    row3: [
      'Z',
      'X',
      'C',
      'V',
      'B',
      'N',
      'M',
      '1',
      '2',
      '3',
      '4',
      '5',
      '6',
      '7',
      '8',
      '9',
      '0',
    ],
  };

  constructor(
    private router: Router,
    private partService: PartService,
    private machineService: MachineService,
    private databaseService: DatabaseService
  ) {}

  async ngOnInit() {
    await this.loadData();
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
    }
  }

  previousPage() {
    this.goToPage(this.currentPage - 1);
  }

  nextPage() {
    this.goToPage(this.currentPage + 1);
  }

  getVisiblePages(): number[] {
    const pages: number[] = [];
    const start = Math.max(1, this.currentPage - 2);
    const end = Math.min(this.totalPages, this.currentPage + 2);

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

  viewPartDetails(part: Part) {
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

  hideKeyboard() {
    this.keyboardVisible = false;
  }

  typeKey(key: string) {
    this.searchQuery += key;
    this.onSearchInput();
  }

  backspace() {
    this.searchQuery = this.searchQuery.slice(0, -1);
    this.onSearchInput();
  }

  clearSearch() {
    this.searchQuery = '';
    this.onSearchInput();
  }

  goBack() {
    this.router.navigate(['/']);
  }
}
