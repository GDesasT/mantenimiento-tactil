import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Area } from '../models/area.model';
import { unwrapApiData } from './api-utils';

@Injectable({
  providedIn: 'root',
})
export class AreaService {
  private areasSubject = new BehaviorSubject<Area[]>([]);
  public areas$ = this.areasSubject.asObservable();

  private readonly apiBaseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  loadAreas(): Observable<Area[]> {
    return this.http.get(`${this.apiBaseUrl}/areas`).pipe(
      map((response) => unwrapApiData<any[]>(response)),
      map((areas) => areas.map(a => ({
        id: a.id,
        name: a.name ?? a.nombre,
        description: a.description ?? a.descripcion,
        createdAt: a.created_at ? new Date(a.created_at) : undefined,
        updatedAt: a.updated_at ? new Date(a.updated_at) : undefined
      }))),
      tap((areas) => {
        this.areasSubject.next(areas);
      })
    );
  }
}
