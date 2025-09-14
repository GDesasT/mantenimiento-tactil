import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { DatabaseService } from './database';
import { Petition, CreatePetitionDto, PetitionStatus, Part } from '../models';

@Injectable({ providedIn: 'root' })
export class PetitionService {
  private petitionsSubject = new BehaviorSubject<Petition[]>([]);
  public petitions$ = this.petitionsSubject.asObservable();

  constructor(private db: DatabaseService) {}

  loadAll(): Observable<Petition[]> {
    return from(this.db.petitions.orderBy('createdAt').reverse().toArray()).pipe(
      tap((rows) => this.petitionsSubject.next(rows))
    );
  }

  create(data: CreatePetitionDto): Observable<Petition> {
    const petition: Omit<Petition, 'id'> = {
      ...data,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    return from(
      this.db.petitions.add(petition as Petition).then((id) => ({
        ...petition,
        id,
      }))
    ).pipe(tap(() => this.loadAll().subscribe()));
  }

  updateStatus(id: number, status: PetitionStatus): Observable<void> {
    return from(this.db.petitions.update(id, { status })).pipe(
      map(() => void 0),
      tap(() => this.loadAll().subscribe())
    );
  }

  delete(id: number): Observable<void> {
    return from(this.db.petitions.delete(id)).pipe(
      map(() => void 0),
      tap(() => this.loadAll().subscribe())
    );
  }

  // Utilidades de consulta
  getByStatus(status: PetitionStatus): Observable<Petition[]> {
    return from(
      this.db.petitions.where('status').equals(status).toArray()
    ).pipe(tap(() => {}));
  }
}
