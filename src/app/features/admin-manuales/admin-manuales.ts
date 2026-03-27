import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TouchButtonComponent } from '../../shared/components/touch-button/touch-button';
import { ManualService } from '../../core/services/manual';
import { Manual, CreateManualDto } from '../../core/models';

@Component({
  selector: 'app-admin-manuales',
  standalone: true,
  imports: [CommonModule, FormsModule, TouchButtonComponent],
  templateUrl: './admin-manuales.html',
  styleUrl: './admin-manuales.scss',
})
export class AdminManualesComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  manuals: Manual[] = [];

  // Formulario
  showForm = false;
  isEditing = false;
  editingId: number | null = null;
  isLoading = false;

  form: CreateManualDto = {
    name: '',
    description: '',
    category: 'general',
    fileName: '',
    pdfData: '',
  };

  selectedFileName = '';
  dragOver = false;

  // Notificaciones
  showSuccess = false;
  successMessage = '';
  showError = false;
  errorMessage = '';

  // Confirmar eliminación
  confirmDeleteId: number | null = null;

  readonly categories = [
    { value: 'Costura', label: '🧵 Costura' },
    { value: 'Corte', label: '✂️ Corte' },
    { value: 'General', label: '📁 General' },
    { value: 'Sistemas Mantenimiento', label: '⚙️ Sistemas Mantenimiento' },
  ];

  constructor(private manualService: ManualService, private router: Router) {}

  ngOnInit() {
    this.loadManuals();
  }

  loadManuals() {
    this.manualService.loadManuals().subscribe({
      next: (manuals) => (this.manuals = manuals),
      error: () => this.showErrorMsg('Error al cargar los manuales'),
    });
  }

  openAddForm() {
    this.isEditing = false;
    this.editingId = null;
    this.resetForm();
    this.showForm = true;
  }

  openEditForm(manual: Manual) {
    this.isEditing = true;
    this.editingId = manual.id;
    this.form = {
      name: manual.name,
      description: manual.description || '',
      category: manual.category,
      fileName: manual.fileName,
      pdfData: manual.pdfData,
    };
    this.selectedFileName = manual.fileName;
    this.showForm = true;
  }

  closeForm() {
    this.showForm = false;
    this.resetForm();
  }

  resetForm() {
    this.form = { name: '', description: '', category: 'general', fileName: '', pdfData: '' };
    this.selectedFileName = '';
    if (this.fileInput) this.fileInput.nativeElement.value = '';
  }

  triggerFileInput() {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) this.processFile(file);
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.dragOver = true;
  }

  onDragLeave() {
    this.dragOver = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.dragOver = false;
    const file = event.dataTransfer?.files[0];
    if (file && file.type === 'application/pdf') {
      this.processFile(file);
    } else {
      this.showErrorMsg('Solo se permiten archivos PDF');
    }
  }

  async processFile(file: File) {
    if (file.type !== 'application/pdf') {
      this.showErrorMsg('Solo se permiten archivos PDF');
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      this.showErrorMsg('El archivo no debe superar los 50 MB');
      return;
    }
    this.isLoading = true;
    try {
      const base64 = await this.manualService.fileToBase64(file);
      this.form.pdfData = base64;
      this.form.fileName = file.name;
      this.selectedFileName = file.name;
      if (!this.form.name) {
        this.form.name = file.name.replace('.pdf', '').replace(/_/g, ' ');
      }
    } catch {
      this.showErrorMsg('Error al leer el archivo');
    } finally {
      this.isLoading = false;
    }
  }

  async saveManual() {
    if (!this.form.name.trim()) {
      this.showErrorMsg('El nombre es obligatorio');
      return;
    }
    if (!this.form.pdfData) {
      this.showErrorMsg('Debes seleccionar un archivo PDF');
      return;
    }

    this.isLoading = true;

    if (this.isEditing && this.editingId !== null) {
      this.manualService.updateManual(this.editingId, this.form).subscribe({
        next: () => {
          this.isLoading = false;
          this.closeForm();
          this.loadManuals();
          this.showSuccessMsg('Manual actualizado correctamente');
        },
        error: () => {
          this.isLoading = false;
          this.showErrorMsg('Error al actualizar el manual');
        },
      });
    } else {
      this.manualService.createManual(this.form).subscribe({
        next: () => {
          this.isLoading = false;
          this.closeForm();
          this.loadManuals();
          this.showSuccessMsg('Manual agregado correctamente');
        },
        error: () => {
          this.isLoading = false;
          this.showErrorMsg('Error al guardar el manual');
        },
      });
    }
  }

  askDelete(id: number) {
    this.confirmDeleteId = id;
  }

  cancelDelete() {
    this.confirmDeleteId = null;
  }

  confirmDelete() {
    if (this.confirmDeleteId === null) return;
    this.manualService.deleteManual(this.confirmDeleteId).subscribe({
      next: () => {
        this.confirmDeleteId = null;
        this.loadManuals();
        this.showSuccessMsg('Manual eliminado');
      },
      error: () => {
        this.confirmDeleteId = null;
        this.showErrorMsg('Error al eliminar el manual');
      },
    });
  }

  goBack() {
    this.router.navigate(['/manuales']);
  }

  getCategoryLabel(val: string): string {
    return this.categories.find((c) => c.value === val)?.label || val;
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

  showSuccessMsg(msg: string) {
    this.successMessage = msg;
    this.showSuccess = true;
    setTimeout(() => (this.showSuccess = false), 3000);
  }

  showErrorMsg(msg: string) {
    this.errorMessage = msg;
    this.showError = true;
    setTimeout(() => (this.showError = false), 4000);
  }
}
