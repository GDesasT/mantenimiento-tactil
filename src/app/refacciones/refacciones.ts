import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  MaintenanceService,
  MachineModel,
  Part,
} from '../services/maintenance';

@Component({
  selector: 'app-refacciones',
  imports: [CommonModule, FormsModule],
  templateUrl: './refacciones.html',
  styleUrl: './refacciones.css',
})
export class RefaccionesComponent implements OnInit {
  funcion: string = '';
  modelo: string = '';
  tipo: string = '';
  machine: MachineModel | null = null;
  parts: Part[] = [];
  showModal = false;
  isEditing = false;
  editingPart: Part | null = null;

  partForm = {
    name: '',
    codigo: '',
    precio: '',
    stock: 0,
  };

  tiposRefacciones = [
    {
      id: 'mecanica',
      name: 'MECÁNICA',
      description: 'Componentes mecánicos y estructurales',
      color: 'from-green-500 to-emerald-600',
    },
    {
      id: 'electronica',
      name: 'ELECTRÓNICA',
      description: 'Componentes eléctricos y electrónicos',
      color: 'from-purple-500 to-indigo-600',
    },
    {
      id: 'consumible',
      name: 'CONSUMIBLE',
      description: 'Materiales de consumo y mantenimiento',
      color: 'from-yellow-500 to-orange-600',
    },
  ];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private maintenanceService: MaintenanceService
  ) {}

  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.funcion = params['funcion'];
      this.modelo = params['modelo'];
      this.tipo = params['tipo'] || '';

      console.log('Parámetros recibidos:', {
        funcion: this.funcion,
        modelo: this.modelo,
        tipo: this.tipo,
      });

      this.loadMachine();
      if (this.tipo) {
        this.loadParts();
      }
    });
  }
  loadMachine() {
    this.machine = this.maintenanceService.getMachineById(
      this.funcion,
      this.modelo
    );
  }

  loadParts() {
    this.parts = this.maintenanceService.getParts(this.modelo, this.tipo);
  }

  selectTipo(tipo: string) {
    this.router.navigate(['/tabla', this.funcion, this.modelo, tipo]);
  }

  openModal(part?: Part) {
    this.showModal = true;
    this.isEditing = !!part;
    this.editingPart = part || null;

    if (part) {
      this.partForm = {
        name: part.name,
        codigo: part.codigo,
        precio: part.precio,
        stock: part.stock,
      };
    } else {
      this.resetForm();
    }
  }

  closeModal() {
    this.showModal = false;
    this.editingPart = null;
    this.isEditing = false;
    this.resetForm();
  }

  resetForm() {
    this.partForm = {
      name: '',
      codigo: '',
      precio: '',
      stock: 0,
    };
  }

  savePart() {
    if (this.partForm.name && this.partForm.codigo && this.partForm.precio) {
      if (this.isEditing && this.editingPart) {
        this.maintenanceService.updatePart(
          this.modelo,
          this.tipo,
          this.editingPart.id,
          this.partForm
        );
      } else {
        this.maintenanceService.addPart(this.modelo, this.tipo, this.partForm);
      }
      this.loadParts();
      this.closeModal();
    }
  }

  deletePart(partId: number) {
    if (confirm('¿Estás seguro de que quieres eliminar esta refacción?')) {
      this.maintenanceService.deletePart(this.modelo, this.tipo, partId);
      this.loadParts();
    }
  }

  getStockStatus(stock: number): string {
    return this.maintenanceService.getStockStatus(stock);
  }

  goBack() {
    const url = this.router.url;
    const isTablaView = url.includes('/tabla/');

    if (isTablaView) {
      this.router.navigate(['/tipos', this.funcion, this.modelo]);
    } else {
      this.router.navigate([`/${this.funcion}`]);
    }
  }

  goHome() {
    this.maintenanceService.resetSelection();
    this.router.navigate(['/home']);
  }
}
