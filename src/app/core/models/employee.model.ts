export interface Employee {
  id?: number; // Dexie PK
  employeeNumber: string; // e.g. '12345'
  name: string; // Nombre del empleado
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateEmployeeDto {
  employeeNumber: string;
  name: string;
}
