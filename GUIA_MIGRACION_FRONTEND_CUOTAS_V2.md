# Guía de Migración Frontend - Sistema de Cuotas V2

**Versión**: 2.0
**Fecha**: 29 de Enero de 2026
**Autor**: Equipo Backend SIGESDA
**Audiencia**: Desarrolladores Frontend

---

## Tabla de Contenidos

1. [Resumen Ejecutivo](#1-resumen-ejecutivo)
2. [Cambios en la Estructura de Datos](#2-cambios-en-la-estructura-de-datos)
3. [Interfaces TypeScript Actualizadas](#3-interfaces-typescript-actualizadas)
4. [Formato de Respuesta del Backend](#4-formato-de-respuesta-del-backend)
5. [Endpoints Actualizados - Referencia Completa](#5-endpoints-actualizados---referencia-completa)
6. [Guía de Migración Paso a Paso](#6-guía-de-migración-paso-a-paso)
7. [Ejemplos de Código Frontend](#7-ejemplos-de-código-frontend)
8. [Casos de Uso Comunes](#8-casos-de-uso-comunes)
9. [Troubleshooting y FAQ](#9-troubleshooting-y-faq)

---

## 1. Resumen Ejecutivo

### Cambios Críticos

El backend ha sido actualizado para incluir **dos nuevas relaciones críticas** en todos los endpoints que devuelven cuotas:

1. **Tipos de Persona (Architecture V2)**: Los datos del receptor ahora incluyen `tipos[]` que contiene la información completa del tipo de persona (SOCIO, NO_SOCIO, DOCENTE, PROVEEDOR) y su categoría asociada.

2. **Ítems de Cuota**: Todas las cuotas ahora incluyen `items[]` con el desglose detallado de cada concepto (cuota base, actividades, descuentos, recargos).

### Impacto en el Frontend

**ALTO** - Requiere actualización de:
- Interfaces TypeScript
- Servicios/API layer
- Componentes de visualización
- Lógica de filtrado y búsqueda

### Prioridad

**CRÍTICA** - El frontend actualmente muestra:
- ❌ Tipo de persona incorrecto ("NO-Socio" para todos)
- ❌ Actividades no visibles (falta `items[]`)
- ❌ Totales incorrectos (campos deprecated `montoBase`, `montoActividades`)

### Timeline Recomendado

- **Día 1-2**: Actualizar interfaces y servicios
- **Día 3-4**: Modificar componentes de UI
- **Día 5**: Testing y validación
- **Total**: 1 semana

---

## 2. Cambios en la Estructura de Datos

### 2.1. Antes vs Después - Comparación Visual

#### ANTES (Estructura antigua)

```json
{
  "success": true,
  "data": [
    {
      "id": 665,
      "reciboId": 665,
      "mes": 2,
      "anio": 2026,
      "categoriaId": 2,
      "montoBase": "5000",        // ❌ DEPRECATED
      "montoActividades": "0",    // ❌ DEPRECATED
      "montoTotal": "7200.01",
      "recibo": {
        "receptor": {
          "id": 44,
          "nombre": "Daniel",
          "apellido": "Gómez",
          "dni": "40000133",
          "numeroSocio": 133,
          "categoria": null       // ❌ LEGACY FIELD (enum obsoleto)
          // ❌ FALTA: tipos[]
        }
      }
      // ❌ FALTA: items[]
      // ❌ FALTA: categoria (relación completa)
    }
  ]
}
```

#### DESPUÉS (Estructura nueva - 29/01/2026)

```json
{
  "success": true,
  "data": [
    {
      "id": 665,
      "reciboId": 665,
      "mes": 2,
      "anio": 2026,
      "categoriaId": 2,
      "montoBase": null,          // ✅ NUEVO: null (campo legacy)
      "montoActividades": null,   // ✅ NUEVO: null (campo legacy)
      "montoTotal": "7200.01",
      "categoria": {              // ✅ NUEVO: Relación completa
        "id": 2,
        "codigo": "ESTUDIANTE",
        "nombre": "Estudiante",
        "descripcion": "Socio estudiante con descuento",
        "montoCuota": "5000",
        "descuento": "20",
        "activa": true
      },
      "recibo": {
        "receptor": {
          "id": 44,
          "nombre": "Daniel",
          "apellido": "Gómez",
          "dni": "40000133",
          "numeroSocio": 133,
          "categoria": null,      // Legacy (mantener para compatibilidad)
          "tipos": [              // ✅ NUEVO: Architecture V2
            {
              "id": 45,
              "personaId": 44,
              "tipoPersonaId": 2,
              "activo": true,
              "categoriaId": 2,
              "fechaAsignacion": "2026-01-15T16:00:44.420Z",
              "tipoPersona": {    // ✅ Información del tipo
                "id": 2,
                "codigo": "SOCIO",
                "nombre": "Socio",
                "descripcion": "Socio del club con derechos y obligaciones",
                "requiresCategoria": true
              },
              "categoria": {      // ✅ Categoría del socio
                "id": 2,
                "codigo": "ESTUDIANTE",
                "nombre": "Estudiante",
                "montoCuota": "5000",
                "descuento": "20"
              }
            }
          ]
        }
      },
      "items": [                  // ✅ NUEVO: Desglose de la cuota
        {
          "id": 673,
          "cuotaId": 665,
          "tipoItemId": 1,
          "concepto": "Cuota base Estudiante",
          "monto": "5000",
          "cantidad": "1",
          "porcentaje": null,
          "esAutomatico": true,
          "esEditable": false,
          "tipoItem": {
            "id": 1,
            "codigo": "CUOTA_BASE_SOCIO",
            "nombre": "Cuota Base Socio",
            "descripcion": "Cuota mensual base según categoría de socio",
            "categoriaItem": {
              "id": 1,
              "codigo": "BASE",
              "nombre": "Cuota Base",
              "icono": "💰",
              "color": "blue"
            }
          },
          "metadata": {
            "categoriaId": 2,
            "categoriaCodigo": "ESTUDIANTE"
          }
        },
        {
          "id": 674,
          "cuotaId": 665,
          "tipoItemId": 5,
          "concepto": "Actividad: Guitarra Nivel Básico",
          "monto": "2500",
          "cantidad": "1",
          "tipoItem": {
            "codigo": "ACTIVIDAD_INDIVIDUAL",
            "nombre": "Actividad Individual",
            "categoriaItem": {
              "codigo": "ACTIVIDAD",
              "nombre": "Actividades",
              "icono": "🎵"
            }
          },
          "metadata": {
            "actividadId": 12,
            "actividadNombre": "Guitarra Nivel Básico"
          }
        },
        {
          "id": 675,
          "cuotaId": 665,
          "tipoItemId": 8,
          "concepto": "Descuento Familiar (15%)",
          "monto": "-300.99",     // ✅ Negativo para descuentos
          "cantidad": "1",
          "porcentaje": "15",
          "tipoItem": {
            "codigo": "DESCUENTO_FAMILIAR",
            "nombre": "Descuento Familiar",
            "categoriaItem": {
              "codigo": "DESCUENTO",
              "nombre": "Descuentos",
              "icono": "🎁"
            }
          },
          "metadata": {
            "reglaId": 3,
            "reglaNombre": "Descuento 2 o más familiares"
          }
        }
      ]
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 350,
    "totalPages": 35,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

### 2.2. Campos Nuevos - Referencia Rápida

| Campo | Ubicación | Tipo | Descripción |
|-------|-----------|------|-------------|
| `tipos[]` | `recibo.receptor.tipos` | Array | Tipos de persona activos (Architecture V2) |
| `tipoPersona` | `recibo.receptor.tipos[].tipoPersona` | Object | Información del tipo (SOCIO, NO_SOCIO, etc.) |
| `categoria` (en tipo) | `recibo.receptor.tipos[].categoria` | Object | Categoría del socio (ACTIVO, ESTUDIANTE, etc.) |
| `categoria` (en cuota) | `categoria` | Object | Categoría de la cuota (relación completa) |
| `items[]` | `items` | Array | Desglose de conceptos de la cuota |
| `tipoItem` | `items[].tipoItem` | Object | Tipo de ítem (CUOTA_BASE, ACTIVIDAD, DESCUENTO) |
| `categoriaItem` | `items[].tipoItem.categoriaItem` | Object | Categoría del ítem (BASE, ACTIVIDAD, DESCUENTO) |

### 2.3. Campos Deprecated (No usar)

| Campo | Estado | Valor Actual | Alternativa |
|-------|--------|--------------|-------------|
| `montoBase` | DEPRECATED | `null` | Usar `items[]` con `tipoItem.codigo = "CUOTA_BASE_SOCIO"` |
| `montoActividades` | DEPRECATED | `null` | Usar `items[]` con `categoriaItem.codigo = "ACTIVIDAD"` |
| `receptor.categoria` | LEGACY | `null` o enum | Usar `receptor.tipos[0].categoria` |

---

## 3. Interfaces TypeScript Actualizadas

### 3.1. Interfaces Principales

```typescript
// ===== ENUMS =====

export enum TipoPersonaCodigo {
  SOCIO = 'SOCIO',
  NO_SOCIO = 'NO_SOCIO',
  DOCENTE = 'DOCENTE',
  PROVEEDOR = 'PROVEEDOR'
}

export enum CategoriaSocioCodigo {
  ACTIVO = 'ACTIVO',
  ESTUDIANTE = 'ESTUDIANTE',
  ADHERENTE = 'ADHERENTE',
  VITALICIO = 'VITALICIO',
  HONORARIO = 'HONORARIO'
}

export enum TipoItemCuotaCodigo {
  CUOTA_BASE_SOCIO = 'CUOTA_BASE_SOCIO',
  ACTIVIDAD_INDIVIDUAL = 'ACTIVIDAD_INDIVIDUAL',
  ACTIVIDAD_GRUPAL = 'ACTIVIDAD_GRUPAL',
  DESCUENTO_FIJO = 'DESCUENTO_FIJO',
  DESCUENTO_PORCENTAJE = 'DESCUENTO_PORCENTAJE',
  DESCUENTO_FAMILIAR = 'DESCUENTO_FAMILIAR',
  RECARGO_FIJO = 'RECARGO_FIJO',
  RECARGO_MORA = 'RECARGO_MORA'
}

export enum CategoriaItemCuotaCodigo {
  BASE = 'BASE',
  ACTIVIDAD = 'ACTIVIDAD',
  DESCUENTO = 'DESCUENTO',
  RECARGO = 'RECARGO',
  AJUSTE = 'AJUSTE'
}

// ===== TIPOS DE PERSONA (Architecture V2) =====

export interface TipoPersonaCatalogo {
  id: number;
  codigo: TipoPersonaCodigo;
  nombre: string;
  descripcion: string;
  activo: boolean;
  orden: number;
  requiresCategoria: boolean;
  requiresEspecialidad: boolean;
  requiresCuit: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CategoriaSocio {
  id: number;
  codigo: CategoriaSocioCodigo;
  nombre: string;
  descripcion: string;
  montoCuota: string;  // Decimal as string
  descuento: string;   // Decimal as string (porcentaje)
  activa: boolean;
  orden: number;
  createdAt: string;
  updatedAt: string;
}

export interface PersonaTipo {
  id: number;
  personaId: number;
  tipoPersonaId: number;
  activo: boolean;
  fechaAsignacion: string;
  fechaDesasignacion: string | null;
  categoriaId: number | null;
  numeroSocio: number | null;
  fechaIngreso: string | null;
  fechaBaja: string | null;
  motivoBaja: string | null;
  especialidadId: number | null;
  honorariosPorHora: string | null;
  cuit: string | null;
  observaciones: string | null;
  createdAt: string;
  updatedAt: string;
  razonSocialId: number | null;

  // Relaciones
  tipoPersona: TipoPersonaCatalogo;
  categoria: CategoriaSocio | null;
}

// ===== PERSONA / RECEPTOR =====

export interface Persona {
  id: number;
  nombre: string;
  apellido: string;
  dni: string;
  numeroSocio: number | null;
  categoria: string | null;  // LEGACY FIELD - No usar
  email: string | null;
  telefono: string | null;

  // NUEVO: Architecture V2
  tipos: PersonaTipo[];  // ← CRÍTICO: Usar este campo
}

// ===== ÍTEMS DE CUOTA =====

export interface CategoriaItemCuota {
  id: number;
  codigo: CategoriaItemCuotaCodigo;
  nombre: string;
  descripcion: string;
  icono: string;
  color: string;
  activo: boolean;
  orden: number;
  createdAt: string;
  updatedAt: string;
}

export interface TipoItemCuota {
  id: number;
  codigo: TipoItemCuotaCodigo;
  nombre: string;
  descripcion: string;
  categoriaItemId: number;
  esCalculado: boolean;
  formula: Record<string, any> | null;
  activo: boolean;
  orden: number;
  configurable: boolean;
  createdAt: string;
  updatedAt: string;

  // Relaciones
  categoriaItem: CategoriaItemCuota;
}

export interface ItemCuota {
  id: number;
  cuotaId: number;
  tipoItemId: number;
  concepto: string;
  monto: string;       // Decimal as string (puede ser negativo)
  cantidad: string;    // Decimal as string
  porcentaje: string | null;  // Decimal as string
  esAutomatico: boolean;
  esEditable: boolean;
  observaciones: string | null;
  metadata: Record<string, any> | null;
  createdAt: string;
  updatedAt: string;

  // Relaciones
  tipoItem: TipoItemCuota;
}

// ===== RECIBO =====

export interface Recibo {
  id: number;
  numero: string;
  tipo: 'CUOTA' | 'ACTIVIDAD' | 'OTRO';
  importe: string;
  fecha: string;
  fechaVencimiento: string | null;
  estado: 'PENDIENTE' | 'PAGADO' | 'VENCIDO' | 'CANCELADO';
  concepto: string;
  observaciones: string | null;
  emisorId: number | null;
  receptorId: number;
  createdAt: string;
  updatedAt: string;

  // Relaciones
  receptor: Persona;
  emisor: Persona | null;
  mediosPago: MedioPago[];
}

// ===== CUOTA (Interfaz principal) =====

export interface Cuota {
  id: number;
  reciboId: number;
  mes: number;
  anio: number;
  categoriaId: number;

  // DEPRECATED - No usar
  montoBase: string | null;
  montoActividades: string | null;

  // Monto total (calculado desde items)
  montoTotal: string;

  createdAt: string;
  updatedAt: string;

  // Relaciones
  recibo: Recibo;
  categoria: CategoriaSocio;
  items: ItemCuota[];  // ← CRÍTICO: Desglose de la cuota
}

// ===== RESPUESTA DE LA API =====

export interface CuotaListResponse {
  success: boolean;
  data: Cuota[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    recordsInPage: number;
    isUnlimited?: boolean;
  };
}

export interface CuotaSingleResponse {
  success: boolean;
  data: Cuota;
}

export interface CuotaErrorResponse {
  success: false;
  error: string;
  details?: Record<string, any>;
}
```

### 3.2. Helper Types

```typescript
// Tipos auxiliares para facilitar el trabajo con la nueva estructura

export type TipoPersonaActivo = PersonaTipo & {
  tipoPersona: TipoPersonaCatalogo;
  categoria: CategoriaSocio | null;
};

export type ItemCuotaPorCategoria = {
  [categoria in CategoriaItemCuotaCodigo]?: ItemCuota[];
};

export interface CuotaDesglosada extends Cuota {
  desglose: {
    base: ItemCuota[];
    actividades: ItemCuota[];
    descuentos: ItemCuota[];
    recargos: ItemCuota[];
    ajustes: ItemCuota[];
  };
  totales: {
    base: number;
    actividades: number;
    descuentos: number;
    recargos: number;
    total: number;
  };
}
```

---

## 4. Formato de Respuesta del Backend

### 4.1. Wrapper Estándar

**TODAS** las respuestas del backend siguen este formato:

```typescript
interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  details?: Record<string, any>;
  meta?: PaginationMeta;
}
```

### 4.2. Extracción de Datos

**INCORRECTO** ❌:
```typescript
const cuotas = response.data;  // ← Error común
```

**CORRECTO** ✅:
```typescript
const cuotas = response.data.data;  // ← Wrapper estándar
```

### 4.3. Ejemplos con Axios

```typescript
// GET - Lista paginada
async function getCuotas(params: CuotaQueryParams): Promise<Cuota[]> {
  const response = await axios.get<CuotaListResponse>('/api/cuotas', { params });

  if (!response.data.success) {
    throw new Error(response.data.error || 'Error al obtener cuotas');
  }

  return response.data.data;  // ← Extraer array de cuotas
}

// GET - Cuota individual
async function getCuotaById(id: number): Promise<Cuota> {
  const response = await axios.get<CuotaSingleResponse>(`/api/cuotas/${id}`);

  if (!response.data.success) {
    throw new Error(response.data.error || 'Error al obtener cuota');
  }

  return response.data.data;  // ← Extraer cuota
}

// GET - Con metadata de paginación
async function getCuotasWithMeta(params: CuotaQueryParams) {
  const response = await axios.get<CuotaListResponse>('/api/cuotas', { params });

  if (!response.data.success) {
    throw new Error(response.data.error || 'Error al obtener cuotas');
  }

  return {
    cuotas: response.data.data,
    meta: response.data.meta  // ← Metadata de paginación
  };
}
```

### 4.4. Manejo de Errores

```typescript
try {
  const cuotas = await getCuotas({ mes: 2, anio: 2026 });
  // ...
} catch (error) {
  if (axios.isAxiosError(error)) {
    const errorData = error.response?.data as CuotaErrorResponse;

    if (errorData && !errorData.success) {
      console.error('Error del backend:', errorData.error);
      console.error('Detalles:', errorData.details);
    } else {
      console.error('Error de red:', error.message);
    }
  }
}
```

---

## 5. Endpoints Actualizados - Referencia Completa

### 5.1. Endpoints Afectados (Incluyen tipos[] e items[])

| Método | Endpoint | Descripción | Incluye tipos[] | Incluye items[] |
|--------|----------|-------------|-----------------|-----------------|
| GET | `/api/cuotas` | Listar cuotas (paginado) | ✅ | ✅ |
| GET | `/api/cuotas/:id` | Obtener cuota por ID | ✅ | ✅ |
| GET | `/api/cuotas/export` | Exportar todas (sin paginación) | ✅ | ✅ |
| GET | `/api/cuotas/recibo/:reciboId` | Obtener por recibo | ✅ | ✅ |
| GET | `/api/cuotas/periodo/:mes/:anio` | Cuotas de un período | ✅ | ✅ |
| GET | `/api/cuotas/socio/:socioId` | Cuotas de un socio | ✅ | ✅ |
| GET | `/api/cuotas/vencidas` | Cuotas vencidas | ✅ | ✅ |
| GET | `/api/cuotas/pendientes` | Cuotas pendientes de pago | ✅ | ✅ |
| POST | `/api/cuotas/buscar` | Buscar cuotas | ✅ | ✅ |
| POST | `/api/cuotas` | Crear cuota | ✅ | ✅ |
| PUT | `/api/cuotas/:id` | Actualizar cuota | ✅ | ✅ |

### 5.2. Ejemplos de Request/Response

#### Ejemplo 1: GET /api/cuotas (Lista paginada)

**Request**:
```http
GET /api/cuotas?mes=2&anio=2026&limit=10&page=1
```

**Response** (ver sección 2.1 para estructura completa)

**Query Parameters**:
```typescript
interface CuotaQueryParams {
  // Filtros
  categoria?: CategoriaSocioCodigo;
  mes?: number;           // 1-12
  anio?: number;
  reciboId?: number;
  personaId?: number;
  soloImpagas?: boolean;
  soloVencidas?: boolean;
  fechaDesde?: string;    // ISO 8601
  fechaHasta?: string;    // ISO 8601

  // Paginación
  page?: number;          // Default: 1
  limit?: number | 'all'; // Default: 10, Max: 100, Special: 'all'

  // Ordenamiento
  ordenarPor?: 'fecha' | 'monto' | 'categoria' | 'vencimiento' | 'periodo';
  orden?: 'asc' | 'desc'; // Default: 'desc'
}
```

#### Ejemplo 2: GET /api/cuotas/:id (Cuota individual)

**Request**:
```http
GET /api/cuotas/665
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": 665,
    "mes": 2,
    "anio": 2026,
    "montoTotal": "7200.01",
    "recibo": {
      "receptor": {
        "nombre": "Daniel",
        "apellido": "Gómez",
        "tipos": [
          {
            "tipoPersona": {
              "codigo": "SOCIO"
            },
            "categoria": {
              "codigo": "ESTUDIANTE",
              "nombre": "Estudiante"
            }
          }
        ]
      }
    },
    "items": [
      {
        "concepto": "Cuota base Estudiante",
        "monto": "5000"
      },
      {
        "concepto": "Actividad: Guitarra Nivel Básico",
        "monto": "2500"
      },
      {
        "concepto": "Descuento Familiar (15%)",
        "monto": "-300.99"
      }
    ]
  }
}
```

#### Ejemplo 3: GET /api/cuotas/export (Exportación completa)

**Request**:
```http
GET /api/cuotas/export?mes=2&anio=2026
```

**Response**:
```json
{
  "success": true,
  "data": [
    // ... todas las cuotas sin paginación
  ],
  "meta": {
    "total": 350,
    "recordsInPage": 350,
    "isUnlimited": true
  }
}
```

**Uso recomendado**:
- Para exportar a CSV/Excel
- Para generar reportes completos
- Para análisis de datos sin paginación

#### Ejemplo 4: POST /api/cuotas/generar-v2 (Generación V2)

**Request**:
```http
POST /api/cuotas/generar-v2
Content-Type: application/json

{
  "mes": 3,
  "anio": 2026,
  "categorias": [2, 3],  // Opcional: ESTUDIANTE, ADHERENTE
  "aplicarDescuentos": true,
  "incluirActividades": true,
  "fechaVencimiento": "2026-04-15"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "generadas": 58,
    "sociosProcesados": 58,
    "errores": 0,
    "cuotas": [
      // ... cuotas generadas con items[]
    ],
    "resumenDescuentos": {
      "totalSociosConDescuento": 35,
      "montoTotalDescuentos": 45900,
      "reglasAplicadas": {
        "DESCUENTO_FAMILIAR": 28,
        "DESCUENTO_2_ACTIVIDADES": 7
      }
    }
  }
}
```

---

## 6. Guía de Migración Paso a Paso

### Paso 1: Actualizar Interfaces TypeScript

**Archivo**: `src/types/cuota.types.ts` (o similar)

**Acción**: Copiar las interfaces de la sección 3 de este documento.

**Checklist**:
- [ ] Crear o actualizar archivo de tipos
- [ ] Importar interfaces en servicios
- [ ] Importar interfaces en componentes
- [ ] Ejecutar `npm run type-check` o `tsc --noEmit`

---

### Paso 2: Actualizar Servicios/API Layer

**Archivo**: `src/services/cuotaService.ts` (o similar)

**ANTES** ❌:
```typescript
export const cuotaService = {
  async getCuotas(params: any) {
    const response = await axios.get('/api/cuotas', { params });
    return response.data;  // ❌ Incorrecto
  },

  async getCuotaById(id: number) {
    const response = await axios.get(`/api/cuotas/${id}`);
    return response.data;  // ❌ Incorrecto
  }
};
```

**DESPUÉS** ✅:
```typescript
import {
  Cuota,
  CuotaListResponse,
  CuotaSingleResponse,
  CuotaQueryParams
} from '@/types/cuota.types';

export const cuotaService = {
  /**
   * Obtener lista de cuotas con paginación
   */
  async getCuotas(params: CuotaQueryParams): Promise<Cuota[]> {
    const response = await axios.get<CuotaListResponse>('/api/cuotas', {
      params
    });

    if (!response.data.success) {
      throw new Error(response.data.error || 'Error al obtener cuotas');
    }

    return response.data.data;  // ✅ Correcto
  },

  /**
   * Obtener cuota individual con todos sus ítems
   */
  async getCuotaById(id: number): Promise<Cuota> {
    const response = await axios.get<CuotaSingleResponse>(`/api/cuotas/${id}`);

    if (!response.data.success) {
      throw new Error(response.data.error || 'Error al obtener cuota');
    }

    return response.data.data;  // ✅ Correcto
  },

  /**
   * Obtener cuotas con metadata de paginación
   */
  async getCuotasWithMeta(params: CuotaQueryParams) {
    const response = await axios.get<CuotaListResponse>('/api/cuotas', {
      params
    });

    if (!response.data.success) {
      throw new Error(response.data.error || 'Error al obtener cuotas');
    }

    return {
      cuotas: response.data.data,
      meta: response.data.meta
    };
  },

  /**
   * Exportar todas las cuotas sin paginación
   */
  async exportCuotas(params: Omit<CuotaQueryParams, 'page' | 'limit'>): Promise<Cuota[]> {
    const response = await axios.get<CuotaListResponse>('/api/cuotas/export', {
      params
    });

    if (!response.data.success) {
      throw new Error(response.data.error || 'Error al exportar cuotas');
    }

    return response.data.data;
  }
};
```

**Checklist**:
- [ ] Actualizar tipos de retorno
- [ ] Actualizar extracción de datos (`response.data.data`)
- [ ] Agregar validación de `success`
- [ ] Agregar manejo de errores
- [ ] Agregar JSDoc comments

---

### Paso 3: Actualizar Componentes de UI

#### 3.1. Mostrar Tipo de Persona

**ANTES** ❌:
```tsx
// Componente que mostraba tipo incorrecto
function CuotaCard({ cuota }: { cuota: Cuota }) {
  const tipoPersona = cuota.recibo.receptor.categoria || 'NO-Socio';
  // ❌ Siempre mostraba 'NO-Socio' porque categoria era null

  return (
    <div>
      <span>Tipo: {tipoPersona}</span>
    </div>
  );
}
```

**DESPUÉS** ✅:
```tsx
// Usar helper function para extraer tipo activo
import { getTipoPersonaActivo } from '@/utils/cuota.helpers';

function CuotaCard({ cuota }: { cuota: Cuota }) {
  const tipoPersona = getTipoPersonaActivo(cuota.recibo.receptor);

  return (
    <div>
      <span className="badge">
        {tipoPersona?.tipoPersona.nombre || 'Sin tipo'}
      </span>
      {tipoPersona?.categoria && (
        <span className="badge badge-secondary">
          {tipoPersona.categoria.nombre}
        </span>
      )}
    </div>
  );
}
```

#### 3.2. Mostrar Ítems de Cuota

**NUEVO** ✅:
```tsx
import { ItemCuota } from '@/types/cuota.types';
import { formatCurrency } from '@/utils/format';

interface ItemsCuotaListProps {
  items: ItemCuota[];
}

function ItemsCuotaList({ items }: ItemsCuotaListProps) {
  // Agrupar por categoría
  const itemsPorCategoria = items.reduce((acc, item) => {
    const categoria = item.tipoItem.categoriaItem.codigo;
    if (!acc[categoria]) {
      acc[categoria] = [];
    }
    acc[categoria].push(item);
    return acc;
  }, {} as Record<string, ItemCuota[]>);

  return (
    <div className="items-cuota">
      {/* Cuota Base */}
      {itemsPorCategoria.BASE && (
        <section>
          <h4>💰 Cuota Base</h4>
          {itemsPorCategoria.BASE.map(item => (
            <div key={item.id} className="item">
              <span>{item.concepto}</span>
              <span>{formatCurrency(parseFloat(item.monto))}</span>
            </div>
          ))}
        </section>
      )}

      {/* Actividades */}
      {itemsPorCategoria.ACTIVIDAD && (
        <section>
          <h4>🎵 Actividades</h4>
          {itemsPorCategoria.ACTIVIDAD.map(item => (
            <div key={item.id} className="item">
              <span>{item.concepto}</span>
              <span>{formatCurrency(parseFloat(item.monto))}</span>
            </div>
          ))}
        </section>
      )}

      {/* Descuentos */}
      {itemsPorCategoria.DESCUENTO && (
        <section>
          <h4>🎁 Descuentos</h4>
          {itemsPorCategoria.DESCUENTO.map(item => (
            <div key={item.id} className="item discount">
              <span>{item.concepto}</span>
              <span className="text-success">
                {formatCurrency(parseFloat(item.monto))}
              </span>
            </div>
          ))}
        </section>
      )}

      {/* Recargos */}
      {itemsPorCategoria.RECARGO && (
        <section>
          <h4>⚠️ Recargos</h4>
          {itemsPorCategoria.RECARGO.map(item => (
            <div key={item.id} className="item surcharge">
              <span>{item.concepto}</span>
              <span className="text-danger">
                {formatCurrency(parseFloat(item.monto))}
              </span>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
```

#### 3.3. Calcular Totales desde Ítems

**ANTES** ❌:
```tsx
function CuotaTotal({ cuota }: { cuota: Cuota }) {
  // ❌ Usar campos deprecated
  const base = parseFloat(cuota.montoBase || '0');
  const actividades = parseFloat(cuota.montoActividades || '0');
  const total = parseFloat(cuota.montoTotal);

  return (
    <div>
      <div>Base: {base}</div>
      <div>Actividades: {actividades}</div>
      <div>Total: {total}</div>
    </div>
  );
}
```

**DESPUÉS** ✅:
```tsx
import { calcularTotalesCuota } from '@/utils/cuota.helpers';

function CuotaTotal({ cuota }: { cuota: Cuota }) {
  const totales = calcularTotalesCuota(cuota);

  return (
    <div className="cuota-totales">
      <div className="total-row">
        <span>Cuota Base:</span>
        <span>{formatCurrency(totales.base)}</span>
      </div>
      <div className="total-row">
        <span>Actividades:</span>
        <span>{formatCurrency(totales.actividades)}</span>
      </div>
      {totales.descuentos > 0 && (
        <div className="total-row text-success">
          <span>Descuentos:</span>
          <span>-{formatCurrency(totales.descuentos)}</span>
        </div>
      )}
      {totales.recargos > 0 && (
        <div className="total-row text-danger">
          <span>Recargos:</span>
          <span>+{formatCurrency(totales.recargos)}</span>
        </div>
      )}
      <div className="total-row total">
        <strong>Total:</strong>
        <strong>{formatCurrency(totales.total)}</strong>
      </div>
    </div>
  );
}
```

**Checklist**:
- [ ] Actualizar componentes de listado
- [ ] Actualizar componentes de detalle
- [ ] Actualizar componentes de filtros
- [ ] Actualizar componentes de exportación
- [ ] Actualizar dashboards/estadísticas

---

### Paso 4: Crear Funciones Helper

**Archivo**: `src/utils/cuota.helpers.ts`

```typescript
import {
  Cuota,
  Persona,
  TipoPersonaActivo,
  ItemCuota,
  CategoriaItemCuotaCodigo
} from '@/types/cuota.types';

/**
 * Obtiene el tipo de persona activo de un receptor
 * (Usualmente el primero, ya que el backend filtra por activo: true)
 */
export function getTipoPersonaActivo(persona: Persona): TipoPersonaActivo | null {
  if (!persona.tipos || persona.tipos.length === 0) {
    return null;
  }

  // El backend ya filtra por activo: true, así que tomamos el primero
  return persona.tipos[0] as TipoPersonaActivo;
}

/**
 * Verifica si una persona es SOCIO activo
 */
export function esSocioActivo(persona: Persona): boolean {
  const tipo = getTipoPersonaActivo(persona);
  return tipo?.tipoPersona.codigo === 'SOCIO';
}

/**
 * Obtiene la categoría del socio (si es SOCIO)
 */
export function getCategoriaSocio(persona: Persona) {
  const tipo = getTipoPersonaActivo(persona);
  if (tipo?.tipoPersona.codigo === 'SOCIO') {
    return tipo.categoria;
  }
  return null;
}

/**
 * Agrupa ítems de cuota por categoría
 */
export function agruparItemsPorCategoria(items: ItemCuota[]) {
  return items.reduce((acc, item) => {
    const categoria = item.tipoItem.categoriaItem.codigo;
    if (!acc[categoria]) {
      acc[categoria] = [];
    }
    acc[categoria].push(item);
    return acc;
  }, {} as Record<CategoriaItemCuotaCodigo, ItemCuota[]>);
}

/**
 * Calcula totales de una cuota desde sus ítems
 */
export function calcularTotalesCuota(cuota: Cuota) {
  const items = cuota.items || [];

  const totales = {
    base: 0,
    actividades: 0,
    descuentos: 0,
    recargos: 0,
    ajustes: 0,
    total: 0
  };

  items.forEach(item => {
    const monto = parseFloat(item.monto);
    const categoria = item.tipoItem.categoriaItem.codigo;

    switch (categoria) {
      case 'BASE':
        totales.base += monto;
        break;
      case 'ACTIVIDAD':
        totales.actividades += monto;
        break;
      case 'DESCUENTO':
        totales.descuentos += Math.abs(monto);  // Descuentos son negativos
        break;
      case 'RECARGO':
        totales.recargos += monto;
        break;
      case 'AJUSTE':
        totales.ajustes += monto;
        break;
    }
  });

  totales.total = parseFloat(cuota.montoTotal);

  return totales;
}

/**
 * Obtiene ítems de una categoría específica
 */
export function getItemsPorCategoria(
  cuota: Cuota,
  categoria: CategoriaItemCuotaCodigo
): ItemCuota[] {
  return cuota.items?.filter(
    item => item.tipoItem.categoriaItem.codigo === categoria
  ) || [];
}

/**
 * Verifica si una cuota tiene descuentos aplicados
 */
export function tieneDescuentos(cuota: Cuota): boolean {
  return cuota.items?.some(
    item => item.tipoItem.categoriaItem.codigo === 'DESCUENTO'
  ) || false;
}

/**
 * Obtiene el nombre completo del receptor
 */
export function getNombreCompletoReceptor(cuota: Cuota): string {
  const receptor = cuota.recibo.receptor;
  return `${receptor.apellido}, ${receptor.nombre}`;
}

/**
 * Formatea el período de la cuota (Ej: "Febrero 2026")
 */
export function formatearPeriodoCuota(cuota: Cuota): string {
  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  return `${meses[cuota.mes - 1]} ${cuota.anio}`;
}

/**
 * Convierte Decimal string a número
 */
export function decimalToNumber(decimal: string | number | null): number {
  if (decimal === null || decimal === undefined) return 0;
  if (typeof decimal === 'number') return decimal;
  return parseFloat(decimal);
}
```

---

### Paso 5: Actualizar Redux/State Management (si aplica)

**Ejemplo con Redux Toolkit**:

```typescript
// cuotaSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Cuota, CuotaQueryParams } from '@/types/cuota.types';
import { cuotaService } from '@/services/cuotaService';

interface CuotaState {
  cuotas: Cuota[];
  selectedCuota: Cuota | null;
  loading: boolean;
  error: string | null;
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null;
}

const initialState: CuotaState = {
  cuotas: [],
  selectedCuota: null,
  loading: false,
  error: null,
  meta: null
};

// Async thunks
export const fetchCuotas = createAsyncThunk(
  'cuota/fetchCuotas',
  async (params: CuotaQueryParams) => {
    const result = await cuotaService.getCuotasWithMeta(params);
    return result;  // { cuotas, meta }
  }
);

export const fetchCuotaById = createAsyncThunk(
  'cuota/fetchCuotaById',
  async (id: number) => {
    return await cuotaService.getCuotaById(id);
  }
);

// Slice
const cuotaSlice = createSlice({
  name: 'cuota',
  initialState,
  reducers: {
    clearSelectedCuota: (state) => {
      state.selectedCuota = null;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // fetchCuotas
      .addCase(fetchCuotas.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCuotas.fulfilled, (state, action) => {
        state.loading = false;
        state.cuotas = action.payload.cuotas;  // ✅ Array de Cuota
        state.meta = action.payload.meta;
      })
      .addCase(fetchCuotas.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Error al cargar cuotas';
      })
      // fetchCuotaById
      .addCase(fetchCuotaById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCuotaById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedCuota = action.payload;  // ✅ Cuota con items[]
      })
      .addCase(fetchCuotaById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Error al cargar cuota';
      });
  }
});

export const { clearSelectedCuota, clearError } = cuotaSlice.actions;
export default cuotaSlice.reducer;
```

---

### Paso 6: Actualizar Tests

```typescript
// cuotaService.test.ts
import { cuotaService } from '@/services/cuotaService';
import { Cuota } from '@/types/cuota.types';

describe('cuotaService', () => {
  describe('getCuotas', () => {
    it('debe extraer correctamente los datos del wrapper', async () => {
      const cuotas = await cuotaService.getCuotas({ mes: 2, anio: 2026 });

      expect(Array.isArray(cuotas)).toBe(true);
      expect(cuotas.length).toBeGreaterThan(0);

      // Verificar estructura de la primera cuota
      const cuota = cuotas[0];
      expect(cuota).toHaveProperty('id');
      expect(cuota).toHaveProperty('recibo');
      expect(cuota.recibo).toHaveProperty('receptor');

      // ✅ Verificar tipos de persona (Architecture V2)
      expect(cuota.recibo.receptor).toHaveProperty('tipos');
      expect(Array.isArray(cuota.recibo.receptor.tipos)).toBe(true);

      if (cuota.recibo.receptor.tipos.length > 0) {
        const tipo = cuota.recibo.receptor.tipos[0];
        expect(tipo).toHaveProperty('tipoPersona');
        expect(tipo.tipoPersona).toHaveProperty('codigo');
        expect(['SOCIO', 'NO_SOCIO', 'DOCENTE', 'PROVEEDOR'])
          .toContain(tipo.tipoPersona.codigo);
      }

      // ✅ Verificar ítems de cuota
      expect(cuota).toHaveProperty('items');
      expect(Array.isArray(cuota.items)).toBe(true);

      if (cuota.items.length > 0) {
        const item = cuota.items[0];
        expect(item).toHaveProperty('concepto');
        expect(item).toHaveProperty('monto');
        expect(item).toHaveProperty('tipoItem');
        expect(item.tipoItem).toHaveProperty('categoriaItem');
      }
    });
  });

  describe('getCuotaById', () => {
    it('debe devolver cuota con todos los ítems', async () => {
      const cuota = await cuotaService.getCuotaById(665);

      expect(cuota).toBeDefined();
      expect(cuota.items).toBeDefined();
      expect(cuota.items.length).toBeGreaterThan(0);
    });
  });
});
```

---

### Paso 7: Validación Final

**Checklist de Validación**:

- [ ] **Tipos TypeScript**: Sin errores al ejecutar `npm run type-check`
- [ ] **Servicios**: Todos los métodos actualizados y probados
- [ ] **Componentes**: Mostrar correctamente tipos de persona e ítems
- [ ] **Helpers**: Funciones auxiliares funcionando correctamente
- [ ] **State Management**: Redux/Zustand actualizados
- [ ] **Tests**: Todos los tests pasando
- [ ] **UI/UX**: Verificar en navegador que se muestra correctamente
- [ ] **Console Errors**: Sin errores en consola del navegador
- [ ] **Network Tab**: Verificar que responses tienen la estructura esperada

---

## 7. Ejemplos de Código Frontend

### 7.1. Componente React - Lista de Cuotas

```tsx
import React, { useEffect, useState } from 'react';
import { Cuota } from '@/types/cuota.types';
import { cuotaService } from '@/services/cuotaService';
import {
  getTipoPersonaActivo,
  formatearPeriodoCuota,
  calcularTotalesCuota
} from '@/utils/cuota.helpers';
import { formatCurrency } from '@/utils/format';

interface CuotaListProps {
  mes: number;
  anio: number;
}

export function CuotaList({ mes, anio }: CuotaListProps) {
  const [cuotas, setCuotas] = useState<Cuota[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCuotas();
  }, [mes, anio]);

  async function loadCuotas() {
    try {
      setLoading(true);
      setError(null);
      const data = await cuotaService.getCuotas({ mes, anio, limit: 100 });
      setCuotas(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar cuotas');
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div>Cargando...</div>;
  if (error) return <div className="error">{error}</div>;
  if (cuotas.length === 0) return <div>No hay cuotas para este período</div>;

  return (
    <div className="cuota-list">
      <h2>Cuotas - {formatearPeriodoCuota(cuotas[0])}</h2>

      <table>
        <thead>
          <tr>
            <th>N° Socio</th>
            <th>Nombre</th>
            <th>Tipo</th>
            <th>Categoría</th>
            <th>Ítems</th>
            <th>Total</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {cuotas.map(cuota => {
            const receptor = cuota.recibo.receptor;
            const tipoPersona = getTipoPersonaActivo(receptor);
            const totales = calcularTotalesCuota(cuota);

            return (
              <tr key={cuota.id}>
                <td>{receptor.numeroSocio || '-'}</td>
                <td>{receptor.apellido}, {receptor.nombre}</td>
                <td>
                  <span className="badge">
                    {tipoPersona?.tipoPersona.nombre || 'N/A'}
                  </span>
                </td>
                <td>
                  {tipoPersona?.categoria?.nombre || '-'}
                </td>
                <td>
                  <div className="items-summary">
                    <span title="Cuota Base">
                      💰 {formatCurrency(totales.base)}
                    </span>
                    {totales.actividades > 0 && (
                      <span title="Actividades">
                        🎵 {formatCurrency(totales.actividades)}
                      </span>
                    )}
                    {totales.descuentos > 0 && (
                      <span title="Descuentos" className="text-success">
                        🎁 -{formatCurrency(totales.descuentos)}
                      </span>
                    )}
                  </div>
                </td>
                <td>
                  <strong>{formatCurrency(totales.total)}</strong>
                </td>
                <td>
                  <span className={`badge badge-${cuota.recibo.estado.toLowerCase()}`}>
                    {cuota.recibo.estado}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
```

### 7.2. Componente React - Detalle de Cuota

```tsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Cuota, ItemCuota } from '@/types/cuota.types';
import { cuotaService } from '@/services/cuotaService';
import {
  getTipoPersonaActivo,
  agruparItemsPorCategoria,
  formatearPeriodoCuota
} from '@/utils/cuota.helpers';
import { formatCurrency, formatDate } from '@/utils/format';

export function CuotaDetail() {
  const { id } = useParams<{ id: string }>();
  const [cuota, setCuota] = useState<Cuota | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCuota();
  }, [id]);

  async function loadCuota() {
    try {
      setLoading(true);
      const data = await cuotaService.getCuotaById(Number(id));
      setCuota(data);
    } catch (err) {
      console.error('Error al cargar cuota:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div>Cargando...</div>;
  if (!cuota) return <div>Cuota no encontrada</div>;

  const receptor = cuota.recibo.receptor;
  const tipoPersona = getTipoPersonaActivo(receptor);
  const itemsAgrupados = agruparItemsPorCategoria(cuota.items);

  return (
    <div className="cuota-detail">
      {/* Header */}
      <div className="cuota-header">
        <h1>Detalle de Cuota - {formatearPeriodoCuota(cuota)}</h1>
        <div className="cuota-meta">
          <span>Recibo N°: {cuota.recibo.numero}</span>
          <span className={`badge badge-${cuota.recibo.estado.toLowerCase()}`}>
            {cuota.recibo.estado}
          </span>
        </div>
      </div>

      {/* Información del Receptor */}
      <section className="receptor-info">
        <h2>Información del Socio</h2>
        <div className="info-grid">
          <div>
            <label>Nombre:</label>
            <p>{receptor.apellido}, {receptor.nombre}</p>
          </div>
          <div>
            <label>DNI:</label>
            <p>{receptor.dni}</p>
          </div>
          <div>
            <label>N° Socio:</label>
            <p>{receptor.numeroSocio || '-'}</p>
          </div>
          <div>
            <label>Tipo de Persona:</label>
            <p>
              <span className="badge">
                {tipoPersona?.tipoPersona.nombre || 'N/A'}
              </span>
            </p>
          </div>
          <div>
            <label>Categoría:</label>
            <p>
              {tipoPersona?.categoria?.nombre || '-'}
              {tipoPersona?.categoria?.descuento && (
                <span className="text-muted">
                  {' '}({tipoPersona.categoria.descuento}% desc.)
                </span>
              )}
            </p>
          </div>
        </div>
      </section>

      {/* Desglose de Ítems */}
      <section className="items-desglose">
        <h2>Desglose de la Cuota</h2>

        {/* Cuota Base */}
        {itemsAgrupados.BASE && (
          <div className="items-group">
            <h3>💰 Cuota Base</h3>
            <table>
              <tbody>
                {itemsAgrupados.BASE.map(item => (
                  <tr key={item.id}>
                    <td>{item.concepto}</td>
                    <td className="text-right">
                      {formatCurrency(parseFloat(item.monto))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Actividades */}
        {itemsAgrupados.ACTIVIDAD && (
          <div className="items-group">
            <h3>🎵 Actividades</h3>
            <table>
              <tbody>
                {itemsAgrupados.ACTIVIDAD.map(item => (
                  <tr key={item.id}>
                    <td>
                      {item.concepto}
                      {item.metadata?.actividadNombre && (
                        <small className="text-muted">
                          {' '}({item.metadata.actividadNombre})
                        </small>
                      )}
                    </td>
                    <td className="text-right">
                      {formatCurrency(parseFloat(item.monto))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Descuentos */}
        {itemsAgrupados.DESCUENTO && (
          <div className="items-group">
            <h3>🎁 Descuentos Aplicados</h3>
            <table>
              <tbody>
                {itemsAgrupados.DESCUENTO.map(item => (
                  <tr key={item.id} className="discount-row">
                    <td>
                      {item.concepto}
                      {item.porcentaje && (
                        <small> ({item.porcentaje}%)</small>
                      )}
                      {item.metadata?.reglaNombre && (
                        <small className="text-muted">
                          {' '}[{item.metadata.reglaNombre}]
                        </small>
                      )}
                    </td>
                    <td className="text-right text-success">
                      {formatCurrency(parseFloat(item.monto))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Recargos */}
        {itemsAgrupados.RECARGO && (
          <div className="items-group">
            <h3>⚠️ Recargos</h3>
            <table>
              <tbody>
                {itemsAgrupados.RECARGO.map(item => (
                  <tr key={item.id} className="surcharge-row">
                    <td>{item.concepto}</td>
                    <td className="text-right text-danger">
                      +{formatCurrency(parseFloat(item.monto))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Total */}
      <section className="cuota-total">
        <div className="total-row">
          <strong>TOTAL A PAGAR:</strong>
          <strong className="total-amount">
            {formatCurrency(parseFloat(cuota.montoTotal))}
          </strong>
        </div>
        {cuota.recibo.fechaVencimiento && (
          <div className="vencimiento-info">
            <span>Vencimiento: {formatDate(cuota.recibo.fechaVencimiento)}</span>
          </div>
        )}
      </section>
    </div>
  );
}
```

### 7.3. Hook Personalizado - useCuotas

```typescript
import { useState, useEffect, useCallback } from 'react';
import { Cuota, CuotaQueryParams } from '@/types/cuota.types';
import { cuotaService } from '@/services/cuotaService';

interface UseCuotasResult {
  cuotas: Cuota[];
  loading: boolean;
  error: string | null;
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  } | null;
  refetch: () => Promise<void>;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
}

export function useCuotas(initialParams: CuotaQueryParams = {}): UseCuotasResult {
  const [cuotas, setCuotas] = useState<Cuota[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<UseCuotasResult['meta']>(null);
  const [params, setParams] = useState<CuotaQueryParams>({
    page: 1,
    limit: 10,
    ...initialParams
  });

  const fetchCuotas = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await cuotaService.getCuotasWithMeta(params);
      setCuotas(result.cuotas);
      setMeta(result.meta);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar cuotas');
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchCuotas();
  }, [fetchCuotas]);

  const setPage = useCallback((page: number) => {
    setParams(prev => ({ ...prev, page }));
  }, []);

  const setLimit = useCallback((limit: number) => {
    setParams(prev => ({ ...prev, limit, page: 1 }));
  }, []);

  return {
    cuotas,
    loading,
    error,
    meta,
    refetch: fetchCuotas,
    setPage,
    setLimit
  };
}

// Uso:
function MiComponente() {
  const { cuotas, loading, meta, setPage } = useCuotas({
    mes: 2,
    anio: 2026
  });

  return (
    <div>
      {/* ... */}
      <button onClick={() => setPage(meta.page + 1)}>
        Siguiente
      </button>
    </div>
  );
}
```

---

## 8. Casos de Uso Comunes

### 8.1. Listar Cuotas de un Período

**Objetivo**: Mostrar todas las cuotas de Febrero 2026

```typescript
async function getCuotasFebreroPage1() {
  const cuotas = await cuotaService.getCuotas({
    mes: 2,
    anio: 2026,
    page: 1,
    limit: 50,
    ordenarPor: 'categoria',
    orden: 'asc'
  });

  // Procesar cuotas
  cuotas.forEach(cuota => {
    const receptor = cuota.recibo.receptor;
    const tipoPersona = getTipoPersonaActivo(receptor);
    const totales = calcularTotalesCuota(cuota);

    console.log({
      socio: `${receptor.numeroSocio} - ${receptor.apellido}`,
      tipo: tipoPersona?.tipoPersona.codigo,
      categoria: tipoPersona?.categoria?.nombre,
      itemsCount: cuota.items.length,
      total: totales.total
    });
  });
}
```

### 8.2. Exportar Todas las Cuotas a CSV

**Objetivo**: Exportar todas las cuotas de 2026 sin paginación

```typescript
import { parse } from 'json2csv';
import { saveAs } from 'file-saver';

async function exportCuotasToCSV(mes: number, anio: number) {
  // Obtener todas las cuotas sin paginación
  const cuotas = await cuotaService.exportCuotas({ mes, anio });

  // Transformar a formato plano para CSV
  const data = cuotas.map(cuota => {
    const receptor = cuota.recibo.receptor;
    const tipoPersona = getTipoPersonaActivo(receptor);
    const totales = calcularTotalesCuota(cuota);

    return {
      'N° Socio': receptor.numeroSocio || '',
      'Apellido': receptor.apellido,
      'Nombre': receptor.nombre,
      'DNI': receptor.dni,
      'Tipo Persona': tipoPersona?.tipoPersona.nombre || '',
      'Categoría': tipoPersona?.categoria?.nombre || '',
      'Mes': cuota.mes,
      'Año': cuota.anio,
      'Cuota Base': totales.base,
      'Actividades': totales.actividades,
      'Descuentos': totales.descuentos,
      'Recargos': totales.recargos,
      'Total': totales.total,
      'Estado': cuota.recibo.estado,
      'N° Recibo': cuota.recibo.numero,
      'Vencimiento': cuota.recibo.fechaVencimiento || ''
    };
  });

  // Convertir a CSV
  const csv = parse(data);

  // Descargar archivo
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, `cuotas_${mes}_${anio}.csv`);
}
```

### 8.3. Filtrar Cuotas por Tipo de Persona

**Objetivo**: Mostrar solo cuotas de SOCIOS (no NO_SOCIOS)

```typescript
async function getCuotasSoloSocios(mes: number, anio: number) {
  // Obtener todas las cuotas
  const todasLasCuotas = await cuotaService.getCuotas({ mes, anio, limit: 'all' });

  // Filtrar en el frontend por tipo SOCIO
  const cuotasSocios = todasLasCuotas.filter(cuota => {
    const tipoPersona = getTipoPersonaActivo(cuota.recibo.receptor);
    return tipoPersona?.tipoPersona.codigo === 'SOCIO';
  });

  return cuotasSocios;
}

// Alternativa: Si el backend implementa filtro por tipo (futuro)
async function getCuotasSociosBackend(mes: number, anio: number) {
  const cuotas = await cuotaService.getCuotas({
    mes,
    anio,
    tipoPersona: 'SOCIO'  // ← Si el backend lo soporta
  });

  return cuotas;
}
```

### 8.4. Mostrar Actividades de un Socio

**Objetivo**: Listar todas las actividades de un socio en su cuota

```typescript
function mostrarActividadesCuota(cuota: Cuota) {
  const actividades = getItemsPorCategoria(cuota, 'ACTIVIDAD');

  if (actividades.length === 0) {
    console.log('No tiene actividades en esta cuota');
    return;
  }

  console.log('Actividades del socio:');
  actividades.forEach(item => {
    console.log({
      actividad: item.concepto,
      monto: formatCurrency(parseFloat(item.monto)),
      metadata: item.metadata
    });
  });
}
```

### 8.5. Generar Cuotas V2 con Validación

**Objetivo**: Generar cuotas de un período con descuentos automáticos

```typescript
async function generarCuotasMes(mes: number, anio: number) {
  try {
    const response = await axios.post('/api/cuotas/generar-v2', {
      mes,
      anio,
      aplicarDescuentos: true,
      incluirActividades: true,
      fechaVencimiento: `${anio}-${String(mes + 1).padStart(2, '0')}-15`
    });

    if (!response.data.success) {
      throw new Error(response.data.error);
    }

    const resultado = response.data.data;

    console.log(`✅ Cuotas generadas: ${resultado.generadas}`);
    console.log(`📊 Socios procesados: ${resultado.sociosProcesados}`);
    console.log(`❌ Errores: ${resultado.errores}`);

    if (resultado.resumenDescuentos) {
      console.log(`🎁 Descuentos aplicados:`);
      console.log(`   - Socios con descuento: ${resultado.resumenDescuentos.totalSociosConDescuento}`);
      console.log(`   - Monto total: $${resultado.resumenDescuentos.montoTotalDescuentos}`);
    }

    return resultado.cuotas;

  } catch (error) {
    console.error('Error al generar cuotas:', error);
    throw error;
  }
}
```

---

## 9. Troubleshooting y FAQ

### 9.1. Errores Comunes

#### Error: "Cannot read property 'tipos' of undefined"

**Causa**: La respuesta no incluye el campo `receptor.tipos`

**Solución**:
```typescript
// ❌ Incorrecto
const tipo = cuota.recibo.receptor.tipos[0];

// ✅ Correcto
const tipo = cuota.recibo.receptor?.tipos?.[0];

// ✅ Mejor: Usar helper con validación
const tipo = getTipoPersonaActivo(cuota.recibo.receptor);
```

#### Error: "items is not an array"

**Causa**: Endpoint antiguo sin la relación `items[]` incluida

**Verificación**:
```typescript
console.log('Response completa:', response.data);
console.log('Items:', response.data.data[0]?.items);
```

**Solución**: Verificar que estás usando la última versión del backend (29/01/2026)

#### Error: "reduce is not a function"

**Causa**: Extracción incorrecta de datos del wrapper

```typescript
// ❌ Incorrecto
const response = await axios.get('/api/cuotas');
const cuotas = response.data;  // ← Esto es el wrapper, no el array

// ✅ Correcto
const response = await axios.get('/api/cuotas');
const cuotas = response.data.data;  // ← Array de cuotas
```

---

### 9.2. FAQ

#### ¿Por qué `montoBase` y `montoActividades` son null?

**Respuesta**: Estos campos son **DEPRECATED** desde la implementación de Cuotas V2. Ahora toda la información está en `items[]`. Usar `calcularTotalesCuota()` para obtener los totales por categoría.

#### ¿Cómo sé si una persona es SOCIO o NO_SOCIO?

**Respuesta**:
```typescript
const tipoPersona = getTipoPersonaActivo(cuota.recibo.receptor);
const esSocio = tipoPersona?.tipoPersona.codigo === 'SOCIO';
```

#### ¿Puedo tener una persona con múltiples tipos?

**Respuesta**: Sí, pero el backend filtra por `activo: true`, así que `tipos[]` solo incluye tipos activos. Usualmente será solo uno. Si hay múltiples, tomar el primero (`tipos[0]`).

#### ¿Cómo filtro cuotas sin paginación?

**Respuesta**:
```typescript
// Opción 1: Usar limit="all"
const cuotas = await cuotaService.getCuotas({ mes: 2, anio: 2026, limit: 'all' });

// Opción 2: Usar endpoint /export
const cuotas = await cuotaService.exportCuotas({ mes: 2, anio: 2026 });
```

#### ¿Los descuentos son siempre negativos en items[]?

**Respuesta**: Sí, los ítems con `categoriaItem.codigo = 'DESCUENTO'` tienen `monto` negativo. Usar `Math.abs()` para mostrar el valor positivo si es necesario.

#### ¿Qué hacer si no aparecen las actividades?

**Verificaciones**:
1. Verificar que la cuota tiene `items[]`
2. Filtrar por `categoriaItem.codigo === 'ACTIVIDAD'`
3. Verificar que el socio esté inscrito en actividades activas
4. Revisar metadata del ítem: `item.metadata.actividadId`

```typescript
const actividades = cuota.items.filter(
  item => item.tipoItem.categoriaItem.codigo === 'ACTIVIDAD'
);

if (actividades.length === 0) {
  console.log('Este socio no tiene actividades en esta cuota');
}
```

#### ¿Cómo manejar backward compatibility con código legacy?

**Respuesta**: Crear función wrapper que soporte ambos formatos:

```typescript
function getCategoriaSocioCompat(persona: Persona) {
  // Intentar Architecture V2 primero
  const tipo = getTipoPersonaActivo(persona);
  if (tipo?.categoria) {
    return tipo.categoria.nombre;
  }

  // Fallback a legacy field
  if (persona.categoria) {
    return persona.categoria;
  }

  return 'Sin categoría';
}
```

---

## 10. Recursos Adicionales

### Documentación del Backend

- **PLAN_IMPLEMENTACION_CUOTAS_V2_COMPLETO.md**: Plan detallado del sistema V2
- **CORRECCION_RESPONSE_FORMAT_FRONTEND.md**: Correcciones previas del formato de respuesta
- **CLAUDE.md**: Documentación general del backend
- **tests/cuotas.http**: 58 ejemplos de requests HTTP

### Archivos de Referencia

- **Schema Prisma**: `/prisma/schema.prisma`
- **Repository**: `/src/repositories/cuota.repository.ts`
- **Service**: `/src/services/cuota.service.ts`
- **Controller**: `/src/controllers/cuota.controller.ts`
- **DTOs**: `/src/dto/cuota.dto.ts`

### Endpoints de Prueba

- **Health Check**: `GET http://localhost:8000/health`
- **API Info**: `GET http://localhost:8000/`
- **Swagger Docs**: `http://localhost:8000/api-docs`

---

## Changelog

### 29/01/2026 - V2.0
- ✅ Agregado campo `tipos[]` en receptor (Architecture V2)
- ✅ Agregado campo `items[]` en cuota (desglose completo)
- ✅ Agregado campo `categoria` en cuota (relación completa)
- ✅ Deprecated `montoBase` y `montoActividades` (ahora null)
- ✅ Agregado endpoint `/api/cuotas/export` para exportación completa
- ✅ Mejorada metadata de paginación

### 15/01/2026 - V1.2
- ✅ Corregidos bugs críticos en generación de cuotas
- ✅ Implementado motor de descuentos V2
- ✅ Agregada tabla `actividades_aulas`

### 05/01/2026 - V1.1
- ✅ Migración ENUM TipoContacto → Catálogo
- ✅ Implementado soft delete para personas
- ✅ Sync bidireccional de relaciones familiares

---

**FIN DE LA GUÍA**

Para consultas o soporte, contactar al equipo de backend SIGESDA.
