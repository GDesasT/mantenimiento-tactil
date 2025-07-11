import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaintenanceService, MachineModel } from '../services/maintenance';

@Component({
  selector: 'app-corte',
  imports: [CommonModule, FormsModule],
  templateUrl: './corte.html',
  styleUrl: './corte.css',
})
export class CorteComponent implements OnInit {
  machines: MachineModel[] = [];
  brands: string[] = [];
  showModal = false;
  editingMachine: MachineModel | null = null;
  isEditing = false;

  machineForm = {
    name: '',
    brand: '',
    model: '',
    year: 2025,
    status: 'activo' as 'activo' | 'inactivo' | 'mantenimiento',
  };

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
    this.machines = this.maintenanceService.getMachines('corte');
    this.brands = this.maintenanceService.getBrands('corte');
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

  toggleNewBrandInput() {
    this.isAddingNewBrand = !this.isAddingNewBrand;
    if (this.isAddingNewBrand) {
      this.machineForm.brand = '';
      this.newBrand = '';
    }
  }

  addNewBrand() {
    if (this.newBrand.trim()) {
      this.maintenanceService.addBrand('corte', this.newBrand.trim());
      this.machineForm.brand = this.newBrand.trim();
      this.loadData();
      this.isAddingNewBrand = false;
      this.newBrand = '';
    }
  }

  removeBrand(brand: string) {
    if (confirm(`¿Estás seguro de que quieres eliminar la marca "${brand}"?`)) {
      this.maintenanceService.removeBrand('corte', brand);
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
          'corte',
          this.editingMachine.id,
          this.machineForm
        );
      } else {
        this.maintenanceService.addMachine('corte', this.machineForm);
      }

      this.loadData();
      this.closeModal();
    }
  }

  deleteMachine(machineId: string) {
    if (confirm('¿Estás seguro de que quieres eliminar esta máquina?')) {
      this.maintenanceService.deleteMachine('corte', machineId);
      this.loadData();
    }
  }

  selectMachine(machine: MachineModel) {
    this.maintenanceService.updateSelection({ selectedModel: machine.id });
    this.router.navigate(['/tipos', 'corte', machine.id]);
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
