import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TouchButtonComponent } from '../../shared/components/touch-button/touch-button';
import { VirtualKeyboardComponent } from '../../shared/components/virtual-keyboard/virtual-keyboard';
import { ChemicalService } from '../../core/services/chemical';
import { Tool } from '../../core/models';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-quimicos',
  standalone: true,
  imports: [CommonModule, FormsModule, TouchButtonComponent, VirtualKeyboardComponent],
  templateUrl: './quimicos.html',
  styleUrl: './quimicos.scss',
})
export class QuimicosComponent implements OnInit, OnDestroy {
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  chemicals: Tool[] = [];
  filteredChemicals: Tool[] = [];
  searchQuery = '';

  // Teclado virtual
  showKeyboard = false;

  // Notificaciones
  showSuccessNotification = false;
  successMessage = '';
  showErrorNotification = false;
  errorMessage = '';

  selectedChemical: Tool | null = null;

  constructor(private chemicalService: ChemicalService, private router: Router) {}

  ngOnInit() {
    this.loadChemicals();
  }

  ngOnDestroy() {
    // Limpieza si es necesaria
  }

  loadChemicals() {
    this.chemicalService.loadChemicals().subscribe({
      next: (chemicals) => {
        this.chemicals = chemicals;
        this.filteredChemicals = chemicals;
        console.log('✅ Chemicals loaded:', chemicals);
      },
      error: (error) => {
        console.error('❌ Error loading chemicals:', error);
        this.showErrorMessage('Error al cargar los químicos');
      },
    });
  }

  onSearch(query: string) {
    this.searchQuery = query;
    if (query.trim() === '') {
      this.filteredChemicals = this.chemicals;
    } else {
      this.filteredChemicals = this.chemicals.filter((chemical) =>
        chemical.name.toLowerCase().includes(query.toLowerCase())
      );
    }
  }

  clearSearch() {
    this.searchQuery = '';
    this.filteredChemicals = this.chemicals;
  }

  selectChemical(chemical: Tool) {
    this.selectedChemical = chemical;
  }

  editChemical(chemical: Tool, event: any) {
    event.stopPropagation();
    // Funcionalidad de edición podría implementarse en el futuro
    this.showSuccessMessage(`Edición de "${chemical.name}" - Por implementar`);
  }

  async deleteChemical(id: number | undefined, event: any) {
    event.stopPropagation();

    if (!id) return;

    const chemical = this.chemicals.find((c) => c.id === id);
    if (!chemical) return;

    const confirmed = window.confirm(
      `¿Estás seguro de que deseas eliminar "${chemical.name}"?`
    );

    if (!confirmed) return;

    try {
      await firstValueFrom(this.chemicalService.deleteChemical(id));
      this.showSuccessMessage(`"${chemical.name}" eliminado exitosamente`);
      this.loadChemicals();
    } catch (error) {
      console.error('Error deleting chemical:', error);
      this.showErrorMessage(`Error al eliminar "${chemical.name}"`);
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
    this.filteredChemicals = this.chemicals;
  }

  onKeyboardEnter() {
    this.onSearch(this.searchQuery);
    this.onKeyboardClose();
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
