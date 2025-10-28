# DOCUMENTACIÓN API: PERSONA V2

API para gestión de personas con soporte para múltiples tipos y contactos.

---

## 📚 TABLA DE CONTENIDOS

1. [Conceptos Clave](#conceptos-clave)
2. [Endpoints de Personas](#endpoints-de-personas)
3. [Endpoints de Tipos](#endpoints-de-tipos)
4. [Endpoints de Contactos](#endpoints-de-contactos)
5. [Catálogos](#catálogos)
6. [Ejemplos de Uso](#ejemplos-de-uso)
7. [Códigos de Error](#códigos-de-error)

---

## 🎯 CONCEPTOS CLAVE

### Tipos de Persona

Una persona puede tener **múltiples tipos** simultáneamente:

- **NO_SOCIO**: Persona sin membresía (tipo por defecto)
- **SOCIO**: Socio del club (requiere categoría)
- **DOCENTE**: Instructor de actividades (requiere especialidad)
- **PROVEEDOR**: Proveedor de servicios (requiere CUIT y razón social)

### Modelo de Datos

```typescript
Persona {
  // Datos base
  id, nombre, apellido, dni, email, telefono, direccion, fechaNacimiento

  // Relaciones
  tipos: PersonaTipo[]     // Múltiples tipos asignados
  contactos: ContactoPersona[]  // Múltiples contactos
}

PersonaTipo {
  personaId, tipoPersonaId, activo, fechaAsignacion, fechaDesasignacion

  // Campos específicos por tipo
  categoriaId, numeroSocio, fechaIngreso (SOCIO)
  especialidadId, honorariosPorHora (DOCENTE)
  cuit, razonSocial (PROVEEDOR)
}

ContactoPersona {
  personaId, tipoContacto, valor, principal, activo
}
```

---

## 📋 ENDPOINTS DE PERSONAS

### 1. Crear Persona

```http
POST /api/personas
Content-Type: application/json

{
  "nombre": "Juan",
  "apellido": "Pérez",
  "dni": "12345678",
  "email": "juan@example.com",
  "telefono": "351-1234567",
  "direccion": "Av. Colón 123",
  "fechaNacimiento": "1990-01-15T00:00:00.000Z",
  "tipos": [
    {
      "tipoPersonaCodigo": "SOCIO",
      "categoriaId": 1
    }
  ],
  "contactos": [
    {
      "tipoContacto": "CELULAR",
      "valor": "+5493511234567",
      "principal": true
    }
  ]
}
```

**Respuesta (201 Created):**

```json
{
  "success": true,
  "message": "Persona creada exitosamente",
  "data": {
    "id": 1,
    "nombre": "Juan",
    "apellido": "Pérez",
    "dni": "12345678",
    "email": "juan@example.com",
    "tipos": [
      {
        "id": 1,
        "personaId": 1,
        "tipoPersonaId": 2,
        "activo": true,
        "categoriaId": 1,
        "numeroSocio": 1001,
        "fechaIngreso": "2025-10-27T19:00:00.000Z",
        "tipoPersona": {
          "id": 2,
          "codigo": "SOCIO",
          "nombre": "Socio"
        }
      }
    ],
    "contactos": [
      {
        "id": 1,
        "tipoContacto": "CELULAR",
        "valor": "+5493511234567",
        "principal": true
      }
    ]
  }
}
```

**Notas:**
- Si no se especifica ningún tipo, se asigna `NO_SOCIO` por defecto
- Para `SOCIO`: si no se proporciona `numeroSocio`, se auto-genera
- Para `SOCIO`: si no se proporciona `categoriaId`, se asigna categoría "GENERAL"
- Para `DOCENTE`: si no se proporciona `especialidadId`, se asigna "GENERAL"
- El `email` y `telefono` se mantienen también en la tabla `personas` (campo legacy)

---

### 2. Listar Personas

```http
GET /api/personas?page=1&limit=10&tiposCodigos=SOCIO,DOCENTE&activo=true&search=juan
```

**Parámetros de Query:**

| Parámetro | Tipo | Descripción | Ejemplo |
|-----------|------|-------------|---------|
| `page` | number | Número de página (default: 1) | `page=2` |
| `limit` | number | Registros por página (max 100, default: 10) | `limit=20` |
| `tiposCodigos` | string | Filtrar por tipos (separados por coma) | `tiposCodigos=SOCIO,DOCENTE` |
| `categoriaId` | number | Filtrar socios por categoría | `categoriaId=1` |
| `especialidadId` | number | Filtrar docentes por especialidad | `especialidadId=1` |
| `activo` | boolean | Solo personas activas | `activo=true` |
| `search` | string | Buscar en nombre, apellido, DNI, email | `search=juan` |
| `includeTipos` | boolean | Incluir tipos en respuesta (default: false) | `includeTipos=true` |
| `includeContactos` | boolean | Incluir contactos en respuesta (default: false) | `includeContactos=true` |

**Respuesta (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nombre": "Juan",
      "apellido": "Pérez",
      "dni": "12345678",
      "email": "juan@example.com"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  }
}
```

---

### 3. Obtener Persona por ID

```http
GET /api/personas/1?includeRelations=true
```

**Respuesta (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "nombre": "Juan",
    "apellido": "Pérez",
    "dni": "12345678",
    "tipos": [
      {
        "id": 1,
        "tipoPersona": { "codigo": "SOCIO", "nombre": "Socio" },
        "categoriaId": 1,
        "numeroSocio": 1001,
        "activo": true
      }
    ],
    "contactos": [
      {
        "id": 1,
        "tipoContacto": "CELULAR",
        "valor": "+5493511234567",
        "principal": true
      }
    ],
    "participaciones_actividades": [],
    "familiares": []
  }
}
```

---

### 4. Actualizar Persona

```http
PUT /api/personas/1
Content-Type: application/json

{
  "nombre": "Juan Carlos",
  "email": "juancarlos@example.com",
  "direccion": "Nueva Dirección 456"
}
```

**Respuesta (200 OK):**

```json
{
  "success": true,
  "message": "Persona actualizada exitosamente",
  "data": {
    "id": 1,
    "nombre": "Juan Carlos",
    "apellido": "Pérez",
    "email": "juancarlos@example.com",
    "direccion": "Nueva Dirección 456"
  }
}
```

**Nota:** Solo actualiza los datos base de la persona. Para actualizar tipos o contactos, usar endpoints específicos.

---

### 5. Eliminar Persona

**Soft Delete (Desactivar todos los tipos):**

```http
DELETE /api/personas/1?motivo=Baja%20voluntaria
```

**Hard Delete (Eliminar permanentemente):**

```http
DELETE /api/personas/1?hard=true
```

**Respuesta (200 OK):**

```json
{
  "success": true,
  "message": "Persona desactivada (todos los tipos desasignados)",
  "data": {
    "id": 1,
    "nombre": "Juan",
    "apellido": "Pérez"
  }
}
```

---

### 6. Buscar Personas

```http
GET /api/personas/search?q=juan&tipo=SOCIO&limit=20
```

**Respuesta (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nombre": "Juan",
      "apellido": "Pérez",
      "dni": "12345678",
      "tipos": [
        {
          "tipoPersona": { "codigo": "SOCIO" }
        }
      ]
    }
  ]
}
```

---

### 7. Listar Socios

```http
GET /api/personas/socios?categoriaId=1&activos=true&conNumeroSocio=true
```

---

### 8. Listar Docentes

```http
GET /api/personas/docentes?especialidadId=1&activos=true
```

---

### 9. Listar Proveedores

```http
GET /api/personas/proveedores?activos=true
```

---

### 10. Verificar DNI

```http
GET /api/personas/dni/12345678/check
```

**Respuesta (200 OK):**

```json
{
  "success": true,
  "data": {
    "exists": true,
    "isActive": true,
    "persona": {
      "id": 1,
      "nombre": "Juan",
      "apellido": "Pérez",
      "dni": "12345678"
    }
  }
}
```

---

### 11. Reactivar Persona

```http
POST /api/personas/1/reactivate
Content-Type: application/json

{
  "nombre": "Juan",
  "email": "juan@example.com"
}
```

**Respuesta (200 OK):**

```json
{
  "success": true,
  "message": "Persona reactivada exitosamente (tipo NO_SOCIO asignado)",
  "data": {
    "id": 1,
    "nombre": "Juan",
    "tipos": [
      {
        "tipoPersona": { "codigo": "NO_SOCIO" }
      }
    ]
  }
}
```

---

### 12. Obtener Estado de Persona

```http
GET /api/personas/1/estado
```

**Respuesta (200 OK):**

```json
{
  "success": true,
  "data": {
    "activa": true,
    "tiposActivos": 2,
    "tiposInactivos": 0
  }
}
```

---

## 🏷️ ENDPOINTS DE TIPOS

### 1. Asignar Tipo a Persona

**Ejemplo: Asignar tipo SOCIO**

```http
POST /api/personas/1/tipos
Content-Type: application/json

{
  "tipoPersonaCodigo": "SOCIO",
  "categoriaId": 1,
  "fechaIngreso": "2025-10-27T00:00:00.000Z"
}
```

**Ejemplo: Asignar tipo DOCENTE**

```http
POST /api/personas/1/tipos
Content-Type: application/json

{
  "tipoPersonaCodigo": "DOCENTE",
  "especialidadId": 1,
  "honorariosPorHora": 5000
}
```

**Ejemplo: Asignar tipo PROVEEDOR**

```http
POST /api/personas/1/tipos
Content-Type: application/json

{
  "tipoPersonaCodigo": "PROVEEDOR",
  "cuit": "20123456789",
  "razonSocial": "Pérez Juan Carlos"
}
```

**Respuesta (201 Created):**

```json
{
  "success": true,
  "message": "Tipo Socio asignado exitosamente",
  "data": {
    "id": 1,
    "personaId": 1,
    "tipoPersonaId": 2,
    "activo": true,
    "categoriaId": 1,
    "numeroSocio": 1001,
    "fechaIngreso": "2025-10-27T00:00:00.000Z",
    "tipoPersona": {
      "codigo": "SOCIO",
      "nombre": "Socio"
    }
  }
}
```

---

### 2. Listar Tipos de Persona

```http
GET /api/personas/1/tipos?soloActivos=true
```

**Respuesta (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "tipoPersona": {
        "codigo": "SOCIO",
        "nombre": "Socio"
      },
      "activo": true,
      "categoriaId": 1,
      "numeroSocio": 1001,
      "fechaAsignacion": "2025-10-27T19:00:00.000Z"
    },
    {
      "id": 2,
      "tipoPersona": {
        "codigo": "DOCENTE",
        "nombre": "Docente"
      },
      "activo": true,
      "especialidadId": 1,
      "honorariosPorHora": 5000,
      "fechaAsignacion": "2025-10-27T20:00:00.000Z"
    }
  ]
}
```

---

### 3. Actualizar Tipo

```http
PUT /api/personas/1/tipos/1
Content-Type: application/json

{
  "categoriaId": 2,
  "honorariosPorHora": 6000
}
```

---

### 4. Desasignar Tipo (Soft Delete)

```http
DELETE /api/personas/1/tipos/2?fechaDesasignacion=2025-10-27T00:00:00.000Z
```

**Respuesta (200 OK):**

```json
{
  "success": true,
  "message": "Tipo Socio desasignado exitosamente",
  "data": {
    "id": 1,
    "activo": false,
    "fechaDesasignacion": "2025-10-27T00:00:00.000Z"
  }
}
```

---

### 5. Eliminar Tipo (Hard Delete)

```http
DELETE /api/personas/1/tipos/2/hard
```

---

## 📞 ENDPOINTS DE CONTACTOS

### 1. Agregar Contacto

```http
POST /api/personas/1/contactos
Content-Type: application/json

{
  "tipoContacto": "WHATSAPP",
  "valor": "+5493511234567",
  "principal": true,
  "observaciones": "Contacto preferido"
}
```

**Tipos de contacto disponibles:**
- `EMAIL`
- `TELEFONO`
- `CELULAR`
- `WHATSAPP`
- `FACEBOOK`
- `INSTAGRAM`
- `LINKEDIN`
- `TWITTER`
- `OTRO`

**Respuesta (201 Created):**

```json
{
  "success": true,
  "message": "Contacto WHATSAPP agregado exitosamente",
  "data": {
    "id": 1,
    "personaId": 1,
    "tipoContacto": "WHATSAPP",
    "valor": "+5493511234567",
    "principal": true,
    "activo": true
  }
}
```

---

### 2. Listar Contactos

```http
GET /api/personas/1/contactos?soloActivos=true
```

**Respuesta (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "tipoContacto": "EMAIL",
      "valor": "juan@example.com",
      "principal": true,
      "activo": true
    },
    {
      "id": 2,
      "tipoContacto": "WHATSAPP",
      "valor": "+5493511234567",
      "principal": false,
      "activo": true
    }
  ]
}
```

---

### 3. Actualizar Contacto

```http
PUT /api/personas/1/contactos/1
Content-Type: application/json

{
  "valor": "nuevoemail@example.com",
  "principal": true
}
```

---

### 4. Eliminar Contacto

```http
DELETE /api/personas/1/contactos/1
```

---

## 📚 CATÁLOGOS

### 1. Listar Tipos de Persona

```http
GET /api/catalogos/tipos-persona?soloActivos=true
```

**Respuesta (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "codigo": "NO_SOCIO",
      "nombre": "No Socio",
      "descripcion": "Persona sin membresía",
      "activo": true,
      "orden": 1
    },
    {
      "id": 2,
      "codigo": "SOCIO",
      "nombre": "Socio",
      "descripcion": "Socio del club",
      "activo": true,
      "orden": 2
    },
    {
      "id": 3,
      "codigo": "DOCENTE",
      "nombre": "Docente",
      "descripcion": "Instructor de actividades",
      "activo": true,
      "orden": 3
    },
    {
      "id": 4,
      "codigo": "PROVEEDOR",
      "nombre": "Proveedor",
      "descripcion": "Proveedor de servicios",
      "activo": true,
      "orden": 4
    }
  ]
}
```

---

### 2. Obtener Tipo por Código

```http
GET /api/catalogos/tipos-persona/SOCIO
```

---

### 3. Listar Especialidades de Docentes

```http
GET /api/catalogos/especialidades-docentes?soloActivas=true
```

**Respuesta (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "codigo": "GENERAL",
      "nombre": "General",
      "activo": true,
      "orden": 1
    }
  ]
}
```

---

### 4. Obtener Especialidad por Código

```http
GET /api/catalogos/especialidades-docentes/GENERAL
```

---

## 💡 EJEMPLOS DE USO

### Caso 1: Crear Persona Simple (No Socio)

```bash
curl -X POST http://localhost:8000/api/personas \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "María",
    "apellido": "González",
    "dni": "87654321",
    "email": "maria@example.com"
  }'
```

**Resultado:** Persona creada con tipo `NO_SOCIO` por defecto.

---

### Caso 2: Crear Socio con Número Auto-generado

```bash
curl -X POST http://localhost:8000/api/personas \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Pedro",
    "apellido": "Rodríguez",
    "dni": "11223344",
    "email": "pedro@example.com",
    "tipos": [
      {
        "tipoPersonaCodigo": "SOCIO",
        "categoriaId": 1
      }
    ]
  }'
```

**Resultado:** Persona creada con tipo `SOCIO` y número de socio auto-generado.

---

### Caso 3: Crear Docente con Especialidad

```bash
curl -X POST http://localhost:8000/api/personas \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Ana",
    "apellido": "Martínez",
    "dni": "55667788",
    "email": "ana@example.com",
    "tipos": [
      {
        "tipoPersonaCodigo": "DOCENTE",
        "especialidadId": 1,
        "honorariosPorHora": 7500
      }
    ]
  }'
```

---

### Caso 4: Persona con Múltiples Tipos

```bash
# 1. Crear persona como NO_SOCIO
curl -X POST http://localhost:8000/api/personas \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Carlos",
    "apellido": "López",
    "dni": "99887766"
  }'

# 2. Asignar tipo SOCIO
curl -X POST http://localhost:8000/api/personas/1/tipos \
  -H "Content-Type: application/json" \
  -d '{
    "tipoPersonaCodigo": "SOCIO",
    "categoriaId": 1
  }'

# 3. Asignar tipo DOCENTE
curl -X POST http://localhost:8000/api/personas/1/tipos \
  -H "Content-Type: application/json" \
  -d '{
    "tipoPersonaCodigo": "DOCENTE",
    "especialidadId": 1,
    "honorariosPorHora": 8000
  }'
```

**Resultado:** Persona con 3 tipos simultáneos: NO_SOCIO, SOCIO y DOCENTE.

---

### Caso 5: Gestión de Contactos

```bash
# 1. Agregar contacto principal
curl -X POST http://localhost:8000/api/personas/1/contactos \
  -H "Content-Type: application/json" \
  -d '{
    "tipoContacto": "WHATSAPP",
    "valor": "+5493511234567",
    "principal": true
  }'

# 2. Agregar contacto secundario
curl -X POST http://localhost:8000/api/personas/1/contactos \
  -H "Content-Type: application/json" \
  -d '{
    "tipoContacto": "EMAIL",
    "valor": "contacto@example.com",
    "principal": false
  }'

# 3. Listar contactos
curl http://localhost:8000/api/personas/1/contactos
```

---

### Caso 6: Filtrar Personas por Múltiples Tipos

```bash
# Buscar personas que sean SOCIO O DOCENTE
curl "http://localhost:8000/api/personas?tiposCodigos=SOCIO,DOCENTE&includeTipos=true"
```

---

## ❌ CÓDIGOS DE ERROR

| Código | Mensaje | Descripción |
|--------|---------|-------------|
| 400 | Bad Request | Datos inválidos en la petición |
| 404 | Not Found | Recurso no encontrado |
| 409 | Conflict | Conflicto (ej: DNI duplicado, tipo ya asignado) |
| 422 | Unprocessable Entity | Error de validación (Zod) |
| 500 | Internal Server Error | Error interno del servidor |

**Ejemplo de error:**

```json
{
  "success": false,
  "error": "Ya existe una persona con DNI 12345678",
  "statusCode": 409
}
```

---

## 🔐 VALIDACIONES

### DNI
- Debe tener entre 7 y 8 dígitos numéricos
- Debe ser único en el sistema

### Email
- Debe ser un email válido
- Debe ser único en el sistema (si se proporciona)

### Tipos de Persona
- **SOCIO**: requiere `categoriaId` (default: categoría GENERAL)
- **DOCENTE**: requiere `especialidadId` (default: especialidad GENERAL)
- **PROVEEDOR**: requiere `cuit` (11 dígitos) y `razonSocial` (obligatorios)
- **NO_SOCIO**: no requiere campos adicionales

### Contactos
- El `valor` debe ser válido según el tipo de contacto
- Solo puede haber un contacto `principal` por tipo de contacto

---

**Última actualización:** 2025-10-27
