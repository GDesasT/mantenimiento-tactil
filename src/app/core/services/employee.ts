import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { CreateEmployeeDto, Employee } from '../models';
import { normalizeEmployee, unwrapApiData } from './api-utils';

@Injectable({ providedIn: 'root' })
export class EmployeeService {
  private employeesSubject = new BehaviorSubject<Employee[]>([]);
  public employees$ = this.employeesSubject.asObservable();

  private readonly apiBaseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  loadEmployees(): Observable<Employee[]> {
    return this.http.get(`${this.apiBaseUrl}/employees`).pipe(
      map((response) => unwrapApiData<any[]>(response)),
      map((employees) => employees.map((employee) => normalizeEmployee(employee))),
      tap((employees) => this.employeesSubject.next(employees))
    );
  }

  getByEmployeeNumber(employeeNumber: string): Observable<Employee | undefined> {
    return this.loadEmployees().pipe(
      map((employees) => employees.find((employee) => employee.employeeNumber === employeeNumber))
    );
  }

  create(data: CreateEmployeeDto): Observable<Employee> {
    return this.http.post(`${this.apiBaseUrl}/employees/find-or-create`, {
      employee_number: data.employeeNumber,
      name: data.name,
    }).pipe(
      map((response) => normalizeEmployee(unwrapApiData<any>(response))),
      tap((employee) => {
        this.employeesSubject.next([employee]);
        this.loadEmployees().subscribe();
      })
    );
  }
}
