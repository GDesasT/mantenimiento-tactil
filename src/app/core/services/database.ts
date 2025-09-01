import { Injectable } from '@angular/core';
import Dexie, { Table } from 'dexie';
import { Machine, Part } from '../models/index';

@Injectable({
  providedIn: 'root',
})
export class DatabaseService extends Dexie {
  machines!: Table<Machine>;
  parts!: Table<Part>;

  constructor() {
    super('MaintenanceDB');

    this.version(1).stores({
      machines: '++id, name, area, createdAt',
      parts:
        '++id, sapNumber, partNumber, machineId, category, location, description, createdAt',
    });

    // Version 2: Agregar campo image a parts
    this.version(2)
      .stores({
        machines: '++id, name, area, createdAt',
        parts:
          '++id, sapNumber, partNumber, machineId, category, location, description, image, createdAt',
      })
      .upgrade((trans) => {
        // Migración: agregar campo image a refacciones existentes
        return trans
          .table('parts')
          .toCollection()
          .modify((part) => {
            if (!part.hasOwnProperty('image')) {
              part.image = '';
            }
          });
      });

    // Hooks para timestamps automáticos
    this.machines.hook('creating', (primKey, obj, trans) => {
      obj.createdAt = new Date();
      obj.updatedAt = new Date();
    });

    this.machines.hook('updating', (modifications, primKey, obj, trans) => {
      (modifications as any).updatedAt = new Date();
    });

    this.parts.hook('creating', (primKey, obj, trans) => {
      obj.createdAt = new Date();
      obj.updatedAt = new Date();
    });

    this.parts.hook('updating', (modifications, primKey, obj, trans) => {
      (modifications as any).updatedAt = new Date();
    });
  }

  async initializeDatabase(): Promise<void> {
    try {
      await this.open();
      console.log('✅ Database initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize database:', error);
      throw error;
    }
  }

  async clearAllData(): Promise<void> {
    await this.transaction('rw', this.machines, this.parts, async () => {
      await this.machines.clear();
      await this.parts.clear();
    });
    console.log('🗑️ All data cleared');
  }

  async getStats(): Promise<{
    totalMachines: number;
    machinesByArea: { corte: number; costura: number };
    totalParts: number;
    partsByCategory: {
      mecanica: number;
      electronica: number;
      consumible: number;
    };
  }> {
    const [machines, parts] = await Promise.all([
      this.machines.toArray(),
      this.parts.toArray(),
    ]);

    return {
      totalMachines: machines.length,
      machinesByArea: {
        corte: machines.filter((m) => m.area === 'corte').length,
        costura: machines.filter((m) => m.area === 'costura').length,
      },
      totalParts: parts.length,
      partsByCategory: {
        mecanica: parts.filter((p) => p.category === 'mecanica').length,
        electronica: parts.filter((p) => p.category === 'electronica').length,
        consumible: parts.filter((p) => p.category === 'consumible').length,
      },
    };
  }
}
