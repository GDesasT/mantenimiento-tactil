import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { CreateToolDto, Tool } from '../models';
import { normalizeTool, unwrapApiData } from './api-utils';

@Injectable({
  providedIn: 'root',
})
export class ToolService {
  private toolsSubject = new BehaviorSubject<Tool[]>([]);
  public tools$ = this.toolsSubject.asObservable();

  private readonly apiBaseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  // Cargar todas las herramientas
  loadTools(): Observable<Tool[]> {
    return this.http.get(`${this.apiBaseUrl}/tools`).pipe(
      map((response) => unwrapApiData<any[]>(response)),
      map((tools) => tools.map((tool) => normalizeTool(tool))),
      tap((tools) => {
        console.log('🛠️ Loaded tools:', tools);
        this.toolsSubject.next(tools);
      })
    );
  }

  // Obtener herramienta por ID
  getToolById(id: number): Observable<Tool | undefined> {
    return this.http.get(`${this.apiBaseUrl}/tools/${id}`).pipe(
      map((response) => normalizeTool(unwrapApiData<any>(response))),
      tap((tool) => console.log('🔍 Found tool:', tool))
    );
  }

  // Crear nueva herramienta
  createTool(toolData: CreateToolDto): Observable<Tool> {
    return this.http.post(`${this.apiBaseUrl}/tools`, toolData).pipe(
      map((response) => normalizeTool(unwrapApiData<any>(response))),
      tap((tool) => {
        console.log('✅ Created tool:', tool);
        this.loadTools().subscribe();
      })
    );
  }

  // Actualizar herramienta
  updateTool(id: number, updates: Partial<Tool>): Observable<void> {
    return this.http.put(`${this.apiBaseUrl}/tools/${id}`, updates).pipe(
      map(() => void 0),
      tap(() => {
        console.log('📝 Updated tool:', id, updates);
        this.loadTools().subscribe();
      })
    );
  }

  // Eliminar herramienta
  deleteTool(id: number): Observable<void> {
    return this.http.delete(`${this.apiBaseUrl}/tools/${id}`).pipe(
      map(() => void 0),
      tap(() => {
        console.log('🗑️ Deleted tool:', id);
        this.loadTools().subscribe();
      })
    );
  }

  // Validar nombre único
  async isNameUnique(name: string, excludeId?: number): Promise<boolean> {
    const tools = await firstValueFrom(this.loadTools());
    const existing = tools.find((tool) => tool.name === name);

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
    const normalizedQuery = query.toLowerCase();
    return this.loadTools().pipe(
      map((tools) =>
        tools.filter((tool) => tool.name.toLowerCase().includes(normalizedQuery))
      )
    );
  }
}
