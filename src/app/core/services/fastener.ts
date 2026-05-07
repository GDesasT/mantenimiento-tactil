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
export class FastenerService {
  private fastenersSubject = new BehaviorSubject<Tool[]>([]);
  public fasteners$ = this.fastenersSubject.asObservable();

  private readonly apiBaseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  // Cargar todos los tornillos
  loadFasteners(): Observable<Tool[]> {
    return this.http.get(`${this.apiBaseUrl}/fasteners`).pipe(
      map((response) => unwrapApiData<any[]>(response)),
      map((fasteners) => fasteners.map((fastener) => normalizeTool(fastener))),
      tap((fasteners) => {
        console.log('⚙️ Loaded fasteners:', fasteners);
        this.fastenersSubject.next(fasteners);
      })
    );
  }

  // Obtener tornillo por ID
  getFastenerById(id: number): Observable<Tool | undefined> {
    return this.http.get(`${this.apiBaseUrl}/fasteners/${id}`).pipe(
      map((response) => normalizeTool(unwrapApiData<any>(response))),
      tap((fastener) => console.log('🔍 Found fastener:', fastener))
    );
  }

  // Crear nuevo tornillo
  createFastener(fastenerData: CreateToolDto): Observable<Tool> {
    return this.http.post(`${this.apiBaseUrl}/fasteners`, fastenerData).pipe(
      map((response) => normalizeTool(unwrapApiData<any>(response))),
      tap((fastener) => {
        console.log('✅ Created fastener:', fastener);
        this.loadFasteners().subscribe();
      })
    );
  }

  // Actualizar tornillo
  updateFastener(id: number, updates: Partial<Tool>): Observable<void> {
    return this.http.put(`${this.apiBaseUrl}/fasteners/${id}`, updates).pipe(
      map(() => void 0),
      tap(() => {
        console.log('📝 Updated fastener:', id, updates);
        this.loadFasteners().subscribe();
      })
    );
  }

  // Eliminar tornillo
  deleteFastener(id: number): Observable<void> {
    return this.http.delete(`${this.apiBaseUrl}/fasteners/${id}`).pipe(
      map(() => void 0),
      tap(() => {
        console.log('🗑️ Deleted fastener:', id);
        this.loadFasteners().subscribe();
      })
    );
  }

  // Validar nombre único
  async isNameUnique(name: string, excludeId?: number): Promise<boolean> {
    const fasteners = await firstValueFrom(this.loadFasteners());
    const existing = fasteners.find((fastener) => fastener.name === name);

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
    const normalizedQuery = query.toLowerCase();
    return this.loadFasteners().pipe(
      map((fasteners) =>
        fasteners.filter((fastener) => fastener.name.toLowerCase().includes(normalizedQuery))
      )
    );
  }
}
