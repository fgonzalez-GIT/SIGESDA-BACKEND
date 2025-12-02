# Guía Frontend: Sistema de Cantidad y Estados de Equipamientos

**Versión**: 1.0
**Fecha**: 2025-12-01
**Autor**: Backend Team

---

## 📋 Índice

1. [Resumen de Cambios](#resumen-de-cambios)
2. [Nuevos Campos en Equipamientos](#nuevos-campos-en-equipamientos)
3. [Estados de Equipamiento](#estados-de-equipamiento)
4. [APIs Modificadas](#apis-modificadas)
5. [Nuevas APIs](#nuevas-apis)
6. [Validaciones y Reglas de Negocio](#validaciones-y-reglas-de-negocio)
7. [Casos de Uso Comunes](#casos-de-uso-comunes)
8. [Manejo de Errores y Warnings](#manejo-de-errores-y-warnings)
9. [Ejemplos Completos](#ejemplos-completos)

---

## 1. Resumen de Cambios

### ¿Qué cambió?

El sistema de equipamientos ahora soporta:

- ✅ **Cantidad en inventario**: Cada equipamiento tiene un stock total
- ✅ **Estados de equipamiento**: Catálogo de estados (Nuevo, Usado, En Reparación, Roto, Dado de Baja)
- ✅ **Validación de disponibilidad**: Al asignar equipamiento a aulas se valida stock disponible
- ✅ **Control de estados bloqueados**: Equipamiento en ciertos estados NO puede asignarse a aulas
- ✅ **Warnings por déficit**: Si asignas más cantidad de la disponible, el sistema te avisa pero permite la operación

### Impacto en Frontend

- **Formularios de equipamiento**: Deben incluir campos `cantidad` y `estadoEquipamientoId`
- **Listado de equipamientos**: Mostrar cantidad y estado
- **Asignación a aulas**: Manejar warnings de disponibilidad
- **Filtros**: Nuevos filtros por estado y stock disponible

---

## 2. Nuevos Campos en Equipamientos

### Modelo `Equipamiento`

```typescript
interface Equipamiento {
  id: number;
  codigo: string;                    // INST-001, MOB-002, etc.
  nombre: string;
  categoriaEquipamientoId: number;
  estadoEquipamientoId?: number;     // ⭐ NUEVO - Nullable
  cantidad: number;                  // ⭐ NUEVO - Default: 1
  descripcion?: string;
  observaciones?: string;
  activo: boolean;
  createdAt: string;
  updatedAt: string;

  // Relaciones (cuando se incluyen)
  categoriaEquipamiento?: {
    id: number;
    codigo: string;
    nombre: string;
  };
  estadoEquipamiento?: {             // ⭐ NUEVO
    id: number;
    codigo: string;
    nombre: string;
    descripcion?: string;
  };
}
```

### Información de Disponibilidad (opcional)

Algunos endpoints retornan información adicional de disponibilidad:

```typescript
interface DisponibilidadInfo {
  cantidadTotal: number;        // Stock total en inventario
  cantidadAsignada: number;     // Suma de cantidades asignadas en aulas
  cantidadDisponible: number;   // Total - Asignadas (puede ser negativo)
  tieneDeficit: boolean;        // true si cantidadDisponible < 0
}
```

---

## 3. Estados de Equipamiento

### Catálogo de Estados

| ID | Código | Nombre | Descripción | Permite Asignación |
|----|--------|--------|-------------|-------------------|
| 1 | `NUEVO` | Nuevo | Equipamiento nuevo sin uso | ✅ SÍ |
| 2 | `USADO` | Usado | Equipamiento en buen estado con uso normal | ✅ SÍ |
| 3 | `EN_REPARACION` | En Reparación | Temporalmente fuera de servicio | ❌ NO |
| 4 | `ROTO` | Roto | Averiado, no funcional | ❌ NO |
| 5 | `DADO_DE_BAJA` | Dado de Baja | Eliminado del inventario | ❌ NO |

### API para Obtener Estados

**Endpoint**: `GET /api/catalogos/estados-equipamientos`

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "codigo": "NUEVO",
      "nombre": "Nuevo",
      "descripcion": "Equipamiento nuevo sin uso",
      "activo": true,
      "orden": 1
    },
    {
      "id": 2,
      "codigo": "USADO",
      "nombre": "Usado",
      "descripcion": "Equipamiento en buen estado con uso normal",
      "activo": true,
      "orden": 2
    }
    // ... más estados
  ]
}
```

---

## 4. APIs Modificadas

### 4.1. Crear Equipamiento

**Endpoint**: `POST /api/equipamientos`

**Payload**:
```json
{
  "nombre": "Sillas Nuevas",
  "categoriaEquipamientoId": 2,
  "estadoEquipamientoId": 1,        // ⭐ NUEVO - Opcional
  "cantidad": 50,                   // ⭐ NUEVO - Default: 1
  "descripcion": "Sillas para aulas",
  "observaciones": "Compradas en 2025"
}
```

**Response Exitosa (201)**:
```json
{
  "success": true,
  "message": "Equipamiento creado exitosamente",
  "data": {
    "id": 17,
    "codigo": "MOB-005",              // Autogenerado
    "nombre": "Sillas Nuevas",
    "categoriaEquipamientoId": 2,
    "estadoEquipamientoId": 1,
    "cantidad": 50,
    "descripcion": "Sillas para aulas",
    "observaciones": "Compradas en 2025",
    "activo": true,
    "createdAt": "2025-12-01T15:00:00.000Z",
    "updatedAt": "2025-12-01T15:00:00.000Z",
    "categoriaEquipamiento": {
      "id": 2,
      "codigo": "MOB",
      "nombre": "Mobiliario"
    },
    "estadoEquipamiento": {
      "id": 1,
      "codigo": "NUEVO",
      "nombre": "Nuevo",
      "descripcion": "Equipamiento nuevo sin uso"
    }
  }
}
```

**Errores Comunes**:
```json
// Estado no existe
{
  "success": false,
  "error": "Estado de equipamiento con ID 99 no encontrado"
}

// Cantidad inválida
{
  "success": false,
  "error": "La cantidad debe ser al menos 1"
}
```

---

### 4.2. Actualizar Equipamiento

**Endpoint**: `PUT /api/equipamientos/:id`

**Payload** (todos los campos son opcionales):
```json
{
  "nombre": "Sillas Nuevas - Lote 2",
  "cantidad": 75,                    // ⭐ Actualizar stock
  "estadoEquipamientoId": 2,         // ⭐ Cambiar a "Usado"
  "observaciones": "Aumentado stock por nueva compra"
}
```

**Response Exitosa (200)**:
```json
{
  "success": true,
  "message": "Equipamiento actualizado exitosamente",
  "data": {
    "id": 17,
    "codigo": "MOB-005",
    "nombre": "Sillas Nuevas - Lote 2",
    "cantidad": 75,
    "estadoEquipamientoId": 2,
    // ... resto de campos
  }
}
```

**⚠️ Warning en Logs** (si reduces cantidad por debajo de lo asignado):
```
[WARN] ⚠️  Cantidad de equipamiento "Sillas Nuevas" (ID: 17) reducida.
Déficit de inventario: 10 unidades. (Asignadas: 60, Nueva cantidad: 50)
```

> **Nota**: El backend permite reducir cantidad aunque genere déficit, pero registra un warning en logs.

---

### 4.3. Listar Equipamientos

**Endpoint**: `GET /api/equipamientos`

**Parámetros de Query** (todos opcionales):

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `page` | number | Número de página (default: 1) |
| `limit` | number | Items por página (default: 10, max: 100) |
| `activo` | boolean | Filtrar por activo/inactivo |
| `estadoEquipamientoId` | number | ⭐ NUEVO - Filtrar por estado |
| `conStock` | boolean | ⭐ NUEVO - Solo equipamiento con cantidad > 0 |
| `search` | string | Búsqueda en nombre, descripción, observaciones |

**Ejemplos de URLs**:
```
GET /api/equipamientos?page=1&limit=20
GET /api/equipamientos?estadoEquipamientoId=2       # Solo "Usado"
GET /api/equipamientos?conStock=true                # Solo con stock disponible
GET /api/equipamientos?activo=true&conStock=true    # Activos con stock
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 3,
      "codigo": "MOB-001",
      "nombre": "Sillas",
      "cantidad": 100,                  // ⭐ NUEVO
      "estadoEquipamientoId": 2,        // ⭐ NUEVO
      "categoriaEquipamientoId": 2,
      "descripcion": "Sillas estándar para alumnos",
      "activo": true,
      "categoriaEquipamiento": {
        "id": 2,
        "codigo": "MOB",
        "nombre": "Mobiliario"
      },
      "estadoEquipamiento": {           // ⭐ NUEVO
        "id": 2,
        "codigo": "USADO",
        "nombre": "Usado"
      },
      "_count": {
        "aulas_equipamientos": 5        // Asignado a 5 aulas
      }
    }
    // ... más equipamientos
  ],
  "total": 12,
  "pages": 1,
  "currentPage": 1
}
```

---

### 4.4. Obtener Equipamiento por ID

**Endpoint**: `GET /api/equipamientos/:id`

**Response**:
```json
{
  "success": true,
  "data": {
    "id": 3,
    "codigo": "MOB-001",
    "nombre": "Sillas",
    "cantidad": 100,
    "estadoEquipamientoId": 2,
    "categoriaEquipamientoId": 2,
    "descripcion": "Sillas estándar",
    "activo": true,
    "createdAt": "2025-11-28T16:16:30.842Z",
    "updatedAt": "2025-12-01T15:00:00.000Z",
    "categoriaEquipamiento": { /* ... */ },
    "estadoEquipamiento": { /* ... */ },
    "aulas_equipamientos": [          // Lista de asignaciones
      {
        "id": 1,
        "aulaId": 1,
        "equipamientoId": 3,
        "cantidad": 30,
        "observaciones": null,
        "aula": {
          "id": 1,
          "nombre": "Sala Principal",
          "capacidad": 50,
          "activa": true
        }
      }
      // ... más asignaciones
    ]
  }
}
```

---

## 5. Nuevas APIs

### 5.1. Obtener Disponibilidad de Equipamiento

**Endpoint**: `GET /api/equipamientos/:id/disponibilidad`

**Response**:
```json
{
  "success": true,
  "data": {
    "id": 3,
    "codigo": "MOB-001",
    "nombre": "Sillas",
    "cantidad": 100,
    // ... campos básicos del equipamiento
    "disponibilidad": {
      "cantidadTotal": 100,
      "cantidadAsignada": 75,
      "cantidadDisponible": 25,
      "tieneDeficit": false
    }
  }
}
```

**Ejemplo con déficit**:
```json
{
  "disponibilidad": {
    "cantidadTotal": 50,
    "cantidadAsignada": 65,
    "cantidadDisponible": -15,      // Negativo = déficit
    "tieneDeficit": true
  }
}
```

---

### 5.2. Asignar Equipamiento a Aula (Modificada)

**Endpoint**: `POST /api/aulas/:aulaId/equipamientos`

**Payload**:
```json
{
  "equipamientoId": 3,
  "cantidad": 20,                   // Cantidad a asignar
  "observaciones": "Para clase de coro"
}
```

**Response Exitosa - Sin Warning (201)**:
```json
{
  "success": true,
  "message": "Equipamiento asignado exitosamente",
  "data": {
    "id": 25,
    "aulaId": 5,
    "equipamientoId": 3,
    "cantidad": 20,
    "observaciones": "Para clase de coro",
    "createdAt": "2025-12-01T15:30:00.000Z",
    "updatedAt": "2025-12-01T15:30:00.000Z",
    "equipamiento": {
      "id": 3,
      "codigo": "MOB-001",
      "nombre": "Sillas",
      "cantidad": 100
    },
    "aula": {
      "id": 5,
      "nombre": "Aula 101"
    }
  }
}
```

**Response Exitosa - Con Warning por Déficit (201)**:
```json
{
  "success": true,
  "message": "Equipamiento asignado exitosamente",
  "data": {
    "id": 26,
    "aulaId": 6,
    "equipamientoId": 3,
    "cantidad": 50,
    "observaciones": null,
    "warnings": [                    // ⭐ NUEVO - Array de advertencias
      "La asignación generará un déficit de 10 unidades. Disponible: 40, Solicitado: 50"
    ],
    // ... resto de campos
  }
}
```

**Errores Comunes**:

```json
// Estado bloqueado (Roto, En Reparación, Dado de Baja)
{
  "success": false,
  "error": "No se puede asignar equipamiento en estado \"Roto\""
}

// Equipamiento inactivo
{
  "success": false,
  "error": "El equipamiento no está activo"
}

// Ya asignado a esta aula
{
  "success": false,
  "error": "El equipamiento con ID 3 ya está asignado a esta aula"
}

// Cantidad inválida
{
  "success": false,
  "error": "La cantidad debe ser al menos 1"
}
```

---

### 5.3. Actualizar o Crear Aula con Equipamientos

**Endpoint**: `PUT /api/aulas/:id`

**Payload** (sincroniza equipamientos):
```json
{
  "nombre": "Aula 101",
  "capacidad": 30,
  "equipamientos": [                // ⭐ Array completo (reemplaza todo)
    {
      "equipamientoId": 3,
      "cantidad": 20,
      "observaciones": "Sillas principales"
    },
    {
      "equipamientoId": 7,
      "cantidad": 1,
      "observaciones": "Proyector"
    }
  ]
}
```

**Comportamiento**:
- Elimina TODAS las asignaciones actuales
- Crea las nuevas asignaciones del array
- Si `equipamientos` no se envía, NO modifica las asignaciones existentes
- Si `equipamientos: []`, elimina todas las asignaciones

**Response**:
```json
{
  "success": true,
  "message": "Aula actualizada exitosamente",
  "data": {
    "id": 5,
    "nombre": "Aula 101",
    "capacidad": 30,
    // ... campos del aula
    "aulas_equipamientos": [
      {
        "id": 27,
        "equipamientoId": 3,
        "cantidad": 20,
        "observaciones": "Sillas principales",
        "equipamiento": { /* ... */ }
      },
      {
        "id": 28,
        "equipamientoId": 7,
        "cantidad": 1,
        "observaciones": "Proyector",
        "equipamiento": { /* ... */ },
        "warnings": [                // ⭐ Puede incluir warnings
          "La asignación generará un déficit de 2 unidades..."
        ]
      }
    ]
  }
}
```

---

## 6. Validaciones y Reglas de Negocio

### 6.1. Al Crear/Actualizar Equipamiento

| Validación | Comportamiento |
|-----------|----------------|
| `cantidad < 1` | ❌ Error 400 |
| `cantidad < cantidadAsignada` (UPDATE) | ⚠️ Warning en logs, permite operación |
| `estadoEquipamientoId` no existe | ❌ Error 404 |
| `estadoEquipamientoId` inactivo | ❌ Error 400 |

### 6.2. Al Asignar Equipamiento a Aula

| Validación | Comportamiento |
|-----------|----------------|
| Equipamiento no existe | ❌ Error 404 |
| Equipamiento inactivo | ❌ Error 400: "El equipamiento no está activo" |
| Estado = `ROTO` | ❌ Error 400: "No se puede asignar equipamiento en estado Roto" |
| Estado = `EN_REPARACION` | ❌ Error 400: "No se puede asignar..." |
| Estado = `DADO_DE_BAJA` | ❌ Error 400: "No se puede asignar..." |
| `cantidadSolicitada > cantidadDisponible` | ✅ Permite + ⚠️ Warning en response |
| Ya asignado a la misma aula | ❌ Error 409: "Ya está asignado a esta aula" |
| `cantidad < 1` | ❌ Error 400 |

### 6.3. Estados que Bloquean Asignación

```typescript
const ESTADOS_BLOQUEADOS = ['ROTO', 'DADO_DE_BAJA', 'EN_REPARACION'];

// Estados que SÍ permiten asignación
const ESTADOS_PERMITIDOS = ['NUEVO', 'USADO'];
```

---

## 7. Casos de Uso Comunes

### Caso 1: Crear Equipamiento Nuevo

```typescript
// 1. Obtener estados disponibles
const estados = await fetch('/api/catalogos/estados-equipamientos');
const estadoNuevo = estados.data.find(e => e.codigo === 'NUEVO');

// 2. Crear equipamiento
const response = await fetch('/api/equipamientos', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    nombre: 'Piano Digital',
    categoriaEquipamientoId: 1,
    estadoEquipamientoId: estadoNuevo.id,
    cantidad: 5,
    descripcion: 'Pianos digitales Yamaha'
  })
});
```

### Caso 2: Mostrar Disponibilidad en Listado

```typescript
// Obtener equipamientos con su info de asignaciones
const equipamientos = await fetch('/api/equipamientos');

// Para cada equipamiento, calcular disponibilidad
equipamientos.data.forEach(equip => {
  // Opción 1: Llamar al endpoint de disponibilidad
  const disp = await fetch(`/api/equipamientos/${equip.id}/disponibilidad`);

  // Opción 2: Calcular en frontend (si tienes los datos)
  const cantidadAsignada = equip._count.aulas_equipamientos; // Esto NO da la suma, solo el count
  // Mejor usar Opción 1
});
```

**Recomendación UI**:
```tsx
function EquipamientoCard({ equipamiento, disponibilidad }) {
  const deficit = disponibilidad.tieneDeficit;

  return (
    <div>
      <h3>{equipamiento.nombre}</h3>
      <p>Stock Total: {disponibilidad.cantidadTotal}</p>
      <p>Asignadas: {disponibilidad.cantidadAsignada}</p>
      <p className={deficit ? 'text-red-500' : 'text-green-500'}>
        Disponibles: {disponibilidad.cantidadDisponible}
        {deficit && ' ⚠️ DÉFICIT'}
      </p>
    </div>
  );
}
```

### Caso 3: Asignar Equipamiento con Validación

```typescript
async function asignarEquipamiento(aulaId, equipamientoId, cantidad) {
  // 1. Verificar disponibilidad primero (opcional pero recomendado)
  const disp = await fetch(`/api/equipamientos/${equipamientoId}/disponibilidad`);
  const disponible = disp.data.disponibilidad.cantidadDisponible;

  // 2. Mostrar warning al usuario si va a generar déficit
  if (cantidad > disponible) {
    const confirmacion = confirm(
      `Solo hay ${disponible} unidades disponibles. ` +
      `¿Desea asignar ${cantidad} de todas formas? ` +
      `(Generará un déficit de ${cantidad - disponible} unidades)`
    );
    if (!confirmacion) return;
  }

  // 3. Asignar
  const response = await fetch(`/api/aulas/${aulaId}/equipamientos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      equipamientoId,
      cantidad,
      observaciones: 'Asignado desde UI'
    })
  });

  // 4. Manejar warnings en la response
  if (response.data.warnings) {
    showToast('⚠️ Asignado con advertencias: ' + response.data.warnings.join(', '), 'warning');
  } else {
    showToast('✅ Equipamiento asignado correctamente', 'success');
  }
}
```

### Caso 4: Filtrar Equipamiento Disponible

```typescript
// Obtener solo equipamiento con stock y en buen estado
const equipamientosDisponibles = await fetch(
  '/api/equipamientos?conStock=true&activo=true&estadoEquipamientoId=2'  // Estado "USADO"
);

// Para selector de equipamiento en formulario de asignación
const options = equipamientosDisponibles.data.map(e => ({
  value: e.id,
  label: `${e.nombre} (${e.cantidad} disponibles)`,
  disabled: e.estadoEquipamiento?.codigo === 'ROTO' // Deshabilitar rotos visualmente
}));
```

### Caso 5: Actualizar Aula con Equipamientos

```typescript
// Sincronizar equipamientos de un aula (reemplaza todos)
async function actualizarEquipamientosAula(aulaId, equipamientos) {
  const response = await fetch(`/api/aulas/${aulaId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      equipamientos: [
        { equipamientoId: 3, cantidad: 30, observaciones: 'Sillas' },
        { equipamientoId: 7, cantidad: 1, observaciones: 'Proyector' }
      ]
    })
  });

  // Verificar warnings en cada equipamiento asignado
  response.data.aulas_equipamientos.forEach(asig => {
    if (asig.warnings) {
      console.warn('Advertencia en', asig.equipamiento.nombre, ':', asig.warnings);
    }
  });
}
```

---

## 8. Manejo de Errores y Warnings

### 8.1. Tipos de Errores

```typescript
interface ErrorResponse {
  success: false;
  error: string;              // Mensaje de error
  details?: any;              // Detalles adicionales (opcional)
}
```

**Códigos HTTP**:
- `400 Bad Request`: Validación fallida, datos inválidos
- `404 Not Found`: Recurso no encontrado
- `409 Conflict`: Conflicto (ej: equipamiento ya asignado)
- `500 Internal Server Error`: Error del servidor

### 8.2. Manejo de Warnings

Los warnings **NO son errores**. La operación se ejecuta exitosamente pero con advertencias.

```typescript
interface SuccessWithWarnings {
  success: true;
  message: string;
  data: {
    // ... datos de la respuesta
    warnings?: string[];      // Array de mensajes de advertencia
  };
}
```

**Ejemplo de manejo**:
```typescript
const response = await asignarEquipamiento(aulaId, equipamientoId, cantidad);

if (response.success) {
  if (response.data.warnings && response.data.warnings.length > 0) {
    // Mostrar warnings al usuario
    showNotification({
      type: 'warning',
      title: 'Asignado con advertencias',
      message: response.data.warnings.join('\n')
    });
  } else {
    // Todo OK sin warnings
    showNotification({
      type: 'success',
      title: 'Equipamiento asignado',
      message: 'Sin problemas de disponibilidad'
    });
  }
} else {
  // Error
  showNotification({
    type: 'error',
    title: 'Error al asignar',
    message: response.error
  });
}
```

---

## 9. Ejemplos Completos

### Ejemplo 1: Flujo Completo - Crear y Asignar Equipamiento

```typescript
async function crearYAsignarEquipamiento() {
  // Paso 1: Crear equipamiento nuevo
  const nuevoEquipamiento = await fetch('/api/equipamientos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nombre: 'Atriles Profesionales',
      categoriaEquipamientoId: 2,  // Mobiliario
      estadoEquipamientoId: 1,      // Nuevo
      cantidad: 30,
      descripcion: 'Atriles metálicos profesionales'
    })
  });

  console.log('Equipamiento creado:', nuevoEquipamiento.data);
  // Output: { id: 18, codigo: "MOB-006", nombre: "Atriles Profesionales", cantidad: 30, ... }

  // Paso 2: Asignar a un aula
  const asignacion = await fetch('/api/aulas/5/equipamientos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      equipamientoId: nuevoEquipamiento.data.id,
      cantidad: 15,
      observaciones: 'Para aula de orquesta'
    })
  });

  console.log('Asignación:', asignacion.data);
  // Output: { id: 30, aulaId: 5, equipamientoId: 18, cantidad: 15, warnings: undefined }

  // Paso 3: Verificar disponibilidad actualizada
  const disponibilidad = await fetch(`/api/equipamientos/${nuevoEquipamiento.data.id}/disponibilidad`);
  console.log('Disponibilidad:', disponibilidad.data.disponibilidad);
  // Output: { cantidadTotal: 30, cantidadAsignada: 15, cantidadDisponible: 15, tieneDeficit: false }
}
```

### Ejemplo 2: Componente React - Formulario de Equipamiento

```tsx
import React, { useState, useEffect } from 'react';

function FormularioEquipamiento({ equipamientoId, onSave }) {
  const [estados, setEstados] = useState([]);
  const [form, setForm] = useState({
    nombre: '',
    categoriaEquipamientoId: '',
    estadoEquipamientoId: '',
    cantidad: 1,
    descripcion: '',
    observaciones: ''
  });

  useEffect(() => {
    // Cargar estados al montar
    fetch('/api/catalogos/estados-equipamientos')
      .then(res => res.json())
      .then(data => setEstados(data.data));

    // Si es edición, cargar datos
    if (equipamientoId) {
      fetch(`/api/equipamientos/${equipamientoId}`)
        .then(res => res.json())
        .then(data => setForm(data.data));
    }
  }, [equipamientoId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const url = equipamientoId
      ? `/api/equipamientos/${equipamientoId}`
      : '/api/equipamientos';
    const method = equipamientoId ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });

    const result = await response.json();

    if (result.success) {
      alert('✅ Equipamiento guardado correctamente');
      onSave(result.data);
    } else {
      alert('❌ Error: ' + result.error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Nombre"
        value={form.nombre}
        onChange={e => setForm({...form, nombre: e.target.value})}
        required
      />

      <select
        value={form.estadoEquipamientoId}
        onChange={e => setForm({...form, estadoEquipamientoId: parseInt(e.target.value)})}
      >
        <option value="">Seleccione estado</option>
        {estados.map(estado => (
          <option key={estado.id} value={estado.id}>
            {estado.nombre}
          </option>
        ))}
      </select>

      <input
        type="number"
        placeholder="Cantidad"
        min="1"
        value={form.cantidad}
        onChange={e => setForm({...form, cantidad: parseInt(e.target.value)})}
        required
      />

      <textarea
        placeholder="Descripción"
        value={form.descripcion}
        onChange={e => setForm({...form, descripcion: e.target.value})}
      />

      <button type="submit">
        {equipamientoId ? 'Actualizar' : 'Crear'} Equipamiento
      </button>
    </form>
  );
}
```

### Ejemplo 3: Componente React - Asignar Equipamiento a Aula

```tsx
import React, { useState, useEffect } from 'react';

function AsignarEquipamientoModal({ aulaId, onClose, onSuccess }) {
  const [equipamientos, setEquipamientos] = useState([]);
  const [selectedEquipamiento, setSelectedEquipamiento] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const [disponibilidad, setDisponibilidad] = useState(null);
  const [observaciones, setObservaciones] = useState('');

  useEffect(() => {
    // Cargar equipamientos activos con stock
    fetch('/api/equipamientos?activo=true&conStock=true')
      .then(res => res.json())
      .then(data => setEquipamientos(data.data));
  }, []);

  useEffect(() => {
    // Cargar disponibilidad cuando cambia el equipamiento seleccionado
    if (selectedEquipamiento) {
      fetch(`/api/equipamientos/${selectedEquipamiento}/disponibilidad`)
        .then(res => res.json())
        .then(data => setDisponibilidad(data.data.disponibilidad));
    }
  }, [selectedEquipamiento]);

  const handleAsignar = async () => {
    // Validar estado bloqueado
    const equip = equipamientos.find(e => e.id === selectedEquipamiento);
    const estadosBloqueados = ['ROTO', 'EN_REPARACION', 'DADO_DE_BAJA'];

    if (equip && estadosBloqueados.includes(equip.estadoEquipamiento?.codigo)) {
      alert(`❌ No se puede asignar equipamiento en estado "${equip.estadoEquipamiento.nombre}"`);
      return;
    }

    // Warning de déficit
    if (disponibilidad && cantidad > disponibilidad.cantidadDisponible) {
      const deficit = cantidad - disponibilidad.cantidadDisponible;
      const confirmar = confirm(
        `⚠️ ADVERTENCIA\n\n` +
        `Solo hay ${disponibilidad.cantidadDisponible} unidades disponibles.\n` +
        `Si asigna ${cantidad}, generará un déficit de ${deficit} unidades.\n\n` +
        `¿Desea continuar de todas formas?`
      );
      if (!confirmar) return;
    }

    // Asignar
    const response = await fetch(`/api/aulas/${aulaId}/equipamientos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        equipamientoId: selectedEquipamiento,
        cantidad,
        observaciones
      })
    });

    const result = await response.json();

    if (result.success) {
      if (result.data.warnings) {
        alert('⚠️ Asignado con advertencias:\n' + result.data.warnings.join('\n'));
      } else {
        alert('✅ Equipamiento asignado correctamente');
      }
      onSuccess();
      onClose();
    } else {
      alert('❌ Error: ' + result.error);
    }
  };

  return (
    <div className="modal">
      <h2>Asignar Equipamiento al Aula</h2>

      <select
        onChange={e => setSelectedEquipamiento(parseInt(e.target.value))}
        value={selectedEquipamiento || ''}
      >
        <option value="">Seleccione equipamiento</option>
        {equipamientos.map(equip => (
          <option
            key={equip.id}
            value={equip.id}
            disabled={['ROTO', 'DADO_DE_BAJA', 'EN_REPARACION'].includes(equip.estadoEquipamiento?.codigo)}
          >
            {equip.nombre} - {equip.estadoEquipamiento?.nombre}
            ({equip.cantidad} en stock)
          </option>
        ))}
      </select>

      {disponibilidad && (
        <div className="disponibilidad-info">
          <p>Stock Total: {disponibilidad.cantidadTotal}</p>
          <p>Asignadas: {disponibilidad.cantidadAsignada}</p>
          <p className={disponibilidad.cantidadDisponible < 0 ? 'text-red-500' : ''}>
            Disponibles: {disponibilidad.cantidadDisponible}
            {disponibilidad.tieneDeficit && ' ⚠️ DÉFICIT'}
          </p>
        </div>
      )}

      <input
        type="number"
        min="1"
        value={cantidad}
        onChange={e => setCantidad(parseInt(e.target.value))}
        placeholder="Cantidad"
      />

      {disponibilidad && cantidad > disponibilidad.cantidadDisponible && (
        <div className="warning-box">
          ⚠️ La cantidad solicitada supera el stock disponible.
          Se generará un déficit de {cantidad - disponibilidad.cantidadDisponible} unidades.
        </div>
      )}

      <textarea
        placeholder="Observaciones (opcional)"
        value={observaciones}
        onChange={e => setObservaciones(e.target.value)}
      />

      <button onClick={handleAsignar} disabled={!selectedEquipamiento}>
        Asignar
      </button>
      <button onClick={onClose}>Cancelar</button>
    </div>
  );
}
```

---

## 📝 Notas Finales

### Compatibilidad

- Los campos `cantidad` y `estadoEquipamientoId` son **opcionales** en CREATE
- Si no se envían, usan valores por defecto:
  - `cantidad`: 1
  - `estadoEquipamientoId`: null (sin estado)

### Performance

- Endpoint `/api/equipamientos/:id/disponibilidad` hace 2 queries (equipamiento + asignaciones)
- Considerar cachear disponibilidad si se consulta frecuentemente
- El campo `_count.aulas_equipamientos` en el listado NO da la suma de cantidades, solo cuenta registros

### Validaciones en Frontend

**Recomendamos validar en frontend**:
1. Cantidad > 0
2. Estado no bloqueado antes de asignar
3. Mostrar warning visual si cantidad > disponible

**NO validar en frontend** (backend lo hace):
- Equipamiento existe
- Estado existe
- Nombre único
- Aula existe

---

## 🆘 Soporte

Si tienes dudas o encuentras problemas:

1. Revisa los logs del servidor para warnings/errors
2. Verifica que estés usando los endpoints correctos
3. Confirma que los payloads cumplan el schema
4. Contacta al equipo de backend para soporte

**Endpoints de Diagnóstico**:
- `GET /health` - Salud del servidor
- `GET /api/equipamientos/:id` - Ver estado completo de un equipamiento
- `GET /api/equipamientos/:id/disponibilidad` - Ver disponibilidad detallada

---

**Versión del Documento**: 1.0
**Última Actualización**: 2025-12-01
**Changelog**:
- 1.0 (2025-12-01): Versión inicial con sistema de cantidad y estados
