# API COMPLETA - GESTIÓN DE AULAS

**Base URL**: `http://localhost:8000/api`

---

## 📋 ÍNDICE

1. [Catálogos de Referencia](#catálogos-de-referencia)
2. [CRUD de Aulas](#crud-de-aulas)
3. [Endpoints Especiales de Búsqueda](#endpoints-especiales-de-búsqueda)
4. [Gestión de Equipamientos](#gestión-de-equipamientos)
5. [Disponibilidad y Reservas](#disponibilidad-y-reservas)
6. [Estructuras de Datos Completas](#estructuras-de-datos-completas)

---

## 1️⃣ CATÁLOGOS DE REFERENCIA

### GET /api/catalogos/tipos-aulas

Obtiene todos los tipos de aula disponibles.

**Request:**
```bash
GET /api/catalogos/tipos-aulas
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 2,
      "codigo": "TEORIA",
      "nombre": "Aula de Teoría",
      "descripcion": "Aula destinada a clases teóricas de música",
      "activo": true,
      "orden": 1,
      "createdAt": "2025-11-26T18:08:39.161Z",
      "updatedAt": "2025-11-26T18:08:39.161Z",
      "_count": {
        "aulas": 0
      }
    },
    {
      "id": 1,
      "codigo": "PRACTICA",
      "nombre": "Aula de Práctica",
      "descripcion": "Aula destinada a práctica individual o grupal",
      "activo": true,
      "orden": 2,
      "_count": {
        "aulas": 2
      }
    },
    {
      "id": 4,
      "codigo": "ESTUDIO",
      "nombre": "Estudio de Grabación",
      "descripcion": "Estudio profesional de grabación y producción",
      "activo": true,
      "orden": 3,
      "_count": {
        "aulas": 1
      }
    },
    {
      "id": 3,
      "codigo": "ENSAYO",
      "nombre": "Sala de Ensayo",
      "descripcion": "Sala amplia para ensayos grupales y orquestales",
      "activo": true,
      "orden": 4,
      "_count": {
        "aulas": 1
      }
    },
    {
      "id": 5,
      "codigo": "AUDITORIO",
      "nombre": "Auditorio",
      "descripcion": "Auditorio para conciertos y presentaciones",
      "activo": true,
      "orden": 5,
      "_count": {
        "aulas": 0
      }
    }
  ],
  "meta": {
    "total": 5
  }
}
```

**Códigos disponibles:**
- `TEORIA` → ID: 2
- `PRACTICA` → ID: 1
- `ESTUDIO` → ID: 4
- `ENSAYO` → ID: 3
- `AUDITORIO` → ID: 5

---

### GET /api/catalogos/estados-aulas

Obtiene todos los estados de aula disponibles.

**Request:**
```bash
GET /api/catalogos/estados-aulas
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 2,
      "codigo": "DISPONIBLE",
      "nombre": "Disponible",
      "descripcion": "Aula disponible para uso",
      "activo": true,
      "orden": 1,
      "createdAt": "2025-11-26T18:08:39.170Z",
      "updatedAt": "2025-11-26T18:08:39.170Z",
      "_count": {
        "aulas": 5
      }
    },
    {
      "id": 4,
      "codigo": "EN_MANTENIMIENTO",
      "nombre": "En Mantenimiento",
      "descripcion": "Aula temporalmente fuera de servicio por mantenimiento",
      "activo": true,
      "orden": 2,
      "_count": {
        "aulas": 0
      }
    },
    {
      "id": 1,
      "codigo": "CERRADA",
      "nombre": "Cerrada",
      "descripcion": "Aula cerrada permanentemente",
      "activo": true,
      "orden": 3,
      "_count": {
        "aulas": 0
      }
    },
    {
      "id": 3,
      "codigo": "RESERVADA",
      "nombre": "Reservada",
      "descripcion": "Aula con reserva permanente",
      "activo": true,
      "orden": 4,
      "_count": {
        "aulas": 1
      }
    }
  ],
  "meta": {
    "total": 4
  }
}
```

**Códigos disponibles:**
- `DISPONIBLE` → ID: 2
- `EN_MANTENIMIENTO` → ID: 4
- `CERRADA` → ID: 1
- `RESERVADA` → ID: 3

---

### GET /api/equipamientos

Obtiene todos los equipamientos disponibles.

**Request:**
```bash
GET /api/equipamientos?activo=true
```

**Response (ejemplo simplificado):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "codigo": "MOB-001",
      "nombre": "Sillas",
      "categoriaEquipamientoId": 4,
      "descripcion": "Sillas estándar para alumnos",
      "activo": true
    },
    {
      "id": 3,
      "codigo": "MOB-002",
      "nombre": "Atriles",
      "categoriaEquipamientoId": 4,
      "descripcion": "Atriles de partituras",
      "activo": true
    },
    {
      "id": 5,
      "codigo": "INST-002",
      "nombre": "Piano Vertical",
      "categoriaEquipamientoId": 3,
      "descripcion": "Piano vertical acústico",
      "activo": true
    }
  ]
}
```

---

## 2️⃣ CRUD DE AULAS

### POST /api/aulas - Crear Nueva Aula

Crea una nueva aula con equipamientos opcionales.

**Formatos Soportados:**

#### Opción 1: Usando IDs (tradicional)
```json
{
  "nombre": "Aula 201",
  "capacidad": 25,
  "ubicacion": "Segundo Piso",
  "tipoAulaId": 1,
  "estadoAulaId": 2,
  "descripcion": "Aula de práctica con piano",
  "observaciones": "Requiere limpieza semanal",
  "equipamientos": [
    {
      "equipamientoId": 5,
      "cantidad": 1,
      "observaciones": "Piano nuevo"
    },
    {
      "equipamientoId": 3,
      "cantidad": 20,
      "observaciones": "Atriles para todos"
    }
  ]
}
```

#### Opción 2: Usando códigos string (recomendado - más legible)
```json
{
  "nombre": "Aula 201",
  "capacidad": 25,
  "ubicacion": "Segundo Piso",
  "tipo": "practica",
  "estado": "disponible",
  "descripcion": "Aula de práctica con piano",
  "equipamientoIds": [5, 3, 1]
}
```

#### Opción 3: Mixto
```json
{
  "nombre": "Aula 201",
  "capacidad": 25,
  "tipo": "ensayo",
  "estadoAulaId": 2,
  "equipamientoIds": [5, 3]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Aula creada exitosamente",
  "data": {
    "id": 10,
    "nombre": "Aula 201",
    "capacidad": 25,
    "ubicacion": "Segundo Piso",
    "tipoAulaId": 1,
    "estadoAulaId": 2,
    "descripcion": "Aula de práctica con piano",
    "observaciones": "Requiere limpieza semanal",
    "activa": true,
    "createdAt": "2025-11-27T16:00:00.000Z",
    "updatedAt": "2025-11-27T16:00:00.000Z",
    "tipoAula": {
      "id": 1,
      "codigo": "PRACTICA",
      "nombre": "Aula de Práctica",
      "descripcion": "Aula destinada a práctica individual o grupal",
      "activo": true,
      "orden": 2
    },
    "estadoAula": {
      "id": 2,
      "codigo": "DISPONIBLE",
      "nombre": "Disponible",
      "descripcion": "Aula disponible para uso",
      "activo": true,
      "orden": 1
    },
    "aulas_equipamientos": [
      {
        "id": 28,
        "aulaId": 10,
        "equipamientoId": 5,
        "cantidad": 1,
        "observaciones": "Piano nuevo",
        "createdAt": "2025-11-27T16:00:00.000Z",
        "updatedAt": "2025-11-27T16:00:00.000Z",
        "equipamiento": {
          "id": 5,
          "codigo": "INST-002",
          "nombre": "Piano Vertical",
          "categoriaEquipamientoId": 3,
          "descripcion": "Piano vertical acústico",
          "observaciones": "Requiere afinación periódica",
          "activo": true,
          "createdAt": "2025-11-26T18:08:39.204Z",
          "updatedAt": "2025-11-26T18:08:39.204Z"
        }
      },
      {
        "id": 29,
        "aulaId": 10,
        "equipamientoId": 3,
        "cantidad": 20,
        "observaciones": "Atriles para todos",
        "equipamiento": {
          "id": 3,
          "codigo": "MOB-002",
          "nombre": "Atriles",
          "categoriaEquipamientoId": 4,
          "descripcion": "Atriles de partituras",
          "activo": true
        }
      }
    ]
  }
}
```

**⚠️ IMPORTANTE PARA FRONTEND:**

El campo de equipamientos se llama **`aulas_equipamientos`** (no `equipamientos`).

Cada elemento tiene:
- `id`: ID de la relación aula-equipamiento
- `aulaId`: ID del aula
- `equipamientoId`: ID del equipamiento
- `cantidad`: Cantidad asignada
- `observaciones`: Notas específicas
- `equipamiento`: **Objeto completo del equipamiento** con todos sus datos

---

### GET /api/aulas - Listar Aulas (con paginación)

Obtiene todas las aulas con filtros opcionales.

**Query Parameters:**
- `page` (number, default: 1): Número de página
- `limit` (number, default: 10): Elementos por página
- `activa` (boolean): Filtrar por estado activo/inactivo
- `tipoAulaId` (number): Filtrar por tipo de aula
- `estadoAulaId` (number): Filtrar por estado
- `capacidadMinima` (number): Capacidad mínima
- `capacidadMaxima` (number): Capacidad máxima
- `conEquipamiento` (boolean): true = solo con equipamiento, false = sin equipamiento
- `search` (string): Búsqueda en nombre, ubicación, descripción

**Ejemplos de Request:**

```bash
# Listar todas las aulas activas (paginado)
GET /api/aulas?activa=true&page=1&limit=10

# Filtrar por tipo PRACTICA
GET /api/aulas?tipoAulaId=1

# Filtrar por estado DISPONIBLE
GET /api/aulas?estadoAulaId=2

# Filtrar por capacidad
GET /api/aulas?capacidadMinima=15&capacidadMaxima=30

# Solo aulas con equipamiento
GET /api/aulas?conEquipamiento=true

# Búsqueda por texto
GET /api/aulas?search=piano

# Combinación de filtros
GET /api/aulas?activa=true&tipoAulaId=1&conEquipamiento=true&page=1&limit=20
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 3,
      "nombre": "Aula 101",
      "capacidad": 20,
      "ubicacion": "Primer Piso",
      "tipoAulaId": 1,
      "estadoAulaId": 2,
      "descripcion": "Aula de práctica para clases grupales",
      "observaciones": "Incluye piano vertical",
      "activa": true,
      "createdAt": "2025-11-26T18:08:39.289Z",
      "updatedAt": "2025-11-26T18:08:39.289Z",
      "tipoAula": {
        "id": 1,
        "codigo": "PRACTICA",
        "nombre": "Aula de Práctica",
        "descripcion": "Aula destinada a práctica individual o grupal",
        "activo": true,
        "orden": 2
      },
      "estadoAula": {
        "id": 2,
        "codigo": "DISPONIBLE",
        "nombre": "Disponible",
        "descripcion": "Aula disponible para uso",
        "activo": true,
        "orden": 1
      },
      "aulas_equipamientos": [
        {
          "id": 6,
          "aulaId": 3,
          "equipamientoId": 5,
          "cantidad": 1,
          "observaciones": null,
          "equipamiento": {
            "id": 5,
            "codigo": "INST-002",
            "nombre": "Piano Vertical",
            "categoriaEquipamientoId": 3,
            "descripcion": "Piano vertical acústico",
            "observaciones": "Requiere afinación periódica",
            "activo": true
          }
        },
        {
          "id": 7,
          "aulaId": 3,
          "equipamientoId": 9,
          "cantidad": 1,
          "equipamiento": {
            "id": 9,
            "codigo": "DIDA-001",
            "nombre": "Pizarra Musical",
            "categoriaEquipamientoId": 2,
            "activo": true
          }
        },
        {
          "id": 8,
          "aulaId": 3,
          "equipamientoId": 1,
          "cantidad": 20,
          "equipamiento": {
            "id": 1,
            "codigo": "MOB-001",
            "nombre": "Sillas",
            "activo": true
          }
        }
      ],
      "_count": {
        "reserva_aulas": 0,
        "reservas_aulas_secciones": 1,
        "aulas_equipamientos": 5
      }
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 9,
    "totalPages": 1
  }
}
```

---

### GET /api/aulas/:id - Obtener Aula por ID

Obtiene una aula específica con todas sus relaciones.

**Request:**
```bash
GET /api/aulas/3
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 3,
    "nombre": "Aula 101",
    "capacidad": 20,
    "ubicacion": "Primer Piso",
    "tipoAulaId": 1,
    "estadoAulaId": 2,
    "descripcion": "Aula de práctica para clases grupales",
    "observaciones": "Incluye piano vertical",
    "activa": true,
    "createdAt": "2025-11-26T18:08:39.289Z",
    "updatedAt": "2025-11-26T18:08:39.289Z",
    "tipoAula": {
      "id": 1,
      "codigo": "PRACTICA",
      "nombre": "Aula de Práctica",
      "descripcion": "Aula destinada a práctica individual o grupal",
      "activo": true,
      "orden": 2
    },
    "estadoAula": {
      "id": 2,
      "codigo": "DISPONIBLE",
      "nombre": "Disponible",
      "descripcion": "Aula disponible para uso",
      "activo": true,
      "orden": 1
    },
    "aulas_equipamientos": [
      {
        "id": 6,
        "aulaId": 3,
        "equipamientoId": 5,
        "cantidad": 1,
        "observaciones": null,
        "createdAt": "2025-11-26T18:08:39.305Z",
        "updatedAt": "2025-11-26T18:08:39.305Z",
        "equipamiento": {
          "id": 5,
          "codigo": "INST-002",
          "nombre": "Piano Vertical",
          "categoriaEquipamientoId": 3,
          "descripcion": "Piano vertical acústico",
          "observaciones": "Requiere afinación periódica",
          "activo": true,
          "createdAt": "2025-11-26T18:08:39.204Z",
          "updatedAt": "2025-11-26T18:08:39.204Z"
        }
      }
    ],
    "reserva_aulas": [],
    "_count": {
      "reserva_aulas": 0,
      "reservas_aulas_secciones": 1,
      "aulas_equipamientos": 5
    }
  }
}
```

---

### PUT /api/aulas/:id - Actualizar Aula

Actualiza una aula existente (todos los campos son opcionales).

**Request:**
```bash
PUT /api/aulas/10
Content-Type: application/json
```

**Body (Opción 1 - IDs):**
```json
{
  "nombre": "Aula 201 Renovada",
  "capacidad": 30,
  "tipoAulaId": 3,
  "estadoAulaId": 2,
  "descripcion": "Aula renovada con nuevos equipos"
}
```

**Body (Opción 2 - Códigos string):**
```json
{
  "nombre": "Aula 201 Renovada",
  "capacidad": 30,
  "tipo": "ensayo",
  "estado": "disponible",
  "descripcion": "Aula renovada con nuevos equipos"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Aula actualizada exitosamente",
  "data": {
    "id": 10,
    "nombre": "Aula 201 Renovada",
    "capacidad": 30,
    "ubicacion": "Segundo Piso",
    "tipoAulaId": 3,
    "estadoAulaId": 2,
    "descripcion": "Aula renovada con nuevos equipos",
    "observaciones": null,
    "activa": true,
    "updatedAt": "2025-11-27T17:00:00.000Z",
    "tipoAula": {
      "id": 3,
      "codigo": "ENSAYO",
      "nombre": "Sala de Ensayo"
    },
    "estadoAula": {
      "id": 2,
      "codigo": "DISPONIBLE",
      "nombre": "Disponible"
    },
    "aulas_equipamientos": [
      {
        "id": 28,
        "equipamientoId": 5,
        "cantidad": 1,
        "equipamiento": {
          "id": 5,
          "nombre": "Piano Vertical"
        }
      }
    ]
  }
}
```

**⚠️ NOTA IMPORTANTE:**
El endpoint PUT **NO actualiza los equipamientos**. Para gestionar equipamientos, usar los endpoints específicos de equipamientos (ver sección 4).

---

### DELETE /api/aulas/:id - Eliminar/Desactivar Aula

Elimina o desactiva un aula.

**Soft Delete (por defecto - recomendado):**
```bash
DELETE /api/aulas/10
```

**Hard Delete (eliminar permanentemente):**
```bash
DELETE /api/aulas/10?hard=true
```

**Response (Soft Delete):**
```json
{
  "success": true,
  "message": "Aula dada de baja",
  "data": {
    "id": 10,
    "nombre": "Aula 201",
    "activa": false,
    "updatedAt": "2025-11-27T17:30:00.000Z"
  }
}
```

**Response (Hard Delete):**
```json
{
  "success": true,
  "message": "Aula eliminada permanentemente",
  "data": {
    "id": 10,
    "nombre": "Aula 201"
  }
}
```

---

## 3️⃣ ENDPOINTS ESPECIALES DE BÚSQUEDA

### GET /api/aulas/disponibles

Obtiene todas las aulas activas ordenadas por capacidad.

**Request:**
```bash
GET /api/aulas/disponibles
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nombre": "Aula Pequeña",
      "capacidad": 10,
      "ubicacion": "Planta Baja",
      "activa": true
    },
    {
      "id": 3,
      "nombre": "Aula 101",
      "capacidad": 20,
      "activa": true
    }
  ]
}
```

---

### GET /api/aulas/search?q=

Búsqueda flexible por nombre, ubicación o descripción.

**Request:**
```bash
GET /api/aulas/search?q=piano
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 3,
      "nombre": "Aula 101",
      "descripcion": "Aula con piano vertical",
      "tipoAula": {
        "nombre": "Aula de Práctica"
      },
      "estadoAula": {
        "nombre": "Disponible"
      }
    }
  ]
}
```

---

### GET /api/aulas/por-capacidad?capacidad=

Obtiene aulas con capacidad mayor o igual al valor especificado.

**Request:**
```bash
GET /api/aulas/por-capacidad?capacidad=20
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 3,
      "nombre": "Aula 101",
      "capacidad": 20
    },
    {
      "id": 5,
      "nombre": "Sala de Ensayo",
      "capacidad": 50
    }
  ]
}
```

---

### GET /api/aulas/con-equipamiento

Obtiene todas las aulas que tienen al menos un equipamiento asignado.

**Request:**
```bash
GET /api/aulas/con-equipamiento
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 3,
      "nombre": "Aula 101",
      "aulas_equipamientos": [
        {
          "equipamiento": {
            "id": 5,
            "nombre": "Piano Vertical"
          },
          "cantidad": 1
        }
      ]
    }
  ]
}
```

---

### GET /api/aulas/menor-uso

Obtiene aulas ordenadas por cantidad de reservas (menor a mayor).

**Request:**
```bash
GET /api/aulas/menor-uso
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 7,
      "nombre": "Aula Nueva",
      "capacidad": 15,
      "ubicacion": "Tercer Piso",
      "totalReservas": 0
    },
    {
      "id": 3,
      "nombre": "Aula 101",
      "capacidad": 20,
      "totalReservas": 5
    }
  ]
}
```

---

## 4️⃣ GESTIÓN DE EQUIPAMIENTOS

### POST /api/aulas/:id/equipamientos - Agregar Equipamiento

Asigna un equipamiento a un aula (cantidad específica).

**Request:**
```bash
POST /api/aulas/3/equipamientos
Content-Type: application/json
```

**Body:**
```json
{
  "equipamientoId": 1,
  "cantidad": 25,
  "observaciones": "Sillas nuevas adquiridas en 2025"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Equipamiento asignado al aula exitosamente",
  "data": {
    "id": 30,
    "aulaId": 3,
    "equipamientoId": 1,
    "cantidad": 25,
    "observaciones": "Sillas nuevas adquiridas en 2025",
    "createdAt": "2025-11-27T18:00:00.000Z",
    "updatedAt": "2025-11-27T18:00:00.000Z",
    "equipamiento": {
      "id": 1,
      "codigo": "MOB-001",
      "nombre": "Sillas",
      "categoriaEquipamientoId": 4,
      "activo": true
    },
    "aula": {
      "id": 3,
      "nombre": "Aula 101"
    }
  }
}
```

---

### GET /api/aulas/:id/equipamientos - Listar Equipamientos del Aula

Obtiene todos los equipamientos asignados a un aula.

**Request:**
```bash
GET /api/aulas/3/equipamientos
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 6,
      "aulaId": 3,
      "equipamientoId": 5,
      "cantidad": 1,
      "observaciones": null,
      "createdAt": "2025-11-26T18:08:39.305Z",
      "updatedAt": "2025-11-26T18:08:39.305Z",
      "equipamiento": {
        "id": 5,
        "codigo": "INST-002",
        "nombre": "Piano Vertical",
        "categoriaEquipamientoId": 3,
        "descripcion": "Piano vertical acústico",
        "observaciones": "Requiere afinación periódica",
        "activo": true
      }
    },
    {
      "id": 8,
      "aulaId": 3,
      "equipamientoId": 1,
      "cantidad": 20,
      "equipamiento": {
        "id": 1,
        "codigo": "MOB-001",
        "nombre": "Sillas",
        "activo": true
      }
    }
  ]
}
```

---

### PUT /api/aulas/:id/equipamientos/:equipamientoId - Actualizar Cantidad

Actualiza la cantidad de un equipamiento ya asignado.

**Request:**
```bash
PUT /api/aulas/3/equipamientos/1
Content-Type: application/json
```

**Body:**
```json
{
  "cantidad": 30,
  "observaciones": "Se agregaron 10 sillas más"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Cantidad de equipamiento actualizada exitosamente",
  "data": {
    "id": 8,
    "aulaId": 3,
    "equipamientoId": 1,
    "cantidad": 30,
    "observaciones": "Se agregaron 10 sillas más",
    "updatedAt": "2025-11-27T18:15:00.000Z",
    "equipamiento": {
      "id": 1,
      "nombre": "Sillas"
    }
  }
}
```

---

### DELETE /api/aulas/:id/equipamientos/:equipamientoId - Quitar Equipamiento

Elimina completamente la asignación de un equipamiento.

**Request:**
```bash
DELETE /api/aulas/3/equipamientos/1
```

**Response:**
```json
{
  "success": true,
  "message": "Equipamiento removido del aula exitosamente"
}
```

---

## 5️⃣ DISPONIBILIDAD Y RESERVAS

### POST /api/aulas/:id/verificar-disponibilidad

Verifica si un aula está disponible en un rango de fechas.

**Request:**
```bash
POST /api/aulas/3/verificar-disponibilidad
Content-Type: application/json
```

**Body:**
```json
{
  "fechaInicio": "2025-12-01T09:00:00.000Z",
  "fechaFin": "2025-12-01T11:00:00.000Z",
  "excluirReservaId": "cm4kg8gba0009i2e1mwkud51h"
}
```

**Response (Disponible):**
```json
{
  "success": true,
  "data": {
    "disponible": true,
    "aulaId": 3,
    "fechaInicio": "2025-12-01T09:00:00.000Z",
    "fechaFin": "2025-12-01T11:00:00.000Z"
  }
}
```

**Response (No Disponible):**
```json
{
  "success": true,
  "data": {
    "disponible": false,
    "aulaId": 3,
    "fechaInicio": "2025-12-01T09:00:00.000Z",
    "fechaFin": "2025-12-01T11:00:00.000Z",
    "conflictos": [
      {
        "id": 15,
        "fechaInicio": "2025-12-01T08:00:00.000Z",
        "fechaFin": "2025-12-01T10:00:00.000Z",
        "actividad": "Clase de Teoría Musical"
      }
    ]
  }
}
```

---

### GET /api/aulas/:id/reservas

Obtiene todas las reservas de un aula (con filtros opcionales).

**Query Parameters:**
- `fechaDesde` (ISO datetime): Fecha inicio del rango
- `fechaHasta` (ISO datetime): Fecha fin del rango

**Request:**
```bash
GET /api/aulas/3/reservas?fechaDesde=2025-11-01T00:00:00.000Z&fechaHasta=2025-12-31T23:59:59.999Z
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 10,
      "aulaId": 3,
      "fechaInicio": "2025-11-15T09:00:00.000Z",
      "fechaFin": "2025-11-15T11:00:00.000Z",
      "observaciones": "Clase regular de piano",
      "actividades": {
        "id": 5,
        "nombre": "Piano Avanzado",
        "tipoActividadId": 2
      }
    }
  ]
}
```

---

### GET /api/aulas/:id/estadisticas

Obtiene estadísticas detalladas de uso del aula.

**Request:**
```bash
GET /api/aulas/3/estadisticas
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalReservas": 45,
    "capacidad": 20,
    "reservasPorActividad": [
      {
        "actividad": {
          "id": 5,
          "nombre": "Piano Avanzado",
          "tipoActividadId": 2
        },
        "count": 25
      },
      {
        "actividad": {
          "id": 8,
          "nombre": "Teoría Musical",
          "tipoActividadId": 1
        },
        "count": 20
      }
    ],
    "reservasMesActual": 8,
    "aulaInfo": {
      "nombre": "Aula 101",
      "ubicacion": "Primer Piso"
    }
  }
}
```

---

## 6️⃣ ESTRUCTURAS DE DATOS COMPLETAS

### Estructura Completa de Aula

```typescript
interface Aula {
  // Campos principales
  id: number;
  nombre: string;
  capacidad: number;
  ubicacion?: string;
  tipoAulaId?: number;
  estadoAulaId?: number;
  descripcion?: string;
  observaciones?: string;
  activa: boolean;
  createdAt: string; // ISO datetime
  updatedAt: string; // ISO datetime

  // Relaciones (cuando se incluyen)
  tipoAula?: {
    id: number;
    codigo: string;
    nombre: string;
    descripcion?: string;
    activo: boolean;
    orden: number;
    createdAt: string;
    updatedAt: string;
  };

  estadoAula?: {
    id: number;
    codigo: string;
    nombre: string;
    descripcion?: string;
    activo: boolean;
    orden: number;
    createdAt: string;
    updatedAt: string;
  };

  // ⚠️ CAMPO CRÍTICO PARA EQUIPAMIENTOS
  aulas_equipamientos?: Array<{
    id: number;
    aulaId: number;
    equipamientoId: number;
    cantidad: number;
    observaciones?: string;
    createdAt: string;
    updatedAt: string;
    equipamiento: {
      id: number;
      codigo: string;
      nombre: string;
      categoriaEquipamientoId: number;
      descripcion?: string;
      observaciones?: string;
      activo: boolean;
      createdAt: string;
      updatedAt: string;
    };
  }>;

  reserva_aulas?: Array<any>; // Reservas (cuando se incluyen)

  // Contadores
  _count?: {
    reserva_aulas: number;
    reservas_aulas_secciones: number;
    aulas_equipamientos: number;
  };
}
```

---

## 📌 NOTAS IMPORTANTES PARA FRONTEND

### 1. Campo de Equipamientos

**❌ ERROR COMÚN:**
```javascript
// Buscar en el campo incorrecto
const equipamientos = aula.equipamientos; // ❌ undefined
```

**✅ CORRECTO:**
```javascript
// El campo correcto es aulas_equipamientos
const equipamientos = aula.aulas_equipamientos; // ✅ Array correcto

// Ejemplo: Extraer lista de nombres de equipamientos
const nombresEquipamientos = aula.aulas_equipamientos?.map(
  ae => ae.equipamiento.nombre
) || [];

// Ejemplo: Contar equipamientos
const totalEquipamientos = aula._count?.aulas_equipamientos || 0;
```

### 2. Conversión Automática tipo/estado

El backend acepta **3 formatos** para tipo y estado:

```javascript
// Formato 1: IDs numéricos
{ tipoAulaId: 1, estadoAulaId: 2 }

// Formato 2: Códigos string (case-insensitive)
{ tipo: "practica", estado: "disponible" }
{ tipo: "ENSAYO", estado: "EN_MANTENIMIENTO" }

// Formato 3: Mixto
{ tipo: "ensayo", estadoAulaId: 2 }
```

### 3. Equipamientos al Crear

El backend acepta **2 formatos** para equipamientos:

```javascript
// Formato 1: Array simple de IDs (cantidad = 1 por defecto)
{ equipamientoIds: [1, 3, 5] }

// Formato 2: Array de objetos completos (permite especificar cantidad)
{
  equipamientos: [
    { equipamientoId: 1, cantidad: 20, observaciones: "..." },
    { equipamientoId: 3, cantidad: 15 }
  ]
}
```

### 4. Paginación

Siempre verificar el objeto `meta` para implementar paginación correctamente:

```javascript
const response = await fetch('/api/aulas?page=1&limit=10');
const json = await response.json();

if (json.success) {
  const aulas = json.data;
  const totalPages = json.meta.totalPages;
  const currentPage = json.meta.page;
  const total = json.meta.total;
}
```

### 5. Filtros Combinados

Se pueden combinar múltiples filtros en una sola query:

```javascript
// Ejemplo: Aulas activas, de tipo PRACTICA, con equipamiento,
// capacidad 15-30, paginado
const url = '/api/aulas?' + new URLSearchParams({
  activa: 'true',
  tipoAulaId: '1',
  conEquipamiento: 'true',
  capacidadMinima: '15',
  capacidadMaxima: '30',
  page: '1',
  limit: '20'
});
```

---

## 🚀 RESUMEN DE ENDPOINTS

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| **CATÁLOGOS** | | |
| GET | `/api/catalogos/tipos-aulas` | Listar tipos de aula |
| GET | `/api/catalogos/estados-aulas` | Listar estados de aula |
| GET | `/api/equipamientos` | Listar equipamientos |
| **CRUD AULAS** | | |
| POST | `/api/aulas` | Crear aula |
| GET | `/api/aulas` | Listar aulas (paginado + filtros) |
| GET | `/api/aulas/:id` | Obtener aula por ID |
| PUT | `/api/aulas/:id` | Actualizar aula |
| DELETE | `/api/aulas/:id` | Eliminar/Desactivar aula |
| **BÚSQUEDAS** | | |
| GET | `/api/aulas/disponibles` | Aulas activas |
| GET | `/api/aulas/search?q=` | Búsqueda flexible |
| GET | `/api/aulas/por-capacidad?capacidad=` | Filtrar por capacidad |
| GET | `/api/aulas/con-equipamiento` | Solo con equipamiento |
| GET | `/api/aulas/menor-uso` | Ordenadas por uso |
| **EQUIPAMIENTOS** | | |
| POST | `/api/aulas/:id/equipamientos` | Agregar equipamiento |
| GET | `/api/aulas/:id/equipamientos` | Listar equipamientos |
| PUT | `/api/aulas/:id/equipamientos/:eqId` | Actualizar cantidad |
| DELETE | `/api/aulas/:id/equipamientos/:eqId` | Quitar equipamiento |
| **DISPONIBILIDAD** | | |
| POST | `/api/aulas/:id/verificar-disponibilidad` | Verificar disponibilidad |
| GET | `/api/aulas/:id/reservas` | Listar reservas |
| GET | `/api/aulas/:id/estadisticas` | Estadísticas de uso |

---

## ✅ VERIFICACIÓN RÁPIDA

Para verificar que todo funciona correctamente desde el frontend:

```bash
# 1. Listar catálogos
curl http://localhost:8000/api/catalogos/tipos-aulas
curl http://localhost:8000/api/catalogos/estados-aulas

# 2. Listar todas las aulas
curl http://localhost:8000/api/aulas?limit=5

# 3. Obtener aula específica con equipamientos
curl http://localhost:8000/api/aulas/3

# 4. Crear aula con códigos string y equipamientos
curl -X POST http://localhost:8000/api/aulas \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Test Frontend",
    "capacidad": 15,
    "tipo": "practica",
    "estado": "disponible",
    "equipamientoIds": [1, 3, 5]
  }'
```

---

**Última actualización**: 2025-11-27
**Versión del API**: 1.0
**Base URL**: http://localhost:8000/api
