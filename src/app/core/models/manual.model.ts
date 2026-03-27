export interface Manual {
  id: number;
  name: string;
  description?: string;
  category: string;
  fileName: string;
  pdfData: string; // base64
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateManualDto {
  name: string;
  description?: string;
  category: string;
  fileName: string;
  pdfData: string; // base64
}
