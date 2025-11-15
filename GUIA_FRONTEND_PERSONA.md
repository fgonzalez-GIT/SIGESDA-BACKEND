# Guía Técnica Frontend - Módulo Persona
## SIGESDA Backend API v1.0

---

## Índice

1. [Información General](#1-información-general)
2. [Endpoint: Crear Persona](#2-endpoint-crear-persona)
3. [Campos: Datos Básicos](#3-campos-datos-básicos)
4. [Tipos de Persona](#4-tipos-de-persona)
5. [Gestión de Contactos](#5-gestión-de-contactos)
6. [Ejemplos de Payload Completo](#6-ejemplos-de-payload-completo)
7. [Respuestas del API](#7-respuestas-del-api)
8. [Otros Endpoints Útiles](#8-otros-endpoints-útiles)
9. [Catálogos y Recursos Relacionados](#9-catálogos-y-recursos-relacionados)
10. [Interfaces TypeScript](#10-interfaces-typescript)
11. [Validaciones y Errores Comunes](#11-validaciones-y-errores-comunes)
12. [Consideraciones de Lógica de Negocio](#12-consideraciones-de-lógica-de-negocio)

---

## 1. Información General

### URL Base
```
http://localhost:3001/api/personas
```

### Método HTTP para Crear
```
POST /api/personas
```

### Headers Requeridos
```http
Content-Type: application/json
```

### Descripción
El módulo de Personas gestiona todos los individuos del sistema, incluyendo **socios**, **no socios**, **docentes** y **proveedores**. Una persona puede tener múltiples tipos simultáneamente (arquitectura multi-tipo).

---

## 2. Endpoint: Crear Persona

### Request

**Método:** `POST`
**URL:** `/api/personas`
**Content-Type:** `application/json`

### Estructura Mínima Requerida

```json
{
  "nombre": "Juan",
  "apellido": "Pérez",
  "dni": "12345678"
}
```

### Estructura Completa

```json
{
  "nombre": "María",
  "apellido": "González",
  "dni": "87654321",
  "email": "maria@example.com",
  "telefono": "1123456789",
  "direccion": "Av. Principal 100, Piso 3",
  "fechaNacimiento": "1985-05-20T00:00:00Z",
  "observaciones": "Notas adicionales sobre la persona",
  "tipos": [
    {
      "tipoPersonaCodigo": "SOCIO",
      "categoriaId": 1,
      "numeroSocio": 100,
      "fechaIngreso": "2024-01-01T00:00:00Z"
    }
  ],
  "contactos": [
    {
      "tipoContacto": "EMAIL",
      "valor": "maria@example.com",
      "principal": true,
      "activo": true
    }
  ]
}
```

---

## 3. Campos: Datos Básicos

### Tabla de Campos de Persona

| Campo | Tipo | Requerido | Validaciones | Descripción |
|-------|------|-----------|--------------|-------------|
| `nombre` | `string` | **SÍ** | 1-100 caracteres | Nombre de la persona |
| `apellido` | `string` | **SÍ** | 1-100 caracteres | Apellido(s) de la persona |
| `dni` | `string` | **SÍ** | 7-8 dígitos numéricos, **ÚNICO** | Documento Nacional de Identidad |
| `email` | `string` | NO | Formato email válido, max 150 chars, **ÚNICO si se proporciona** | Correo electrónico |
| `telefono` | `string` | NO | Max 20 caracteres | Número de teléfono |
| `direccion` | `string` | NO | Max 200 caracteres | Dirección física |
| `fechaNacimiento` | `string` (ISO 8601) | NO | Formato: `YYYY-MM-DDTHH:mm:ssZ` | Fecha de nacimiento |
| `observaciones` | `string` | NO | Max 500 caracteres | Notas adicionales |
| `tipos` | `array` | NO | Ver sección [Tipos de Persona](#4-tipos-de-persona) | Array de tipos asignados |
| `contactos` | `array` | NO | Ver sección [Gestión de Contactos](#5-gestión-de-contactos) | Array de contactos |

### Formato de Fecha (ISO 8601)

Las fechas deben enviarse en formato ISO 8601:

```json
{
  "fechaNacimiento": "1985-05-20T00:00:00Z"
}
```

**Ejemplos válidos:**
- `"2024-01-15T00:00:00Z"` (UTC)
- `"2024-01-15T10:30:00-03:00"` (con timezone)
- `"1990-12-31T23:59:59.000Z"` (con milisegundos)

---

## 4. Tipos de Persona

### Arquitectura Multi-Tipo

Una persona puede tener **múltiples tipos simultáneamente**:
- ✅ SOCIO + DOCENTE
- ✅ NO_SOCIO + DOCENTE
- ✅ SOCIO + DOCENTE + PROVEEDOR
- ❌ **SOCIO + NO_SOCIO** (mutuamente excluyentes)

### Tipos Disponibles

| Código | Nombre | Descripción |
|--------|--------|-------------|
| `SOCIO` | Socio | Miembro activo de la asociación |
| `NO_SOCIO` | No Socio | Persona sin membresía activa |
| `DOCENTE` | Docente | Profesor/instructor |
| `PROVEEDOR` | Proveedor | Proveedor de servicios/productos |

---

### 4.1. Tipo: SOCIO

**Campos Específicos:**

| Campo | Tipo | Requerido | Auto-asignado | Descripción |
|-------|------|-----------|---------------|-------------|
| `tipoPersonaCodigo` | `string` | **SÍ** | NO | Valor: `"SOCIO"` |
| `categoriaId` | `number` | NO | **SÍ** | ID de categoría (default: "ACTIVO") |
| `numeroSocio` | `number` | NO | **SÍ** | Número de socio (auto-incrementa) |
| `fechaIngreso` | `string` (ISO) | NO | **SÍ** | Fecha de alta (default: hoy) |

**Ejemplo:**

```json
{
  "tipos": [
    {
      "tipoPersonaCodigo": "SOCIO",
      "categoriaId": 1,           // Opcional - se auto-asigna "ACTIVO"
      "numeroSocio": 150,          // Opcional - se auto-asigna siguiente disponible
      "fechaIngreso": "2024-01-01T00:00:00Z"  // Opcional - default: hoy
    }
  ]
}
```

**Auto-asignaciones:**
- Si no se proporciona `categoriaId`, se asigna automáticamente la categoría "ACTIVO"
- Si no se proporciona `numeroSocio`, se asigna automáticamente el siguiente número disponible
- Si no se proporciona `fechaIngreso`, se usa la fecha actual

**Catálogos Relacionados:**
- Para obtener categorías disponibles: `GET /api/categorias-socio`

---

### 4.2. Tipo: NO_SOCIO

**Campos Específicos:**

| Campo | Tipo | Requerido | Auto-asignado | Descripción |
|-------|------|-----------|---------------|-------------|
| `tipoPersonaCodigo` | `string` | **SÍ** | NO | Valor: `"NO_SOCIO"` |

**Ejemplo:**

```json
{
  "tipos": [
    {
      "tipoPersonaCodigo": "NO_SOCIO"
    }
  ]
}
```

**Auto-asignación por defecto:**
- Si **NO** se proporciona el array `tipos` al crear una persona, el sistema asigna automáticamente el tipo `NO_SOCIO`

```json
// Este request...
{
  "nombre": "Juan",
  "apellido": "Pérez",
  "dni": "12345678"
}

// ...resulta en una persona con tipo NO_SOCIO automáticamente asignado
```

---

### 4.3. Tipo: DOCENTE

**Campos Específicos:**

| Campo | Tipo | Requerido | Auto-asignado | Descripción |
|-------|------|-----------|---------------|-------------|
| `tipoPersonaCodigo` | `string` | **SÍ** | NO | Valor: `"DOCENTE"` |
| `especialidadId` | `number` | NO | **SÍ** | ID de especialidad (default: "GENERAL") |
| `honorariosPorHora` | `number` | NO | NO | Costo por hora en pesos |

**Ejemplo:**

```json
{
  "tipos": [
    {
      "tipoPersonaCodigo": "DOCENTE",
      "especialidadId": 3,           // Opcional - se auto-asigna "GENERAL"
      "honorariosPorHora": 1500.50   // Opcional
    }
  ]
}
```

**Auto-asignaciones:**
- Si no se proporciona `especialidadId`, se asigna automáticamente la primera especialidad activa del sistema

**Catálogos Relacionados:**
- Para obtener especialidades disponibles: `GET /api/especialidad-docente`

---

### 4.4. Tipo: PROVEEDOR

**Campos Específicos:**

| Campo | Tipo | Requerido | Auto-asignado | Descripción |
|-------|------|-----------|---------------|-------------|
| `tipoPersonaCodigo` | `string` | **SÍ** | NO | Valor: `"PROVEEDOR"` |
| `cuit` | `string` | **SÍ** | NO | CUIT (exactamente 11 caracteres) |
| `razonSocial` | `string` | **SÍ** | NO | Razón social (max 200 chars) |

**Ejemplo:**

```json
{
  "tipos": [
    {
      "tipoPersonaCodigo": "PROVEEDOR",
      "cuit": "20123456789",                    // REQUERIDO
      "razonSocial": "Empresa Suministros SRL"  // REQUERIDO
    }
  ]
}
```

**Validaciones especiales:**
- `cuit` debe tener exactamente 11 caracteres
- `razonSocial` y `cuit` son obligatorios para tipo PROVEEDOR

---

### 4.5. Regla de Exclusión Mutua: SOCIO ↔ NO_SOCIO

**IMPORTANTE:** Una persona **NO PUEDE** ser SOCIO y NO_SOCIO al mismo tiempo.

**❌ INVÁLIDO:**

```json
{
  "tipos": [
    { "tipoPersonaCodigo": "SOCIO" },
    { "tipoPersonaCodigo": "NO_SOCIO" }
  ]
}
```

**Error retornado:**
```json
{
  "success": false,
  "error": "SOCIO y NO_SOCIO son mutuamente excluyentes. Una persona no puede ser SOCIO y NO_SOCIO al mismo tiempo."
}
```

**✅ VÁLIDO:**

```json
{
  "tipos": [
    { "tipoPersonaCodigo": "SOCIO" },
    { "tipoPersonaCodigo": "DOCENTE" },
    { "tipoPersonaCodigo": "PROVEEDOR" }
  ]
}
```

**✅ VÁLIDO:**

```json
{
  "tipos": [
    { "tipoPersonaCodigo": "NO_SOCIO" },
    { "tipoPersonaCodigo": "DOCENTE" }
  ]
}
```

---

## 5. Gestión de Contactos

### Estructura de Contacto

```json
{
  "contactos": [
    {
      "tipoContacto": "EMAIL",
      "valor": "maria@example.com",
      "principal": true,
      "activo": true,
      "observaciones": "Contacto preferido"
    }
  ]
}
```

### Tipos de Contacto Disponibles

| Código | Descripción |
|--------|-------------|
| `EMAIL` | Correo electrónico |
| `TELEFONO` | Teléfono fijo |
| `CELULAR` | Teléfono celular |
| `WHATSAPP` | Número de WhatsApp |
| `TELEGRAM` | Usuario de Telegram |
| `OTRO` | Otro tipo de contacto |

### Campos de Contacto

| Campo | Tipo | Requerido | Validaciones | Descripción |
|-------|------|-----------|--------------|-------------|
| `tipoContacto` | `enum` | **SÍ** | Uno de los valores válidos | Tipo de contacto |
| `valor` | `string` | **SÍ** | 1-200 caracteres | Valor del contacto |
| `principal` | `boolean` | NO | Default: `false` | Marca si es contacto principal |
| `activo` | `boolean` | NO | Default: `true` | Estado del contacto |
| `observaciones` | `string` | NO | Max 500 caracteres | Notas adicionales |

### Ejemplo Completo con Múltiples Contactos

```json
{
  "nombre": "Roberto",
  "apellido": "Fernández",
  "dni": "44444444",
  "contactos": [
    {
      "tipoContacto": "EMAIL",
      "valor": "roberto@example.com",
      "principal": true,
      "activo": true
    },
    {
      "tipoContacto": "TELEFONO",
      "valor": "011-4567-8900",
      "principal": true,
      "activo": true
    },
    {
      "tipoContacto": "CELULAR",
      "valor": "+54 9 11 1234-5678",
      "principal": false,
      "activo": true
    },
    {
      "tipoContacto": "WHATSAPP",
      "valor": "+54 9 11 1234-5678",
      "principal": false,
      "activo": true,
      "observaciones": "Disponible 24hs"
    }
  ]
}
```

---

## 6. Ejemplos de Payload Completo

### 6.1. Persona Básica (solo campos requeridos)

```json
{
  "nombre": "Juan",
  "apellido": "Pérez",
  "dni": "12345678"
}
```

**Resultado:** Se crea persona con tipo `NO_SOCIO` asignado automáticamente.

---

### 6.2. Persona NO_SOCIO con Datos Completos

```json
{
  "nombre": "Juan Carlos",
  "apellido": "Pérez García",
  "dni": "12345678",
  "email": "juan.perez@example.com",
  "telefono": "011-4567-8900",
  "direccion": "Calle Falsa 123, CABA",
  "fechaNacimiento": "1990-05-15T00:00:00Z",
  "observaciones": "Cliente regular desde 2020",
  "tipos": [
    {
      "tipoPersonaCodigo": "NO_SOCIO"
    }
  ],
  "contactos": [
    {
      "tipoContacto": "EMAIL",
      "valor": "juan.perez@example.com",
      "principal": true,
      "activo": true
    },
    {
      "tipoContacto": "CELULAR",
      "valor": "+54 9 11 2345-6789",
      "principal": true,
      "activo": true
    }
  ]
}
```

---

### 6.3. Persona SOCIO con Auto-asignaciones

```json
{
  "nombre": "María",
  "apellido": "González",
  "dni": "87654321",
  "email": "maria.gonzalez@example.com",
  "telefono": "011-9876-5432",
  "direccion": "Av. Libertador 1500, Piso 10",
  "fechaNacimiento": "1985-08-20T00:00:00Z",
  "tipos": [
    {
      "tipoPersonaCodigo": "SOCIO"
      // categoriaId se auto-asigna a "ACTIVO"
      // numeroSocio se auto-asigna (ej: 101)
      // fechaIngreso se asigna a hoy
    }
  ]
}
```

---

### 6.4. Persona SOCIO con Campos Explícitos

```json
{
  "nombre": "Carlos",
  "apellido": "Martínez",
  "dni": "11111111",
  "email": "carlos.martinez@example.com",
  "tipos": [
    {
      "tipoPersonaCodigo": "SOCIO",
      "categoriaId": 2,                          // Categoría específica
      "numeroSocio": 250,                        // Número específico
      "fechaIngreso": "2023-06-15T00:00:00Z"    // Fecha específica
    }
  ]
}
```

---

### 6.5. Persona DOCENTE

```json
{
  "nombre": "Patricia",
  "apellido": "López",
  "dni": "22222222",
  "email": "patricia.lopez@example.com",
  "telefono": "011-5555-6666",
  "tipos": [
    {
      "tipoPersonaCodigo": "DOCENTE",
      "especialidadId": 3,          // Especialidad: "Piano"
      "honorariosPorHora": 2000.00
    }
  ]
}
```

---

### 6.6. Persona PROVEEDOR

```json
{
  "nombre": "Empresa Instrumentos",
  "apellido": "SRL",
  "dni": "33333333",
  "email": "ventas@instrumentos.com",
  "telefono": "011-7777-8888",
  "direccion": "Parque Industrial Lote 45",
  "tipos": [
    {
      "tipoPersonaCodigo": "PROVEEDOR",
      "cuit": "20333333339",                           // REQUERIDO
      "razonSocial": "Instrumentos Musicales SRL"      // REQUERIDO
    }
  ],
  "contactos": [
    {
      "tipoContacto": "EMAIL",
      "valor": "ventas@instrumentos.com",
      "principal": true,
      "activo": true
    },
    {
      "tipoContacto": "TELEFONO",
      "valor": "011-7777-8888",
      "principal": true,
      "activo": true
    },
    {
      "tipoContacto": "WHATSAPP",
      "valor": "+54 9 11 7777-8888",
      "principal": false,
      "activo": true
    }
  ]
}
```

---

### 6.7. Persona Multi-Tipo (SOCIO + DOCENTE)

```json
{
  "nombre": "Laura",
  "apellido": "Fernández",
  "dni": "44444444",
  "email": "laura.fernandez@example.com",
  "telefono": "011-3333-4444",
  "direccion": "Calle Corrientes 2000",
  "fechaNacimiento": "1982-12-10T00:00:00Z",
  "observaciones": "Socia fundadora y profesora de violín",
  "tipos": [
    {
      "tipoPersonaCodigo": "SOCIO",
      "categoriaId": 1,
      "numeroSocio": 5,
      "fechaIngreso": "2010-01-15T00:00:00Z"
    },
    {
      "tipoPersonaCodigo": "DOCENTE",
      "especialidadId": 5,
      "honorariosPorHora": 2500.00
    }
  ],
  "contactos": [
    {
      "tipoContacto": "EMAIL",
      "valor": "laura.fernandez@example.com",
      "principal": true,
      "activo": true
    },
    {
      "tipoContacto": "CELULAR",
      "valor": "+54 9 11 3333-4444",
      "principal": true,
      "activo": true
    }
  ]
}
```

---

### 6.8. Persona Multi-Tipo (NO_SOCIO + DOCENTE + PROVEEDOR)

```json
{
  "nombre": "Javier",
  "apellido": "Rodríguez",
  "dni": "55555555",
  "email": "javier.rodriguez@example.com",
  "tipos": [
    {
      "tipoPersonaCodigo": "NO_SOCIO"
    },
    {
      "tipoPersonaCodigo": "DOCENTE",
      "especialidadId": 2,
      "honorariosPorHora": 1800.00
    },
    {
      "tipoPersonaCodigo": "PROVEEDOR",
      "cuit": "20555555559",
      "razonSocial": "Javier Rodríguez - Servicios Musicales"
    }
  ]
}
```

---

## 7. Respuestas del API

### 7.1. Respuesta Exitosa (201 Created)

```json
{
  "success": true,
  "message": "Persona creada exitosamente",
  "data": {
    "id": 1,
    "nombre": "María",
    "apellido": "González",
    "dni": "87654321",
    "email": "maria.gonzalez@example.com",
    "telefono": "011-9876-5432",
    "direccion": "Av. Libertador 1500, Piso 10",
    "fechaNacimiento": "1985-08-20T00:00:00.000Z",
    "observaciones": null,
    "createdAt": "2024-01-10T15:30:00.000Z",
    "updatedAt": "2024-01-10T15:30:00.000Z",
    "tipos": [
      {
        "id": 1,
        "personaId": 1,
        "tipoPersonaId": 1,
        "activo": true,
        "fechaAsignacion": "2024-01-10T15:30:00.000Z",
        "fechaDesasignacion": null,
        "categoriaId": 1,
        "numeroSocio": 101,
        "fechaIngreso": "2024-01-10T00:00:00.000Z",
        "especialidadId": null,
        "honorariosPorHora": null,
        "cuit": null,
        "razonSocial": null,
        "tipoPersona": {
          "id": 1,
          "codigo": "SOCIO",
          "nombre": "Socio",
          "activo": true
        },
        "categoria": {
          "id": 1,
          "codigo": "ACTIVO",
          "nombre": "Activo"
        }
      }
    ],
    "contactos": []
  }
}
```

**Campos importantes en la respuesta:**
- `data.id`: ID único de la persona creada (usar para operaciones posteriores)
- `data.tipos[].numeroSocio`: Número de socio auto-asignado (si aplica)
- `data.tipos[].categoriaId`: Categoría auto-asignada (si aplica)
- `data.tipos[].tipoPersona.codigo`: Código del tipo asignado

---

### 7.2. Error: DNI Duplicado (409 Conflict)

```json
{
  "success": false,
  "error": "Ya existe una persona con DNI 12345678"
}
```

**Solución:** Verificar si el DNI ya existe antes de crear usando `GET /api/personas/dni/:dni/check`

---

### 7.3. Error: Email Duplicado (409 Conflict)

```json
{
  "success": false,
  "error": "Ya existe una persona con email juan@example.com"
}
```

**Solución:** Usar un email diferente o dejarlo vacío si no es crítico

---

### 7.4. Error: Tipos Mutuamente Excluyentes (400 Bad Request)

```json
{
  "success": false,
  "error": "SOCIO y NO_SOCIO son mutuamente excluyentes. Una persona no puede ser SOCIO y NO_SOCIO al mismo tiempo."
}
```

**Solución:** Elegir solo uno de los dos tipos (SOCIO o NO_SOCIO)

---

### 7.5. Error: Validación de Campos (400 Bad Request)

```json
{
  "success": false,
  "error": "Validation error",
  "details": [
    {
      "code": "too_small",
      "minimum": 1,
      "type": "string",
      "inclusive": true,
      "exact": false,
      "message": "Nombre es requerido",
      "path": ["nombre"]
    },
    {
      "code": "invalid_string",
      "validation": "email",
      "message": "Email inválido",
      "path": ["email"]
    },
    {
      "code": "too_big",
      "maximum": 8,
      "type": "string",
      "inclusive": true,
      "exact": false,
      "message": "DNI debe tener entre 7 y 8 caracteres",
      "path": ["dni"]
    }
  ]
}
```

**Campos en `details`:**
- `path`: Array con el nombre del campo con error
- `message`: Mensaje descriptivo del error
- `code`: Código de error de Zod

---

### 7.6. Error: Persona No Encontrada (404 Not Found)

```json
{
  "success": false,
  "error": "Persona con ID 999 no encontrada"
}
```

---

### 7.7. Error: PROVEEDOR sin Campos Requeridos (400 Bad Request)

```json
{
  "success": false,
  "error": "El tipo PROVEEDOR requiere CUIT y razón social"
}
```

**Solución:** Proporcionar ambos campos `cuit` y `razonSocial` al asignar tipo PROVEEDOR

---

## 8. Otros Endpoints Útiles

### 8.1. GET - Listar Personas

**Endpoint:** `GET /api/personas`

**Query Parameters:**

| Parámetro | Tipo | Descripción | Default |
|-----------|------|-------------|---------|
| `page` | `number` | Número de página | 1 |
| `limit` | `number` | Resultados por página (max 100) | 10 |
| `tiposCodigos` | `string` | Filtrar por tipos (separados por coma) | - |
| `categoriaId` | `number` | Filtrar por categoría de socio | - |
| `especialidadId` | `number` | Filtrar por especialidad de docente | - |
| `activo` | `boolean` | Filtrar por estado activo/inactivo | - |
| `search` | `string` | Buscar por nombre, apellido, DNI, email | - |
| `includeTipos` | `boolean` | Incluir relaciones de tipos | false |
| `includeContactos` | `boolean` | Incluir contactos | false |

**Ejemplos:**

```bash
# Listar todos (página 1, 20 por página)
GET /api/personas?page=1&limit=20

# Listar solo socios con sus tipos
GET /api/personas?tiposCodigos=SOCIO&includeTipos=true

# Listar docentes con especialidad 3
GET /api/personas?tiposCodigos=DOCENTE&especialidadId=3&includeTipos=true

# Buscar por texto
GET /api/personas?search=Juan&limit=10

# Listar personas inactivas
GET /api/personas?activo=false

# Listar múltiples tipos
GET /api/personas?tiposCodigos=SOCIO,DOCENTE&activo=true
```

**Respuesta:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nombre": "Juan",
      "apellido": "Pérez",
      "dni": "12345678",
      "email": "juan@example.com",
      "tipos": [...],
      "contactos": [...]
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

---

### 8.2. GET - Obtener Persona por ID

**Endpoint:** `GET /api/personas/:id`

**Query Parameters:**

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `includeRelations` | `boolean` | Incluir relaciones familiares, participaciones, etc. |

**Ejemplo:**

```bash
GET /api/personas/1?includeRelations=true
```

**Respuesta:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "nombre": "María",
    "apellido": "González",
    "dni": "87654321",
    "email": "maria@example.com",
    "tipos": [...],
    "contactos": [...],
    "participacion_actividades": [...],
    "parentescos": [...]
  }
}
```

---

### 8.3. PUT - Actualizar Persona

**Endpoint:** `PUT /api/personas/:id`

**Campos actualizables (todos opcionales):**

```json
{
  "nombre": "María Elena",
  "apellido": "González López",
  "dni": "87654321",
  "email": "maria.nueva@example.com",
  "telefono": "011-9999-8888",
  "direccion": "Nueva Dirección 456",
  "fechaNacimiento": "1985-08-20T00:00:00Z",
  "observaciones": "Información actualizada"
}
```

**Nota:** Para actualizar tipos o contactos, usar endpoints específicos.

**Respuesta:**

```json
{
  "success": true,
  "message": "Persona actualizada exitosamente",
  "data": {
    "id": 1,
    "nombre": "María Elena",
    "apellido": "González López",
    "updatedAt": "2024-01-10T16:00:00.000Z",
    ...
  }
}
```

---

### 8.4. DELETE - Eliminar/Desactivar Persona

**Endpoint:** `DELETE /api/personas/:id`

**Query Parameters:**

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `hard` | `boolean` | `true` = eliminación permanente, `false` = soft delete (default) |
| `motivo` | `string` | Motivo de la baja (solo para soft delete) |

**Ejemplos:**

```bash
# Soft delete (desactivar)
DELETE /api/personas/1

# Soft delete con motivo
DELETE /api/personas/1?motivo=Solicitud del usuario

# Hard delete (permanente)
DELETE /api/personas/1?hard=true
```

**Respuesta Soft Delete:**

```json
{
  "success": true,
  "message": "Persona desactivada (todos los tipos desasignados)",
  "data": {
    "id": 1,
    "nombre": "María",
    "tipos": [
      {
        "id": 1,
        "activo": false,
        "fechaDesasignacion": "2024-01-11T10:00:00.000Z",
        "motivoBaja": "Solicitud del usuario"
      }
    ]
  }
}
```

**Respuesta Hard Delete:**

```json
{
  "success": true,
  "message": "Persona eliminada permanentemente",
  "data": null
}
```

---

### 8.5. POST - Reactivar Persona

**Endpoint:** `POST /api/personas/:id/reactivate`

**Body (opcional):**

```json
{
  "email": "nuevo@example.com",
  "telefono": "011-8888-7777"
}
```

**Respuesta:**

```json
{
  "success": true,
  "message": "Persona reactivada exitosamente (tipo NO_SOCIO asignado)",
  "data": {
    "id": 1,
    "nombre": "María",
    "tipos": [
      {
        "id": 2,
        "tipoPersona": {
          "codigo": "NO_SOCIO"
        },
        "activo": true,
        "fechaAsignacion": "2024-01-11T11:00:00.000Z"
      }
    ]
  }
}
```

---

### 8.6. GET - Listar Solo Socios

**Endpoint:** `GET /api/personas/socios`

**Query Parameters:**

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `categoriaId` | `number` | Filtrar por categoría |
| `activos` | `boolean` | Solo activos (default: true) |
| `conNumeroSocio` | `boolean` | Solo con número de socio asignado |

**Ejemplo:**

```bash
GET /api/personas/socios?categoriaId=1&activos=true
```

---

### 8.7. GET - Listar Solo Docentes

**Endpoint:** `GET /api/personas/docentes`

**Query Parameters:**

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `especialidadId` | `number` | Filtrar por especialidad |
| `activos` | `boolean` | Solo activos (default: true) |

**Ejemplo:**

```bash
GET /api/personas/docentes?especialidadId=3&activos=true
```

---

### 8.8. GET - Listar Solo Proveedores

**Endpoint:** `GET /api/personas/proveedores`

**Query Parameters:**

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `activos` | `boolean` | Solo activos (default: true) |

**Ejemplo:**

```bash
GET /api/personas/proveedores?activos=true
```

---

### 8.9. GET - Buscar Personas

**Endpoint:** `GET /api/personas/search`

**Query Parameters:**

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `q` | `string` | **SÍ** | Término de búsqueda |
| `tipo` | `string` | NO | Filtrar por tipo (SOCIO, DOCENTE, etc.) |
| `limit` | `number` | NO | Máximo de resultados (default: 20) |

**Ejemplo:**

```bash
GET /api/personas/search?q=Juan&tipo=SOCIO&limit=10
```

**Respuesta:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nombre": "Juan",
      "apellido": "Pérez",
      "dni": "12345678",
      "email": "juan@example.com",
      "tipos": [...]
    }
  ]
}
```

---

### 8.10. GET - Verificar DNI Existe

**Endpoint:** `GET /api/personas/dni/:dni/check`

**Ejemplo:**

```bash
GET /api/personas/dni/12345678/check
```

**Respuesta - DNI Existe:**

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
      "dni": "12345678",
      "email": "juan@example.com"
    }
  }
}
```

**Respuesta - DNI No Existe:**

```json
{
  "success": true,
  "data": {
    "exists": false,
    "isActive": false,
    "persona": null
  }
}
```

**Uso recomendado:** Llamar a este endpoint ANTES de intentar crear una persona para evitar errores 409.

---

### 8.11. GET - Estado de Persona

**Endpoint:** `GET /api/personas/:id/estado`

**Ejemplo:**

```bash
GET /api/personas/1/estado
```

**Respuesta:**

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

### 8.12. GET - Verificar si Tiene Tipo Activo

**Endpoint:** `GET /api/personas/:id/tipos/:tipoCodigo/check`

**Ejemplo:**

```bash
GET /api/personas/1/tipos/SOCIO/check
```

**Respuesta:**

```json
{
  "success": true,
  "data": {
    "personaId": 1,
    "tipoPersonaCodigo": "SOCIO",
    "tieneActivo": true
  }
}
```

---

## 9. Catálogos y Recursos Relacionados

### 9.1. Categorías de Socio

**Endpoint:** `GET /api/categorias-socio`

**Respuesta:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "codigo": "ACTIVO",
      "nombre": "Activo",
      "descripcion": "Socio activo con todos los beneficios",
      "activo": true
    },
    {
      "id": 2,
      "codigo": "VITALICIO",
      "nombre": "Vitalicio",
      "descripcion": "Socio vitalicio",
      "activo": true
    },
    {
      "id": 3,
      "codigo": "HONORARIO",
      "nombre": "Honorario",
      "descripcion": "Socio honorario",
      "activo": true
    }
  ]
}
```

**Uso:** Obtener el `id` de la categoría para asignar al campo `categoriaId` al crear un SOCIO.

---

### 9.2. Especialidades de Docente

**Endpoint:** `GET /api/especialidad-docente`

**Respuesta:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nombre": "General",
      "descripcion": "Especialidad general",
      "activo": true
    },
    {
      "id": 2,
      "nombre": "Piano",
      "descripcion": "Profesor de piano",
      "activo": true
    },
    {
      "id": 3,
      "nombre": "Violín",
      "descripcion": "Profesor de violín",
      "activo": true
    },
    {
      "id": 4,
      "nombre": "Guitarra",
      "descripcion": "Profesor de guitarra",
      "activo": true
    }
  ]
}
```

**Uso:** Obtener el `id` de la especialidad para asignar al campo `especialidadId` al crear un DOCENTE.

---

### 9.3. Tipos de Persona (Catálogo)

**Endpoint:** `GET /api/tipo-persona-catalogo`

**Respuesta:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "codigo": "SOCIO",
      "nombre": "Socio",
      "activo": true
    },
    {
      "id": 2,
      "codigo": "NO_SOCIO",
      "nombre": "No Socio",
      "activo": true
    },
    {
      "id": 3,
      "codigo": "DOCENTE",
      "nombre": "Docente",
      "activo": true
    },
    {
      "id": 4,
      "codigo": "PROVEEDOR",
      "nombre": "Proveedor",
      "activo": true
    }
  ]
}
```

**Uso:** Opcional - El frontend puede usar el `codigo` directamente sin necesidad de obtener el `id`.

---

## 10. Interfaces TypeScript

Para integración con frontend TypeScript/JavaScript, aquí están las interfaces completas:

### 10.1. DTOs para Crear Persona

```typescript
/**
 * DTO para crear una persona
 */
interface CreatePersonaDto {
  // Datos básicos (requeridos)
  nombre: string;
  apellido: string;
  dni: string;

  // Datos básicos (opcionales)
  email?: string;
  telefono?: string;
  direccion?: string;
  fechaNacimiento?: string;  // ISO 8601 format
  observaciones?: string;

  // Tipos asignados
  tipos?: PersonaTipoInput[];

  // Contactos
  contactos?: ContactoInput[];
}

/**
 * Input para asignar un tipo a una persona
 */
interface PersonaTipoInput {
  tipoPersonaCodigo: 'SOCIO' | 'NO_SOCIO' | 'DOCENTE' | 'PROVEEDOR';
  tipoPersonaId?: number;

  // Campos específicos de SOCIO
  categoriaId?: number;
  numeroSocio?: number;
  fechaIngreso?: string;  // ISO 8601 format

  // Campos específicos de DOCENTE
  especialidadId?: number;
  honorariosPorHora?: number;

  // Campos específicos de PROVEEDOR
  cuit?: string;
  razonSocial?: string;
}

/**
 * Input para agregar un contacto
 */
interface ContactoInput {
  tipoContacto: 'EMAIL' | 'TELEFONO' | 'CELULAR' | 'WHATSAPP' | 'TELEGRAM' | 'OTRO';
  valor: string;
  principal?: boolean;
  activo?: boolean;
  observaciones?: string;
}

/**
 * DTO para actualizar una persona
 */
interface UpdatePersonaDto {
  nombre?: string;
  apellido?: string;
  dni?: string;
  email?: string | null;
  telefono?: string | null;
  direccion?: string | null;
  fechaNacimiento?: string | null;  // ISO 8601 format
  observaciones?: string | null;
}
```

---

### 10.2. Interfaces de Respuesta

```typescript
/**
 * Respuesta estándar del API
 */
interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  details?: ValidationError[];
  meta?: PaginationMeta;
}

/**
 * Persona completa (respuesta del backend)
 */
interface Persona {
  id: number;
  nombre: string;
  apellido: string;
  dni: string;
  email: string | null;
  telefono: string | null;
  direccion: string | null;
  fechaNacimiento: string | null;  // ISO 8601 format
  observaciones: string | null;
  createdAt: string;  // ISO 8601 format
  updatedAt: string;  // ISO 8601 format

  // Relaciones
  tipos: PersonaTipo[];
  contactos: Contacto[];

  // Opcionales (solo si se solicitan)
  participacion_actividades?: ParticipacionActividad[];
  parentescos?: RelacionFamiliar[];
}

/**
 * Tipo de persona asignado
 */
interface PersonaTipo {
  id: number;
  personaId: number;
  tipoPersonaId: number;
  activo: boolean;
  fechaAsignacion: string;  // ISO 8601 format
  fechaDesasignacion: string | null;  // ISO 8601 format
  motivoBaja: string | null;

  // Campos específicos de SOCIO
  categoriaId: number | null;
  numeroSocio: number | null;
  fechaIngreso: string | null;  // ISO 8601 format

  // Campos específicos de DOCENTE
  especialidadId: number | null;
  honorariosPorHora: number | null;

  // Campos específicos de PROVEEDOR
  cuit: string | null;
  razonSocial: string | null;

  // Relaciones expandidas
  tipoPersona: TipoPersonaCatalogo;
  categoria?: CategoriaSocio;
  especialidad?: EspecialidadDocente;
}

/**
 * Contacto de una persona
 */
interface Contacto {
  id: number;
  personaId: number;
  tipoContacto: 'EMAIL' | 'TELEFONO' | 'CELULAR' | 'WHATSAPP' | 'TELEGRAM' | 'OTRO';
  valor: string;
  principal: boolean;
  activo: boolean;
  observaciones: string | null;
  createdAt: string;  // ISO 8601 format
  updatedAt: string;  // ISO 8601 format
}

/**
 * Catálogo de tipo de persona
 */
interface TipoPersonaCatalogo {
  id: number;
  codigo: 'SOCIO' | 'NO_SOCIO' | 'DOCENTE' | 'PROVEEDOR';
  nombre: string;
  activo: boolean;
}

/**
 * Categoría de socio
 */
interface CategoriaSocio {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  activo: boolean;
}

/**
 * Especialidad de docente
 */
interface EspecialidadDocente {
  id: number;
  nombre: string;
  descripcion: string | null;
  activo: boolean;
}

/**
 * Error de validación
 */
interface ValidationError {
  code: string;
  message: string;
  path: string[];
  [key: string]: any;
}

/**
 * Metadata de paginación
 */
interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
```

---

### 10.3. Ejemplo de Uso en TypeScript

```typescript
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

/**
 * Servicio para gestionar personas
 */
class PersonaService {

  /**
   * Crear una nueva persona
   */
  async crearPersona(data: CreatePersonaDto): Promise<ApiResponse<Persona>> {
    try {
      const response = await axios.post<ApiResponse<Persona>>(
        `${API_BASE_URL}/personas`,
        data
      );
      return response.data;
    } catch (error: any) {
      if (error.response) {
        return error.response.data;
      }
      throw error;
    }
  }

  /**
   * Verificar si un DNI ya existe
   */
  async verificarDNI(dni: string): Promise<{ exists: boolean; persona: Persona | null }> {
    const response = await axios.get<ApiResponse<any>>(
      `${API_BASE_URL}/personas/dni/${dni}/check`
    );
    return response.data.data;
  }

  /**
   * Obtener persona por ID
   */
  async obtenerPersona(id: number, includeRelations = false): Promise<Persona> {
    const response = await axios.get<ApiResponse<Persona>>(
      `${API_BASE_URL}/personas/${id}`,
      { params: { includeRelations } }
    );
    return response.data.data!;
  }

  /**
   * Listar personas con filtros
   */
  async listarPersonas(params: {
    page?: number;
    limit?: number;
    tiposCodigos?: string;
    search?: string;
    activo?: boolean;
    includeTipos?: boolean;
  }): Promise<{ data: Persona[]; meta: PaginationMeta }> {
    const response = await axios.get<ApiResponse<Persona[]>>(
      `${API_BASE_URL}/personas`,
      { params }
    );
    return {
      data: response.data.data!,
      meta: response.data.meta!
    };
  }

  /**
   * Actualizar persona
   */
  async actualizarPersona(id: number, data: UpdatePersonaDto): Promise<Persona> {
    const response = await axios.put<ApiResponse<Persona>>(
      `${API_BASE_URL}/personas/${id}`,
      data
    );
    return response.data.data!;
  }

  /**
   * Eliminar persona (soft delete)
   */
  async eliminarPersona(id: number, motivo?: string): Promise<void> {
    await axios.delete(`${API_BASE_URL}/personas/${id}`, {
      params: { motivo }
    });
  }

  /**
   * Reactivar persona
   */
  async reactivarPersona(id: number, data?: Partial<UpdatePersonaDto>): Promise<Persona> {
    const response = await axios.post<ApiResponse<Persona>>(
      `${API_BASE_URL}/personas/${id}/reactivate`,
      data || {}
    );
    return response.data.data!;
  }

  /**
   * Buscar personas
   */
  async buscarPersonas(query: string, tipo?: string, limit = 20): Promise<Persona[]> {
    const response = await axios.get<ApiResponse<Persona[]>>(
      `${API_BASE_URL}/personas/search`,
      { params: { q: query, tipo, limit } }
    );
    return response.data.data!;
  }

  /**
   * Obtener categorías de socio
   */
  async obtenerCategoriasSocio(): Promise<CategoriaSocio[]> {
    const response = await axios.get<ApiResponse<CategoriaSocio[]>>(
      `${API_BASE_URL}/categorias-socio`
    );
    return response.data.data!;
  }

  /**
   * Obtener especialidades de docente
   */
  async obtenerEspecialidadesDocente(): Promise<EspecialidadDocente[]> {
    const response = await axios.get<ApiResponse<EspecialidadDocente[]>>(
      `${API_BASE_URL}/especialidad-docente`
    );
    return response.data.data!;
  }
}

// Ejemplo de uso
const personaService = new PersonaService();

// Crear un socio
const nuevoSocio: CreatePersonaDto = {
  nombre: 'María',
  apellido: 'González',
  dni: '87654321',
  email: 'maria@example.com',
  tipos: [
    {
      tipoPersonaCodigo: 'SOCIO'
      // numeroSocio y categoriaId se auto-asignan
    }
  ]
};

personaService.crearPersona(nuevoSocio)
  .then(response => {
    if (response.success) {
      console.log('Persona creada:', response.data);
      console.log('Número de socio asignado:', response.data!.tipos[0].numeroSocio);
    } else {
      console.error('Error:', response.error);
    }
  });
```

---

## 11. Validaciones y Errores Comunes

### 11.1. Tabla de Errores

| Error | Código HTTP | Causa | Solución |
|-------|-------------|-------|----------|
| Nombre es requerido | 400 | Campo `nombre` vacío o no proporcionado | Proporcionar nombre (1-100 chars) |
| Apellido es requerido | 400 | Campo `apellido` vacío o no proporcionado | Proporcionar apellido (1-100 chars) |
| DNI es requerido | 400 | Campo `dni` vacío o no proporcionado | Proporcionar DNI |
| DNI debe tener entre 7 y 8 caracteres | 400 | DNI con longitud inválida | Proporcionar DNI de 7-8 dígitos |
| Email inválido | 400 | Formato de email incorrecto | Usar formato válido (user@domain.com) |
| Ya existe una persona con DNI X | 409 | DNI duplicado | Verificar con `/dni/:dni/check` antes de crear |
| Ya existe una persona con email X | 409 | Email duplicado | Usar email diferente o dejarlo vacío |
| SOCIO y NO_SOCIO son mutuamente excluyentes | 400 | Intentar asignar ambos tipos | Elegir solo SOCIO o NO_SOCIO |
| El tipo PROVEEDOR requiere CUIT y razón social | 400 | PROVEEDOR sin campos requeridos | Proporcionar `cuit` y `razonSocial` |
| Persona con ID X no encontrada | 404 | ID inexistente | Verificar que el ID existe |
| No se encontró categoría ACTIVO | 500 | Catálogo sin categoría default | Contactar administrador del sistema |

---

### 11.2. Validaciones del Frontend (Recomendadas)

Antes de enviar el request, el frontend debería validar:

#### Campos Requeridos
- ✅ `nombre` no vacío (1-100 caracteres)
- ✅ `apellido` no vacío (1-100 caracteres)
- ✅ `dni` no vacío (7-8 dígitos numéricos)

#### Formato de Email
```typescript
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (email && !emailRegex.test(email)) {
  // Email inválido
}
```

#### Longitud de Campos
```typescript
if (nombre.length < 1 || nombre.length > 100) {
  // Nombre inválido
}

if (apellido.length < 1 || apellido.length > 100) {
  // Apellido inválido
}

if (dni.length < 7 || dni.length > 8) {
  // DNI inválido
}

if (email && email.length > 150) {
  // Email muy largo
}

if (telefono && telefono.length > 20) {
  // Teléfono muy largo
}

if (direccion && direccion.length > 200) {
  // Dirección muy larga
}

if (observaciones && observaciones.length > 500) {
  // Observaciones muy largas
}
```

#### Validación de Tipos Mutuamente Excluyentes
```typescript
const tieneSocio = tipos.some(t => t.tipoPersonaCodigo === 'SOCIO');
const tieneNoSocio = tipos.some(t => t.tipoPersonaCodigo === 'NO_SOCIO');

if (tieneSocio && tieneNoSocio) {
  // Error: SOCIO y NO_SOCIO no pueden coexistir
  return false;
}
```

#### Validación de PROVEEDOR
```typescript
const proveedor = tipos.find(t => t.tipoPersonaCodigo === 'PROVEEDOR');

if (proveedor) {
  if (!proveedor.cuit || proveedor.cuit.length !== 11) {
    // CUIT requerido y debe tener 11 caracteres
    return false;
  }

  if (!proveedor.razonSocial || proveedor.razonSocial.length === 0) {
    // Razón social requerida
    return false;
  }
}
```

#### Verificar DNI Antes de Crear
```typescript
async function verificarDNIAntes(dni: string): Promise<boolean> {
  const response = await axios.get(
    `${API_BASE_URL}/personas/dni/${dni}/check`
  );

  if (response.data.data.exists) {
    // DNI ya existe
    alert(`El DNI ${dni} ya está registrado para ${response.data.data.persona.nombre}`);
    return false;
  }

  return true;
}

// Usar antes de crear
if (await verificarDNIAntes(formData.dni)) {
  // Proceder con la creación
  await crearPersona(formData);
}
```

---

## 12. Consideraciones de Lógica de Negocio

### 12.1. Auto-asignaciones

El backend realiza auto-asignaciones automáticas en ciertos casos:

| Escenario | Auto-asignación |
|-----------|----------------|
| Crear persona **sin** array `tipos` | Se asigna tipo `NO_SOCIO` automáticamente |
| Crear SOCIO sin `categoriaId` | Se asigna categoría "ACTIVO" (primera activa) |
| Crear SOCIO sin `numeroSocio` | Se asigna siguiente número disponible (max + 1) |
| Crear SOCIO sin `fechaIngreso` | Se asigna fecha actual |
| Crear DOCENTE sin `especialidadId` | Se asigna primera especialidad activa |
| Reactivar persona sin tipos activos | Se asigna tipo `NO_SOCIO` |

**Recomendación:** El frontend **NO** debe preocuparse por estos valores. El backend los gestiona automáticamente.

---

### 12.2. Unicidad de DNI y Email

- **DNI:** Debe ser único en toda la base de datos
- **Email:** Debe ser único si se proporciona (puede ser NULL)

**Recomendación:** Usar el endpoint `GET /api/personas/dni/:dni/check` antes de mostrar el formulario de creación para evitar errores 409.

---

### 12.3. Soft Delete vs Hard Delete

**Soft Delete (por defecto):**
- Marca todos los tipos de la persona como inactivos
- Mantiene los datos en la base de datos
- Permite reactivación posterior
- Preserva historial e integridad referencial

**Hard Delete:**
- Elimina permanentemente la persona y todas sus relaciones
- **⚠️ PELIGRO:** No se puede deshacer
- Solo usar en casos excepcionales

**Recomendación:** Usar siempre soft delete (sin parámetro `hard=true`).

---

### 12.4. Arquitectura Multi-Tipo

Una persona puede tener múltiples tipos activos simultáneamente:

```
VÁLIDO:
- SOCIO + DOCENTE
- SOCIO + DOCENTE + PROVEEDOR
- NO_SOCIO + DOCENTE
- NO_SOCIO + PROVEEDOR

INVÁLIDO:
- SOCIO + NO_SOCIO (mutuamente excluyentes)
```

**Flujo de conversión:**
1. Persona creada sin tipos → `NO_SOCIO` auto-asignado
2. Usuario se hace socio → Asignar tipo `SOCIO` (el sistema elimina automáticamente `NO_SOCIO`)
3. Socio también es docente → Asignar tipo `DOCENTE` (coexiste con `SOCIO`)

---

### 12.5. Contactos Principales

Una persona puede tener múltiples contactos del mismo tipo, pero se recomienda marcar solo uno como `principal=true` por tipo.

**Ejemplo:**
```json
{
  "contactos": [
    {
      "tipoContacto": "EMAIL",
      "valor": "principal@example.com",
      "principal": true
    },
    {
      "tipoContacto": "EMAIL",
      "valor": "secundario@example.com",
      "principal": false
    }
  ]
}
```

---

### 12.6. Relaciones con Otros Módulos

La persona es la entidad central del sistema y se relaciona con:

- **Actividades:** A través de `participacion_actividades` (inscripciones)
- **Familiares:** A través de `familiares` (relaciones familiares bidireccionales)
- **Recibos:** A través de `recibos` (pagos y cuotas)
- **Cuotas:** A través de `cuotas` (deudas mensuales)
- **Reservas:** A través de `reservas` (reservas de aulas)
- **Asistencias:** A través de `asistencias` (registro de asistencia a actividades)

**Integridad referencial:** El sistema mantiene integridad referencial. No se puede eliminar (hard delete) una persona si tiene:
- Participaciones activas en actividades
- Relaciones familiares activas
- Recibos pendientes
- Cuotas sin pagar

---

### 12.7. Flujo Recomendado de Creación

1. **Cargar catálogos iniciales** (una vez al montar el componente):
   ```typescript
   const [categorias, setCategorias] = useState<CategoriaSocio[]>([]);
   const [especialidades, setEspecialidades] = useState<EspecialidadDocente[]>([]);

   useEffect(() => {
     cargarCategorias();
     cargarEspecialidades();
   }, []);
   ```

2. **Validar formulario** antes de enviar

3. **Verificar DNI** antes de crear:
   ```typescript
   const dniExiste = await verificarDNI(formData.dni);
   if (dniExiste) {
     mostrarError('DNI ya registrado');
     return;
   }
   ```

4. **Enviar request de creación**:
   ```typescript
   const response = await crearPersona(formData);
   ```

5. **Manejar respuesta**:
   ```typescript
   if (response.success) {
     mostrarExito('Persona creada exitosamente');
     redirigir(`/personas/${response.data.id}`);
   } else {
     mostrarError(response.error);
   }
   ```

---

### 12.8. Formato de Fechas

**IMPORTANTE:** Todas las fechas deben enviarse en formato **ISO 8601** con timezone UTC:

```typescript
// ✅ CORRECTO
"2024-01-15T00:00:00Z"
"1990-05-20T00:00:00.000Z"

// ❌ INCORRECTO
"2024-01-15"
"15/01/2024"
"01-15-2024"
```

**Convertir Date a ISO 8601:**
```typescript
const fecha = new Date('1990-05-20');
const fechaISO = fecha.toISOString();  // "1990-05-20T00:00:00.000Z"
```

---

### 12.9. Paginación

Al listar personas con `GET /api/personas`, el API retorna resultados paginados:

```json
{
  "success": true,
  "data": [...],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

**Recomendación:** Implementar paginación en el frontend usando los valores de `meta`.

---

### 12.10. Performance y Optimización

**Incluir relaciones solo cuando sea necesario:**

```typescript
// ❌ Carga innecesaria
GET /api/personas?includeTipos=true&includeContactos=true&page=1&limit=100

// ✅ Carga optimizada
GET /api/personas?page=1&limit=20
```

**Usar búsqueda específica:**

```typescript
// ❌ Cargar todas las personas y filtrar en frontend
const todas = await listarPersonas({ limit: 1000 });
const socios = todas.filter(p => p.tipos.some(t => t.tipoPersona.codigo === 'SOCIO'));

// ✅ Filtrar en backend
const socios = await listarPersonas({ tiposCodigos: 'SOCIO', limit: 20 });
```

---

## 13. Resumen de Endpoints

| Método | Endpoint | Propósito |
|--------|----------|-----------|
| `POST` | `/api/personas` | Crear persona |
| `GET` | `/api/personas` | Listar personas (paginado) |
| `GET` | `/api/personas/:id` | Obtener persona por ID |
| `PUT` | `/api/personas/:id` | Actualizar persona |
| `DELETE` | `/api/personas/:id` | Eliminar/desactivar persona |
| `POST` | `/api/personas/:id/reactivate` | Reactivar persona |
| `GET` | `/api/personas/:id/estado` | Estado de persona |
| `GET` | `/api/personas/:id/tipos/:tipoCodigo/check` | Verificar tipo activo |
| `GET` | `/api/personas/search` | Buscar personas |
| `GET` | `/api/personas/socios` | Listar solo socios |
| `GET` | `/api/personas/docentes` | Listar solo docentes |
| `GET` | `/api/personas/proveedores` | Listar solo proveedores |
| `GET` | `/api/personas/dni/:dni/check` | Verificar DNI existe |
| `GET` | `/api/categorias-socio` | Listar categorías de socio |
| `GET` | `/api/especialidad-docente` | Listar especialidades de docente |

---

## 14. Contacto y Soporte

Para preguntas, bugs o sugerencias sobre esta API:

- **Repositorio:** SIGESDA Backend
- **Documentación adicional:** Ver `CLAUDE.md` en la raíz del proyecto
- **Schema de base de datos:** `prisma/schema.prisma`
- **Tests manuales:** `tests/manual/` (scripts de prueba)

---

**Última actualización:** 2025-01-11
**Versión de API:** v1.0
**Versión de Backend:** Backend Etapa 4
