# API de Actividades - Guía de Integración Frontend

## Índice
1. [Información General](#información-general)
2. [Catálogos Necesarios](#catálogos-necesarios)
3. [Endpoints CRUD](#endpoints-crud)
4. [Gestión de Horarios](#gestión-de-horarios)
5. [Gestión de Docentes](#gestión-de-docentes)
6. [Gestión de Participantes](#gestión-de-participantes)
7. [Consultas Especiales](#consultas-especiales)
8. [Códigos de Error](#códigos-de-error)

---

## Información General

**Base URL**: `http://localhost:3001/api`

**Headers Requeridos**:
```
Content-Type: application/json
```

**Formato de Respuesta Exitosa**:
```json
{
  "success": true,
  "data": { ... }
}
```

**Formato de Respuesta con Error**:
```json
{
  "success": false,
  "error": "Mensaje de error",
  "details": { ... }  // Opcional, para errores de validación
}
```

---

## Catálogos Necesarios

Antes de crear actividades, necesitas obtener los catálogos para los dropdowns:

### 1. Tipos de Actividades
```http
GET /api/catalogos/tipos-actividades
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "codigo": "CORO",
      "nombre": "Coro",
      "descripcion": "Actividad coral",
      "activo": true,
      "orden": 1
    }
  ]
}
```

### 2. Categorías de Actividades
```http
GET /api/catalogos/categorias-actividades
```

**Response**: Igual estructura que tipos

### 3. Estados de Actividades
```http
GET /api/catalogos/estados-actividades
```

**Response**: Igual estructura que tipos

### 4. Días de la Semana
```http
GET /api/catalogos/dias-semana
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "codigo": "LUN",
      "nombre": "Lunes",
      "nombreCorto": "Lun",
      "orden": 1,
      "activo": true
    }
  ]
}
```

### 5. Roles de Docentes
```http
GET /api/catalogos/roles-docentes
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "codigo": "TITULAR",
      "nombre": "Docente Titular",
      "descripcion": "Responsable principal de la actividad",
      "orden": 1,
      "activo": true
    }
  ]
}
```

---

## Endpoints CRUD

### 1. Crear Actividad

```http
POST /api/actividades
```

**Request Body**:
```json
{
  "codigoActividad": "CORO-001",           // REQUERIDO, String, único, max 50
  "nombre": "Coro Infantil",               // REQUERIDO, String
  "tipoActividadId": 1,                    // REQUERIDO, Int (FK a tipos_actividades)
  "categoriaId": 2,                        // REQUERIDO, Int (FK a categorias_actividades)
  "estadoId": 1,                           // REQUERIDO, Int (FK a estados_actividades)
  "descripcion": "Coro para niños...",     // OPCIONAL, String
  "fechaDesde": "2025-01-15T00:00:00Z",    // REQUERIDO, DateTime ISO 8601
  "fechaHasta": "2025-12-31T23:59:59Z",    // OPCIONAL, DateTime ISO 8601
  "cupoMaximo": 30,                        // OPCIONAL, Int positivo
  "costo": 100.50,                         // OPCIONAL, Decimal (default: 0)
  "observaciones": "Requiere audición",    // OPCIONAL, String

  // Horarios de la actividad
  "horarios": [                            // OPCIONAL, Array
    {
      "diaSemanaId": 1,                    // REQUERIDO, Int (1-7, FK a dias_semana)
      "horaInicio": "18:00",               // REQUERIDO, String HH:MM o HH:MM:SS
      "horaFin": "20:00",                  // REQUERIDO, String HH:MM o HH:MM:SS
      "activo": true                       // OPCIONAL, Boolean (default: true)
    }
  ],

  // Docentes asignados
  "docentes": [                            // OPCIONAL, Array
    {
      "docenteId": 5,                      // REQUERIDO, Int (persona con tipo DOCENTE)
      "rolDocenteId": 1,                   // REQUERIDO, Int (FK a roles_docentes)
      "fechaAsignacion": "2025-01-15T00:00:00Z",  // OPCIONAL, DateTime (default: now)
      "observaciones": "Director del coro" // OPCIONAL, String
    }
  ]
}
```

**Validaciones Importantes**:
- `codigoActividad` debe ser único
- `fechaHasta` debe ser >= `fechaDesde` (si se proporciona)
- `horaFin` debe ser > `horaInicio` en cada horario
- `docenteId` debe ser una persona con tipo DOCENTE activo
- No puede haber horarios duplicados (mismo día/hora en la misma actividad)

**Response Success (201)**:
```json
{
  "success": true,
  "data": {
    "id": 10,
    "codigoActividad": "CORO-001",
    "nombre": "Coro Infantil",
    "tipoActividadId": 1,
    "categoriaId": 2,
    "estadoId": 1,
    "descripcion": "Coro para niños...",
    "fechaDesde": "2025-01-15T00:00:00.000Z",
    "fechaHasta": "2025-12-31T23:59:59.000Z",
    "capacidadMaxima": 30,
    "costo": 100.50,
    "activa": true,
    "observaciones": "Requiere audición",
    "createdAt": "2025-01-17T10:30:00.000Z",
    "updatedAt": "2025-01-17T10:30:00.000Z",

    // Relaciones incluidas
    "tiposActividades": {
      "id": 1,
      "codigo": "CORO",
      "nombre": "Coro"
    },
    "categoriasActividades": {
      "id": 2,
      "codigo": "INFANTIL",
      "nombre": "Infantil"
    },
    "estadosActividades": {
      "id": 1,
      "codigo": "PLANIFICADA",
      "nombre": "Planificada"
    },
    "horarios_actividades": [
      {
        "id": 15,
        "diaSemanaId": 1,
        "horaInicio": "18:00:00",
        "horaFin": "20:00:00",
        "activo": true,
        "diasSemana": {
          "id": 1,
          "codigo": "LUN",
          "nombre": "Lunes"
        }
      }
    ],
    "docentes_actividades": [
      {
        "id": 8,
        "docenteId": 5,
        "rolDocenteId": 1,
        "fechaAsignacion": "2025-01-15T00:00:00.000Z",
        "activo": true,
        "observaciones": "Director del coro",
        "personas": {
          "id": 5,
          "nombre": "Juan",
          "apellido": "Pérez",
          "email": "juan@example.com"
        },
        "rolesDocentes": {
          "id": 1,
          "codigo": "TITULAR",
          "nombre": "Docente Titular"
        }
      }
    ]
  }
}
```

**Response Error (400)**:
```json
{
  "success": false,
  "error": "Ya existe una actividad con el código CORO-001"
}
```

---

### 2. Listar Actividades

```http
GET /api/actividades?page=1&limit=20&tipoActividadId=1&activa=true
```

**Query Parameters**:
- `page` - Int, página actual (default: 1)
- `limit` - Int, elementos por página (default: 20, max: 100)
- `tipoActividadId` - Int, filtrar por tipo
- `categoriaId` - Int, filtrar por categoría
- `estadoId` - Int, filtrar por estado
- `activa` - Boolean, filtrar por activas/inactivas
- `search` - String, buscar en código o nombre
- `fechaDesde` - DateTime, filtrar >= fecha
- `fechaHasta` - DateTime, filtrar <= fecha

**Response Success (200)**:
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": 10,
        "codigoActividad": "CORO-001",
        "nombre": "Coro Infantil",
        "tipoActividadId": 1,
        "categoriaId": 2,
        "estadoId": 1,
        "descripcion": "Coro para niños...",
        "fechaDesde": "2025-01-15T00:00:00.000Z",
        "fechaHasta": "2025-12-31T23:59:59.000Z",
        "capacidadMaxima": 30,
        "costo": 100.50,
        "activa": true,
        "createdAt": "2025-01-17T10:30:00.000Z",

        // Relaciones
        "tiposActividades": { "id": 1, "nombre": "Coro" },
        "categoriasActividades": { "id": 2, "nombre": "Infantil" },
        "estadosActividades": { "id": 1, "nombre": "Planificada" },

        // Conteos
        "_count": {
          "horarios_actividades": 2,
          "docentes_actividades": 1,
          "participacion_actividades": 15  // Participantes activos
        }
      }
    ],
    "total": 50,
    "page": 1,
    "limit": 20,
    "totalPages": 3
  }
}
```

---

### 3. Obtener Detalle de Actividad

```http
GET /api/actividades/:id
```

**Path Parameters**:
- `id` - Int, ID de la actividad

**Response Success (200)**:
```json
{
  "success": true,
  "data": {
    "id": 10,
    "codigoActividad": "CORO-001",
    "nombre": "Coro Infantil",
    "tipoActividadId": 1,
    "categoriaId": 2,
    "estadoId": 1,
    "descripcion": "Coro para niños...",
    "fechaDesde": "2025-01-15T00:00:00.000Z",
    "fechaHasta": "2025-12-31T23:59:59.000Z",
    "capacidadMaxima": 30,
    "costo": 100.50,
    "activa": true,
    "observaciones": "Requiere audición",
    "createdAt": "2025-01-17T10:30:00.000Z",
    "updatedAt": "2025-01-17T10:30:00.000Z",

    // Catálogos relacionados
    "tiposActividades": {
      "id": 1,
      "codigo": "CORO",
      "nombre": "Coro"
    },
    "categoriasActividades": {
      "id": 2,
      "codigo": "INFANTIL",
      "nombre": "Infantil"
    },
    "estadosActividades": {
      "id": 1,
      "codigo": "PLANIFICADA",
      "nombre": "Planificada"
    },

    // Horarios completos
    "horarios_actividades": [
      {
        "id": 15,
        "diaSemanaId": 1,
        "horaInicio": "18:00:00",
        "horaFin": "20:00:00",
        "activo": true,
        "diasSemana": {
          "id": 1,
          "codigo": "LUN",
          "nombre": "Lunes",
          "nombreCorto": "Lun"
        }
      },
      {
        "id": 16,
        "diaSemanaId": 3,
        "horaInicio": "18:00:00",
        "horaFin": "20:00:00",
        "activo": true,
        "diasSemana": {
          "id": 3,
          "codigo": "MIE",
          "nombre": "Miércoles",
          "nombreCorto": "Mié"
        }
      }
    ],

    // Docentes completos
    "docentes_actividades": [
      {
        "id": 8,
        "docenteId": 5,
        "rolDocenteId": 1,
        "fechaAsignacion": "2025-01-15T00:00:00.000Z",
        "fechaDesasignacion": null,
        "activo": true,
        "observaciones": "Director del coro",
        "personas": {
          "id": 5,
          "nombre": "Juan",
          "apellido": "Pérez",
          "email": "juan@example.com",
          "telefono": "555-1234"
        },
        "rolesDocentes": {
          "id": 1,
          "codigo": "TITULAR",
          "nombre": "Docente Titular"
        }
      }
    ],

    // Participantes activos (muestra simplificada)
    "participacion_actividades": [
      {
        "id": 20,
        "personaId": 10,
        "fechaInicio": "2025-01-20T00:00:00.000Z",
        "activa": true,
        "personas": {
          "id": 10,
          "nombre": "María",
          "apellido": "González",
          "email": "maria@example.com"
        }
      }
    ],

    // Conteos
    "_count": {
      "participacion_actividades": 15  // Total participantes activos
    }
  }
}
```

**Response Error (404)**:
```json
{
  "success": false,
  "error": "Actividad con ID 999 no encontrada"
}
```

---

### 4. Actualizar Actividad

```http
PUT /api/actividades/:id
```

**Path Parameters**:
- `id` - Int, ID de la actividad

**Request Body** (todos los campos son OPCIONALES):
```json
{
  "nombre": "Coro Infantil - Actualizado",
  "descripcion": "Nueva descripción",
  "estadoId": 2,                         // Cambiar estado
  "fechaHasta": "2026-06-30T23:59:59Z",  // Extender fecha
  "capacidadMaxima": 35,                 // Aumentar cupo
  "costo": 150.00,                       // Actualizar costo
  "activa": true,                        // Activar/desactivar
  "observaciones": "Nuevas observaciones"
}
```

**Campos NO Actualizables**:
- `codigoActividad` (inmutable)
- `tipoActividadId` (inmutable)
- `categoriaId` (inmutable)
- `fechaDesde` (inmutable)

**Response Success (200)**:
```json
{
  "success": true,
  "data": {
    // ... actividad completa con cambios aplicados
  }
}
```

---

### 5. Eliminar Actividad (Soft Delete)

```http
DELETE /api/actividades/:id
```

**Path Parameters**:
- `id` - Int, ID de la actividad

**Notas**:
- La eliminación es lógica (soft delete): `activa = false`
- NO se puede eliminar si tiene participantes activos
- NO se puede eliminar si tiene secciones activas

**Response Success (200)**:
```json
{
  "success": true,
  "message": "Actividad eliminada exitosamente"
}
```

**Response Error (400)**:
```json
{
  "success": false,
  "error": "No se puede eliminar la actividad: tiene 15 participantes activos"
}
```

---

## Gestión de Horarios

### 1. Agregar Horario a Actividad

```http
POST /api/actividades/:actividadId/horarios
```

**Request Body**:
```json
{
  "diaSemanaId": 5,          // REQUERIDO, Int (1-7)
  "horaInicio": "19:00",     // REQUERIDO, String HH:MM
  "horaFin": "21:00",        // REQUERIDO, String HH:MM
  "activo": true             // OPCIONAL, Boolean
}
```

**Response Success (201)**:
```json
{
  "success": true,
  "data": {
    "id": 25,
    "actividadId": 10,
    "diaSemanaId": 5,
    "horaInicio": "19:00:00",
    "horaFin": "21:00:00",
    "activo": true,
    "diasSemana": {
      "id": 5,
      "codigo": "VIE",
      "nombre": "Viernes"
    }
  }
}
```

---

### 2. Actualizar Horario

```http
PUT /api/actividades/horarios/:horarioId
```

**Request Body** (todos opcionales):
```json
{
  "diaSemanaId": 6,
  "horaInicio": "20:00",
  "horaFin": "22:00",
  "activo": false
}
```

**Response Success (200)**:
```json
{
  "success": true,
  "data": {
    // ... horario actualizado
  }
}
```

---

### 3. Eliminar Horario

```http
DELETE /api/actividades/horarios/:horarioId
```

**Response Success (200)**:
```json
{
  "success": true,
  "message": "Horario eliminado exitosamente"
}
```

---

## Gestión de Docentes

### 1. Obtener Docentes Disponibles

```http
GET /api/actividades/docentes/disponibles
```

**Query Parameters**:
- `especialidad` - String, filtrar por especialidad (opcional)

**Response Success (200)**:
```json
{
  "success": true,
  "data": [
    {
      "id": 5,
      "nombre": "Juan",
      "apellido": "Pérez",
      "email": "juan@example.com",
      "telefono": "555-1234",
      "persona_tipo": [
        {
          "tipoPersonaId": 3,  // 3 = DOCENTE
          "activo": true,
          "especialidad": "Piano",
          "honorariosPorHora": 50.00,
          "disponibilidad": "Lunes a Viernes",
          "tiposPersona": {
            "id": 3,
            "codigo": "DOCENTE",
            "nombre": "Docente"
          }
        }
      ]
    }
  ]
}
```

---

### 2. Asignar Docente a Actividad

```http
POST /api/actividades/:actividadId/docentes
```

**Request Body**:
```json
{
  "docenteId": 5,                         // REQUERIDO, Int (persona con tipo DOCENTE)
  "rolDocenteId": 1,                      // REQUERIDO, Int (FK roles_docentes)
  "fechaAsignacion": "2025-01-20T00:00:00Z",  // OPCIONAL (default: now)
  "observaciones": "Profesor de piano"    // OPCIONAL
}
```

**Validaciones**:
- La persona debe tener tipo DOCENTE activo
- No puede haber asignaciones duplicadas (mismo docente + rol + actividad activos)

**Response Success (201)**:
```json
{
  "success": true,
  "data": {
    "id": 12,
    "actividadId": 10,
    "docenteId": 5,
    "rolDocenteId": 1,
    "fechaAsignacion": "2025-01-20T00:00:00.000Z",
    "fechaDesasignacion": null,
    "activo": true,
    "observaciones": "Profesor de piano",
    "personas": {
      "id": 5,
      "nombre": "Juan",
      "apellido": "Pérez"
    },
    "rolesDocentes": {
      "id": 1,
      "codigo": "TITULAR",
      "nombre": "Docente Titular"
    }
  }
}
```

**Response Error (400)**:
```json
{
  "success": false,
  "error": "La persona con ID 5 no tiene el tipo DOCENTE activo"
}
```

---

### 3. Desasignar Docente

```http
DELETE /api/actividades/docentes/:asignacionId
```

**Notas**:
- La desasignación es lógica: establece `fechaDesasignacion` y `activo = false`

**Response Success (200)**:
```json
{
  "success": true,
  "message": "Docente desasignado exitosamente"
}
```

---

## Gestión de Participantes

### 1. Agregar Participante

```http
POST /api/actividades/:actividadId/participantes
```

**Request Body**:
```json
{
  "personaId": 15,                        // REQUERIDO, Int
  "fechaInicio": "2025-01-25T00:00:00Z",  // OPCIONAL (default: now)
  "precioEspecial": 80.00,                // OPCIONAL, Decimal
  "observaciones": "Alumno nuevo"         // OPCIONAL
}
```

**Validaciones**:
- La actividad debe tener cupo disponible
- La persona no puede estar ya inscrita (activa) en la actividad
- No se puede agregar si la actividad está inactiva

**Response Success (201)**:
```json
{
  "success": true,
  "data": {
    "id": 30,
    "actividadId": 10,
    "personaId": 15,
    "fechaInicio": "2025-01-25T00:00:00.000Z",
    "fechaFin": null,
    "precioEspecial": 80.00,
    "activa": true,
    "observaciones": "Alumno nuevo",
    "personas": {
      "id": 15,
      "nombre": "Carlos",
      "apellido": "Martínez",
      "email": "carlos@example.com"
    }
  }
}
```

**Response Error (400)**:
```json
{
  "success": false,
  "error": "La actividad ha alcanzado su capacidad máxima (30/30)"
}
```

---

### 2. Listar Participantes de Actividad

```http
GET /api/actividades/:actividadId/participantes?page=1&limit=20&activa=true
```

**Query Parameters**:
- `page` - Int, página (default: 1)
- `limit` - Int, por página (default: 20)
- `activa` - Boolean, filtrar activos/inactivos

**Response Success (200)**:
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": 30,
        "personaId": 15,
        "fechaInicio": "2025-01-25T00:00:00.000Z",
        "fechaFin": null,
        "precioEspecial": 80.00,
        "activa": true,
        "observaciones": "Alumno nuevo",
        "personas": {
          "id": 15,
          "nombre": "Carlos",
          "apellido": "Martínez",
          "email": "carlos@example.com",
          "telefono": "555-5678"
        }
      }
    ],
    "total": 15,
    "page": 1,
    "limit": 20
  }
}
```

---

### 3. Quitar Participante (Dar de Baja)

```http
DELETE /api/actividades/:actividadId/participantes/:participanteId
```

**Notas**:
- La baja es lógica: establece `fechaFin = now()` y `activa = false`

**Response Success (200)**:
```json
{
  "success": true,
  "message": "Participante dado de baja exitosamente"
}
```

---

## Consultas Especiales

### 1. Obtener Estadísticas de Actividad

```http
GET /api/actividades/:id/estadisticas
```

**Response Success (200)**:
```json
{
  "success": true,
  "data": {
    "totalParticipantes": 15,      // Participantes activos
    "totalHorarios": 2,             // Horarios activos
    "totalDocentes": 1,             // Docentes activos
    "cupoMaximo": 30,
    "cupoDisponible": 15,           // cupoMaximo - totalParticipantes
    "porcentajeOcupacion": 50,      // (15/30) * 100
    "estaLlena": false              // totalParticipantes >= cupoMaximo
  }
}
```

---

### 2. Buscar Actividades por Día y Hora

```http
GET /api/actividades/por-horario?diaSemanaId=1&horaInicio=18:00&horaFin=20:00
```

**Query Parameters**:
- `diaSemanaId` - REQUERIDO, Int (1-7)
- `horaInicio` - OPCIONAL, String HH:MM
- `horaFin` - OPCIONAL, String HH:MM
- `soloActivas` - OPCIONAL, Boolean (default: true)

**Response Success (200)**:
```json
{
  "success": true,
  "data": [
    {
      "id": 10,
      "codigoActividad": "CORO-001",
      "nombre": "Coro Infantil",
      "horarios_actividades": [
        {
          "diaSemanaId": 1,
          "horaInicio": "18:00:00",
          "horaFin": "20:00:00",
          "diasSemana": {
            "nombre": "Lunes"
          }
        }
      ]
    }
  ]
}
```

---

### 3. Verificar Disponibilidad de Aula

```http
POST /api/actividades/verificar-disponibilidad-aula
```

**Request Body**:
```json
{
  "aulaId": "cuid-del-aula",
  "diaSemanaId": 1,
  "horaInicio": "18:00",
  "horaFin": "20:00",
  "fechaVigenciaDesde": "2025-01-15T00:00:00Z",
  "fechaVigenciaHasta": "2025-12-31T23:59:59Z",  // OPCIONAL
  "horarioExcluidoId": 25                        // OPCIONAL (para edición)
}
```

**Response Success (200)**:
```json
{
  "success": true,
  "data": {
    "disponible": false,
    "conflictos": [
      {
        "actividadId": 8,
        "nombreActividad": "Orquesta Juvenil",
        "horarioId": 20,
        "diaSemana": "Lunes",
        "horaInicio": "18:00:00",
        "horaFin": "20:00:00"
      }
    ]
  }
}
```

---

## Códigos de Error

### Códigos HTTP

- **200 OK** - Operación exitosa (GET, PUT, DELETE)
- **201 Created** - Recurso creado exitosamente (POST)
- **400 Bad Request** - Error de validación o lógica de negocio
- **404 Not Found** - Recurso no encontrado
- **500 Internal Server Error** - Error del servidor

### Mensajes de Error Comunes

#### Validación de Datos
```json
{
  "success": false,
  "error": "Errores de validación",
  "details": {
    "codigoActividad": "El código de actividad es requerido",
    "tipoActividadId": "Debe ser un número entero positivo",
    "fechaHasta": "La fecha hasta debe ser posterior a la fecha desde"
  }
}
```

#### Lógica de Negocio
```json
{
  "success": false,
  "error": "Ya existe una actividad con el código CORO-001"
}
```

```json
{
  "success": false,
  "error": "La actividad ha alcanzado su capacidad máxima (30/30)"
}
```

```json
{
  "success": false,
  "error": "La persona con ID 5 no tiene el tipo DOCENTE activo"
}
```

```json
{
  "success": false,
  "error": "No se puede eliminar la actividad: tiene 15 participantes activos"
}
```

#### Recursos No Encontrados
```json
{
  "success": false,
  "error": "Actividad con ID 999 no encontrada"
}
```

```json
{
  "success": false,
  "error": "Tipo de actividad con ID 10 no encontrado"
}
```

---

## Notas Importantes

### 1. Formato de Fechas y Horas

**Fechas/DateTime**: Usar formato ISO 8601
```
"2025-01-15T00:00:00Z"      // Con timezone UTC (recomendado)
"2025-01-15T00:00:00.000Z"  // También válido
```

**Horas**: Formato HH:MM o HH:MM:SS
```
"18:00"       // Válido
"18:00:00"    // Válido
```

### 2. IDs de Catálogos

Todos los IDs de catálogos (`tipoActividadId`, `categoriaId`, etc.) son **integers autoincrementales**, NO UUIDs.

### 3. Paginación

La paginación usa cursor-based (page/limit):
- `page`: Número de página (base 1)
- `limit`: Elementos por página (default: 20, max: 100)

### 4. Filtros Booleanos

Los filtros booleanos en query strings aceptan:
- `true` / `false` (strings)
- `1` / `0` (numbers)

Ejemplo: `?activa=true` o `?activa=1`

### 5. Soft Deletes

Todas las eliminaciones son lógicas (soft delete):
- Actividades: `activa = false`
- Horarios: se eliminan físicamente (CASCADE)
- Docentes: `activo = false`, `fechaDesasignacion = now()`
- Participantes: `activa = false`, `fechaFin = now()`

### 6. Relaciones Incluidas

Por defecto, los endpoints incluyen relaciones básicas. Para obtener más detalles, usar el endpoint específico de detalle (`GET /api/actividades/:id`).

---

## Ejemplos de Flujos Completos

### Flujo 1: Crear Actividad Completa

```javascript
// 1. Obtener catálogos para dropdowns
const tipos = await fetch('/api/catalogos/tipos-actividades');
const categorias = await fetch('/api/catalogos/categorias-actividades');
const estados = await fetch('/api/catalogos/estados-actividades');
const dias = await fetch('/api/catalogos/dias-semana');
const roles = await fetch('/api/catalogos/roles-docentes');

// 2. Obtener docentes disponibles
const docentes = await fetch('/api/actividades/docentes/disponibles');

// 3. Crear actividad con horarios y docente
const response = await fetch('/api/actividades', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    codigoActividad: "PIANO-001",
    nombre: "Clases de Piano Nivel 1",
    tipoActividadId: 2,
    categoriaId: 1,
    estadoId: 1,
    descripcion: "Clases grupales de piano para principiantes",
    fechaDesde: "2025-02-01T00:00:00Z",
    fechaHasta: "2025-06-30T23:59:59Z",
    cupoMaximo: 10,
    costo: 150.00,
    horarios: [
      {
        diaSemanaId: 2, // Martes
        horaInicio: "16:00",
        horaFin: "17:30"
      },
      {
        diaSemanaId: 4, // Jueves
        horaInicio: "16:00",
        horaFin: "17:30"
      }
    ],
    docentes: [
      {
        docenteId: 7,
        rolDocenteId: 1,
        observaciones: "Profesor titular"
      }
    ]
  })
});

const actividad = await response.json();
```

### Flujo 2: Inscribir Participante

```javascript
// 1. Obtener estadísticas para verificar cupo
const stats = await fetch(`/api/actividades/${actividadId}/estadisticas`);
const { cupoDisponible } = stats.data;

if (cupoDisponible > 0) {
  // 2. Inscribir participante
  const response = await fetch(`/api/actividades/${actividadId}/participantes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      personaId: 20,
      fechaInicio: new Date().toISOString(),
      precioEspecial: 120.00, // Descuento especial
      observaciones: "Beca del 20%"
    })
  });

  const participante = await response.json();
}
```

### Flujo 3: Actualizar Actividad

```javascript
// 1. Obtener actividad actual
const current = await fetch(`/api/actividades/${actividadId}`);

// 2. Actualizar campos necesarios
const response = await fetch(`/api/actividades/${actividadId}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    nombre: "Piano Nivel 1 - Grupo A",
    capacidadMaxima: 12, // Aumentar cupo
    costo: 180.00,       // Actualizar precio
    estadoId: 2          // Cambiar a "En Curso"
  })
});

const updated = await response.json();
```

---

## Preguntas Frecuentes (FAQ)

**Q: ¿Puedo cambiar el tipo de actividad después de crearla?**
A: No, `tipoActividadId` y `categoriaId` son inmutables por razones de integridad.

**Q: ¿Qué pasa si elimino una actividad con participantes?**
A: El sistema rechazará la operación si hay participantes activos. Debes dar de baja a todos los participantes primero.

**Q: ¿Puedo tener múltiples docentes en una actividad?**
A: Sí, puedes asignar múltiples docentes con diferentes roles (Titular, Asistente, Invitado, etc.).

**Q: ¿Cómo manejo las reservas de aulas?**
A: Las reservas de aulas se gestionan a través de endpoints separados en `/api/reservas-aulas` (documentación pendiente).

**Q: ¿Los horarios se eliminan físicamente?**
A: Sí, los horarios usan eliminación física (hard delete) ya que están vinculados a la actividad por CASCADE.

**Q: ¿Puedo reactivar una actividad eliminada?**
A: Sí, puedes usar `PUT /api/actividades/:id` con `{ "activa": true }` para reactivarla.

---

**Documento generado**: 2025-01-17
**Versión de API**: v1.0
**Contacto**: equipo-backend@sigesda.com
