import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { TouchButtonComponent } from '../../shared/components/touch-button/touch-button';
import { ManualService } from '../../core/services/manual';
import { Manual } from '../../core/models';

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
    const cats = new Set(manuals.map((m) => m.category).filter(Boolean));
    this.categories = Array.from(cats);
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
    if (this.selectedCategory !== 'todos') {
      result = result.filter((m) => m.category === this.selectedCategory);
    }
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          (m.description || '').toLowerCase().includes(q) ||
          m.category.toLowerCase().includes(q)
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
    return this.manuals.filter((m) => m.category === cat).length;
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
    const labels: Record<string, string> = {
      maquinaria: 'Maquinaria',
      seguridad: 'Seguridad',
      mantenimiento: 'Mantenimiento',
      proceso: 'Proceso',
      general: 'General',
    };
    return labels[cat] || cat;
  }

  getCategoryColor(cat: string): string {
    const colors: Record<string, string> = {
      maquinaria: '#3b82f6',
      seguridad: '#ef4444',
      mantenimiento: '#f59e0b',
      proceso: '#10b981',
      general: '#8b5cf6',
    };
    return colors[cat] || '#6b7280';
  }
}
