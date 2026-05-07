import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { CreateMachineDto, Machine } from '../models';
import { normalizeMachine, unwrapApiData } from './api-utils';

@Injectable({
  providedIn: 'root',
})
export class MachineService {
  private machinesSubject = new BehaviorSubject<Machine[]>([]);
  public machines$ = this.machinesSubject.asObservable();

  private readonly apiBaseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  // Cargar todas las máquinas
  loadMachines(): Observable<Machine[]> {
    return this.http.get(`${this.apiBaseUrl}/machines`).pipe(
      map((response) => unwrapApiData<any[]>(response)),
      map((machines) => machines.map((machine) => normalizeMachine(machine))),
      tap((machines) => {
        console.log('📋 Loaded machines:', machines);
        this.machinesSubject.next(machines);
      })
    );
  }

  // Obtener máquinas por área
  getMachinesByArea(area: string): Observable<Machine[]> {
    return this.loadMachines().pipe(
      map((machines) => machines.filter((m) => {
        const machineArea = (m.area || '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const requestedArea = (area || '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
        return machineArea === requestedArea;
      })),
      map((machines) => machines.sort((a, b) => a.name.localeCompare(b.name))),
      tap((machines) => console.log(`🔧 Machines in ${area}:`, machines))
    );
  }

  // Obtener máquina por ID
  getMachineById(id: number): Observable<Machine | undefined> {
    return this.http.get(`${this.apiBaseUrl}/machines/${id}`).pipe(
      map((response) => normalizeMachine(unwrapApiData<any>(response))),
      tap((machine) => console.log('🔍 Found machine:', machine))
    );
  }

  // Crear nueva máquina
  createMachine(machineData: CreateMachineDto): Observable<Machine> {
    return this.http.post(`${this.apiBaseUrl}/machines`, machineData).pipe(
      map((response) => normalizeMachine(unwrapApiData<any>(response))),
      tap((machine) => {
        console.log('✅ Created machine:', machine);
        this.loadMachines().subscribe();
      })
    );
  }

  // Actualizar máquina
  updateMachine(id: number, updates: Partial<Machine>): Observable<void> {
    return this.http.put(`${this.apiBaseUrl}/machines/${id}`, updates).pipe(
      map(() => void 0),
      tap(() => {
        console.log('📝 Updated machine:', id, updates);
        this.loadMachines().subscribe();
      })
    );
  }

  // Eliminar máquina
  deleteMachine(id: number): Observable<void> {
    return this.http.delete(`${this.apiBaseUrl}/machines/${id}`).pipe(
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
    area: string,
    excludeId?: number
  ): Promise<boolean> {
    const machines = await firstValueFrom(this.loadMachines());
    const existing = machines.find(
      (machine) => machine.name === name && machine.area === area
    );

    if (!existing) {
      return true;
    }

    if (excludeId && existing.id === excludeId) {
      return true;
    }

    return false;
  }
}
