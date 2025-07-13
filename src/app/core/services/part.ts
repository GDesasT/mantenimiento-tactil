import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { DatabaseService } from './database';
import { Part, CreatePartDto, PartCategory } from '../models';

@Injectable({
  providedIn: 'root',
})
export class PartService {
  private partsSubject = new BehaviorSubject<Part[]>([]);
  public parts$ = this.partsSubject.asObservable();

  constructor(private db: DatabaseService) {}

  // Cargar todas las refacciones
  loadParts(): Observable<Part[]> {
    return from(this.db.parts.orderBy('description').toArray()).pipe(
      tap((parts) => {
        console.log('📦 Loaded parts:', parts);
        this.partsSubject.next(parts);
      })
    );
  }

  // Obtener refacciones por máquina
  getPartsByMachine(machineId: number): Observable<Part[]> {
    return from(
      this.db.parts.where('machineId').equals(machineId).toArray()
    ).pipe(
      map((parts) =>
        parts.sort((a, b) => a.description.localeCompare(b.description))
      ),
      tap((parts) => console.log(`🔧 Parts for machine ${machineId}:`, parts))
    );
  }

  // Obtener refacciones por máquina y categoría
  getPartsByMachineAndCategory(
    machineId: number,
    category: PartCategory
  ): Observable<Part[]> {
    return from(
      this.db.parts
        .where(['machineId', 'category'])
        .equals([machineId, category])
        .toArray()
    ).pipe(
      map((parts) =>
        parts.sort((a, b) => a.description.localeCompare(b.description))
      ),
      tap((parts) =>
        console.log(`🔧 ${category} parts for machine ${machineId}:`, parts)
      )
    );
  }

  // Buscar refacciones
  searchParts(query: string, machineId?: number): Observable<Part[]> {
    const searchTerm = query.toLowerCase();

    return from(
      this.db.parts
        .filter((part) => {
          const matchesSearch =
            part.description.toLowerCase().includes(searchTerm) ||
            part.sapNumber.toLowerCase().includes(searchTerm) ||
            part.partNumber.toLowerCase().includes(searchTerm);

          const matchesMachine = !machineId || part.machineId === machineId;

          return matchesSearch && matchesMachine;
        })
        .toArray()
    ).pipe(tap((parts) => console.log(`🔍 Search "${query}":`, parts)));
  }

  // Obtener refacción por ID
  getPartById(id: number): Observable<Part | undefined> {
    return from(this.db.parts.get(id)).pipe(
      tap((part) => console.log('🔍 Found part:', part))
    );
  }

  // Crear nueva refacción
  createPart(partData: CreatePartDto): Observable<Part> {
    return from(
      this.db.parts
        .add(partData as Part)
        .then(
          (id) =>
            ({
              ...partData,
              id,
              createdAt: new Date(),
              updatedAt: new Date(),
            } as Part)
        )
    ).pipe(
      tap((part) => {
        console.log('✅ Created part:', part);
        this.loadParts().subscribe();
      })
    );
  }

  // Actualizar refacción
  updatePart(id: number, updates: Partial<Part>): Observable<void> {
    return from(this.db.parts.update(id, updates)).pipe(
      map(() => void 0),
      tap(() => {
        console.log('📝 Updated part:', id, updates);
        this.loadParts().subscribe();
      })
    );
  }

  // Eliminar refacción
  deletePart(id: number): Observable<void> {
    return from(this.db.parts.delete(id)).pipe(
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
    const existing = await this.db.parts
      .where('sapNumber')
      .equals(sapNumber)
      .first();

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
    const parts = await this.db.parts
      .where('machineId')
      .equals(machineId)
      .toArray();

    const stats = {
      mecanica: parts.filter((p) => p.category === 'mecanica').length,
      electronica: parts.filter((p) => p.category === 'electronica').length,
      consumible: parts.filter((p) => p.category === 'consumible').length,
    };

    console.log(`📊 Stats for machine ${machineId}:`, stats);
    return stats;
  }
}
