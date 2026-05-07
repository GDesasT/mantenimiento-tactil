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
export class ChemicalService {
  private chemicalsSubject = new BehaviorSubject<Tool[]>([]);
  public chemicals$ = this.chemicalsSubject.asObservable();

  private readonly apiBaseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  // Cargar todos los químicos
  loadChemicals(): Observable<Tool[]> {
    return this.http.get(`${this.apiBaseUrl}/chemicals`).pipe(
      map((response) => unwrapApiData<any[]>(response)),
      map((chemicals) => chemicals.map((chemical) => normalizeTool(chemical))),
      tap((chemicals) => {
        console.log('🧪 Loaded chemicals:', chemicals);
        this.chemicalsSubject.next(chemicals);
      })
    );
  }

  // Obtener químico por ID
  getChemicalById(id: number): Observable<Tool | undefined> {
    return this.http.get(`${this.apiBaseUrl}/chemicals/${id}`).pipe(
      map((response) => normalizeTool(unwrapApiData<any>(response))),
      tap((chemical) => console.log('🔍 Found chemical:', chemical))
    );
  }

  // Crear nuevo químico
  createChemical(chemicalData: CreateToolDto): Observable<Tool> {
    return this.http.post(`${this.apiBaseUrl}/chemicals`, chemicalData).pipe(
      map((response) => normalizeTool(unwrapApiData<any>(response))),
      tap((chemical) => {
        console.log('✅ Created chemical:', chemical);
        this.loadChemicals().subscribe();
      })
    );
  }

  // Actualizar químico
  updateChemical(id: number, updates: Partial<Tool>): Observable<void> {
    return this.http.put(`${this.apiBaseUrl}/chemicals/${id}`, updates).pipe(
      map(() => void 0),
      tap(() => {
        console.log('📝 Updated chemical:', id, updates);
        this.loadChemicals().subscribe();
      })
    );
  }

  // Eliminar químico
  deleteChemical(id: number): Observable<void> {
    return this.http.delete(`${this.apiBaseUrl}/chemicals/${id}`).pipe(
      map(() => void 0),
      tap(() => {
        console.log('🗑️ Deleted chemical:', id);
        this.loadChemicals().subscribe();
      })
    );
  }

  // Validar nombre único
  async isNameUnique(name: string, excludeId?: number): Promise<boolean> {
    const chemicals = await firstValueFrom(this.loadChemicals());
    const existing = chemicals.find((chemical) => chemical.name === name);

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
    const normalizedQuery = query.toLowerCase();
    return this.loadChemicals().pipe(
      map((chemicals) =>
        chemicals.filter((chemical) => chemical.name.toLowerCase().includes(normalizedQuery))
      )
    );
  }
}
