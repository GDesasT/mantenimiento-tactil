import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { DatabaseService } from './database';
import { Tool, CreateToolDto } from '../models';

@Injectable({
  providedIn: 'root',
})
export class ToolService {
  private toolsSubject = new BehaviorSubject<Tool[]>([]);
  public tools$ = this.toolsSubject.asObservable();

  constructor(private db: DatabaseService) {}

  // Cargar todas las herramientas
  loadTools(): Observable<Tool[]> {
    return from(this.db.tools.toArray()).pipe(
      tap((tools) => {
        console.log('🛠️ Loaded tools:', tools);
        this.toolsSubject.next(tools);
      })
    );
  }

  // Obtener herramienta por ID
  getToolById(id: number): Observable<Tool | undefined> {
    return from(this.db.tools.get(id)).pipe(
      tap((tool) => console.log('🔍 Found tool:', tool))
    );
  }

  // Crear nueva herramienta
  createTool(toolData: CreateToolDto): Observable<Tool> {
    return from(
      this.db.tools
        .add(toolData as Tool)
        .then(
          (id) =>
            ({
              ...toolData,
              id,
              createdAt: new Date(),
              updatedAt: new Date(),
            } as Tool)
        )
    ).pipe(
      tap((tool) => {
        console.log('✅ Created tool:', tool);
        this.loadTools().subscribe();
      })
    );
  }

  // Actualizar herramienta
  updateTool(id: number, updates: Partial<Tool>): Observable<void> {
    return from(this.db.tools.update(id, updates)).pipe(
      map(() => void 0),
      tap(() => {
        console.log('📝 Updated tool:', id, updates);
        this.loadTools().subscribe();
      })
    );
  }

  // Eliminar herramienta
  deleteTool(id: number): Observable<void> {
    return from(this.db.tools.delete(id)).pipe(
      map(() => void 0),
      tap(() => {
        console.log('🗑️ Deleted tool:', id);
        this.loadTools().subscribe();
      })
    );
  }

  // Validar nombre único
  async isNameUnique(name: string, excludeId?: number): Promise<boolean> {
    const existing = await this.db.tools
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

  // Obtener herramientas por búsqueda
  searchTools(query: string): Observable<Tool[]> {
    return from(this.db.tools.toArray()).pipe(
      map((tools) =>
        tools.filter((tool) =>
          tool.name.toLowerCase().includes(query.toLowerCase())
        )
      )
    );
  }
}
