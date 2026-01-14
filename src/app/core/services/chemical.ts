import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { DatabaseService } from './database';
import { Tool, CreateToolDto } from '../models';

@Injectable({
  providedIn: 'root',
})
export class ChemicalService {
  private chemicalsSubject = new BehaviorSubject<Tool[]>([]);
  public chemicals$ = this.chemicalsSubject.asObservable();

  constructor(private db: DatabaseService) {}

  // Cargar todos los químicos
  loadChemicals(): Observable<Tool[]> {
    return from(this.db.chemicals.toArray()).pipe(
      tap((chemicals) => {
        console.log('🧪 Loaded chemicals:', chemicals);
        this.chemicalsSubject.next(chemicals);
      })
    );
  }

  // Obtener químico por ID
  getChemicalById(id: number): Observable<Tool | undefined> {
    return from(this.db.chemicals.get(id)).pipe(
      tap((chemical) => console.log('🔍 Found chemical:', chemical))
    );
  }

  // Crear nuevo químico
  createChemical(chemicalData: CreateToolDto): Observable<Tool> {
    return from(
      this.db.chemicals
        .add(chemicalData as Tool)
        .then(
          (id) =>
            ({
              ...chemicalData,
              id,
              createdAt: new Date(),
              updatedAt: new Date(),
            } as Tool)
        )
    ).pipe(
      tap((chemical) => {
        console.log('✅ Created chemical:', chemical);
        this.loadChemicals().subscribe();
      })
    );
  }

  // Actualizar químico
  updateChemical(id: number, updates: Partial<Tool>): Observable<void> {
    return from(this.db.chemicals.update(id, updates)).pipe(
      map(() => void 0),
      tap(() => {
        console.log('📝 Updated chemical:', id, updates);
        this.loadChemicals().subscribe();
      })
    );
  }

  // Eliminar químico
  deleteChemical(id: number): Observable<void> {
    return from(this.db.chemicals.delete(id)).pipe(
      map(() => void 0),
      tap(() => {
        console.log('🗑️ Deleted chemical:', id);
        this.loadChemicals().subscribe();
      })
    );
  }

  // Validar nombre único
  async isNameUnique(name: string, excludeId?: number): Promise<boolean> {
    const existing = await this.db.chemicals
      .where('name')
      .equals(name)
      .first();

    if (!existing) {
      return true;
    }

    if (excludeId && existing.id === excludeId) {
      return true;
    }

    return false;
  }

  // Obtener químicos por búsqueda
  searchChemicals(query: string): Observable<Tool[]> {
    return from(this.db.chemicals.toArray()).pipe(
      map((chemicals) =>
        chemicals.filter((chemical) =>
          chemical.name.toLowerCase().includes(query.toLowerCase())
        )
      )
    );
  }
}
