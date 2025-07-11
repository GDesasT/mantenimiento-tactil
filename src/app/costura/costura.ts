import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaintenanceService, MachineModel } from '../services/maintenance';

@Component({
  selector: 'app-costura',
  imports: [CommonModule, FormsModule],
  templateUrl: './costura.html',
  styleUrl: './costura.css',
})
export class CosturaComponent implements OnInit {
  machines: MachineModel[] = [];
  brands: string[] = [];
  showModal = false;
  editingMachine: MachineModel | null = null;
  isEditing = false;

  // Formulario de máquina
  machineForm = {
    name: '',
    brand: '',
    model: '',
    year: 2025,
    status: 'activo' as 'activo' | 'inactivo' | 'mantenimiento',
  };

  // Para agregar nueva marca
  newBrand = '';
  isAddingNewBrand = false;

  statuses = [
    { value: 'activo', label: 'Activo' },
    { value: 'inactivo', label: 'Inactivo' },
    { value: 'mantenimiento', label: 'En Mantenimiento' },
  ];

  constructor(
    private router: Router,
    private maintenanceService: MaintenanceService
  ) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.machines = this.maintenanceService.getMachines('costura');
    this.brands = this.maintenanceService.getBrands('costura');
  }

  openModal(machine?: MachineModel) {
    this.showModal = true;
    this.isEditing = !!machine;
    this.editingMachine = machine || null;

    if (machine) {
      this.machineForm = {
        name: machine.name,
        brand: machine.brand,
        model: machine.model,
        year: machine.year,
        status: machine.status,
      };
    } else {
      this.resetForm();
    }
  }

  closeModal() {
    this.showModal = false;
    this.editingMachine = null;
    this.isEditing = false;
    this.resetForm();
  }

  resetForm() {
    this.machineForm = {
      name: '',
      brand: '',
      model: '',
      year: 2025,
      status: 'activo',
    };
    this.isAddingNewBrand = false;
    this.newBrand = '';
  }

  // Gestión de marcas
  toggleNewBrandInput() {
    this.isAddingNewBrand = !this.isAddingNewBrand;
    if (this.isAddingNewBrand) {
      this.machineForm.brand = '';
      this.newBrand = '';
    }
  }

  addNewBrand() {
    if (this.newBrand.trim()) {
      this.maintenanceService.addBrand('costura', this.newBrand.trim());
      this.machineForm.brand = this.newBrand.trim();
      this.loadData();
      this.isAddingNewBrand = false;
      this.newBrand = '';
    }
  }

  removeBrand(brand: string) {
    if (confirm(`¿Estás seguro de que quieres eliminar la marca "${brand}"?`)) {
      this.maintenanceService.removeBrand('costura', brand);
      this.loadData();
    }
  }

  saveMachine() {
    if (this.isAddingNewBrand && this.newBrand.trim()) {
      this.addNewBrand();
    }

    if (
      this.machineForm.name &&
      this.machineForm.brand &&
      this.machineForm.model
    ) {
      if (this.isEditing && this.editingMachine) {
        this.maintenanceService.updateMachine(
          'costura',
          this.editingMachine.id,
          this.machineForm
        );
      } else {
        this.maintenanceService.addMachine('costura', this.machineForm);
      }

      this.loadData();
      this.closeModal();
    }
  }

  deleteMachine(machineId: string) {
    if (confirm('¿Estás seguro de que quieres eliminar esta máquina?')) {
      this.maintenanceService.deleteMachine('costura', machineId);
      this.loadData();
    }
  }

  selectMachine(machine: MachineModel) {
    this.maintenanceService.updateSelection({ selectedModel: machine.id }); // ← Cambiar 'modelo' por 'selectedModel'
    this.router.navigate(['/tipos', 'costura', machine.id]);
  }

  getStatusColor(status: string): string {
    return this.maintenanceService.getStatusColor(status);
  }

  goBack() {
    this.router.navigate(['/home']);
  }

  reset() {
    this.maintenanceService.resetSelection();
    this.router.navigate(['/home']);
  }
}
