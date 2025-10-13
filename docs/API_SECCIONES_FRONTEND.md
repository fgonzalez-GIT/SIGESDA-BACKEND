# 📘 Guía de Integración API - Sistema de Secciones

## 🎯 Resumen Ejecutivo

Se ha implementado un sistema completo de **Secciones/Grupos** que permite gestionar múltiples grupos de una misma actividad con horarios, docentes y aulas independientes. Se agregaron **27 nuevos endpoints** organizados en 6 módulos funcionales.

**Base URL**: `http://localhost:8000/api`

---

## 📋 Índice de Endpoints

| Categoría | Endpoints | Descripción |
|-----------|-----------|-------------|
| [CRUD Secciones](#1-crud-de-secciones) | 5 | Crear, listar, actualizar, eliminar secciones |
| [Horarios](#2-gestión-de-horarios) | 3 | Gestionar horarios de cada sección |
| [Docentes](#3-gestión-de-docentes) | 2 | Asignar/remover docentes a secciones |
| [Participantes](#4-gestión-de-participantes) | 5 | Inscripciones y gestión de alumnos |
| [Reservas Aulas](#5-reservas-de-aulas) | 3 | Asignar aulas a secciones |
| [Validaciones](#6-validaciones-y-conflictos) | 1 | Verificar conflictos de horarios |
| [Reportes](#7-reportes-y-estadísticas) | 5 | Estadísticas y horarios semanales |
| [Endpoints Adicionales](#8-endpoints-adicionales) | 3 | Integración con personas/actividades |

---

## 1. CRUD de Secciones

### 1.1 Listar Secciones

```http
GET /api/secciones
```

**Query Parameters:**
| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| actividadId | string | No | Filtrar por actividad específica |
| activa | boolean | No | Filtrar por estado (true/false) |
| search | string | No | Búsqueda por nombre o código |
| page | number | No | Número de página (default: 1) |
| limit | number | No | Resultados por página (default: 10) |

**Response 200 OK:**
```json
{
  "success": true,
  "data": [
    {
      "id": "sec_abc123",
      "actividadId": "act_xyz789",
      "nombre": "Grupo A - Mañana",
      "codigo": "PIANO-MA-A",
      "capacidadMaxima": 8,
      "activa": true,
      "observaciones": "Nivel principiante",
      "createdAt": "2025-01-15T10:00:00Z",
      "updatedAt": "2025-01-15T10:00:00Z",
      "horarios": [
        {
          "id": "hor_def456",
          "diaSemana": "LUNES",
          "horaInicio": "09:00",
          "horaFin": "10:30",
          "activo": true
        }
      ],
      "docentes": [
        {
          "id": "doc_ghi789",
          "nombre": "María",
          "apellido": "García",
          "especialidad": "Piano"
        }
      ],
      "actividad": {
        "id": "act_xyz789",
        "nombre": "Piano Nivel 1",
        "tipo": "CLASE_INSTRUMENTO",
        "precio": "5000"
      },
      "_count": {
        "participaciones": 5,
        "reservasAula": 2
      }
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 15,
    "totalPages": 2
  }
}
```

---

### 1.2 Obtener Sección por ID

```http
GET /api/secciones/:id
```

**Query Parameters:**
| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| detallada | boolean | No | Si es true, incluye participaciones y reservas |

**Response 200 OK:**
```json
{
  "success": true,
  "data": {
    "id": "sec_abc123",
    "actividadId": "act_xyz789",
    "nombre": "Grupo A - Mañana",
    "codigo": "PIANO-MA-A",
    "capacidadMaxima": 8,
    "activa": true,
    "observaciones": "Nivel principiante",
    "horarios": [...],
    "docentes": [...],
    "actividad": {...},
    "_count": {
      "participaciones": 5,
      "reservasAula": 2
    }
  }
}
```

**Con detallada=true, incluye además:**
```json
{
  "participaciones": [
    {
      "id": "par_jkl012",
      "personaId": "per_mno345",
      "fechaInicio": "2025-01-15T00:00:00Z",
      "fechaFin": null,
      "activa": true,
      "persona": {
        "id": "per_mno345",
        "tipo": "SOCIO",
        "nombre": "Juan",
        "apellido": "Pérez"
      }
    }
  ],
  "reservasAula": [
    {
      "id": "res_pqr678",
      "aulaId": "aul_stu901",
      "diaSemana": "LUNES",
      "horaInicio": "09:00",
      "horaFin": "10:30",
      "aula": {
        "id": "aul_stu901",
        "nombre": "Aula 1",
        "capacidad": 10
      }
    }
  ]
}
```

**Response 404:**
```json
{
  "success": false,
  "error": "Sección no encontrada"
}
```

---

### 1.3 Crear Sección

```http
POST /api/secciones
```

**Request Body:**
```json
{
  "actividadId": "act_xyz789",
  "nombre": "Grupo A - Mañana",
  "codigo": "PIANO-MA-A",
  "capacidadMaxima": 8,
  "activa": true,
  "observaciones": "Nivel principiante",
  "docenteIds": ["doc_ghi789", "doc_abc123"],
  "horarios": [
    {
      "diaSemana": "LUNES",
      "horaInicio": "09:00",
      "horaFin": "10:30",
      "activo": true
    },
    {
      "diaSemana": "MIERCOLES",
      "horaInicio": "09:00",
      "horaFin": "10:30",
      "activo": true
    }
  ]
}
```

**Campos:**
| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| actividadId | string | ✅ | ID de la actividad padre |
| nombre | string | ✅ | Nombre de la sección (ej: "Grupo A") |
| codigo | string | ❌ | Código único (ej: "PIANO-MA-A") |
| capacidadMaxima | number | ❌ | Capacidad máxima de alumnos |
| activa | boolean | ❌ | Estado activo (default: true) |
| observaciones | string | ❌ | Notas adicionales |
| docenteIds | string[] | ❌ | IDs de docentes a asignar |
| horarios | object[] | ❌ | Horarios de la sección |

**Enum diaSemana:**
```
LUNES | MARTES | MIERCOLES | JUEVES | VIERNES | SABADO | DOMINGO
```

**Response 201 Created:**
```json
{
  "success": true,
  "data": {
    "id": "sec_abc123",
    "actividadId": "act_xyz789",
    "nombre": "Grupo A - Mañana",
    "codigo": "PIANO-MA-A",
    "capacidadMaxima": 8,
    "activa": true,
    "horarios": [...],
    "docentes": [...]
  },
  "message": "Sección creada exitosamente"
}
```

**Response 400 Bad Request:**
```json
{
  "success": false,
  "error": "Ya existe una sección con el nombre 'Grupo A - Mañana' para esta actividad"
}
```

**Validaciones que pueden fallar:**
- Actividad no encontrada o inactiva
- Nombre duplicado para la misma actividad
- Código duplicado
- Docente no existe o no es tipo DOCENTE
- Conflicto de horarios del docente
- Solapamiento de horarios internos

---

### 1.4 Actualizar Sección

```http
PUT /api/secciones/:id
```

**Request Body (todos los campos opcionales):**
```json
{
  "nombre": "Grupo A - Mañana Modificado",
  "codigo": "PIANO-MA-A2",
  "capacidadMaxima": 10,
  "activa": false,
  "observaciones": "Actualizado"
}
```

**Response 200 OK:**
```json
{
  "success": true,
  "data": {
    "id": "sec_abc123",
    "nombre": "Grupo A - Mañana Modificado",
    ...
  },
  "message": "Sección actualizada exitosamente"
}
```

**Response 400:**
```json
{
  "success": false,
  "error": "Ya existe una sección con el nombre 'Grupo B' para esta actividad"
}
```

---

### 1.5 Eliminar Sección

```http
DELETE /api/secciones/:id
```

**Response 200 OK:**
```json
{
  "success": true,
  "message": "Sección eliminada exitosamente"
}
```

**Response 400:**
```json
{
  "success": false,
  "error": "No se puede eliminar la sección porque tiene 5 participantes activos"
}
```

**⚠️ Importante:**
- Solo se puede eliminar si NO tiene participantes activos
- La eliminación es en cascada (borra horarios, participaciones inactivas, reservas)

---

## 2. Gestión de Horarios

### 2.1 Agregar Horario a Sección

```http
POST /api/secciones/:id/horarios
```

**Request Body:**
```json
{
  "diaSemana": "VIERNES",
  "horaInicio": "14:00",
  "horaFin": "15:30",
  "activo": true
}
```

**Response 201 Created:**
```json
{
  "success": true,
  "data": {
    "id": "hor_new123",
    "seccionId": "sec_abc123",
    "diaSemana": "VIERNES",
    "horaInicio": "14:00",
    "horaFin": "15:30",
    "activo": true
  },
  "message": "Horario agregado exitosamente"
}
```

**Response 400:**
```json
{
  "success": false,
  "error": "Conflicto de horarios: el nuevo horario 14:00-15:30 se solapa con el horario existente 14:30-16:00"
}
```

---

### 2.2 Actualizar Horario

```http
PUT /api/secciones/horarios/:horarioId
```

**Request Body (campos opcionales):**
```json
{
  "diaSemana": "SABADO",
  "horaInicio": "15:00",
  "horaFin": "16:30",
  "activo": false
}
```

**Response 200 OK:**
```json
{
  "success": true,
  "data": {
    "id": "hor_new123",
    "horaInicio": "15:00",
    ...
  },
  "message": "Horario actualizado exitosamente"
}
```

---

### 2.3 Eliminar Horario

```http
DELETE /api/secciones/horarios/:horarioId
```

**Response 200 OK:**
```json
{
  "success": true,
  "message": "Horario eliminado exitosamente"
}
```

---

## 3. Gestión de Docentes

### 3.1 Asignar Docente a Sección

```http
POST /api/secciones/:id/docentes
```

**Request Body:**
```json
{
  "docenteId": "doc_ghi789"
}
```

**Response 200 OK:**
```json
{
  "success": true,
  "data": {
    "id": "sec_abc123",
    "nombre": "Grupo A - Mañana",
    "docentes": [
      {
        "id": "doc_ghi789",
        "nombre": "María",
        "apellido": "García",
        "especialidad": "Piano"
      }
    ],
    "horarios": [...]
  },
  "message": "Docente asignado exitosamente"
}
```

**Response 400:**
```json
{
  "success": false,
  "error": "El docente María García ya tiene asignada la sección 'Grupo B' el día LUNES de 09:00 a 10:30"
}
```

---

### 3.2 Remover Docente de Sección

```http
DELETE /api/secciones/:id/docentes/:docenteId
```

**Response 200 OK:**
```json
{
  "success": true,
  "data": {
    "id": "sec_abc123",
    "docentes": []
  },
  "message": "Docente removido exitosamente"
}
```

---

## 4. Gestión de Participantes

### 4.1 Inscribir Participante

```http
POST /api/secciones/:id/participantes
```

**Request Body:**
```json
{
  "personaId": "per_mno345",
  "fechaInicio": "2025-01-15T00:00:00Z",
  "fechaFin": null,
  "precioEspecial": 4500,
  "activa": true,
  "observaciones": "Descuento por socio"
}
```

**Campos:**
| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| personaId | string | ✅ | ID de la persona a inscribir |
| fechaInicio | string (ISO date) | ✅ | Fecha de inicio de participación |
| fechaFin | string (ISO date) | ❌ | Fecha de fin (null = indefinido) |
| precioEspecial | number | ❌ | Precio especial (override del precio base) |
| activa | boolean | ❌ | Estado (default: true) |
| observaciones | string | ❌ | Notas |

**Response 201 Created:**
```json
{
  "success": true,
  "data": {
    "id": "par_jkl012",
    "personaId": "per_mno345",
    "seccionId": "sec_abc123",
    "fechaInicio": "2025-01-15T00:00:00Z",
    "fechaFin": null,
    "precioEspecial": "4500",
    "activa": true,
    "persona": {
      "id": "per_mno345",
      "tipo": "SOCIO",
      "nombre": "Juan",
      "apellido": "Pérez"
    },
    "seccion": {
      "id": "sec_abc123",
      "nombre": "Grupo A - Mañana",
      "actividad": {...}
    }
  },
  "message": "Participante inscrito exitosamente"
}
```

**Response 400:**
```json
{
  "success": false,
  "error": "La sección ha alcanzado su capacidad máxima (8 participantes)"
}
```

---

### 4.2 Listar Participantes de Sección

```http
GET /api/secciones/:id/participantes
```

**Query Parameters:**
| Parámetro | Tipo | Default | Descripción |
|-----------|------|---------|-------------|
| activas | boolean | true | Filtrar solo participaciones activas |

**Response 200 OK:**
```json
{
  "success": true,
  "data": [
    {
      "id": "par_jkl012",
      "personaId": "per_mno345",
      "fechaInicio": "2025-01-15T00:00:00Z",
      "fechaFin": null,
      "activa": true,
      "persona": {
        "id": "per_mno345",
        "tipo": "SOCIO",
        "nombre": "Juan",
        "apellido": "Pérez",
        "email": "juan@example.com",
        "telefono": "+54911..."
      }
    }
  ]
}
```

---

### 4.3 Actualizar Participación

```http
PUT /api/secciones/participaciones/:participacionId
```

**Request Body (campos opcionales):**
```json
{
  "fechaFin": "2025-06-30T00:00:00Z",
  "precioEspecial": 4000,
  "activa": false,
  "observaciones": "Actualizado"
}
```

**Response 200 OK:**
```json
{
  "success": true,
  "data": {
    "id": "par_jkl012",
    "precioEspecial": "4000",
    ...
  },
  "message": "Participación actualizada exitosamente"
}
```

---

### 4.4 Dar de Baja Participación

```http
POST /api/secciones/participaciones/:participacionId/baja
```

**Request Body (opcional):**
```json
{
  "fechaFin": "2025-06-30T00:00:00Z"
}
```

**Response 200 OK:**
```json
{
  "success": true,
  "data": {
    "id": "par_jkl012",
    "activa": false,
    "fechaFin": "2025-06-30T00:00:00Z"
  },
  "message": "Participación dada de baja exitosamente"
}
```

**⚠️ Nota:** Esta es una baja lógica (soft delete). La participación queda inactiva pero no se elimina.

---

### 4.5 Listar Secciones de una Persona

```http
GET /api/personas/:personaId/secciones
```

**Query Parameters:**
| Parámetro | Tipo | Default | Descripción |
|-----------|------|---------|-------------|
| activas | boolean | true | Filtrar solo participaciones activas |

**Response 200 OK:**
```json
{
  "success": true,
  "data": [
    {
      "id": "par_jkl012",
      "seccionId": "sec_abc123",
      "fechaInicio": "2025-01-15T00:00:00Z",
      "activa": true,
      "seccion": {
        "id": "sec_abc123",
        "nombre": "Grupo A - Mañana",
        "actividad": {
          "nombre": "Piano Nivel 1",
          "tipo": "CLASE_INSTRUMENTO"
        },
        "horarios": [
          {
            "diaSemana": "LUNES",
            "horaInicio": "09:00",
            "horaFin": "10:30"
          }
        ]
      }
    }
  ]
}
```

---

## 5. Reservas de Aulas

### 5.1 Crear Reserva de Aula

```http
POST /api/secciones/:id/reservas-aulas
```

**Request Body:**
```json
{
  "aulaId": "aul_stu901",
  "diaSemana": "LUNES",
  "horaInicio": "09:00",
  "horaFin": "10:30",
  "fechaVigencia": "2025-01-15T00:00:00Z",
  "fechaFin": "2025-06-30T00:00:00Z",
  "observaciones": "Reserva semestral"
}
```

**Campos:**
| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| aulaId | string | ✅ | ID del aula a reservar |
| diaSemana | string | ✅ | Día de la semana |
| horaInicio | string | ✅ | Hora inicio (HH:MM) |
| horaFin | string | ✅ | Hora fin (HH:MM) |
| fechaVigencia | string (ISO date) | ✅ | Desde cuándo aplica |
| fechaFin | string (ISO date) | ❌ | Hasta cuándo (null = indefinido) |
| observaciones | string | ❌ | Notas |

**Response 201 Created:**
```json
{
  "success": true,
  "data": {
    "id": "res_pqr678",
    "seccionId": "sec_abc123",
    "aulaId": "aul_stu901",
    "diaSemana": "LUNES",
    "horaInicio": "09:00",
    "horaFin": "10:30",
    "fechaVigencia": "2025-01-15T00:00:00Z",
    "seccion": {...},
    "aula": {
      "id": "aul_stu901",
      "nombre": "Aula 1",
      "capacidad": 10
    }
  },
  "message": "Reserva de aula creada exitosamente"
}
```

**Response 400:**
```json
{
  "success": false,
  "error": "El aula Aula 1 ya está reservada para la sección 'Grupo B' el día LUNES de 09:00 a 10:30"
}
```

---

### 5.2 Actualizar Reserva de Aula

```http
PUT /api/secciones/reservas-aulas/:reservaId
```

**Request Body (campos opcionales):**
```json
{
  "fechaFin": "2025-12-31T00:00:00Z",
  "observaciones": "Extendida"
}
```

**⚠️ Nota:** No se puede cambiar aulaId, diaSemana ni horaInicio. Para eso, eliminar y crear nueva.

**Response 200 OK:**
```json
{
  "success": true,
  "data": {
    "id": "res_pqr678",
    "fechaFin": "2025-12-31T00:00:00Z",
    ...
  },
  "message": "Reserva de aula actualizada exitosamente"
}
```

---

### 5.3 Eliminar Reserva de Aula

```http
DELETE /api/secciones/reservas-aulas/:reservaId
```

**Response 200 OK:**
```json
{
  "success": true,
  "message": "Reserva de aula eliminada exitosamente"
}
```

---

## 6. Validaciones y Conflictos

### 6.1 Verificar Conflictos de Horarios

```http
POST /api/secciones/verificar-conflictos
```

**Request Body:**
```json
{
  "seccionId": "sec_abc123",
  "diaSemana": "LUNES",
  "horaInicio": "09:00",
  "horaFin": "10:30",
  "docenteId": "doc_ghi789",
  "aulaId": "aul_stu901"
}
```

**Campos:**
| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| seccionId | string | ❌ | ID de sección a excluir en la búsqueda |
| diaSemana | string | ✅ | Día a verificar |
| horaInicio | string | ✅ | Hora inicio (HH:MM) |
| horaFin | string | ✅ | Hora fin (HH:MM) |
| docenteId | string | ❌ | ID del docente a verificar |
| aulaId | string | ❌ | ID del aula a verificar |

**Response 200 OK (sin conflictos):**
```json
{
  "success": true,
  "data": {
    "tieneConflictos": false,
    "conflictos": []
  }
}
```

**Response 200 OK (con conflictos):**
```json
{
  "success": true,
  "data": {
    "tieneConflictos": true,
    "conflictos": [
      {
        "tipo": "DOCENTE",
        "mensaje": "El docente María García ya tiene asignada otra sección en este horario",
        "detalles": {
          "seccionId": "sec_xyz999",
          "seccionNombre": "Grupo B",
          "actividadNombre": "Piano Nivel 1",
          "diaSemana": "LUNES",
          "horaInicio": "09:00",
          "horaFin": "10:30",
          "docente": "María García"
        }
      },
      {
        "tipo": "AULA",
        "mensaje": "El aula Aula 1 ya está reservada para otra sección en este horario",
        "detalles": {
          "seccionId": "sec_xyz999",
          "seccionNombre": "Grupo B",
          "actividadNombre": "Piano Nivel 1",
          "diaSemana": "LUNES",
          "horaInicio": "09:00",
          "horaFin": "10:30",
          "aula": "Aula 1"
        }
      }
    ]
  }
}
```

**💡 Uso sugerido:** Llamar a este endpoint antes de crear/actualizar secciones o asignar docentes/aulas para mostrar advertencias al usuario.

---

## 7. Reportes y Estadísticas

### 7.1 Estadísticas de Sección

```http
GET /api/secciones/:id/estadisticas
```

**Response 200 OK:**
```json
{
  "success": true,
  "data": {
    "seccion": "Grupo A - Mañana",
    "actividad": "Piano Nivel 1",
    "participantes": {
      "total": 6,
      "activos": 6,
      "socios": 4,
      "noSocios": 2
    },
    "ocupacion": {
      "porcentaje": 75,
      "disponibles": 2
    },
    "docentes": ["María García", "Juan Pérez"],
    "aulas": ["Aula 1", "Aula 2"],
    "horarios": [
      {
        "dia": "LUNES",
        "horario": "09:00-10:30"
      },
      {
        "dia": "MIERCOLES",
        "horario": "09:00-10:30"
      }
    ]
  }
}
```

**💡 Uso:** Mostrar métricas en dashboard de cada sección.

---

### 7.2 Horario Semanal Completo

```http
GET /api/secciones/horario-semanal
```

**Response 200 OK:**
```json
{
  "success": true,
  "data": [
    {
      "dia": "LUNES",
      "secciones": [
        {
          "seccionId": "sec_abc123",
          "actividadNombre": "Piano Nivel 1",
          "seccionNombre": "Grupo A - Mañana",
          "codigo": "PIANO-MA-A",
          "docentes": ["María García"],
          "aula": "Aula 1",
          "horario": "09:00-10:30",
          "participantes": 6,
          "capacidad": 8,
          "ocupacion": 75
        },
        {
          "seccionId": "sec_def456",
          "actividadNombre": "Guitarra Nivel 1",
          "seccionNombre": "Grupo B",
          "codigo": "GUIT-MA-B",
          "docentes": ["Pedro López"],
          "aula": "Aula 2",
          "horario": "10:00-11:30",
          "participantes": 5,
          "capacidad": 6,
          "ocupacion": 83
        }
      ]
    },
    {
      "dia": "MARTES",
      "secciones": [...]
    }
  ]
}
```

**💡 Uso:** Mostrar grilla semanal con todas las clases, útil para vista de calendario.

---

### 7.3 Ocupación Global de Secciones

```http
GET /api/secciones/ocupacion
```

**Response 200 OK:**
```json
{
  "success": true,
  "data": {
    "totalSecciones": 15,
    "ocupacionPromedio": 72,
    "seccionesLlenas": 5,
    "seccionesDisponibles": 10,
    "detalle": [
      {
        "seccionId": "sec_abc123",
        "actividad": "Piano Nivel 1",
        "seccion": "Grupo A - Mañana",
        "ocupacion": 100,
        "participantes": 8,
        "capacidad": 8
      },
      {
        "seccionId": "sec_def456",
        "actividad": "Guitarra Nivel 1",
        "seccion": "Grupo B",
        "ocupacion": 83,
        "participantes": 5,
        "capacidad": 6
      }
    ]
  }
}
```

**💡 Uso:** Dashboard principal para ver estado general de inscripciones.

---

### 7.4 Secciones por Actividad

```http
GET /api/actividades/:actividadId/secciones
```

**Response 200 OK:**
```json
{
  "success": true,
  "data": [
    {
      "id": "sec_abc123",
      "nombre": "Grupo A - Mañana",
      "codigo": "PIANO-MA-A",
      "capacidadMaxima": 8,
      "activa": true,
      "horarios": [...],
      "docentes": [...],
      "_count": {
        "participaciones": 6
      }
    },
    {
      "id": "sec_def456",
      "nombre": "Grupo B - Tarde",
      "codigo": "PIANO-TA-B",
      "capacidadMaxima": 6,
      "activa": true,
      "horarios": [...],
      "docentes": [...],
      "_count": {
        "participaciones": 4
      }
    }
  ]
}
```

**💡 Uso:** Mostrar secciones disponibles al seleccionar una actividad para inscripción.

---

### 7.5 Carga Horaria de Docente

```http
GET /api/personas/docentes/:docenteId/carga-horaria
```

**Response 200 OK:**
```json
{
  "success": true,
  "data": {
    "docenteId": "doc_ghi789",
    "docente": "María García",
    "totalHorasSemana": 15.5,
    "secciones": [
      {
        "seccionId": "sec_abc123",
        "actividad": "Piano Nivel 1",
        "seccion": "Grupo A - Mañana",
        "horas": 1.5,
        "dia": "LUNES",
        "horario": "09:00-10:30"
      },
      {
        "seccionId": "sec_abc123",
        "actividad": "Piano Nivel 1",
        "seccion": "Grupo A - Mañana",
        "horas": 1.5,
        "dia": "MIERCOLES",
        "horario": "09:00-10:30"
      }
    ],
    "alerta": null
  }
}
```

**Con sobrecarga (> 20 horas):**
```json
{
  "alerta": {
    "tipo": "SOBRECARGA",
    "mensaje": "El docente tiene 22.5 horas semanales, superando las 20 horas recomendadas"
  }
}
```

**💡 Uso:** Validar carga de docentes antes de asignarlos a nuevas secciones.

---

## 8. Endpoints Adicionales

Estos endpoints ya existían pero se les agregaron funcionalidades relacionadas a secciones:

### 8.1 Listar Personas con Filtro de Tipo

```http
GET /api/personas?tipo=DOCENTE
```

**Uso:** Obtener lista de docentes para asignar a secciones.

---

### 8.2 Listar Aulas Activas

```http
GET /api/aulas?activa=true
```

**Uso:** Obtener lista de aulas disponibles para reservas.

---

### 8.3 Obtener Actividad con Secciones

```http
GET /api/actividades/:id
```

**Response incluye ahora:** Lista de secciones de la actividad (igual que endpoint 7.4).

---

## 📊 Códigos de Respuesta HTTP

| Código | Descripción | Cuándo ocurre |
|--------|-------------|---------------|
| 200 | OK | Operación exitosa |
| 201 | Created | Recurso creado exitosamente |
| 400 | Bad Request | Validación fallida o regla de negocio violada |
| 404 | Not Found | Recurso no encontrado |
| 500 | Internal Server Error | Error del servidor |

---

## 🔄 Flujos de Integración Sugeridos

### Flujo 1: Crear Sección Completa

```
1. GET /api/actividades → Seleccionar actividad
2. GET /api/personas?tipo=DOCENTE → Seleccionar docentes
3. GET /api/aulas?activa=true → Seleccionar aulas
4. POST /api/secciones/verificar-conflictos → Validar horarios
5. POST /api/secciones → Crear sección con horarios y docentes
6. POST /api/secciones/:id/reservas-aulas → Asignar aulas
```

### Flujo 2: Inscribir Alumno

```
1. GET /api/actividades/:id/secciones → Ver secciones disponibles
2. GET /api/secciones/:id/estadisticas → Ver cupos disponibles
3. POST /api/secciones/:id/participantes → Inscribir
```

### Flujo 3: Vista de Horario Semanal

```
1. GET /api/secciones/horario-semanal → Obtener grilla completa
2. Renderizar calendario con las secciones por día/hora
```

---

## ⚠️ Consideraciones Importantes

### Validaciones Automáticas

El backend valida automáticamente:
- ✅ Horarios: horaFin > horaInicio
- ✅ Conflictos de docentes (no puede estar en 2 lugares a la vez)
- ✅ Conflictos de aulas (un aula, una sección a la vez)
- ✅ Capacidad máxima de secciones
- ✅ Nombres y códigos únicos por actividad
- ✅ Tipos de persona (DOCENTE, SOCIO, etc.)

### Tipos de Datos Importantes

**Formato de Horarios:**
```
horaInicio/horaFin: "HH:MM" (ej: "09:00", "14:30")
```

**Formato de Fechas:**
```
ISO 8601: "2025-01-15T00:00:00Z"
```

**Enum DiaSemana:**
```typescript
type DiaSemana =
  | "LUNES"
  | "MARTES"
  | "MIERCOLES"
  | "JUEVES"
  | "VIERNES"
  | "SABADO"
  | "DOMINGO";
```

**Enum TipoPersona:**
```typescript
type TipoPersona =
  | "SOCIO"
  | "NO_SOCIO"
  | "DOCENTE"
  | "PROVEEDOR";
```

**Enum TipoActividad:**
```typescript
type TipoActividad =
  | "CORO"
  | "CLASE_CANTO"
  | "CLASE_INSTRUMENTO";
```

---

## 📋 Plan de Acción para Frontend

### Fase 1: Preparación (1-2 días)

**Tareas:**
1. ✅ Revisar esta documentación completamente
2. ✅ Crear tipos TypeScript para todas las interfaces
3. ✅ Configurar axios/fetch con base URL
4. ✅ Crear servicios/hooks para cada endpoint
5. ✅ Definir estructura de estado (Redux/Zustand/Context)

**Entregables:**
- `types/seccion.types.ts` con todas las interfaces
- `services/seccionService.ts` con funciones de API
- `hooks/useSecciones.ts` con custom hooks

---

### Fase 2: Vistas Principales (3-4 días)

#### 2.1 Vista de Lista de Secciones
**Componentes necesarios:**
- `SeccionesList.tsx` - Tabla/cards con secciones
- `SeccionFilters.tsx` - Filtros (actividad, activa, búsqueda)
- `SeccionCard.tsx` - Tarjeta individual de sección

**Funcionalidades:**
- Listar secciones con paginación
- Filtrar por actividad/estado/búsqueda
- Ver estadísticas básicas (participantes, ocupación)
- Botón para crear nueva sección

**Endpoints utilizados:**
- `GET /api/secciones`
- `GET /api/secciones/:id/estadisticas`

---

#### 2.2 Vista de Detalle de Sección
**Componentes necesarios:**
- `SeccionDetail.tsx` - Vista completa de la sección
- `HorariosList.tsx` - Lista de horarios
- `DocentesList.tsx` - Lista de docentes asignados
- `ParticipantesList.tsx` - Lista de alumnos
- `AulasList.tsx` - Aulas reservadas

**Funcionalidades:**
- Ver toda la información de la sección
- Editar datos básicos (nombre, capacidad)
- Gestionar horarios (agregar/eliminar)
- Gestionar docentes (asignar/remover)
- Ver lista de participantes

**Endpoints utilizados:**
- `GET /api/secciones/:id?detallada=true`
- `PUT /api/secciones/:id`
- `DELETE /api/secciones/:id`

---

#### 2.3 Formulario de Creación/Edición
**Componentes necesarios:**
- `SeccionForm.tsx` - Formulario principal
- `HorarioInputs.tsx` - Inputs para agregar horarios
- `DocenteSelector.tsx` - Selector de docentes
- `AulaSelector.tsx` - Selector de aulas

**Funcionalidades:**
- Crear sección nueva paso a paso
- Seleccionar actividad padre
- Agregar múltiples horarios
- Asignar docentes (con validación de conflictos)
- Asignar aulas (con validación de conflictos)
- Validación en tiempo real

**Endpoints utilizados:**
- `GET /api/actividades`
- `GET /api/personas?tipo=DOCENTE`
- `GET /api/aulas?activa=true`
- `POST /api/secciones/verificar-conflictos`
- `POST /api/secciones`

---

### Fase 3: Gestión de Participantes (2 días)

#### 3.1 Inscripción de Alumnos
**Componentes necesarios:**
- `InscripcionForm.tsx` - Formulario de inscripción
- `PersonaSelector.tsx` - Buscador de personas
- `SeccionSelector.tsx` - Selector de sección disponible

**Funcionalidades:**
- Buscar persona por nombre/DNI
- Ver secciones disponibles de una actividad
- Ver cupos disponibles en tiempo real
- Inscribir con precio especial opcional
- Validar capacidad máxima

**Endpoints utilizados:**
- `GET /api/personas`
- `GET /api/actividades/:id/secciones`
- `GET /api/secciones/:id/estadisticas`
- `POST /api/secciones/:id/participantes`

---

#### 3.2 Gestión de Participaciones
**Componentes necesarios:**
- `ParticipacionesList.tsx` - Lista de participaciones
- `ParticipacionCard.tsx` - Card con datos del alumno
- `BajaModal.tsx` - Modal para dar de baja

**Funcionalidades:**
- Ver lista de participantes activos
- Ver historial (incluyendo inactivos)
- Actualizar datos de participación
- Dar de baja participación

**Endpoints utilizados:**
- `GET /api/secciones/:id/participantes`
- `PUT /api/secciones/participaciones/:id`
- `POST /api/secciones/participaciones/:id/baja`

---

### Fase 4: Reportes y Visualizaciones (2-3 días)

#### 4.1 Horario Semanal
**Componentes necesarios:**
- `HorarioSemanal.tsx` - Grilla de horarios
- `SeccionCell.tsx` - Celda con info de sección
- `HorarioFilters.tsx` - Filtros por actividad/docente

**Funcionalidades:**
- Mostrar grilla semanal (días x horarios)
- Ver todas las secciones por día/hora
- Código de colores por ocupación
- Click en celda para ver detalle
- Exportar a PDF/Excel

**Endpoints utilizados:**
- `GET /api/secciones/horario-semanal`

---

#### 4.2 Dashboard de Estadísticas
**Componentes necesarios:**
- `Dashboard.tsx` - Vista principal
- `OcupacionChart.tsx` - Gráfico de ocupación
- `SeccionesStats.tsx` - Métricas generales
- `DocenteCargaChart.tsx` - Carga horaria de docentes

**Funcionalidades:**
- Métricas generales (total secciones, ocupación promedio)
- Gráficos de ocupación por sección
- Lista de secciones llenas/disponibles
- Alertas de sobrecarga de docentes

**Endpoints utilizados:**
- `GET /api/secciones/ocupacion`
- `GET /api/personas/docentes/:id/carga-horaria`

---

### Fase 5: Validaciones y UX (1-2 días)

#### 5.1 Validaciones en Tiempo Real
**Implementar:**
- Validación de conflictos antes de crear sección
- Validación de capacidad antes de inscribir
- Validación de horarios (horaFin > horaInicio)
- Alertas visuales de conflictos

**Endpoints utilizados:**
- `POST /api/secciones/verificar-conflictos`

---

#### 5.2 Mejoras de UX
**Implementar:**
- Loading states en todas las operaciones
- Mensajes de éxito/error (toast/snackbar)
- Confirmaciones para eliminar
- Estados vacíos (empty states)
- Skeleton loaders
- Paginación inteligente

---

### Fase 6: Testing y Refinamiento (2 días)

**Tareas:**
1. ✅ Tests unitarios de componentes
2. ✅ Tests de integración de flujos
3. ✅ Pruebas manuales de todos los endpoints
4. ✅ Corrección de bugs encontrados
5. ✅ Optimización de performance
6. ✅ Validación con usuarios

---

## 🎨 Sugerencias de UI/UX

### Dashboard Principal
```
┌─────────────────────────────────────────────────────┐
│  📊 Estadísticas Generales                          │
│  ┌──────────┬──────────┬──────────┬──────────┐    │
│  │ 15       │ 72%      │ 5        │ 10       │    │
│  │ Secciones│ Ocupación│ Llenas   │ Disponib.│    │
│  └──────────┴──────────┴──────────┴──────────┘    │
│                                                      │
│  📅 Horario Semanal                                 │
│  ┌────────┬────────┬────────┬────────┬────────┐   │
│  │ LUNES  │ MARTES │ MIERC. │ JUEVES │ VIERNES│   │
│  ├────────┼────────┼────────┼────────┼────────┤   │
│  │09:00   │        │        │        │        │   │
│  │Piano A │        │Guitar B│        │Coro A  │   │
│  │75% 🟢  │        │100% 🔴 │        │50% 🟡  │   │
│  ├────────┼────────┼────────┼────────┼────────┤   │
│  │10:30   │Piano B │        │Canto A │        │   │
│  │...     │...     │...     │...     │...     │   │
│  └────────┴────────┴────────┴────────┴────────┘   │
└─────────────────────────────────────────────────────┘
```

### Indicadores Visuales
```
Ocupación:
🟢 0-50%   - Disponible
🟡 51-80%  - Parcial
🟠 81-99%  - Casi llena
🔴 100%    - Llena

Estado de sección:
✅ Activa
❌ Inactiva
⚠️  Con conflictos
```

### Color Coding
- Verde: Secciones con disponibilidad
- Amarillo: Secciones parcialmente llenas
- Rojo: Secciones sin cupos
- Gris: Secciones inactivas

---

## 🔍 Ejemplos de Código

### 1. Servicio de API (TypeScript)

```typescript
// services/seccionService.ts
import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

export const seccionService = {
  // Listar secciones
  async listSecciones(params: {
    actividadId?: string;
    activa?: boolean;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const response = await axios.get(`${API_URL}/secciones`, { params });
    return response.data;
  },

  // Obtener sección por ID
  async getSeccion(id: string, detallada: boolean = false) {
    const response = await axios.get(`${API_URL}/secciones/${id}`, {
      params: { detallada }
    });
    return response.data;
  },

  // Crear sección
  async createSeccion(data: CreateSeccionDto) {
    const response = await axios.post(`${API_URL}/secciones`, data);
    return response.data;
  },

  // Verificar conflictos
  async verificarConflictos(data: VerificarConflictoDto) {
    const response = await axios.post(
      `${API_URL}/secciones/verificar-conflictos`,
      data
    );
    return response.data;
  },

  // Inscribir participante
  async inscribirParticipante(seccionId: string, data: InscripcionDto) {
    const response = await axios.post(
      `${API_URL}/secciones/${seccionId}/participantes`,
      data
    );
    return response.data;
  },

  // Obtener horario semanal
  async getHorarioSemanal() {
    const response = await axios.get(`${API_URL}/secciones/horario-semanal`);
    return response.data;
  },

  // Obtener estadísticas
  async getEstadisticas(seccionId: string) {
    const response = await axios.get(
      `${API_URL}/secciones/${seccionId}/estadisticas`
    );
    return response.data;
  }
};
```

---

### 2. Custom Hook (React)

```typescript
// hooks/useSecciones.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { seccionService } from '@/services/seccionService';

export function useSecciones(filters?: SeccionFilters) {
  return useQuery({
    queryKey: ['secciones', filters],
    queryFn: () => seccionService.listSecciones(filters)
  });
}

export function useSeccion(id: string, detallada: boolean = false) {
  return useQuery({
    queryKey: ['seccion', id, detallada],
    queryFn: () => seccionService.getSeccion(id, detallada),
    enabled: !!id
  });
}

export function useCreateSeccion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: seccionService.createSeccion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['secciones'] });
    }
  });
}

export function useInscribirParticipante() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ seccionId, data }: {
      seccionId: string;
      data: InscripcionDto
    }) => seccionService.inscribirParticipante(seccionId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['seccion', variables.seccionId]
      });
    }
  });
}
```

---

### 3. Componente de Formulario (React)

```typescript
// components/SeccionForm.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createSeccionSchema } from '@/schemas/seccion.schema';

export function SeccionForm({ actividadId }: { actividadId: string }) {
  const { mutate, isLoading } = useCreateSeccion();

  const form = useForm({
    resolver: zodResolver(createSeccionSchema),
    defaultValues: {
      actividadId,
      nombre: '',
      capacidadMaxima: 10,
      horarios: []
    }
  });

  const onSubmit = (data: CreateSeccionDto) => {
    mutate(data, {
      onSuccess: () => {
        toast.success('Sección creada exitosamente');
        router.push('/secciones');
      },
      onError: (error) => {
        toast.error(error.message);
      }
    });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <Input {...form.register('nombre')} label="Nombre de la sección" />
      <Input {...form.register('codigo')} label="Código" />
      <Input {...form.register('capacidadMaxima')} type="number" />

      <HorariosInput control={form.control} name="horarios" />
      <DocentesSelect control={form.control} name="docenteIds" />

      <Button type="submit" loading={isLoading}>
        Crear Sección
      </Button>
    </form>
  );
}
```

---

## 📝 Checklist de Implementación

### Setup Inicial
- [ ] Crear estructura de carpetas (services, hooks, types, components)
- [ ] Configurar axios con interceptors
- [ ] Definir tipos TypeScript de todas las entidades
- [ ] Configurar React Query / SWR
- [ ] Crear archivo de constantes (DIAS_SEMANA, TIPOS, etc.)

### Endpoints (27 total)
- [ ] GET /api/secciones
- [ ] GET /api/secciones/:id
- [ ] POST /api/secciones
- [ ] PUT /api/secciones/:id
- [ ] DELETE /api/secciones/:id
- [ ] POST /api/secciones/:id/horarios
- [ ] PUT /api/secciones/horarios/:id
- [ ] DELETE /api/secciones/horarios/:id
- [ ] POST /api/secciones/:id/docentes
- [ ] DELETE /api/secciones/:id/docentes/:id
- [ ] POST /api/secciones/:id/participantes
- [ ] GET /api/secciones/:id/participantes
- [ ] PUT /api/secciones/participaciones/:id
- [ ] POST /api/secciones/participaciones/:id/baja
- [ ] GET /api/personas/:id/secciones
- [ ] POST /api/secciones/:id/reservas-aulas
- [ ] PUT /api/secciones/reservas-aulas/:id
- [ ] DELETE /api/secciones/reservas-aulas/:id
- [ ] POST /api/secciones/verificar-conflictos
- [ ] GET /api/secciones/:id/estadisticas
- [ ] GET /api/secciones/horario-semanal
- [ ] GET /api/secciones/ocupacion
- [ ] GET /api/actividades/:id/secciones
- [ ] GET /api/personas/docentes/:id/carga-horaria
- [ ] GET /api/personas?tipo=DOCENTE
- [ ] GET /api/aulas?activa=true
- [ ] GET /api/actividades

### Componentes Principales
- [ ] SeccionesList
- [ ] SeccionDetail
- [ ] SeccionForm
- [ ] HorarioSemanal
- [ ] Dashboard
- [ ] InscripcionForm
- [ ] ParticipantesList

### Funcionalidades
- [ ] Crear sección con horarios y docentes
- [ ] Editar sección
- [ ] Eliminar sección (con validación)
- [ ] Agregar/eliminar horarios
- [ ] Asignar/remover docentes
- [ ] Inscribir participante
- [ ] Dar de baja participación
- [ ] Ver horario semanal
- [ ] Ver estadísticas por sección
- [ ] Ver ocupación global
- [ ] Validar conflictos en tiempo real

### Validaciones
- [ ] Validación de formularios con Zod
- [ ] Validación de conflictos de horarios
- [ ] Validación de capacidad máxima
- [ ] Validación de horarios (horaFin > horaInicio)
- [ ] Manejo de errores HTTP

### UX/UI
- [ ] Loading states
- [ ] Error states
- [ ] Empty states
- [ ] Toast notifications
- [ ] Confirmación de eliminar
- [ ] Skeleton loaders
- [ ] Responsive design
- [ ] Accesibilidad (a11y)

### Testing
- [ ] Tests unitarios de servicios
- [ ] Tests de componentes
- [ ] Tests de integración
- [ ] Tests E2E de flujos principales

---

## 🚀 Cronograma Sugerido

| Semana | Tareas | Entregables |
|--------|--------|-------------|
| 1 | Setup + Lista de Secciones | Proyecto configurado, vista de lista funcionando |
| 2 | Detalle + Formulario | CRUD completo de secciones |
| 3 | Participantes + Inscripciones | Gestión de alumnos funcionando |
| 4 | Reportes + Horario Semanal | Dashboard y visualizaciones |
| 5 | Testing + Refinamiento | Sistema completo y testeado |

**Estimación total: 4-5 semanas** para implementación completa

---

## 📞 Soporte y Contacto

**Backend Endpoint Base URL:** `http://localhost:8000/api`

**Archivo de pruebas HTTP:** `tests/secciones.http` (66 test cases)

**Documentación completa del backend:** `docs/API_SECCIONES_FRONTEND.md` (este archivo)

**Estado del sistema:**
- ✅ Backend 100% operativo
- ✅ Base de datos migrada
- ✅ Todos los endpoints testeados
- ✅ Validaciones funcionando

---

**Documentación generada:** 2025-01-10
**Versión del sistema:** 1.0.0
**Endpoints totales:** 27
**Estado:** ✅ Listo para integración frontend
