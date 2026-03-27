import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TouchButtonComponent } from '../../shared/components/touch-button/touch-button';
import { VirtualKeyboardComponent } from '../../shared/components/virtual-keyboard/virtual-keyboard';
import { FastenerService } from '../../core/services/fastener';
import { Tool } from '../../core/models';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-tornillos',
  standalone: true,
  imports: [CommonModule, FormsModule, TouchButtonComponent, VirtualKeyboardComponent],
  templateUrl: './tornillos.html',
  styleUrl: './tornillos.scss',
})
export class TornillosComponent implements OnInit, OnDestroy {
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  fasteners: Tool[] = [];
  filteredFasteners: Tool[] = [];
  searchQuery = '';

  // Teclado virtual
  showKeyboard = false;

  // Notificaciones
  showSuccessNotification = false;
  successMessage = '';
  showErrorNotification = false;
  errorMessage = '';

  selectedFastener: Tool | null = null;

  constructor(private fastenerService: FastenerService, private router: Router) {}

  ngOnInit() {
    this.loadFasteners();
  }

  ngOnDestroy() {
    // Limpieza si es necesaria
  }

  loadFasteners() {
    this.fastenerService.loadFasteners().subscribe({
      next: (fasteners) => {
        this.fasteners = fasteners;
        this.filteredFasteners = fasteners;
        console.log('✅ Fasteners loaded:', fasteners);
      },
      error: (error) => {
        console.error('❌ Error loading fasteners:', error);
        this.showErrorMessage('Error al cargar los tornillos');
      },
    });
  }

  onSearch(query: string) {
    this.searchQuery = query;
    if (query.trim() === '') {
      this.filteredFasteners = this.fasteners;
    } else {
      this.filteredFasteners = this.fasteners.filter((fastener) =>
        fastener.name.toLowerCase().includes(query.toLowerCase())
      );
    }
  }

  clearSearch() {
    this.searchQuery = '';
    this.filteredFasteners = this.fasteners;
  }

  selectFastener(fastener: Tool) {
    this.selectedFastener = fastener;
  }

  editFastener(fastener: Tool, event: any) {
    event.stopPropagation();
    // Funcionalidad de edición podría implementarse en el futuro
    this.showSuccessMessage(`Edición de "${fastener.name}" - Por implementar`);
  }

  async deleteFastener(id: number | undefined, event: any) {
    event.stopPropagation();

    if (!id) return;

    const fastener = this.fasteners.find((f) => f.id === id);
    if (!fastener) return;

    const confirmed = window.confirm(
      `¿Estás seguro de que deseas eliminar "${fastener.name}"?`
    );

    if (!confirmed) return;

    try {
      await firstValueFrom(this.fastenerService.deleteFastener(id));
      this.showSuccessMessage(`"${fastener.name}" eliminado exitosamente`);
      this.loadFasteners();
    } catch (error) {
      console.error('Error deleting fastener:', error);
      this.showErrorMessage(`Error al eliminar "${fastener.name}"`);
    }
  }

  goBack() {
    this.router.navigate(['']);
  }

  goToImport() {
    this.router.navigate(['/excel-import']);
  }

  // Métodos del teclado virtual
  onSearchFocus() {
    this.showKeyboard = true;
  }

  onKeyboardKey(key: string) {
    this.searchQuery += key;
    this.onSearch(this.searchQuery);
  }

  onKeyboardBackspace() {
    this.searchQuery = this.searchQuery.slice(0, -1);
    this.onSearch(this.searchQuery);
  }

  onKeyboardClear() {
    this.searchQuery = '';
    this.filteredFasteners = this.fasteners;
  }

  onKeyboardClose() {
    this.showKeyboard = false;
    if (this.searchInput) {
      this.searchInput.nativeElement.blur();
    }
  }

  showSuccessMessage(message: string) {
    this.successMessage = message;
    this.showSuccessNotification = true;
    setTimeout(() => {
      this.showSuccessNotification = false;
    }, 3000);
  }

  showErrorMessage(message: string) {
    this.errorMessage = message;
    this.showErrorNotification = true;
    setTimeout(() => {
      this.showErrorNotification = false;
    }, 3000);
  }
}
