import { Machine } from '../models/machine.model';
import { Part } from '../models/part.model';
import { Employee } from '../models/employee.model';
import { Petition } from '../models/petition.model';
import { Tool } from '../models/tools';
import { Manual } from '../models/manual.model';

type AnyRecord = Record<string, any>;

export function unwrapApiData<T>(response: any): T {
  if (response && typeof response === 'object' && 'data' in response) {
    const payload = response.data;

    if (payload && typeof payload === 'object' && 'data' in payload && Array.isArray(payload.data)) {
      return payload.data as T;
    }

    return payload as T;
  }

  return response as T;
}

export function normalizeDateValue(value: any): Date {
  if (!value) {
    return new Date();
  }

  return value instanceof Date ? value : new Date(value);
}

export function normalizeMachine(item: AnyRecord): Machine {
  const record = item as any;

  // Intentamos obtener el área desde varias posibles propiedades
  let areaName = record.area ?? record.area_name ?? record.Area ?? record.areaName;
  if (!areaName && record.area_id) {
     // Si solo viene el ID pero no el nombre, esto puede causar problemas, pero por ahora lo convertimos a string o dejamos default
     areaName = 'area-' + record.area_id;
  }

  return {
    id: record.id,
    name: record.name ?? record.Nombre ?? '',
    area: areaName ?? 'costura',
    createdAt: normalizeDateValue(record.createdAt ?? record.created_at),
    updatedAt: normalizeDateValue(record.updatedAt ?? record.updated_at),
  };
}

export function normalizePart(item: AnyRecord): Part {
  const record = item as any;

  // Intentar mapear category_id a nombre de categoría si es posible
  let catName = record.category ?? record.category_name;
  if (!catName && record.category_id) {
    if (record.category_id === 1) catName = 'mecanica';
    else if (record.category_id === 2) catName = 'electronica';
    else if (record.category_id === 3) catName = 'consumible';
    else catName = 'mecanica'; // fallback
  }

  return {
    id: record.id,
    sapNumber: record.sapNumber ?? record.sap_number ?? record.SAP ?? '',
    partNumber: record.partNumber ?? record.part_number ?? record['#PARTE'] ?? '',
    description: record.description ?? record.descripcion ?? record.DESCRIPCION ?? '',
    category: catName ?? 'mecanica',
    categoryId: record.categoryId ?? record.category_id,
    machineId: Number(record.machineId ?? record.machine_id ?? 0),
    location: record.location ?? record.ubicacion ?? '',
    image: record.image ?? record.imagen ?? '',
    stock: Number(record.stock ?? 0),
    minStock: record.minStock ?? record.min_stock,
    maxStock: record.maxStock ?? record.max_stock,
    createdAt: normalizeDateValue(record.createdAt ?? record.created_at),
    updatedAt: normalizeDateValue(record.updatedAt ?? record.updated_at),
  };
}

export function normalizeEmployee(item: AnyRecord): Employee {
  const record = item as any;

  return {
    id: record.id,
    employeeNumber: record.employeeNumber ?? record.employee_number ?? '',
    name: record.name ?? '',
    createdAt: normalizeDateValue(record.createdAt ?? record.created_at),
    updatedAt: normalizeDateValue(record.updatedAt ?? record.updated_at),
  };
}

export function normalizePetition(item: AnyRecord): Petition {
  const record = item as any;

  return {
    id: record.id,
    partId: Number(record.partId ?? record.part_id ?? 0),
    machineId: Number(record.machineId ?? record.machine_id ?? 0),
    employeeNumber: record.employeeNumber ?? record.employee_number ?? '',
    employeeName: record.employeeName ?? record.employee_name ?? '',
    note: record.note ?? record.remarks ?? '',
    status: record.status ?? 'pending',
    createdAt: normalizeDateValue(record.createdAt ?? record.created_at),
    updatedAt: normalizeDateValue(record.updatedAt ?? record.updated_at),
  };
}

export function normalizeTool(item: AnyRecord): Tool {
  const record = item as any;

  return {
    id: record.id,
    name: record.name ?? '',
    image: record.image ?? '',
    location: record.location ?? '',
    createdAt: normalizeDateValue(record.createdAt ?? record.created_at),
    updatedAt: normalizeDateValue(record.updatedAt ?? record.updated_at),
  };
}

export function normalizeManual(item: AnyRecord): Manual {
  const record = item as any;
  const rawPdfData = record.pdfData ?? record.pdf_data ?? '';
  const pdfData =
    typeof rawPdfData === 'string' &&
    rawPdfData &&
    !rawPdfData.startsWith('data:') &&
    !rawPdfData.startsWith('http') &&
    !rawPdfData.startsWith('file:')
      ? `data:application/pdf;base64,${rawPdfData}`
      : rawPdfData;

  return {
    id: record.id,
    name: record.name ?? '',
    description: record.description ?? '',
    category: record.category ?? '',
    fileName: record.fileName ?? record.file_name ?? '',
    pdfData,
    createdAt: normalizeDateValue(record.createdAt ?? record.created_at),
    updatedAt: normalizeDateValue(record.updatedAt ?? record.updated_at),
  };
}
