import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { DatabaseService } from './database';
import { Machine, CreateMachineDto } from '../models';

@Injectable({
  providedIn: 'root',
})
export class MachineService {
  private machinesSubject = new BehaviorSubject<Machine[]>([]);
  public machines$ = this.machinesSubject.asObservable();

  constructor(private db: DatabaseService) {}

  // Cargar todas las máquinas
  loadMachines(): Observable<Machine[]> {
    return from(this.db.machines.orderBy('name').toArray()).pipe(
      tap((machines) => {
        console.log('📋 Loaded machines:', machines);
        this.machinesSubject.next(machines);
      })
    );
  }

  // Obtener máquinas por área
  getMachinesByArea(area: 'corte' | 'costura'): Observable<Machine[]> {
    return from(this.db.machines.where('area').equals(area).toArray()).pipe(
      map((machines) => machines.sort((a, b) => a.name.localeCompare(b.name))),
      tap((machines) => console.log(`🔧 Machines in ${area}:`, machines))
    );
  }

  // Obtener máquina por ID
  getMachineById(id: number): Observable<Machine | undefined> {
    return from(this.db.machines.get(id)).pipe(
      tap((machine) => console.log('🔍 Found machine:', machine))
    );
  }

  // Crear nueva máquina
  createMachine(machineData: CreateMachineDto): Observable<Machine> {
    return from(
      this.db.machines
        .add(machineData as Machine)
        .then(
          (id) =>
            ({
              ...machineData,
              id,
              createdAt: new Date(),
              updatedAt: new Date(),
            } as Machine)
        )
    ).pipe(
      tap((machine) => {
        console.log('✅ Created machine:', machine);
        this.loadMachines().subscribe();
      })
    );
  }

  // Actualizar máquina
  updateMachine(id: number, updates: Partial<Machine>): Observable<void> {
    return from(this.db.machines.update(id, updates)).pipe(
      map(() => void 0),
      tap(() => {
        console.log('📝 Updated machine:', id, updates);
        this.loadMachines().subscribe();
      })
    );
  }

  // Eliminar máquina
  deleteMachine(id: number): Observable<void> {
    return from(this.db.machines.delete(id)).pipe(
      map(() => void 0),
      tap(() => {
        console.log('🗑️ Deleted machine:', id);
        this.loadMachines().subscribe();
      })
    );
  }

  // Validar nombre único
  async isNameUnique(
    name: string,
    area: 'corte' | 'costura',
    excludeId?: number
  ): Promise<boolean> {
    const existing = await this.db.machines
      .where(['name', 'area'])
      .equals([name, area])
      .first();

    if (!existing) {
      return true;
    }

    if (excludeId && existing.id === excludeId) {
      return true;
    }

    return false;
  }
}
