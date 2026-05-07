export interface Machine {
  id?: number;
  name: string;
  area: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateMachineDto {
  name: string;
  area: string;
}
