export interface Machine {
  id?: number;
  name: string;
  area: 'corte' | 'costura' | 'consumible';
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateMachineDto {
  name: string;
  area: 'corte' | 'costura' | 'consumible';
}
