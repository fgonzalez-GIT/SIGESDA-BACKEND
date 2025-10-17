# API de Actividades V2.0 - Documentación Completa

## Tabla de Contenidos

- [Información General](#información-general)
- [Base URL](#base-url)
- [Autenticación](#autenticación)
- [Formatos de Respuesta](#formatos-de-respuesta)
- [Códigos de Estado HTTP](#códigos-de-estado-http)
- [Endpoints](#endpoints)
  - [Catálogos](#catálogos)
  - [CRUD de Actividades](#crud-de-actividades)
  - [Gestión de Horarios](#gestión-de-horarios)
  - [Gestión de Docentes](#gestión-de-docentes)
  - [Participantes](#participantes)
  - [Estadísticas](#estadísticas)
  - [Reportes](#reportes)
  - [Operaciones Especiales](#operaciones-especiales)

---

## Información General

La API de Actividades V2.0 permite gestionar actividades del sistema SIGESDA, incluyendo:

- Creación y gestión de actividades culturales, deportivas y educativas
- Administración de horarios semanales
- Asignación de docentes y roles
- Gestión de participantes
- Consultas de estadísticas y reportes
- Duplicación de actividades

**Versión**: 2.0
**Última actualización**: 2025-10-15

---

## Base URL

```
http://localhost:8000/api/actividades
```

En producción, reemplazar `localhost:8000` por el dominio correspondiente.

---

## Autenticación

🔒 **Estado actual**: No requiere autenticación (en desarrollo)

📝 **Nota para producción**: Se recomienda implementar autenticación JWT o similar. Todos los endpoints deberán incluir:

```http
Authorization: Bearer {token}
```

---

## Formatos de Respuesta

### Respuesta Exitosa

```json
{
  "success": true,
  "data": {
    // Datos solicitados
  },
  "message": "Mensaje opcional"
}
```

### Respuesta con Paginación

```json
{
  "success": true,
  "data": {
    "data": [...],
    "total": 100,
    "page": 1,
    "limit": 10,
    "pages": 10
  }
}
```

### Respuesta de Error

```json
{
  "success": false,
  "error": "Mensaje de error descriptivo"
}
```

---

## Códigos de Estado HTTP

| Código | Descripción |
|--------|-------------|
| `200` | OK - Operación exitosa |
| `201` | Created - Recurso creado exitosamente |
| `400` | Bad Request - Datos inválidos o faltantes |
| `404` | Not Found - Recurso no encontrado |
| `409` | Conflict - Conflicto con estado actual (ej: código duplicado) |
| `500` | Internal Server Error - Error del servidor |

---

## Endpoints

### Catálogos

Los catálogos son datos maestros necesarios para crear y gestionar actividades.

#### 1. Obtener Todos los Catálogos

Obtiene todos los catálogos en una sola petición (optimizado).

```http
GET /catalogos/todos
```

**Respuesta** (200 OK):

```json
{
  "success": true,
  "data": {
    "tipos": [
      {
        "id": 1,
        "codigo": "CORO",
        "nombre": "Coro",
        "descripcion": "Actividades de canto coral",
        "activo": true,
        "orden": 1
      }
    ],
    "categorias": [
      {
        "id": 1,
        "codigo": "ADULTOS",
        "nombre": "Adultos Mayores",
        "descripcion": "Actividades para personas de 60 años o más",
        "activo": true,
        "orden": 1
      }
    ],
    "estados": [
      {
        "id": 1,
        "codigo": "ACTIVA",
        "nombre": "Activa",
        "descripcion": "Actividad en curso",
        "activo": true,
        "orden": 1
      }
    ],
    "diasSemana": [
      {
        "id": 1,
        "codigo": "LUN",
        "nombre": "Lunes",
        "orden": 1
      }
    ],
    "rolesDocentes": [
      {
        "id": 1,
        "codigo": "PROFESOR",
        "nombre": "Profesor Principal",
        "descripcion": "Docente titular de la actividad",
        "activo": true,
        "orden": 1
      }
    ]
  }
}
```

#### 2. Obtener Tipos de Actividades

```http
GET /catalogos/tipos
```

**Respuesta** (200 OK):

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "codigo": "CORO",
      "nombre": "Coro",
      "descripcion": "Actividades de canto coral",
      "activo": true,
      "orden": 1,
      "created_at": "2025-10-15T20:00:00.000Z",
      "updated_at": "2025-10-15T20:00:00.000Z"
    }
  ]
}
```

#### 3. Obtener Categorías de Actividades

```http
GET /catalogos/categorias
```

**Respuesta**: Igual estructura que tipos.

#### 4. Obtener Estados de Actividades

```http
GET /catalogos/estados
```

**Respuesta**: Igual estructura que tipos.

**Estados disponibles**:
- `ACTIVA`: Actividad en curso
- `INACTIVA`: Actividad pausada temporalmente
- `FINALIZADA`: Actividad completada
- `CANCELADA`: Actividad cancelada

#### 5. Obtener Días de la Semana

```http
GET /catalogos/dias-semana
```

**Respuesta** (200 OK):

```json
{
  "success": true,
  "data": [
    { "id": 1, "codigo": "LUN", "nombre": "Lunes", "orden": 1 },
    { "id": 2, "codigo": "MAR", "nombre": "Martes", "orden": 2 },
    { "id": 3, "codigo": "MIE", "nombre": "Miércoles", "orden": 3 },
    { "id": 4, "codigo": "JUE", "nombre": "Jueves", "orden": 4 },
    { "id": 5, "codigo": "VIE", "nombre": "Viernes", "orden": 5 },
    { "id": 6, "codigo": "SAB", "nombre": "Sábado", "orden": 6 },
    { "id": 7, "codigo": "DOM", "nombre": "Domingo", "orden": 7 }
  ]
}
```

#### 6. Obtener Roles de Docentes

```http
GET /catalogos/roles-docentes
```

**Respuesta**: Igual estructura que tipos.

**Roles disponibles**:
- `PROFESOR`: Profesor principal
- `AYUDANTE`: Profesor ayudante
- `INVITADO`: Profesor invitado
- `COORDINADOR`: Coordinador de actividad

---

### CRUD de Actividades

#### 7. Crear Actividad

Crea una nueva actividad con horarios, docentes y reservas de aulas (opcional).

```http
POST /
Content-Type: application/json
```

**Request Body**:

```json
{
  "codigoActividad": "CORO-ADU-2025-A",
  "nombre": "Coro de Adultos Mayores",
  "tipoActividadId": 1,
  "categoriaId": 1,
  "estadoId": 1,
  "descripcion": "Coro para personas de 60 años o más",
  "fechaDesde": "2025-03-01T00:00:00.000Z",
  "fechaHasta": "2025-06-30T23:59:59.999Z",
  "cupoMaximo": 30,
  "costo": 0,
  "observaciones": "Actividad gratuita",
  "horarios": [
    {
      "diaSemanaId": 2,
      "horaInicio": "10:00",
      "horaFin": "12:00",
      "activo": true
    },
    {
      "diaSemanaId": 4,
      "horaInicio": "10:00",
      "horaFin": "12:00",
      "activo": true
    }
  ],
  "docentes": [
    {
      "docenteId": "cm123abc456",
      "rolDocenteId": 1,
      "observaciones": "Profesor titular"
    }
  ],
  "reservasAulas": []
}
```

**Campos requeridos**:
- `codigoActividad`: String, único, formato: `[A-Z0-9\-]+`
- `nombre`: String (max 200 caracteres)
- `tipoActividadId`: Integer (ID de tipos_actividades)
- `categoriaId`: Integer (ID de categorias_actividades)
- `estadoId`: Integer (ID de estados_actividades, default: 1)
- `fechaDesde`: DateTime ISO 8601
- `costo`: Number (default: 0)

**Campos opcionales**:
- `descripcion`: String (max 1000 caracteres)
- `fechaHasta`: DateTime ISO 8601
- `cupoMaximo`: Integer positivo
- `observaciones`: String (max 1000 caracteres)
- `horarios`: Array de objetos horario
- `docentes`: Array de objetos docente
- `reservasAulas`: Array de objetos reserva

**Respuesta** (201 Created):

```json
{
  "success": true,
  "message": "Actividad creada exitosamente",
  "data": {
    "id": 1,
    "codigo_actividad": "CORO-ADU-2025-A",
    "nombre": "Coro de Adultos Mayores",
    "tipo_actividad_id": 1,
    "categoria_id": 1,
    "estado_id": 1,
    "descripcion": "Coro para personas de 60 años o más",
    "fecha_desde": "2025-03-01T00:00:00.000Z",
    "fecha_hasta": "2025-06-30T23:59:59.999Z",
    "cupo_maximo": 30,
    "costo": 0,
    "observaciones": "Actividad gratuita",
    "created_at": "2025-10-15T20:00:00.000Z",
    "updated_at": "2025-10-15T20:00:00.000Z",
    "tipos_actividades": {
      "id": 1,
      "codigo": "CORO",
      "nombre": "Coro"
    },
    "categorias_actividades": {
      "id": 1,
      "codigo": "ADULTOS",
      "nombre": "Adultos Mayores"
    },
    "estados_actividades": {
      "id": 1,
      "codigo": "ACTIVA",
      "nombre": "Activa"
    },
    "horarios_actividades": [
      {
        "id": 1,
        "actividad_id": 1,
        "dia_semana_id": 2,
        "hora_inicio": "10:00:00",
        "hora_fin": "12:00:00",
        "activo": true,
        "dias_semana": {
          "id": 2,
          "codigo": "MAR",
          "nombre": "Martes"
        }
      }
    ],
    "docentes_actividades": [],
    "participaciones_actividades": []
  }
}
```

**Errores comunes**:
- `400`: Código duplicado, datos inválidos, fechas inconsistentes
- `400`: Horarios en conflicto (mismo día, horas superpuestas)

#### 8. Listar Actividades

Lista actividades con filtros y paginación.

```http
GET /?page=1&limit=10&incluirRelaciones=true&orderBy=nombre&orderDir=asc
```

**Query Parameters**:

| Parámetro | Tipo | Descripción | Default |
|-----------|------|-------------|---------|
| `page` | Integer | Número de página | `1` |
| `limit` | Integer | Registros por página (max 100) | `10` |
| `tipoActividadId` | Integer | Filtrar por tipo | - |
| `categoriaId` | Integer | Filtrar por categoría | - |
| `estadoId` | Integer | Filtrar por estado | - |
| `diaSemanaId` | Integer | Filtrar por día (1-7) | - |
| `docenteId` | String (CUID) | Filtrar por docente | - |
| `aulaId` | String (CUID) | Filtrar por aula | - |
| `conCupo` | Boolean | Solo con cupo disponible | - |
| `vigentes` | Boolean | Solo vigentes (fechas actuales) | - |
| `costoDesde` | Number | Costo mínimo | - |
| `costoHasta` | Number | Costo máximo | - |
| `search` | String | Búsqueda en nombre/descripción/código | - |
| `incluirRelaciones` | Boolean | Incluir relaciones (tipos, estados, etc.) | `true` |
| `orderBy` | String | Campo de ordenamiento | `nombre` |
| `orderDir` | String | Dirección: `asc` o `desc` | `asc` |

**Valores válidos para `orderBy`**:
- `nombre`, `codigo`, `fechaDesde`, `costo`, `cupoMaximo`, `created_at`

**Ejemplos**:

```http
# Actividades activas con cupo disponible
GET /?estadoId=1&conCupo=true

# Actividades gratuitas del tipo Coro
GET /?tipoActividadId=1&costoHasta=0

# Búsqueda por texto
GET /?search=teatro

# Actividades vigentes ordenadas por fecha
GET /?vigentes=true&orderBy=fechaDesde&orderDir=desc
```

**Respuesta** (200 OK):

```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": 1,
        "codigo_actividad": "CORO-ADU-2025-A",
        "nombre": "Coro de Adultos Mayores",
        "tipo_actividad_id": 1,
        "categoria_id": 1,
        "estado_id": 1,
        "cupo_maximo": 30,
        "costo": 0,
        "tipos_actividades": {
          "nombre": "Coro"
        },
        "categorias_actividades": {
          "nombre": "Adultos Mayores"
        },
        "estados_actividades": {
          "nombre": "Activa"
        },
        "horarios_actividades": [...],
        "_count_participantes": 15
      }
    ],
    "total": 100,
    "page": 1,
    "limit": 10,
    "pages": 10
  }
}
```

#### 9. Obtener Actividad por ID

```http
GET /:id
```

**Parámetros de Ruta**:
- `id`: Integer - ID de la actividad

**Respuesta** (200 OK):

```json
{
  "success": true,
  "data": {
    "id": 1,
    "codigo_actividad": "CORO-ADU-2025-A",
    "nombre": "Coro de Adultos Mayores",
    "tipo_actividad_id": 1,
    "categoria_id": 1,
    "estado_id": 1,
    "descripcion": "Coro para personas de 60 años o más",
    "fecha_desde": "2025-03-01T00:00:00.000Z",
    "fecha_hasta": "2025-06-30T23:59:59.999Z",
    "cupo_maximo": 30,
    "costo": 0,
    "observaciones": "Actividad gratuita",
    "created_at": "2025-10-15T20:00:00.000Z",
    "updated_at": "2025-10-15T20:00:00.000Z",
    "tipos_actividades": {...},
    "categorias_actividades": {...},
    "estados_actividades": {...},
    "horarios_actividades": [...],
    "docentes_actividades": [...],
    "participaciones_actividades": [...]
  }
}
```

**Errores**:
- `400`: ID inválido (no numérico)
- `404`: Actividad no encontrada

#### 10. Obtener Actividad por Código

```http
GET /codigo/:codigo
```

**Parámetros de Ruta**:
- `codigo`: String - Código único de la actividad (ej: `CORO-ADU-2025-A`)

**Respuesta**: Igual que GET /:id

**Errores**:
- `404`: Actividad con ese código no encontrada

#### 11. Actualizar Actividad

Actualiza datos de una actividad existente. Todos los campos son opcionales.

```http
PATCH /:id
Content-Type: application/json
```

**Parámetros de Ruta**:
- `id`: Integer - ID de la actividad

**Request Body** (todos opcionales):

```json
{
  "codigoActividad": "CORO-ADU-2025-B",
  "nombre": "Coro de Adultos Mayores - Edición 2",
  "tipoActividadId": 1,
  "categoriaId": 2,
  "estadoId": 1,
  "descripcion": "Nueva descripción",
  "fechaDesde": "2025-04-01T00:00:00.000Z",
  "fechaHasta": "2025-07-31T23:59:59.999Z",
  "cupoMaximo": 35,
  "costo": 500,
  "observaciones": "Nuevas observaciones"
}
```

**Validaciones**:
- Si se cambia `codigoActividad`, debe ser único
- Si se proporcionan `fechaDesde` y `fechaHasta`, hasta >= desde
- No se pueden actualizar horarios directamente (usar endpoints específicos)

**Respuesta** (200 OK):

```json
{
  "success": true,
  "message": "Actividad actualizada exitosamente",
  "data": {
    // Actividad actualizada completa
  }
}
```

**Errores**:
- `400`: Código duplicado, fechas inválidas
- `404`: Actividad no encontrada

#### 12. Eliminar Actividad

```http
DELETE /:id
```

**Parámetros de Ruta**:
- `id`: Integer - ID de la actividad

**Validaciones**:
- No se puede eliminar si tiene participantes activos
- Elimina en cascada: horarios y asignaciones de docentes

**Respuesta** (200 OK):

```json
{
  "success": true,
  "message": "Actividad eliminada exitosamente"
}
```

**Errores**:
- `400`: La actividad tiene participantes activos
- `404`: Actividad no encontrada

---

### Gestión de Horarios

#### 13. Obtener Horarios de una Actividad

```http
GET /:id/horarios
```

**Parámetros de Ruta**:
- `id`: Integer - ID de la actividad

**Respuesta** (200 OK):

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "actividad_id": 1,
      "dia_semana_id": 2,
      "hora_inicio": "10:00:00",
      "hora_fin": "12:00:00",
      "activo": true,
      "created_at": "2025-10-15T20:00:00.000Z",
      "updated_at": "2025-10-15T20:00:00.000Z",
      "dias_semana": {
        "id": 2,
        "codigo": "MAR",
        "nombre": "Martes",
        "orden": 2
      },
      "reservas_aulas_actividades": []
    }
  ]
}
```

#### 14. Agregar Horario a Actividad

```http
POST /:id/horarios
Content-Type: application/json
```

**Parámetros de Ruta**:
- `id`: Integer - ID de la actividad

**Request Body**:

```json
{
  "diaSemanaId": 3,
  "horaInicio": "14:00",
  "horaFin": "16:00",
  "activo": true
}
```

**Campos requeridos**:
- `diaSemanaId`: Integer (1-7)
- `horaInicio`: String formato `HH:MM` o `HH:MM:SS`
- `horaFin`: String formato `HH:MM` o `HH:MM:SS`

**Validaciones**:
- `horaFin` debe ser posterior a `horaInicio`
- No debe superponerse con otros horarios de la misma actividad en el mismo día

**Respuesta** (201 Created):

```json
{
  "success": true,
  "message": "Horario agregado exitosamente",
  "data": {
    "id": 2,
    "actividad_id": 1,
    "dia_semana_id": 3,
    "hora_inicio": "14:00:00",
    "hora_fin": "16:00:00",
    "activo": true,
    "created_at": "2025-10-15T20:00:00.000Z",
    "updated_at": "2025-10-15T20:00:00.000Z"
  }
}
```

**Errores**:
- `400`: Horarios en conflicto, horas inválidas
- `404`: Actividad no encontrada

#### 15. Actualizar Horario

```http
PATCH /horarios/:horarioId
Content-Type: application/json
```

**Parámetros de Ruta**:
- `horarioId`: Integer - ID del horario

**Request Body** (todos opcionales):

```json
{
  "diaSemanaId": 4,
  "horaInicio": "15:00",
  "horaFin": "17:00",
  "activo": false
}
```

**Validaciones**:
- Mismas que al crear horario
- Valida conflictos con otros horarios de la misma actividad

**Respuesta** (200 OK):

```json
{
  "success": true,
  "message": "Horario actualizado exitosamente",
  "data": {
    // Horario actualizado
  }
}
```

**Errores**:
- `400`: Horarios en conflicto
- `404`: Horario no encontrado

#### 16. Eliminar Horario

```http
DELETE /horarios/:horarioId
```

**Parámetros de Ruta**:
- `horarioId`: Integer - ID del horario

**Respuesta** (200 OK):

```json
{
  "success": true,
  "message": "Horario eliminado exitosamente"
}
```

**Errores**:
- `404`: Horario no encontrado

---

### Gestión de Docentes

#### 17. Obtener Docentes de una Actividad

```http
GET /:id/docentes
```

**Parámetros de Ruta**:
- `id`: Integer - ID de la actividad

**Respuesta** (200 OK):

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "actividad_id": 1,
      "docente_id": "cm123abc456",
      "rol_docente_id": 1,
      "fecha_asignacion": "2025-03-01T00:00:00.000Z",
      "fecha_desasignacion": null,
      "activo": true,
      "observaciones": "Profesor titular",
      "created_at": "2025-10-15T20:00:00.000Z",
      "updated_at": "2025-10-15T20:00:00.000Z",
      "personas": {
        "persona_id": "cm123abc456",
        "nombre": "Juan",
        "apellido": "Pérez",
        "email": "juan.perez@example.com"
      },
      "roles_docentes": {
        "id": 1,
        "codigo": "PROFESOR",
        "nombre": "Profesor Principal"
      }
    }
  ]
}
```

#### 18. Asignar Docente a Actividad

```http
POST /:id/docentes
Content-Type: application/json
```

**Parámetros de Ruta**:
- `id`: Integer - ID de la actividad

**Request Body**:

```json
{
  "docenteId": "cm123abc456",
  "rolDocenteId": 1,
  "observaciones": "Profesor invitado"
}
```

**Campos requeridos**:
- `docenteId`: String (CUID) - ID de la persona
- `rolDocenteId`: Integer - ID del rol de docente

**Respuesta** (201 Created):

```json
{
  "success": true,
  "message": "Docente asignado exitosamente",
  "data": {
    // Asignación creada con relaciones
  }
}
```

**Errores**:
- `404`: Actividad o persona no encontrada
- `400`: El docente ya está asignado con ese rol

#### 19. Desasignar Docente de Actividad

Realiza un "soft delete" de la asignación (marca como inactivo).

```http
DELETE /:id/docentes/:docenteId/rol/:rolDocenteId
```

**Parámetros de Ruta**:
- `id`: Integer - ID de la actividad
- `docenteId`: String (CUID) - ID de la persona
- `rolDocenteId`: Integer - ID del rol

**Respuesta** (200 OK):

```json
{
  "success": true,
  "message": "Docente desasignado exitosamente",
  "data": {
    // Asignación marcada como inactiva con fecha_desasignacion
  }
}
```

**Errores**:
- `404`: Asignación no encontrada

#### 20. Obtener Docentes Disponibles

Lista todas las personas con rol de docente disponibles para asignar.

```http
GET /docentes/disponibles
```

**Respuesta** (200 OK):

```json
{
  "success": true,
  "data": [
    {
      "persona_id": "cm123abc456",
      "nombre": "Juan",
      "apellido": "Pérez",
      "email": "juan.perez@example.com",
      "telefono": "+56912345678",
      "tipo_persona": "DOCENTE"
    }
  ]
}
```

---

### Participantes

#### 21. Obtener Participantes de una Actividad

```http
GET /:id/participantes
```

**Parámetros de Ruta**:
- `id`: Integer - ID de la actividad

**Respuesta** (200 OK):

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "persona_id": "cm789xyz012",
      "actividad_id": 1,
      "fecha_inicio": "2025-03-01T00:00:00.000Z",
      "fecha_fin": null,
      "precio_especial": null,
      "activo": true,
      "observaciones": null,
      "created_at": "2025-10-15T20:00:00.000Z",
      "updated_at": "2025-10-15T20:00:00.000Z",
      "personas": {
        "persona_id": "cm789xyz012",
        "nombre": "María",
        "apellido": "González",
        "rut": "12345678-9",
        "email": "maria.gonzalez@example.com",
        "fecha_nacimiento": "1955-05-15"
      }
    }
  ]
}
```

---

### Estadísticas

#### 22. Obtener Estadísticas de una Actividad

```http
GET /:id/estadisticas
```

**Parámetros de Ruta**:
- `id`: Integer - ID de la actividad

**Respuesta** (200 OK):

```json
{
  "success": true,
  "data": {
    "actividadId": 1,
    "nombreActividad": "Coro de Adultos Mayores",
    "totalParticipantes": 15,
    "totalHorarios": 2,
    "totalDocentes": 1,
    "totalReservasAulas": 0,
    "cupoMaximo": 30,
    "cupoDisponible": 15,
    "porcentajeOcupacion": 50.0,
    "costo": 0,
    "estado": "Activa",
    "vigente": true,
    "fechaDesde": "2025-03-01T00:00:00.000Z",
    "fechaHasta": "2025-06-30T23:59:59.999Z"
  }
}
```

**Errores**:
- `404`: Actividad no encontrada

---

### Reportes

#### 23. Resumen de Actividades por Tipo

Agrupa todas las actividades por tipo con estadísticas.

```http
GET /reportes/por-tipo
```

**Respuesta** (200 OK):

```json
{
  "success": true,
  "data": [
    {
      "tipo": {
        "id": 1,
        "codigo": "CORO",
        "nombre": "Coro"
      },
      "totalActividades": 3,
      "actividades": [
        {
          "id": 1,
          "codigo": "CORO-ADU-2025-A",
          "nombre": "Coro de Adultos Mayores",
          "cupoMaximo": 30,
          "costo": 0
        }
      ]
    },
    {
      "tipo": {
        "id": 2,
        "codigo": "TALLER",
        "nombre": "Taller"
      },
      "totalActividades": 5,
      "actividades": [...]
    }
  ]
}
```

#### 24. Horario Semanal Completo

Genera un horario semanal con todas las actividades organizadas por día.

```http
GET /reportes/horario-semanal
```

**Respuesta** (200 OK):

```json
{
  "success": true,
  "data": {
    "horarioSemanal": [
      {
        "dia": {
          "id": 1,
          "codigo": "LUN",
          "nombre": "Lunes",
          "orden": 1
        },
        "actividades": [
          {
            "id": 1,
            "codigo": "CORO-ADU-2025-A",
            "nombre": "Coro de Adultos Mayores",
            "tipo": "Coro",
            "horarios": [
              {
                "horaInicio": "10:00",
                "horaFin": "12:00",
                "aula": "Sala 101"
              }
            ],
            "docentes": [
              {
                "nombre": "Juan Pérez",
                "rol": "Profesor Principal"
              }
            ]
          }
        ]
      },
      {
        "dia": {
          "id": 2,
          "codigo": "MAR",
          "nombre": "Martes",
          "orden": 2
        },
        "actividades": [...]
      }
    ],
    "generadoEn": "2025-10-15T20:30:00.000Z"
  }
}
```

---

### Operaciones Especiales

#### 25. Cambiar Estado de Actividad

Cambia el estado de una actividad (ACTIVA, INACTIVA, FINALIZADA, CANCELADA).

```http
PATCH /:id/estado
Content-Type: application/json
```

**Parámetros de Ruta**:
- `id`: Integer - ID de la actividad

**Request Body**:

```json
{
  "nuevoEstadoId": 2,
  "observaciones": "Actividad pausada por falta de docente"
}
```

**Campos requeridos**:
- `nuevoEstadoId`: Integer - ID del nuevo estado

**Respuesta** (200 OK):

```json
{
  "success": true,
  "message": "Estado de actividad cambiado exitosamente",
  "data": {
    // Actividad con estado actualizado
  }
}
```

**Errores**:
- `404`: Actividad no encontrada
- `400`: Estado inválido

#### 26. Duplicar Actividad

Crea una copia de una actividad existente con nuevo código y fechas.

```http
POST /:id/duplicar
Content-Type: application/json
```

**Parámetros de Ruta**:
- `id`: Integer - ID de la actividad a duplicar

**Request Body**:

```json
{
  "nuevoCodigoActividad": "CORO-ADU-2025-B",
  "nuevoNombre": "Coro de Adultos Mayores - Edición 2",
  "nuevaFechaDesde": "2025-07-01T00:00:00.000Z",
  "nuevaFechaHasta": "2025-09-30T23:59:59.999Z",
  "copiarHorarios": true,
  "copiarDocentes": false,
  "copiarReservasAulas": false
}
```

**Campos requeridos**:
- `nuevoCodigoActividad`: String único
- `nuevoNombre`: String
- `nuevaFechaDesde`: DateTime ISO 8601

**Campos opcionales**:
- `nuevaFechaHasta`: DateTime ISO 8601
- `copiarHorarios`: Boolean (default: true)
- `copiarDocentes`: Boolean (default: false)
- `copiarReservasAulas`: Boolean (default: false)

**Respuesta** (201 Created):

```json
{
  "success": true,
  "message": "Actividad duplicada exitosamente",
  "data": {
    // Nueva actividad creada con datos duplicados
  }
}
```

**Errores**:
- `404`: Actividad original no encontrada
- `400`: Código duplicado, fechas inválidas

---

## Ejemplos de Uso Completos

### Ejemplo 1: Crear Actividad con Horarios

```javascript
// Frontend: Crear nueva actividad
const crearActividad = async () => {
  try {
    const response = await fetch('http://localhost:8000/api/actividades', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': 'Bearer {token}' // En producción
      },
      body: JSON.stringify({
        codigoActividad: 'TALLER-TEATRO-2025',
        nombre: 'Taller de Teatro',
        tipoActividadId: 2,
        categoriaId: 1,
        estadoId: 1,
        descripcion: 'Taller de teatro para adultos mayores',
        fechaDesde: '2025-03-15T00:00:00.000Z',
        fechaHasta: '2025-06-15T23:59:59.999Z',
        cupoMaximo: 20,
        costo: 1500,
        horarios: [
          {
            diaSemanaId: 3, // Miércoles
            horaInicio: '15:00',
            horaFin: '17:00',
            activo: true
          },
          {
            diaSemanaId: 5, // Viernes
            horaInicio: '15:00',
            horaFin: '17:00',
            activo: true
          }
        ]
      })
    });

    const data = await response.json();

    if (data.success) {
      console.log('Actividad creada:', data.data);
      // Redirigir o mostrar mensaje de éxito
    } else {
      console.error('Error:', data.error);
      // Mostrar error al usuario
    }
  } catch (error) {
    console.error('Error de red:', error);
  }
};
```

### Ejemplo 2: Listar Actividades con Filtros

```javascript
// Frontend: Obtener actividades activas con cupo
const obtenerActividadesDisponibles = async () => {
  const params = new URLSearchParams({
    estadoId: '1',           // Solo activas
    conCupo: 'true',         // Con cupo disponible
    vigentes: 'true',        // Vigentes (fechas actuales)
    incluirRelaciones: 'true',
    page: '1',
    limit: '20',
    orderBy: 'nombre',
    orderDir: 'asc'
  });

  try {
    const response = await fetch(
      `http://localhost:8000/api/actividades?${params}`,
      {
        headers: {
          // 'Authorization': 'Bearer {token}'
        }
      }
    );

    const data = await response.json();

    if (data.success) {
      console.log('Total:', data.data.total);
      console.log('Actividades:', data.data.data);
      // Renderizar lista en UI
    }
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### Ejemplo 3: Actualizar Actividad

```javascript
// Frontend: Actualizar datos de actividad
const actualizarActividad = async (id, cambios) => {
  try {
    const response = await fetch(
      `http://localhost:8000/api/actividades/${id}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': 'Bearer {token}'
        },
        body: JSON.stringify(cambios)
      }
    );

    const data = await response.json();

    if (data.success) {
      console.log('Actividad actualizada:', data.data);
    } else {
      console.error('Error:', data.error);
    }
  } catch (error) {
    console.error('Error:', error);
  }
};

// Uso
actualizarActividad(1, {
  cupoMaximo: 25,
  costo: 2000,
  descripcion: 'Nueva descripción actualizada'
});
```

### Ejemplo 4: Agregar Horario

```javascript
// Frontend: Agregar horario adicional
const agregarHorario = async (actividadId) => {
  try {
    const response = await fetch(
      `http://localhost:8000/api/actividades/${actividadId}/horarios`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          diaSemanaId: 4, // Jueves
          horaInicio: '10:00',
          horaFin: '12:00',
          activo: true
        })
      }
    );

    const data = await response.json();

    if (data.success) {
      console.log('Horario agregado:', data.data);
    } else {
      console.error('Error:', data.error);
    }
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### Ejemplo 5: Obtener Horario Semanal

```javascript
// Frontend: Generar horario semanal visual
const obtenerHorarioSemanal = async () => {
  try {
    const response = await fetch(
      'http://localhost:8000/api/actividades/reportes/horario-semanal'
    );

    const data = await response.json();

    if (data.success) {
      const horarioSemanal = data.data.horarioSemanal;

      // Renderizar calendario semanal
      horarioSemanal.forEach(dia => {
        console.log(`\n${dia.dia.nombre}:`);
        dia.actividades.forEach(act => {
          console.log(`  - ${act.nombre}`);
          act.horarios.forEach(h => {
            console.log(`    ${h.horaInicio} - ${h.horaFin}`);
          });
        });
      });
    }
  } catch (error) {
    console.error('Error:', error);
  }
};
```

---

## Manejo de Errores

### Errores de Validación (400)

```json
{
  "success": false,
  "error": "Ya existe una actividad con el código CORO-ADU-2025-A"
}
```

### Recurso No Encontrado (404)

```json
{
  "success": false,
  "error": "Actividad con ID 999 no encontrada"
}
```

### Error del Servidor (500)

```json
{
  "success": false,
  "error": "Internal Server Error"
}
```

**En desarrollo**, los errores 500 incluyen el stack trace:

```json
{
  "success": false,
  "error": "Mensaje del error",
  "stack": "Error: ...\n    at ..."
}
```

---

## Validaciones Importantes

### Códigos de Actividad

- **Formato**: Solo mayúsculas, números y guiones
- **Ejemplo válido**: `CORO-ADU-2025-A`
- **Único**: No puede haber dos actividades con el mismo código

### Horarios

- `horaFin` debe ser posterior a `horaInicio`
- No puede haber horarios superpuestos en la misma actividad y día
- Formato: `HH:MM` o `HH:MM:SS`

### Fechas

- `fechaHasta` debe ser posterior o igual a `fechaDesde`
- Formato: ISO 8601 (ej: `2025-03-01T00:00:00.000Z`)

### IDs

- IDs de actividades, horarios: **Integer**
- IDs de personas, aulas: **String (CUID)** (ej: `cm123abc456`)
- IDs de catálogos: **Integer**

---

## Notas para el Equipo Frontend

### Optimizaciones

1. **Cachear catálogos**: Los catálogos cambian raramente, pueden cachearse localmente
2. **Incluir relaciones solo cuando sea necesario**: Usar `incluirRelaciones=false` en listados simples
3. **Paginación**: Siempre usar paginación en listados largos

### Tipos TypeScript Sugeridos

```typescript
interface Actividad {
  id: number;
  codigo_actividad: string;
  nombre: string;
  tipo_actividad_id: number;
  categoria_id: number;
  estado_id: number;
  descripcion: string | null;
  fecha_desde: string; // ISO 8601
  fecha_hasta: string | null; // ISO 8601
  cupo_maximo: number | null;
  costo: number;
  observaciones: string | null;
  created_at: string;
  updated_at: string;
  // Relaciones opcionales
  tipos_actividades?: TipoActividad;
  categorias_actividades?: CategoriaActividad;
  estados_actividades?: EstadoActividad;
  horarios_actividades?: Horario[];
  docentes_actividades?: DocenteActividad[];
  participaciones_actividades?: Participacion[];
}

interface Horario {
  id: number;
  actividad_id: number;
  dia_semana_id: number;
  hora_inicio: string; // Time
  hora_fin: string; // Time
  activo: boolean;
  dias_semana?: DiaSemana;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}
```

### Estado de la API

- **Versión actual**: 2.0
- **Estado**: Desarrollo/Testing
- **Autenticación**: No implementada (pendiente para producción)
- **Rate limiting**: No implementado
- **CORS**: Habilitado para desarrollo

---

## Contacto y Soporte

Para dudas o reportar problemas con la API:

- **Backend Team**: [correo del equipo]
- **Repositorio**: [URL del repositorio]
- **Documentación adicional**: Ver carpeta `/docs` en el proyecto

---

**Última actualización**: 2025-10-15
**Versión del documento**: 1.0
