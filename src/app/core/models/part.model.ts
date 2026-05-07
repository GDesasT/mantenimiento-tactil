export interface Part {
  id?: number;
  sapNumber: string;
  partNumber: string;
  description: string;
  category: string;
  categoryId?: number;
  machineId: number;
  location: string;
  image?: string;
  stock: number;
  minStock?: number;
  maxStock?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePartDto {
  sapNumber: string;
  partNumber: string;
  description: string;
  category: string;
  categoryId?: number;
  machineId: number;
  location: string;
  image?: string;
  stock?: number;
}

export type PartCategory = string;
