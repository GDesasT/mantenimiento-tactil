import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { DatabaseService } from './database';
import { Tool, CreateToolDto } from '../models';

@Injectable({
  providedIn: 'root',
})
export class FastenerService {
  private fastenersSubject = new BehaviorSubject<Tool[]>([]);
  public fasteners$ = this.fastenersSubject.asObservable();

  constructor(private db: DatabaseService) {}

  // Cargar todos los tornillos
  loadFasteners(): Observable<Tool[]> {
    return from(this.db.fasteners.toArray()).pipe(
      tap((fasteners) => {
        console.log('⚙️ Loaded fasteners:', fasteners);
        this.fastenersSubject.next(fasteners);
      })
    );
  }

  // Obtener tornillo por ID
  getFastenerById(id: number): Observable<Tool | undefined> {
    return from(this.db.fasteners.get(id)).pipe(
      tap((fastener) => console.log('🔍 Found fastener:', fastener))
    );
  }

  // Crear nuevo tornillo
  createFastener(fastenerData: CreateToolDto): Observable<Tool> {
    return from(
      this.db.fasteners
        .add(fastenerData as Tool)
        .then(
          (id) =>
            ({
              ...fastenerData,
              id,
              createdAt: new Date(),
              updatedAt: new Date(),
            } as Tool)
        )
    ).pipe(
      tap((fastener) => {
        console.log('✅ Created fastener:', fastener);
        this.loadFasteners().subscribe();
      })
    );
  }

  // Actualizar tornillo
  updateFastener(id: number, updates: Partial<Tool>): Observable<void> {
    return from(this.db.fasteners.update(id, updates)).pipe(
      map(() => void 0),
      tap(() => {
        console.log('📝 Updated fastener:', id, updates);
        this.loadFasteners().subscribe();
      })
    );
  }

  // Eliminar tornillo
  deleteFastener(id: number): Observable<void> {
    return from(this.db.fasteners.delete(id)).pipe(
      map(() => void 0),
      tap(() => {
        console.log('🗑️ Deleted fastener:', id);
        this.loadFasteners().subscribe();
      })
    );
  }

  // Validar nombre único
  async isNameUnique(name: string, excludeId?: number): Promise<boolean> {
    const existing = await this.db.fasteners
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

  // Obtener tornillos por búsqueda
  searchFasteners(query: string): Observable<Tool[]> {
    return from(this.db.fasteners.toArray()).pipe(
      map((fasteners) =>
        fasteners.filter((fastener) =>
          fastener.name.toLowerCase().includes(query.toLowerCase())
        )
      )
    );
  }
}
