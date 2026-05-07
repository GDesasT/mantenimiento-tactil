# ToolRoom Pick-Up API Reference

Documentación técnica de la API RESTful del sistema ToolRoom Pick-Up. Esta guía está enfocada en operatividad en tiempo real: CRUDs, flujos logísticos, autenticación, respuestas y consultas corporativas.

## 1. Overview

**Base URL**

```http
http://tudominio.com/api
```

Todas las rutas de este documento ya incluyen el prefijo `/api`.

**Headers obligatorios**

```http
Accept: application/json
Content-Type: application/json
```

**Autenticación opcional o recomendada**

```http
Authorization: Bearer {tu_token_de_acceso}
```

## 2. Response Contract

### 2.1 Éxito

```json
{
	"success": true,
	"message": "Operación de registro exitosa",
	"data": {
		"id": 14,
		"nombre": "Objeto creado",
		"created_at": "2026-05-07T10:00:00.000000Z"
	}
}
```

### 2.2 Error de negocio o sistema

```json
{
	"success": false,
	"message": "El registro solicitado no fue encontrado en la base de datos."
}
```

### 2.3 Validación

```json
{
	"message": "The given data was invalid.",
	"errors": {
		"location": ["El campo ubicación es estrictamente requerido."],
		"stock": ["El stock debe ser un número entero válido superior a 0."]
	}
}
```

## 3. Resource Map

| Recurso | Propósito |
|---|---|
| petitions | Flujo de requisiciones, aprobación y entrega |
| parts | Refacciones y repuestos asociados a máquinas |
| tools | Herramientas reutilizables |
| fasteners | Tornillería y fijadores |
| chemicals | Químicos y consumibles regulados |
| manuals | Manuales PDF y documentación técnica |
| machines | Catálogo de máquinas industriales |
| categories | Clasificación de inventario |
| areas | Centros o áreas operativas |
| employees | Identificación de operadores |

## 4. Petitions Workflow

El corazón logístico del sistema. Estas rutas cubren la requisición, validación y ciclo de vida del pedido.

### 4.1 `GET /api/petitions`
Devuelve el historial completo o las peticiones activas.

**Respuesta típica**

```json
{
	"success": true,
	"message": "Listado de peticiones obtenido",
	"data": [
		{
			"id": 14,
			"employee_id": 102,
			"status": "pending",
			"remarks": "Urgente",
			"created_at": "2026-05-07T10:00:00.000000Z"
		}
	]
}
```

### 4.2 `POST /api/petitions`
Crea una nueva requisición.

**Payload**

```json
{
	"employee_id": 102,
	"remarks": "Urgente, la línea 3 está parada y necesitamos refacciones.",
	"items": [
		{
			"item_type": "part",
			"item_id": 45,
			"quantity": 2
		},
		{
			"item_type": "tool",
			"item_id": 8,
			"quantity": 1
		},
		{
			"item_type": "chemical",
			"item_id": 12,
			"quantity": 3
		}
	]
}
```

### 4.3 Transition Endpoints

| Endpoint | Estado resultante | Uso |
|---|---|---|
| `POST /api/petitions/{id}/approve` | `APPROVED` | Validación por supervisor |
| `POST /api/petitions/{id}/prepare` | `PREPARING` | Almacén comienza surtido |
| `POST /api/petitions/{id}/ready` | `READY` | Pedido listo para recogida |
| `POST /api/petitions/{id}/deliver` | `DELIVERED` | Entrega final al operador |
| `POST /api/petitions/{id}/reject` | `REJECTED` | Cancelación o rechazo |

## 5. Core Inventory CRUDs

### 5.1 Parts

#### `GET /api/parts`
Lista todas las refacciones.

#### `GET /api/parts/{id}`
Obtiene una refacción específica.

#### `POST /api/parts`
Registra una refacción.

```json
{
	"sap_number": "SAP-9812-B",
	"part_number": "PT-XYZ-01",
	"description": "Bomba de inyección de presión variable",
	"category_id": 3,
	"machine_id": 14,
	"location": "Bloque D - Gabinete 09",
	"stock": 25
}
```

#### `PUT /api/parts/{id}`
Actualiza parcial o totalmente una refacción.

#### `DELETE /api/parts/{id}`
Elimina la refacción. El backend puede usar soft delete según configuración.

### 5.2 Tools

| Método | Ruta |
|---|---|
| `GET` | `/api/tools` |
| `POST` | `/api/tools` |
| `PUT` | `/api/tools/{id}` |
| `DELETE` | `/api/tools/{id}` |

### 5.3 Fasteners

| Método | Ruta |
|---|---|
| `GET` | `/api/fasteners` |
| `POST` | `/api/fasteners` |
| `PUT` | `/api/fasteners/{id}` |
| `DELETE` | `/api/fasteners/{id}` |

### 5.4 Chemicals

| Método | Ruta |
|---|---|
| `GET` | `/api/chemicals` |
| `POST` | `/api/chemicals` |
| `PUT` | `/api/chemicals/{id}` |
| `DELETE` | `/api/chemicals/{id}` |

### 5.5 Manuals

| Método | Ruta |
|---|---|
| `GET` | `/api/manuals` |
| `POST` | `/api/manuals` |
| `PUT` | `/api/manuals/{id}` |
| `DELETE` | `/api/manuals/{id}` |

## 6. Support Tables

### 6.1 Machines

| Método | Ruta |
|---|---|
| `GET` | `/api/machines` |
| `POST` | `/api/machines` |

**Payload**

```json
{
	"name": "Brazo Robótico Ensamblador - Línea 4",
	"serial_number": "SNR-88910",
	"area_id": 2
}
```

### 6.2 Categories

| Método | Ruta |
|---|---|
| `GET` | `/api/categories` |

### 6.3 Areas

| Método | Ruta |
|---|---|
| `GET` | `/api/areas` |

## 7. Employees

### `POST /api/employees/find-or-create`
Busca un empleado por número de gafete o lo crea de forma automática.

**Payload**

```json
{
	"employee_number": "N788LKQ9",
	"name": "Nombre Temporal"
}
```

**Respuesta**

```json
{
	"success": true,
	"message": "Empleado procesado con éxito",
	"data": {
		"id": 850,
		"name": "Generico / Hallado",
		"employee_number": "N788LKQ9"
	}
}
```

## 8. Operational Notes

### 8.1 Reglas recomendadas
- Validar siempre `Content-Type: application/json`.
- Usar respuestas `422` para validación de campos obligatorios.
- Mantener `success`, `message` y `data` como contrato estable.
- No mezclar flujos de importación masiva con los endpoints operativos de tiempo real.

### 8.2 Integración frontend
- El frontend debe leer catálogos por `GET` y mutar por `POST`, `PUT`, `DELETE`.
- Las transiciones de petition deben ser acciones explícitas, no cambios directos de estado por UI.
- Los manuales deben manejarse como metadata + archivo asociado.

### 8.3 Decisiones de diseño para una buena API
- Endpoints cortos y predecibles.
- Nombres consistentes en plural.
- Estados de workflow encapsulados en rutas dedicadas.
- Respuestas homogéneas con wrapper.

## 9. Recommended Next Steps

1. Definir los modelos de respuesta finales para cada recurso.
2. Crear un OpenAPI/Swagger para esta especificación.
3. Implementar la API por capas, empezando por `machines`, `parts` y `petitions`.

