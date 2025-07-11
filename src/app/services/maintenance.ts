import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface MachineModel {
  id: string;
  name: string;
  brand: string;
  model: string;
  year: number;
  status: 'activo' | 'inactivo' | 'mantenimiento';
}

export interface Part {
  id: number;
  name: string;
  codigo: string;
  precio: string;
  stock: number;
}

export interface NavigationState {
  selectedFunction: string;
  selectedModel: string;
  selectedType: string;
}

@Injectable({
  providedIn: 'root',
})
export class MaintenanceService {
  private navigationState = new BehaviorSubject<NavigationState>({
    selectedFunction: '',
    selectedModel: '',
    selectedType: '',
  });

  navigationState$ = this.navigationState.asObservable();

  // Marcas dinámicas por categoría
  private brands: { [key: string]: string[] } = {
    corte: [],
    costura: [],
  };

  // Datos de máquinas
  private machines: { [key: string]: MachineModel[] } = {
    corte: [],
    costura: [],
  };

  // Datos de refacciones
  private parts: { [key: string]: { [key: string]: Part[] } } = {};

  constructor() {
    // Agregar datos de ejemplo para testing
    this.addTestData();
  }

  private addTestData() {
    // Datos para cualquier máquina de corte que tenga un ID similar
    const testMachineId = 'corte-1752204522561'; // El ID que veo en tu URL

    this.parts[testMachineId] = {
      mecanica: [
        {
          id: 1,
          name: 'Cuchilla Principal',
          codigo: 'COR-001',
          precio: '$450',
          stock: 12,
        },
        {
          id: 2,
          name: 'Rodamiento Principal',
          codigo: 'COR-002',
          precio: '$180',
          stock: 8,
        },
        {
          id: 3,
          name: 'Guía de Corte',
          codigo: 'COR-003',
          precio: '$120',
          stock: 15,
        },
        {
          id: 4,
          name: 'Tensor de Hilo',
          codigo: 'COR-004',
          precio: '$85',
          stock: 20,
        },
      ],
      electronica: [
        {
          id: 5,
          name: 'Motor Principal',
          codigo: 'COR-101',
          precio: '$1200',
          stock: 3,
        },
        {
          id: 6,
          name: 'Sensor de Posición',
          codigo: 'COR-102',
          precio: '$350',
          stock: 6,
        },
        {
          id: 7,
          name: 'Controlador Digital',
          codigo: 'COR-103',
          precio: '$800',
          stock: 4,
        },
        {
          id: 8,
          name: 'Display LCD',
          codigo: 'COR-104',
          precio: '$200',
          stock: 7,
        },
      ],
      consumible: [
        {
          id: 9,
          name: 'Aceite Hidráulico',
          codigo: 'COR-201',
          precio: '$45',
          stock: 25,
        },
        {
          id: 10,
          name: 'Filtro de Aire',
          codigo: 'COR-202',
          precio: '$25',
          stock: 30,
        },
        {
          id: 11,
          name: 'Cinta Adhesiva',
          codigo: 'COR-203',
          precio: '$15',
          stock: 50,
        },
        {
          id: 12,
          name: 'Lubricante',
          codigo: 'COR-204',
          precio: '$35',
          stock: 40,
        },
      ],
    };
  }

  // Métodos para marcas
  getBrands(funcion: string): string[] {
    return this.brands[funcion] || [];
  }

  addBrand(funcion: string, brand: string): void {
    if (!this.brands[funcion]) {
      this.brands[funcion] = [];
    }

    if (!this.brands[funcion].includes(brand)) {
      this.brands[funcion].push(brand);
    }
  }

  removeBrand(funcion: string, brand: string): void {
    if (this.brands[funcion]) {
      this.brands[funcion] = this.brands[funcion].filter((b) => b !== brand);
    }
  }

  // Métodos CRUD para máquinas
  getMachines(funcion: string): MachineModel[] {
    return this.machines[funcion] || [];
  }

  addMachine(funcion: string, machine: Omit<MachineModel, 'id'>): void {
    const newId = `${funcion}-${Date.now()}`;
    const newMachine: MachineModel = {
      ...machine,
      id: newId,
    };

    if (!this.machines[funcion]) {
      this.machines[funcion] = [];
    }

    this.machines[funcion].push(newMachine);
    this.addBrand(funcion, machine.brand);
    this.addExamplePartsForMachine(newId);
  }

  private addExamplePartsForMachine(machineId: string): void {
    console.log('Creando refacciones para:', machineId);

    this.parts[machineId] = {
      mecanica: [
        {
          id: 1,
          name: 'Cuchilla Principal',
          codigo: `${machineId.substring(0, 3).toUpperCase()}-001`,
          precio: '$450',
          stock: 12,
        },
        {
          id: 2,
          name: 'Rodamiento Principal',
          codigo: `${machineId.substring(0, 3).toUpperCase()}-002`,
          precio: '$180',
          stock: 8,
        },
        {
          id: 3,
          name: 'Guía de Corte',
          codigo: `${machineId.substring(0, 3).toUpperCase()}-003`,
          precio: '$120',
          stock: 15,
        },
        {
          id: 4,
          name: 'Tensor de Hilo',
          codigo: `${machineId.substring(0, 3).toUpperCase()}-004`,
          precio: '$85',
          stock: 20,
        },
      ],
      electronica: [
        {
          id: 5,
          name: 'Motor Principal',
          codigo: `${machineId.substring(0, 3).toUpperCase()}-101`,
          precio: '$1200',
          stock: 3,
        },
        {
          id: 6,
          name: 'Sensor de Posición',
          codigo: `${machineId.substring(0, 3).toUpperCase()}-102`,
          precio: '$350',
          stock: 6,
        },
        {
          id: 7,
          name: 'Controlador Digital',
          codigo: `${machineId.substring(0, 3).toUpperCase()}-103`,
          precio: '$800',
          stock: 4,
        },
        {
          id: 8,
          name: 'Display LCD',
          codigo: `${machineId.substring(0, 3).toUpperCase()}-104`,
          precio: '$200',
          stock: 7,
        },
      ],
      consumible: [
        {
          id: 9,
          name: 'Aceite Hidráulico',
          codigo: `${machineId.substring(0, 3).toUpperCase()}-201`,
          precio: '$45',
          stock: 25,
        },
        {
          id: 10,
          name: 'Filtro de Aire',
          codigo: `${machineId.substring(0, 3).toUpperCase()}-202`,
          precio: '$25',
          stock: 30,
        },
        {
          id: 11,
          name: 'Cinta Adhesiva',
          codigo: `${machineId.substring(0, 3).toUpperCase()}-203`,
          precio: '$15',
          stock: 50,
        },
        {
          id: 12,
          name: 'Lubricante',
          codigo: `${machineId.substring(0, 3).toUpperCase()}-204`,
          precio: '$35',
          stock: 40,
        },
      ],
    };

    console.log('Refacciones creadas:', this.parts[machineId]);
  }

  updateMachine(
    funcion: string,
    machineId: string,
    updatedMachine: Partial<MachineModel>
  ): void {
    const machines = this.machines[funcion];
    const index = machines.findIndex((m) => m.id === machineId);

    if (index !== -1) {
      this.machines[funcion][index] = { ...machines[index], ...updatedMachine };
      if (updatedMachine.brand) {
        this.addBrand(funcion, updatedMachine.brand);
      }
    }
  }

  deleteMachine(funcion: string, machineId: string): void {
    this.machines[funcion] = this.machines[funcion].filter(
      (m) => m.id !== machineId
    );
    if (this.parts[machineId]) {
      delete this.parts[machineId];
    }
  }

  getMachineById(funcion: string, machineId: string): MachineModel | null {
    return this.machines[funcion]?.find((m) => m.id === machineId) || null;
  }

  getParts(modelo: string, tipo: string): Part[] {
    console.log('Buscando refacciones para:', { modelo, tipo });
    console.log('Datos disponibles:', this.parts);
    const result = this.parts[modelo]?.[tipo] || [];
    console.log('Resultado:', result);
    return result;
  }

  addPart(modelo: string, tipo: string, part: Omit<Part, 'id'>): void {
    if (!this.parts[modelo]) {
      this.parts[modelo] = { mecanica: [], electronica: [], consumible: [] };
    }
    if (!this.parts[modelo][tipo]) {
      this.parts[modelo][tipo] = [];
    }

    const newId = Math.max(0, ...this.parts[modelo][tipo].map((p) => p.id)) + 1;
    const newPart: Part = { ...part, id: newId };

    this.parts[modelo][tipo].push(newPart);
  }

  updatePart(
    modelo: string,
    tipo: string,
    partId: number,
    updatedPart: Partial<Part>
  ): void {
    const parts = this.parts[modelo]?.[tipo];
    if (parts) {
      const index = parts.findIndex((p) => p.id === partId);
      if (index !== -1) {
        this.parts[modelo][tipo][index] = { ...parts[index], ...updatedPart };
      }
    }
  }

  deletePart(modelo: string, tipo: string, partId: number): void {
    if (this.parts[modelo]?.[tipo]) {
      this.parts[modelo][tipo] = this.parts[modelo][tipo].filter(
        (p) => p.id !== partId
      );
    }
  }

  updateSelection(selection: Partial<NavigationState>) {
    const current = this.navigationState.value;
    this.navigationState.next({ ...current, ...selection });
  }

  resetSelection() {
    this.navigationState.next({
      selectedFunction: '',
      selectedModel: '',
      selectedType: '',
    });
  }

  getStockStatus(stock: number): string {
    if (stock > 20) return 'text-green-600 bg-green-100';
    if (stock > 10) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'activo':
        return 'bg-green-100 text-green-800';
      case 'inactivo':
        return 'bg-red-100 text-red-800';
      case 'mantenimiento':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }
}
