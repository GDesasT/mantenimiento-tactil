import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { CreatePartDto, Part, PartCategory } from '../models';
import { normalizePart, unwrapApiData } from './api-utils';

@Injectable({
  providedIn: 'root',
})
export class PartService {
  private partsSubject = new BehaviorSubject<Part[]>([]);
  public parts$ = this.partsSubject.asObservable();

  private readonly apiBaseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  // Cargar todas las refacciones
  loadParts(): Observable<Part[]> {
    return this.http.get(`${this.apiBaseUrl}/parts`).pipe(
      map((response) => unwrapApiData<any[]>(response)),
      map((parts) => parts.map((part) => normalizePart(part))),
      tap((parts) => {
        console.log('📦 Loaded parts:', parts);
        this.partsSubject.next(parts);
      })
    );
  }

  // Obtener refacciones por máquina
  getPartsByMachine(machineId: number): Observable<Part[]> {
    return this.loadParts().pipe(
      map((parts) =>
        parts.sort((a, b) => a.description.localeCompare(b.description))
      ),
      map((parts) => parts.filter((part) => part.machineId === machineId)),
      tap((parts) => console.log(`🔧 Parts for machine ${machineId}:`, parts))
    );
  }

  // Obtener refacciones por máquina y categoría
  getPartsByMachineAndCategory(
    machineId: number,
    category: PartCategory
  ): Observable<Part[]> {
    return this.loadParts().pipe(
      map((parts) =>
        parts.sort((a, b) => a.description.localeCompare(b.description))
      ),
      map((parts) =>
        parts.filter(
          (part) => part.machineId === machineId && part.category === category
        )
      ),
      tap((parts) =>
        console.log(`🔧 ${category} parts for machine ${machineId}:`, parts)
      )
    );
  }

  // Buscar refacciones
  searchParts(query: string, machineId?: number): Observable<Part[]> {
    const searchTerm = query.toLowerCase();

    return this.loadParts().pipe(
      map((parts) =>
        parts.filter((part) => {
          const matchesSearch =
            part.description.toLowerCase().includes(searchTerm) ||
            part.sapNumber.toLowerCase().includes(searchTerm) ||
            part.partNumber.toLowerCase().includes(searchTerm);

          const matchesMachine = !machineId || part.machineId === machineId;

          return matchesSearch && matchesMachine;
        })
      ),
      tap((parts) => console.log(`🔍 Search "${query}":`, parts))
    );
  }

  // Obtener refacción por ID
  getPartById(id: number): Observable<Part | undefined> {
    return this.http.get(`${this.apiBaseUrl}/parts/${id}`).pipe(
      map((response) => normalizePart(unwrapApiData<any>(response))),
      tap((part) => console.log('🔍 Found part:', part))
    );
  }

  // Crear nueva refacción
  createPart(partData: CreatePartDto): Observable<Part> {
    const payload = {
      sap_number: partData.sapNumber,
      part_number: partData.partNumber,
      description: partData.description,
      category_id: partData.categoryId ?? (partData.category === 'mecanica' ? 1 : partData.category === 'electronica' ? 2 : partData.category === 'consumible' ? 3 : 1),
      machine_id: partData.machineId,
      location: partData.location,
      image: partData.image ?? '',
      stock: partData.stock ?? 0,
    };

    return this.http.post(`${this.apiBaseUrl}/parts`, payload).pipe(
      map((response) => normalizePart(unwrapApiData<any>(response))),
      tap((part) => {
        console.log('✅ Created part:', part);
        this.loadParts().subscribe();
      })
    );
  }

  // Actualizar refacción
  updatePart(id: number, updates: Partial<Part>): Observable<void> {
    const payload = {
      ...(updates.sapNumber ? { sap_number: updates.sapNumber } : {}),
      ...(updates.partNumber ? { part_number: updates.partNumber } : {}),
      ...(updates.description ? { description: updates.description } : {}),
      ...(updates.categoryId || updates.category ? { category_id: updates.categoryId ?? (updates.category === 'mecanica' ? 1 : updates.category === 'electronica' ? 2 : updates.category === 'consumible' ? 3 : 1) } : {}),
      ...(updates.machineId ? { machine_id: updates.machineId } : {}),
      ...(updates.location ? { location: updates.location } : {}),
      ...(updates.image !== undefined ? { image: updates.image } : {}),
      ...(updates.stock !== undefined ? { stock: updates.stock } : {}),
    };

    return this.http.put(`${this.apiBaseUrl}/parts/${id}`, payload).pipe(
      map(() => void 0),
      tap(() => {
        console.log('📝 Updated part:', id, updates);
        this.loadParts().subscribe();
      })
    );
  }

  // Eliminar refacción
  deletePart(id: number): Observable<void> {
    return this.http.delete(`${this.apiBaseUrl}/parts/${id}`).pipe(
      map(() => void 0),
      tap(() => {
        console.log('🗑️ Deleted part:', id);
        this.loadParts().subscribe();
      })
    );
  }

  // Validar SAP único
  async isSapNumberUnique(
    sapNumber: string,
    excludeId?: number
  ): Promise<boolean> {
    const parts = await firstValueFrom(this.loadParts());
    const existing = parts.find((part) => part.sapNumber === sapNumber);

    if (!existing) {
      return true;
    }

    if (excludeId && existing.id === excludeId) {
      return true;
    }

    return false;
  }

  // Obtener estadísticas
  async getPartStats(
    machineId: number
  ): Promise<{ [key in PartCategory]: number }> {
    const parts = await firstValueFrom(this.loadParts());
    const machineParts = parts.filter((part) => part.machineId === machineId);

    const stats = {
      mecanica: machineParts.filter((p) => p.category === 'mecanica').length,
      electronica: machineParts.filter((p) => p.category === 'electronica').length,
      consumible: machineParts.filter((p) => p.category === 'consumible').length,
    };

    console.log(`📊 Stats for machine ${machineId}:`, stats);
    return stats;
  }
}
