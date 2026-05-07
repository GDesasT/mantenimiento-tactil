import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { CreateManualDto, Manual } from '../models';
import { normalizeManual, unwrapApiData } from './api-utils';

@Injectable({
  providedIn: 'root',
})
export class ManualService {
  private manualsSubject = new BehaviorSubject<Manual[]>([]);
  public manuals$ = this.manualsSubject.asObservable();

  private readonly apiBaseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  // Cargar todos los manuales
  loadManuals(): Observable<Manual[]> {
    return this.http.get(`${this.apiBaseUrl}/manuals`).pipe(
      map((response) => unwrapApiData<any[]>(response)),
      map((manuals) => manuals.map((manual) => normalizeManual(manual))),
      tap((manuals) => {
        console.log('📚 Loaded manuals:', manuals.length);
        this.manualsSubject.next(manuals);
      })
    );
  }

  // Obtener manual por ID
  getManualById(id: number): Observable<Manual | undefined> {
    return this.http.get(`${this.apiBaseUrl}/manuals/${id}`).pipe(
      map((response) => normalizeManual(unwrapApiData<any>(response)))
    );
  }

  // Crear nuevo manual
  createManual(data: CreateManualDto): Observable<Manual> {
    return this.http.post(`${this.apiBaseUrl}/manuals`, data).pipe(
      map((response) => normalizeManual(unwrapApiData<any>(response))),
      tap((manual) => {
        console.log('✅ Created manual:', manual.name);
        this.loadManuals().subscribe();
      })
    );
  }

  // Actualizar manual
  updateManual(id: number, updates: Partial<Manual>): Observable<void> {
    return this.http.put(`${this.apiBaseUrl}/manuals/${id}`, updates).pipe(
      map(() => void 0),
      tap(() => {
        console.log('📝 Updated manual:', id);
        this.loadManuals().subscribe();
      })
    );
  }

  // Eliminar manual
  deleteManual(id: number): Observable<void> {
    return this.http.delete(`${this.apiBaseUrl}/manuals/${id}`).pipe(
      map(() => void 0),
      tap(() => {
        console.log('🗑️ Deleted manual:', id);
        this.loadManuals().subscribe();
      })
    );
  }

  // Convertir File a base64 (se usa al subir, antes de guardar en disco)
  fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  }
}

