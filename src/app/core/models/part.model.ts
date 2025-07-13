export interface Part {
  id?: number;
  sapNumber: string;
  partNumber: string;
  description: string;
  category: 'mecanica' | 'electronica' | 'consumible';
  machineId: number;
  location: string;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePartDto {
  sapNumber: string;
  partNumber: string;
  description: string;
  category: 'mecanica' | 'electronica' | 'consumible';
  machineId: number;
  location: string;
  image?: string;
}

export type PartCategory = 'mecanica' | 'electronica' | 'consumible';
