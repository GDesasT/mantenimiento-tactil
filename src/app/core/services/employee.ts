import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { DatabaseService } from './database';
import { Employee, CreateEmployeeDto } from '../models';

@Injectable({ providedIn: 'root' })
export class EmployeeService {
  private employeesSubject = new BehaviorSubject<Employee[]>([]);
  public employees$ = this.employeesSubject.asObservable();

  constructor(private db: DatabaseService) {}

  loadEmployees(): Observable<Employee[]> {
    return from(this.db.employees.orderBy('name').toArray()).pipe(
      tap((employees) => this.employeesSubject.next(employees))
    );
  }

  getByEmployeeNumber(employeeNumber: string): Observable<Employee | undefined> {
    return from(
      this.db.employees.where('employeeNumber').equals(employeeNumber).first()
    );
  }

  create(data: CreateEmployeeDto): Observable<Employee> {
    return from(
      this.db.employees.add(data as Employee).then((id) => ({
        ...data,
        id,
        createdAt: new Date(),
        updatedAt: new Date(),
      }))
    ).pipe(tap(() => this.loadEmployees().subscribe()));
  }
}
