export interface Tool {
  id: number;
  name: string;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
  location: string;
}
export interface CreateToolDto {
  name: string;
  image?: string;
  location: string;
}