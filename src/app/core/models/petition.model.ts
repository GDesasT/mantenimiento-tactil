export type PetitionStatus = 'pending' | 'approved' | 'rejected';

export interface Petition {
  id?: number; // Dexie PK
  partId: number; // Refacción solicitada
  machineId: number; // Máquina relacionada
  employeeNumber: string; // Número de empleado que solicita
  employeeName: string; // Redundancia para facilitar lectura
  note?: string; // Opcional: comentario
  status: PetitionStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePetitionDto {
  partId: number;
  machineId: number;
  employeeNumber: string;
  employeeName: string;
  note?: string;
}
