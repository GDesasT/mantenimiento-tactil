export interface Machine {
  id?: number;
  name: string;
  area: 'corte' | 'costura';
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateMachineDto {
  name: string;
  area: 'corte' | 'costura';
}
