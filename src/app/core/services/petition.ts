import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { CreatePetitionDto, Petition, PetitionStatus } from '../models';
import { normalizePetition, unwrapApiData } from './api-utils';

@Injectable({ providedIn: 'root' })
export class PetitionService {
  private petitionsSubject = new BehaviorSubject<Petition[]>([]);
  public petitions$ = this.petitionsSubject.asObservable();

  private readonly apiBaseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  loadAll(): Observable<Petition[]> {
    return this.http.get(`${this.apiBaseUrl}/petitions`).pipe(
      map((response) => unwrapApiData<any[]>(response)),
      map((rows) => rows.map((row) => normalizePetition(row))),
      tap((rows) => this.petitionsSubject.next(rows))
    );
  }

  create(data: CreatePetitionDto): Observable<Petition> {
    const payload = {
      employee_id: data.employeeId ?? Number(data.employeeNumber),
      remarks: data.note ?? '',
      items: [
        {
          item_type: 'part',
          item_id: data.partId,
          quantity: 1,
        },
      ],
    };

    return this.http.post(`${this.apiBaseUrl}/petitions`, payload).pipe(
      map((response) => normalizePetition(unwrapApiData<any>(response))),
      tap(() => this.loadAll().subscribe())
    );
  }

  updateStatus(id: number, status: PetitionStatus): Observable<void> {
    const transitions: Partial<Record<PetitionStatus, string>> = {
      approved: 'approve',
      preparing: 'prepare',
      ready: 'ready',
      delivered: 'deliver',
      rejected: 'reject',
      pending: 'approve',
    };

    const action = transitions[status] || 'approve';

    return this.http.post(`${this.apiBaseUrl}/petitions/${id}/${action}`, {}).pipe(
      map(() => void 0),
      tap(() => this.loadAll().subscribe())
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete(`${this.apiBaseUrl}/petitions/${id}`).pipe(
      map(() => void 0),
      tap(() => this.loadAll().subscribe())
    );
  }

  // Utilidades de consulta
  getByStatus(status: PetitionStatus): Observable<Petition[]> {
    return this.loadAll().pipe(
      map((rows) => rows.filter((row) => row.status === status))
    );
  }
}
