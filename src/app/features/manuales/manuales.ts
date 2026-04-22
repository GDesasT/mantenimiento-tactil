import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { TouchButtonComponent } from '../../shared/components/touch-button/touch-button';
import { ManualService } from '../../core/services/manual';
import { Manual } from '../../core/models';
import {
  MANUAL_CATEGORIES,
  getManualCategoryColor,
  normalizeManualCategory,
  resolveManualCategory,
} from '../../core/constants/manual-categories';

@Component({
  selector: 'app-manuales',
  standalone: true,
  imports: [CommonModule, FormsModule, TouchButtonComponent],
  templateUrl: './manuales.html',
  styleUrl: './manuales.scss',
})
export class ManualesComponent implements OnInit {
  manuals: Manual[] = [];
  filteredManuals: Manual[] = [];
  searchQuery = '';
  selectedCategory = 'todos';
  categories: string[] = [];

  selectedManual: Manual | null = null;
  pdfUrl: SafeResourceUrl | null = null;
  private _blobUrl: string | null = null;
  showViewer = false;
  /** true cuando se abre con visor nativo (Electron + ruta disco) */
  nativeOpen = false;

  constructor(
    private manualService: ManualService,
    private sanitizer: DomSanitizer,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadManuals();
  }

  loadManuals() {
    this.manualService.loadManuals().subscribe({
      next: (manuals) => {
        this.manuals = manuals;
        this.filteredManuals = manuals;
        this.extractCategories(manuals);
      },
      error: (err) => console.error('Error cargando manuales:', err),
    });
  }

  extractCategories(manuals: Manual[]) {
    const categories = manuals
      .map((manual) => resolveManualCategory(manual.category))
      .filter((category): category is string => !!category);

    const existingMap = new Map<string, string>();
    for (const category of categories) {
      existingMap.set(category.toLowerCase(), category);
    }

    const orderedHardcoded = MANUAL_CATEGORIES.filter((category) =>
      existingMap.has(category.toLowerCase())
    ).map((category) => existingMap.get(category.toLowerCase()) || category);

    const remaining = Array.from(existingMap.entries())
      .filter(
        ([normalized]) =>
          !MANUAL_CATEGORIES.some((hardcoded) => hardcoded.toLowerCase() === normalized)
      )
      .map(([, value]) => value)
      .sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }));

    this.categories = [...orderedHardcoded, ...remaining];
  }

  onSearch(query: string) {
    this.searchQuery = query;
    this.applyFilters();
  }

  onCategoryChange(cat: string) {
    this.selectedCategory = cat;
    this.applyFilters();
  }

  applyFilters() {
    let result = this.manuals;
    const selectedCategoryNormalized = normalizeManualCategory(this.selectedCategory).toLowerCase();
    if (this.selectedCategory !== 'todos') {
      result = result.filter(
        (m) => normalizeManualCategory(m.category).toLowerCase() === selectedCategoryNormalized
      );
    }
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          (m.description || '').toLowerCase().includes(q) ||
          normalizeManualCategory(m.category).toLowerCase().includes(q)
      );
    }
    this.filteredManuals = result;
  }

  clearSearch() {
    this.searchQuery = '';
    this.applyFilters();
  }

  clearFilters() {
    this.searchQuery = '';
    this.selectedCategory = 'todos';
    this.filteredManuals = this.manuals;
  }

  getCountByCategory(cat: string): number {
    const normalized = normalizeManualCategory(cat).toLowerCase();
    return this.manuals.filter((m) => normalizeManualCategory(m.category).toLowerCase() === normalized)
      .length;
  }

  openManual(manual: Manual) {
    this.selectedManual = manual;
    const electron = (window as any).electron?.ipcRenderer;

    // Electron + ruta en disco → abrir con visor nativo del sistema
    if (electron && manual.pdfData && !manual.pdfData.startsWith('data:')) {
      this.nativeOpen = true;
      electron.invoke('pdf-open', { filePath: manual.pdfData });
      return; // no abrimos panel interno
    }

    // Fallback (web o base64 legacy) → Blob URL en iframe
    this.nativeOpen = false;
    const base64 = manual.pdfData.split(',')[1];
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const blob = new Blob([bytes], { type: 'application/pdf' });
    this._blobUrl = URL.createObjectURL(blob);
    this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this._blobUrl);
    this.showViewer = true;
  }

  closeViewer() {
    this.showViewer = false;
    this.selectedManual = null;
    this.pdfUrl = null;
    if (this._blobUrl) {
      URL.revokeObjectURL(this._blobUrl);
      this._blobUrl = null;
    }
  }

  goBack() {
    this.router.navigate(['/']);
  }

  goToAdmin() {
    this.router.navigate(['/admin-manuales']);
  }

  getCategoryLabel(cat: string): string {
    return resolveManualCategory(cat) || 'Sin categoría';
  }

  getCategoryColor(cat: string): string {
    return getManualCategoryColor(cat);
  }
}
