import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TouchButtonComponent } from '../../shared/components/touch-button/touch-button';
import { VirtualKeyboardComponent } from '../../shared/components/virtual-keyboard/virtual-keyboard';
import { ToolService } from '../../core/services/tool';
import { Tool } from '../../core/models';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-herramientas',
  standalone: true,
  imports: [CommonModule, FormsModule, TouchButtonComponent, VirtualKeyboardComponent],
  templateUrl: './herramientas.html',
  styleUrl: './herramientas.scss',
})
export class HerramientasComponent implements OnInit, OnDestroy {
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  tools: Tool[] = [];
  filteredTools: Tool[] = [];
  searchQuery = '';

  // Teclado virtual
  showKeyboard = false;

  // Notificaciones
  showSuccessNotification = false;
  successMessage = '';
  showErrorNotification = false;
  errorMessage = '';

  selectedTool: Tool | null = null;

  constructor(private toolService: ToolService, private router: Router) {}

  ngOnInit() {
    this.loadTools();
  }

  ngOnDestroy() {
    // Limpieza si es necesaria
  }

  loadTools() {
    this.toolService.loadTools().subscribe({
      next: (tools) => {
        this.tools = tools;
        this.filteredTools = tools;
        console.log('✅ Tools loaded:', tools);
      },
      error: (error) => {
        console.error('❌ Error loading tools:', error);
        this.showErrorMessage('Error al cargar las herramientas');
      },
    });
  }

  onSearch(query: string) {
    this.searchQuery = query;
    if (query.trim() === '') {
      this.filteredTools = this.tools;
    } else {
      this.filteredTools = this.tools.filter((tool) =>
        tool.name.toLowerCase().includes(query.toLowerCase())
      );
    }
  }

  clearSearch() {
    this.searchQuery = '';
    this.filteredTools = this.tools;
  }

  selectTool(tool: Tool) {
    this.selectedTool = tool;
  }

  editTool(tool: Tool, event: any) {
    event.stopPropagation();
    // Funcionalidad de edición podría implementarse en el futuro
    this.showSuccessMessage(`Edición de "${tool.name}" - Por implementar`);
  }

  async deleteTool(id: number | undefined, event: any) {
    event.stopPropagation();

    if (!id) return;

    const tool = this.tools.find((t) => t.id === id);
    if (!tool) return;

    const confirmed = window.confirm(
      `¿Estás seguro de que deseas eliminar "${tool.name}"?`
    );

    if (!confirmed) return;

    try {
      await firstValueFrom(this.toolService.deleteTool(id));
      this.showSuccessMessage(`"${tool.name}" eliminada exitosamente`);
      this.loadTools();
    } catch (error) {
      console.error('Error deleting tool:', error);
      this.showErrorMessage(`Error al eliminar "${tool.name}"`);
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
    this.filteredTools = this.tools;
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
