import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Category } from '../models/category.model';
import { unwrapApiData } from './api-utils';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private categoriesSubject = new BehaviorSubject<Category[]>([]);
  public categories$ = this.categoriesSubject.asObservable();

  private readonly apiBaseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  loadCategories(): Observable<Category[]> {
    return this.http.get(`${this.apiBaseUrl}/categories`).pipe(
      map((response) => unwrapApiData<any[]>(response)),
      map((categories) => categories.map(c => ({
        id: c.id,
        name: c.name ?? c.nombre,
        description: c.description ?? c.descripcion,
        createdAt: c.created_at ? new Date(c.created_at) : undefined,
        updatedAt: c.updated_at ? new Date(c.updated_at) : undefined
      }))),
      tap((categories) => {
        this.categoriesSubject.next(categories);
      })
    );
  }
}
