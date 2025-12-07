# Guía de Integración Frontend - API de Tipos de Contacto

**Versión:** 1.0
**Fecha:** 2025-01-05
**Backend Version:** back-etapa-7.5

---

## 📋 Tabla de Contenidos

1. [Resumen de Cambios](#resumen-de-cambios)
2. [Breaking Changes](#breaking-changes)
3. [Modelos de Datos (TypeScript)](#modelos-de-datos-typescript)
4. [API Reference - Catálogo de Tipos](#api-reference---catálogo-de-tipos)
5. [API Reference - Contactos de Personas](#api-reference---contactos-de-personas)
6. [Ejemplos de Uso](#ejemplos-de-uso)
7. [Validaciones y Reglas de Negocio](#validaciones-y-reglas-de-negocio)
8. [Manejo de Errores](#manejo-de-errores)
9. [Migración del Código Frontend](#migración-del-código-frontend)
10. [FAQ](#faq)

---

## 🎯 Resumen de Cambios

### ¿Qué cambió?

**ANTES (ENUM):**
```typescript
// Tipo de contacto era un ENUM fijo
enum TipoContacto {
  EMAIL = 'EMAIL',
  TELEFONO = 'TELEFONO',
  CELULAR = 'CELULAR',
  WHATSAPP = 'WHATSAPP',
  TELEGRAM = 'TELEGRAM',
  OTRO = 'OTRO'
}

// En el contacto se enviaba el string del ENUM
{
  tipoContacto: 'EMAIL',  // ❌ String hardcodeado
  valor: 'email@example.com'
}
```

**AHORA (Catálogo):**
```typescript
// Tipo de contacto es un catálogo dinámico
interface TipoContactoCatalogo {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  icono: string | null;
  pattern: string | null;
  activo: boolean;
  orden: number;
}

// En el contacto se envía el ID del catálogo
{
  tipoContactoId: 1,  // ✅ ID del catálogo
  valor: 'email@example.com'
}
```

### ¿Por qué este cambio?

✅ **Extensibilidad:** Agregar nuevos tipos sin modificar código
✅ **UI Mejorada:** Iconos, descripciones, orden personalizable
✅ **Validación Avanzada:** Regex patterns por tipo
✅ **Administración:** CRUD completo desde interfaz de admin
✅ **Consistencia:** Mismo patrón que otros catálogos del sistema

---

## ⚠️ Breaking Changes

### 1. Campo `tipoContacto` → `tipoContactoId`

**ANTES:**
```typescript
// Al crear un contacto
{
  tipoContacto: 'EMAIL',  // String
  valor: 'test@example.com'
}
```

**AHORA:**
```typescript
// Al crear un contacto
{
  tipoContactoId: 1,  // Number (ID del catálogo)
  valor: 'test@example.com'
}
```

### 2. Response de GET contactos incluye objeto `tipoContacto`

**ANTES:**
```json
{
  "id": 1,
  "personaId": 5,
  "tipoContacto": "EMAIL",
  "valor": "test@example.com",
  "principal": true
}
```

**AHORA:**
```json
{
  "id": 1,
  "personaId": 5,
  "tipoContactoId": 1,
  "tipoContacto": {
    "id": 1,
    "codigo": "EMAIL",
    "nombre": "Correo Electrónico",
    "icono": "📧",
    "pattern": "^[^@]+@[^@]+\\.[^@]+$",
    "orden": 1
  },
  "valor": "test@example.com",
  "principal": true
}
```

### 3. Nuevo endpoint para obtener catálogo de tipos

**ANTES:**
- Los tipos estaban hardcodeados en el frontend

**AHORA:**
```typescript
// Obtener tipos disponibles desde el backend
GET /api/catalogos/tipos-contacto
```

---

## 📦 Modelos de Datos (TypeScript)

### TipoContactoCatalogo

```typescript
/**
 * Tipo de contacto del catálogo
 */
interface TipoContactoCatalogo {
  /** ID único del tipo */
  id: number;

  /** Código único (ej: 'EMAIL', 'TELEFONO') */
  codigo: string;

  /** Nombre descriptivo (ej: 'Correo Electrónico') */
  nombre: string;

  /** Descripción detallada */
  descripcion: string | null;

  /** Icono emoji (ej: '📧', '📱') */
  icono: string | null;

  /** Regex de validación (ej: '^[^@]+@[^@]+\\.[^@]+$') */
  pattern: string | null;

  /** Indica si está activo */
  activo: boolean;

  /** Orden de visualización */
  orden: number;

  /** Fecha de creación */
  createdAt: string;

  /** Fecha de última actualización */
  updatedAt: string;
}
```

### ContactoPersona

```typescript
/**
 * Contacto de una persona
 */
interface ContactoPersona {
  /** ID único del contacto */
  id: number;

  /** ID de la persona */
  personaId: number;

  /** ID del tipo de contacto (FK a tipo_contacto_catalogo) */
  tipoContactoId: number;

  /** Tipo de contacto completo (incluido en GET) */
  tipoContacto?: TipoContactoCatalogo;

  /** Valor del contacto (email, teléfono, etc.) */
  valor: string;

  /** Indica si es el contacto principal de este tipo */
  principal: boolean;

  /** Indica si está activo */
  activo: boolean;

  /** Observaciones adicionales */
  observaciones: string | null;

  /** Fecha de creación */
  createdAt: string;

  /** Fecha de última actualización */
  updatedAt: string;
}
```

### DTOs para Requests

```typescript
/**
 * DTO para crear un nuevo tipo de contacto (ADMIN)
 */
interface CreateTipoContactoDTO {
  codigo: string;           // MAYÚSCULAS, único
  nombre: string;           // 1-100 caracteres
  descripcion?: string;     // Opcional, max 500 caracteres
  icono?: string;           // Opcional, emoji
  pattern?: string;         // Opcional, regex válido
  activo?: boolean;         // Default: true
  orden?: number;           // Default: 0
}

/**
 * DTO para actualizar un tipo de contacto (ADMIN)
 */
interface UpdateTipoContactoDTO {
  codigo?: string;
  nombre?: string;
  descripcion?: string | null;
  icono?: string | null;
  pattern?: string | null;
  activo?: boolean;
  orden?: number;
}

/**
 * DTO para crear un contacto de persona
 */
interface CreateContactoPersonaDTO {
  tipoContactoId: number;   // ID del tipo (requerido)
  valor: string;            // 1-200 caracteres (requerido)
  principal?: boolean;      // Default: false
  observaciones?: string;   // Opcional, max 500 caracteres
  activo?: boolean;         // Default: true
}

/**
 * DTO para actualizar un contacto de persona
 */
interface UpdateContactoPersonaDTO {
  tipoContactoId?: number;
  valor?: string;
  principal?: boolean;
  observaciones?: string | null;
  activo?: boolean;
}
```

### API Response Wrapper

```typescript
/**
 * Estructura estándar de respuesta de la API
 */
interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  meta?: {
    total?: number;
    [key: string]: any;
  };
}
```

---

## 🔌 API Reference - Catálogo de Tipos

Base URL: `http://localhost:8000/api`

### 1. Listar Tipos de Contacto

Obtiene todos los tipos de contacto disponibles.

**Endpoint:**
```
GET /catalogos/tipos-contacto
```

**Query Parameters:**
| Parámetro | Tipo | Default | Descripción |
|-----------|------|---------|-------------|
| `soloActivos` | boolean | true | Filtrar solo tipos activos |
| `ordenarPor` | 'orden' \| 'nombre' \| 'codigo' | 'orden' | Campo de ordenamiento |

**Ejemplo Request:**
```typescript
// Sin filtros (solo activos, ordenados por 'orden')
GET /catalogos/tipos-contacto

// Todos los tipos (incluidos inactivos)
GET /catalogos/tipos-contacto?soloActivos=false

// Ordenar por nombre
GET /catalogos/tipos-contacto?ordenarPor=nombre
```

**Response 200 OK:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "codigo": "EMAIL",
      "nombre": "Correo Electrónico",
      "descripcion": "Dirección de correo electrónico",
      "icono": "📧",
      "pattern": "^[^@]+@[^@]+\\.[^@]+$",
      "activo": true,
      "orden": 1,
      "createdAt": "2025-01-05T19:22:41.525Z",
      "updatedAt": "2025-01-05T19:22:41.525Z"
    },
    {
      "id": 2,
      "codigo": "TELEFONO",
      "nombre": "Teléfono Fijo",
      "descripcion": "Número de teléfono fijo",
      "icono": "☎️",
      "pattern": "^\\+?[0-9\\s\\-\\(\\)]+$",
      "activo": true,
      "orden": 2,
      "createdAt": "2025-01-05T19:22:41.525Z",
      "updatedAt": "2025-01-05T19:22:41.525Z"
    }
  ],
  "meta": {
    "total": 6
  }
}
```

**Uso en Frontend:**
```typescript
// React/Vue/Angular
async function fetchTiposContacto() {
  const response = await fetch('/api/catalogos/tipos-contacto');
  const result: ApiResponse<TipoContactoCatalogo[]> = await response.json();

  if (result.success) {
    return result.data; // TipoContactoCatalogo[]
  }
  throw new Error(result.error);
}

// Ejemplo de uso en un componente
const tipos = await fetchTiposContacto();

// Renderizar en un select
<select name="tipoContactoId">
  {tipos.map(tipo => (
    <option key={tipo.id} value={tipo.id}>
      {tipo.icono} {tipo.nombre}
    </option>
  ))}
</select>
```

---

### 2. Obtener Tipo por ID

Obtiene un tipo de contacto específico.

**Endpoint:**
```
GET /catalogos/tipos-contacto/:id
```

**Path Parameters:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `id` | number | ID del tipo de contacto |

**Ejemplo Request:**
```
GET /catalogos/tipos-contacto/1
```

**Response 200 OK:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "codigo": "EMAIL",
    "nombre": "Correo Electrónico",
    "descripcion": "Dirección de correo electrónico",
    "icono": "📧",
    "pattern": "^[^@]+@[^@]+\\.[^@]+$",
    "activo": true,
    "orden": 1,
    "createdAt": "2025-01-05T19:22:41.525Z",
    "updatedAt": "2025-01-05T19:22:41.525Z"
  }
}
```

**Response 404 Not Found:**
```json
{
  "success": false,
  "error": "Tipo de contacto no encontrado"
}
```

---

### 3. Crear Tipo de Contacto (ADMIN)

Crea un nuevo tipo de contacto en el catálogo.

**Endpoint:**
```
POST /catalogos/tipos-contacto
```

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "codigo": "INSTAGRAM",
  "nombre": "Instagram",
  "descripcion": "Usuario de Instagram",
  "icono": "📷",
  "pattern": "^@?[a-zA-Z0-9._]+$",
  "activo": true,
  "orden": 7
}
```

**Response 201 Created:**
```json
{
  "success": true,
  "message": "Tipo de contacto 'Instagram' creado exitosamente",
  "data": {
    "id": 8,
    "codigo": "INSTAGRAM",
    "nombre": "Instagram",
    "descripcion": "Usuario de Instagram",
    "icono": "📷",
    "pattern": "^@?[a-zA-Z0-9._]+$",
    "activo": true,
    "orden": 7,
    "createdAt": "2025-01-05T22:45:21.351Z",
    "updatedAt": "2025-01-05T22:45:21.351Z"
  }
}
```

**Response 400 Bad Request:**
```json
{
  "success": false,
  "error": "El código es requerido"
}
```

**Response 409 Conflict:**
```json
{
  "success": false,
  "error": "Ya existe un tipo de contacto con el código 'INSTAGRAM'"
}
```

**Validaciones:**
- `codigo`: requerido, 1-50 caracteres, MAYÚSCULAS, único
- `nombre`: requerido, 1-100 caracteres
- `descripcion`: opcional, max 500 caracteres
- `icono`: opcional, max 50 caracteres
- `pattern`: opcional, max 500 caracteres, debe ser regex válido
- `activo`: opcional, default true
- `orden`: opcional, default 0

---

### 4. Actualizar Tipo de Contacto (ADMIN)

Actualiza un tipo de contacto existente.

**Endpoint:**
```
PUT /catalogos/tipos-contacto/:id
```

**Path Parameters:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `id` | number | ID del tipo de contacto |

**Request Body (todos los campos opcionales):**
```json
{
  "nombre": "Instagram Empresarial",
  "descripcion": "Cuenta de Instagram de la empresa",
  "orden": 10
}
```

**Response 200 OK:**
```json
{
  "success": true,
  "message": "Tipo de contacto 'Instagram Empresarial' actualizado exitosamente",
  "data": {
    "id": 8,
    "codigo": "INSTAGRAM",
    "nombre": "Instagram Empresarial",
    "descripcion": "Cuenta de Instagram de la empresa",
    "icono": "📷",
    "pattern": "^@?[a-zA-Z0-9._]+$",
    "activo": true,
    "orden": 10,
    "createdAt": "2025-01-05T22:45:21.351Z",
    "updatedAt": "2025-01-05T23:10:15.125Z"
  }
}
```

**Response 404 Not Found:**
```json
{
  "success": false,
  "error": "Tipo de contacto no encontrado"
}
```

---

### 5. Eliminar Tipo de Contacto (ADMIN)

Elimina permanentemente un tipo de contacto.

**Endpoint:**
```
DELETE /catalogos/tipos-contacto/:id
```

**Path Parameters:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `id` | number | ID del tipo de contacto |

**Response 200 OK:**
```json
{
  "success": true,
  "message": "Tipo de contacto 'Instagram' eliminado permanentemente"
}
```

**Response 409 Conflict:**
```json
{
  "success": false,
  "error": "No se puede eliminar el tipo porque tiene 5 contacto(s) asociado(s). Desactívelo en su lugar."
}
```

**⚠️ IMPORTANTE:** Solo se puede eliminar si NO hay contactos asociados. Use desactivar en su lugar.

---

### 6. Desactivar Tipo de Contacto (ADMIN)

Desactiva un tipo de contacto (soft delete).

**Endpoint:**
```
POST /catalogos/tipos-contacto/:id/desactivar
```

**Response 200 OK:**
```json
{
  "success": true,
  "message": "Tipo de contacto 'Instagram' desactivado exitosamente",
  "data": {
    "id": 8,
    "codigo": "INSTAGRAM",
    "activo": false,
    ...
  }
}
```

---

### 7. Activar Tipo de Contacto (ADMIN)

Reactiva un tipo de contacto previamente desactivado.

**Endpoint:**
```
POST /catalogos/tipos-contacto/:id/activar
```

**Response 200 OK:**
```json
{
  "success": true,
  "message": "Tipo de contacto 'Instagram' activado exitosamente",
  "data": {
    "id": 8,
    "codigo": "INSTAGRAM",
    "activo": true,
    ...
  }
}
```

---

### 8. Estadísticas de Uso

Obtiene estadísticas de uso de cada tipo de contacto.

**Endpoint:**
```
GET /catalogos/tipos-contacto/estadisticas/uso
```

**Response 200 OK:**
```json
{
  "success": true,
  "data": [
    {
      "tipo": {
        "id": 1,
        "codigo": "EMAIL",
        "nombre": "Correo Electrónico",
        ...
      },
      "totalContactos": 150,
      "contactosActivos": 145
    },
    {
      "tipo": {
        "id": 2,
        "codigo": "TELEFONO",
        "nombre": "Teléfono Fijo",
        ...
      },
      "totalContactos": 80,
      "contactosActivos": 75
    }
  ]
}
```

**Uso en Frontend:**
```typescript
// Mostrar estadísticas en un dashboard
async function fetchEstadisticas() {
  const response = await fetch('/api/catalogos/tipos-contacto/estadisticas/uso');
  const result = await response.json();

  return result.data.map(stat => ({
    tipo: stat.tipo.nombre,
    total: stat.totalContactos,
    activos: stat.contactosActivos,
    inactivos: stat.totalContactos - stat.contactosActivos
  }));
}
```

---

## 🔌 API Reference - Contactos de Personas

### 1. Listar Contactos de una Persona

Obtiene todos los contactos de una persona.

**Endpoint:**
```
GET /personas/:personaId/contactos
```

**Path Parameters:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `personaId` | number | ID de la persona |

**Query Parameters:**
| Parámetro | Tipo | Default | Descripción |
|-----------|------|---------|-------------|
| `soloActivos` | boolean | true | Filtrar solo contactos activos |

**Ejemplo Request:**
```
GET /personas/5/contactos
GET /personas/5/contactos?soloActivos=false
```

**Response 200 OK:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "personaId": 5,
      "tipoContactoId": 1,
      "tipoContacto": {
        "id": 1,
        "codigo": "EMAIL",
        "nombre": "Correo Electrónico",
        "icono": "📧",
        "pattern": "^[^@]+@[^@]+\\.[^@]+$",
        "orden": 1
      },
      "valor": "juan.perez@example.com",
      "principal": true,
      "activo": true,
      "observaciones": null,
      "createdAt": "2025-01-01T10:00:00.000Z",
      "updatedAt": "2025-01-01T10:00:00.000Z"
    },
    {
      "id": 2,
      "personaId": 5,
      "tipoContactoId": 3,
      "tipoContacto": {
        "id": 3,
        "codigo": "CELULAR",
        "nombre": "Teléfono Celular",
        "icono": "📱",
        "pattern": "^\\+?[0-9\\s\\-\\(\\)]+$",
        "orden": 3
      },
      "valor": "+54 9 11 1234-5678",
      "principal": true,
      "activo": true,
      "observaciones": "WhatsApp disponible",
      "createdAt": "2025-01-01T10:00:00.000Z",
      "updatedAt": "2025-01-01T10:00:00.000Z"
    }
  ],
  "meta": {
    "total": 2
  }
}
```

**Uso en Frontend:**
```typescript
// Componente de lista de contactos
async function fetchContactos(personaId: number) {
  const response = await fetch(`/api/personas/${personaId}/contactos`);
  const result: ApiResponse<ContactoPersona[]> = await response.json();
  return result.data;
}

// Renderizar contactos
const contactos = await fetchContactos(5);

<ul>
  {contactos.map(contacto => (
    <li key={contacto.id}>
      <span>{contacto.tipoContacto.icono}</span>
      <span>{contacto.tipoContacto.nombre}:</span>
      <span>{contacto.valor}</span>
      {contacto.principal && <span>⭐ Principal</span>}
    </li>
  ))}
</ul>
```

---

### 2. Obtener Contacto por ID

Obtiene un contacto específico.

**Endpoint:**
```
GET /personas/:personaId/contactos/:contactoId
```

**Path Parameters:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `personaId` | number | ID de la persona |
| `contactoId` | number | ID del contacto |

**Response 200 OK:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "personaId": 5,
    "tipoContactoId": 1,
    "tipoContacto": { ... },
    "valor": "juan.perez@example.com",
    "principal": true,
    "activo": true,
    "observaciones": null,
    "createdAt": "2025-01-01T10:00:00.000Z",
    "updatedAt": "2025-01-01T10:00:00.000Z"
  }
}
```

**Response 404 Not Found:**
```json
{
  "success": false,
  "error": "Contacto no encontrado"
}
```

---

### 3. Crear Contacto

Agrega un nuevo contacto a una persona.

**Endpoint:**
```
POST /personas/:personaId/contactos
```

**Path Parameters:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `personaId` | number | ID de la persona |

**Request Body:**
```json
{
  "tipoContactoId": 1,
  "valor": "nuevo.email@example.com",
  "principal": true,
  "observaciones": "Email corporativo",
  "activo": true
}
```

**Response 201 Created:**
```json
{
  "success": true,
  "message": "Contacto Correo Electrónico agregado exitosamente",
  "data": {
    "id": 15,
    "personaId": 5,
    "tipoContactoId": 1,
    "tipoContacto": {
      "id": 1,
      "codigo": "EMAIL",
      "nombre": "Correo Electrónico",
      "icono": "📧"
    },
    "valor": "nuevo.email@example.com",
    "principal": true,
    "activo": true,
    "observaciones": "Email corporativo",
    "createdAt": "2025-01-05T23:30:00.000Z",
    "updatedAt": "2025-01-05T23:30:00.000Z"
  }
}
```

**Response 400 Bad Request:**
```json
{
  "success": false,
  "error": "El formato del valor no es válido para Correo Electrónico"
}
```

**Response 409 Conflict:**
```json
{
  "success": false,
  "error": "Ya existe un contacto activo con ese valor para esta persona"
}
```

**Validaciones:**
- `tipoContactoId`: requerido, debe existir y estar activo
- `valor`: requerido, 1-200 caracteres, validado contra pattern del tipo
- `principal`: opcional, default false
- `observaciones`: opcional, max 500 caracteres
- `activo`: opcional, default true

**Uso en Frontend:**
```typescript
// Formulario de crear contacto
interface ContactoFormData {
  tipoContactoId: number;
  valor: string;
  principal: boolean;
  observaciones?: string;
}

async function crearContacto(personaId: number, data: ContactoFormData) {
  const response = await fetch(`/api/personas/${personaId}/contactos`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });

  const result: ApiResponse<ContactoPersona> = await response.json();

  if (!result.success) {
    throw new Error(result.error);
  }

  return result.data;
}

// Ejemplo de uso
const nuevoContacto = await crearContacto(5, {
  tipoContactoId: 1,
  valor: 'email@example.com',
  principal: true
});
```

---

### 4. Actualizar Contacto

Actualiza un contacto existente.

**Endpoint:**
```
PUT /personas/:personaId/contactos/:contactoId
```

**Path Parameters:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `personaId` | number | ID de la persona |
| `contactoId` | number | ID del contacto |

**Request Body (todos los campos opcionales):**
```json
{
  "valor": "email.actualizado@example.com",
  "principal": false,
  "observaciones": "Email actualizado"
}
```

**Response 200 OK:**
```json
{
  "success": true,
  "message": "Contacto actualizado exitosamente",
  "data": {
    "id": 15,
    "personaId": 5,
    "tipoContactoId": 1,
    "tipoContacto": { ... },
    "valor": "email.actualizado@example.com",
    "principal": false,
    "activo": true,
    "observaciones": "Email actualizado",
    "createdAt": "2025-01-05T23:30:00.000Z",
    "updatedAt": "2025-01-05T23:35:00.000Z"
  }
}
```

**Response 404 Not Found:**
```json
{
  "success": false,
  "error": "Contacto no encontrado"
}
```

---

### 5. Eliminar Contacto (Soft Delete)

Desactiva un contacto (no lo elimina permanentemente).

**Endpoint:**
```
DELETE /personas/:personaId/contactos/:contactoId
```

**Path Parameters:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `personaId` | number | ID de la persona |
| `contactoId` | number | ID del contacto |

**Response 200 OK:**
```json
{
  "success": true,
  "message": "Contacto eliminado exitosamente",
  "data": {
    "id": 15,
    "activo": false,
    ...
  }
}
```

---

### 6. Eliminar Contacto Permanentemente (ADMIN)

Elimina permanentemente un contacto de la base de datos.

**Endpoint:**
```
DELETE /personas/:personaId/contactos/:contactoId/permanente
```

**Response 200 OK:**
```json
{
  "success": true,
  "message": "Contacto eliminado PERMANENTEMENTE"
}
```

**⚠️ IMPORTANTE:** Esta acción es irreversible. Usar con precaución.

---

## 💡 Ejemplos de Uso

### Ejemplo 1: Cargar Selector de Tipos de Contacto

```typescript
// React Component
import { useState, useEffect } from 'react';

interface TipoContactoOption {
  value: number;
  label: string;
  icon: string;
}

function TipoContactoSelector() {
  const [tipos, setTipos] = useState<TipoContactoOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTipos() {
      try {
        const response = await fetch('/api/catalogos/tipos-contacto');
        const result = await response.json();

        if (result.success) {
          const options = result.data.map(tipo => ({
            value: tipo.id,
            label: tipo.nombre,
            icon: tipo.icono || ''
          }));
          setTipos(options);
        }
      } catch (error) {
        console.error('Error loading tipos:', error);
      } finally {
        setLoading(false);
      }
    }

    loadTipos();
  }, []);

  if (loading) return <div>Cargando...</div>;

  return (
    <select name="tipoContactoId" required>
      <option value="">Seleccione tipo de contacto</option>
      {tipos.map(tipo => (
        <option key={tipo.value} value={tipo.value}>
          {tipo.icon} {tipo.label}
        </option>
      ))}
    </select>
  );
}
```

---

### Ejemplo 2: Formulario de Crear Contacto con Validación

```typescript
// React Component con validación
import { useState } from 'react';

interface ContactoFormProps {
  personaId: number;
  tiposContacto: TipoContactoCatalogo[];
  onSuccess: (contacto: ContactoPersona) => void;
}

function CrearContactoForm({ personaId, tiposContacto, onSuccess }: ContactoFormProps) {
  const [formData, setFormData] = useState({
    tipoContactoId: '',
    valor: '',
    principal: false,
    observaciones: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Obtener tipo seleccionado
  const tipoSeleccionado = tiposContacto.find(
    t => t.id === Number(formData.tipoContactoId)
  );

  // Validar formato según pattern del tipo
  const validarFormato = (valor: string): boolean => {
    if (!tipoSeleccionado?.pattern) return true;

    try {
      const regex = new RegExp(tipoSeleccionado.pattern);
      return regex.test(valor);
    } catch {
      return true; // Si el pattern es inválido, permitir
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validación del lado del cliente
    if (!validarFormato(formData.valor)) {
      setError(`Formato inválido para ${tipoSeleccionado?.nombre}`);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/personas/${personaId}/contactos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          tipoContactoId: Number(formData.tipoContactoId),
          valor: formData.valor,
          principal: formData.principal,
          observaciones: formData.observaciones || undefined
        })
      });

      const result = await response.json();

      if (result.success) {
        onSuccess(result.data);
        // Resetear formulario
        setFormData({
          tipoContactoId: '',
          valor: '',
          principal: false,
          observaciones: ''
        });
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Error al crear contacto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Tipo de Contacto</label>
        <select
          value={formData.tipoContactoId}
          onChange={(e) => setFormData({ ...formData, tipoContactoId: e.target.value })}
          required
        >
          <option value="">Seleccione...</option>
          {tiposContacto.map(tipo => (
            <option key={tipo.id} value={tipo.id}>
              {tipo.icono} {tipo.nombre}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label>Valor</label>
        <input
          type="text"
          value={formData.valor}
          onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
          placeholder={tipoSeleccionado?.descripcion || 'Ingrese el valor'}
          required
        />
        {tipoSeleccionado?.pattern && (
          <small>Formato: {tipoSeleccionado.descripcion}</small>
        )}
      </div>

      <div>
        <label>
          <input
            type="checkbox"
            checked={formData.principal}
            onChange={(e) => setFormData({ ...formData, principal: e.target.checked })}
          />
          Marcar como principal
        </label>
      </div>

      <div>
        <label>Observaciones</label>
        <textarea
          value={formData.observaciones}
          onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
          maxLength={500}
        />
      </div>

      {error && <div className="error">{error}</div>}

      <button type="submit" disabled={loading}>
        {loading ? 'Guardando...' : 'Guardar Contacto'}
      </button>
    </form>
  );
}
```

---

### Ejemplo 3: Lista de Contactos con Acciones

```typescript
// React Component
interface ContactosListProps {
  personaId: number;
}

function ContactosList({ personaId }: ContactosListProps) {
  const [contactos, setContactos] = useState<ContactoPersona[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContactos();
  }, [personaId]);

  const loadContactos = async () => {
    try {
      const response = await fetch(`/api/personas/${personaId}/contactos`);
      const result = await response.json();

      if (result.success) {
        setContactos(result.data);
      }
    } catch (error) {
      console.error('Error loading contactos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (contactoId: number) => {
    if (!confirm('¿Está seguro de eliminar este contacto?')) return;

    try {
      const response = await fetch(
        `/api/personas/${personaId}/contactos/${contactoId}`,
        { method: 'DELETE' }
      );

      const result = await response.json();

      if (result.success) {
        // Recargar lista
        loadContactos();
      }
    } catch (error) {
      console.error('Error deleting contacto:', error);
    }
  };

  const handleTogglePrincipal = async (contacto: ContactoPersona) => {
    try {
      const response = await fetch(
        `/api/personas/${personaId}/contactos/${contacto.id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ principal: !contacto.principal })
        }
      );

      const result = await response.json();

      if (result.success) {
        loadContactos();
      }
    } catch (error) {
      console.error('Error updating contacto:', error);
    }
  };

  if (loading) return <div>Cargando contactos...</div>;

  return (
    <div className="contactos-list">
      <h3>Contactos</h3>

      {contactos.length === 0 ? (
        <p>No hay contactos registrados</p>
      ) : (
        <ul>
          {contactos.map(contacto => (
            <li key={contacto.id}>
              <div className="contacto-info">
                <span className="icon">{contacto.tipoContacto.icono}</span>
                <div>
                  <div className="tipo">{contacto.tipoContacto.nombre}</div>
                  <div className="valor">{contacto.valor}</div>
                  {contacto.observaciones && (
                    <div className="observaciones">{contacto.observaciones}</div>
                  )}
                </div>
                {contacto.principal && <span className="badge">⭐ Principal</span>}
              </div>

              <div className="actions">
                <button onClick={() => handleTogglePrincipal(contacto)}>
                  {contacto.principal ? 'Quitar principal' : 'Marcar principal'}
                </button>
                <button onClick={() => handleDelete(contacto.id)}>
                  Eliminar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

---

### Ejemplo 4: Dashboard de Administración de Tipos

```typescript
// Admin Component - Gestión de tipos de contacto
function TiposContactoAdmin() {
  const [tipos, setTipos] = useState<TipoContactoCatalogo[]>([]);
  const [estadisticas, setEstadisticas] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    // Cargar tipos y estadísticas en paralelo
    const [tiposRes, statsRes] = await Promise.all([
      fetch('/api/catalogos/tipos-contacto?soloActivos=false'),
      fetch('/api/catalogos/tipos-contacto/estadisticas/uso')
    ]);

    const [tiposData, statsData] = await Promise.all([
      tiposRes.json(),
      statsRes.json()
    ]);

    if (tiposData.success) setTipos(tiposData.data);
    if (statsData.success) setEstadisticas(statsData.data);
  };

  const handleToggleActivo = async (tipo: TipoContactoCatalogo) => {
    const endpoint = tipo.activo ? 'desactivar' : 'activar';

    try {
      const response = await fetch(
        `/api/catalogos/tipos-contacto/${tipo.id}/${endpoint}`,
        { method: 'POST' }
      );

      const result = await response.json();

      if (result.success) {
        loadData(); // Recargar
      }
    } catch (error) {
      console.error('Error toggling activo:', error);
    }
  };

  return (
    <div className="admin-tipos-contacto">
      <h2>Administración de Tipos de Contacto</h2>

      <table>
        <thead>
          <tr>
            <th>Icono</th>
            <th>Código</th>
            <th>Nombre</th>
            <th>Orden</th>
            <th>Contactos</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {tipos.map(tipo => {
            const stat = estadisticas.find(s => s.tipo.id === tipo.id);

            return (
              <tr key={tipo.id}>
                <td>{tipo.icono}</td>
                <td>{tipo.codigo}</td>
                <td>{tipo.nombre}</td>
                <td>{tipo.orden}</td>
                <td>
                  {stat ? `${stat.contactosActivos} / ${stat.totalContactos}` : '0'}
                </td>
                <td>
                  <span className={tipo.activo ? 'activo' : 'inactivo'}>
                    {tipo.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td>
                  <button onClick={() => handleToggleActivo(tipo)}>
                    {tipo.activo ? 'Desactivar' : 'Activar'}
                  </button>
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

---

## 🔒 Validaciones y Reglas de Negocio

### Validaciones en el Backend

#### 1. TipoContactoCatalogo

| Campo | Validación |
|-------|-----------|
| `codigo` | - Requerido<br>- 1-50 caracteres<br>- Solo MAYÚSCULAS y guiones bajos<br>- Único en la base de datos |
| `nombre` | - Requerido<br>- 1-100 caracteres |
| `descripcion` | - Opcional<br>- Max 500 caracteres |
| `icono` | - Opcional<br>- Max 50 caracteres |
| `pattern` | - Opcional<br>- Max 500 caracteres<br>- Debe ser regex válido |
| `activo` | - Boolean<br>- Default: true |
| `orden` | - Número entero<br>- ≥ 0<br>- Default: 0 |

#### 2. ContactoPersona

| Campo | Validación |
|-------|-----------|
| `tipoContactoId` | - Requerido<br>- Debe existir en tipo_contacto_catalogo<br>- Debe estar activo |
| `valor` | - Requerido<br>- 1-200 caracteres<br>- Validado contra `pattern` del tipo (si existe)<br>- No puede duplicarse para la misma persona |
| `principal` | - Boolean<br>- Default: false<br>- Solo 1 principal por tipo |
| `observaciones` | - Opcional<br>- Max 500 caracteres |
| `activo` | - Boolean<br>- Default: true |

### Reglas de Negocio

#### 1. Sistema de Contacto Principal

- **Regla:** Solo puede haber **UN** contacto principal por tipo de contacto
- **Comportamiento:** Al marcar un contacto como principal, los demás del mismo tipo se desmarcan automáticamente

**Ejemplo:**
```
Persona tiene:
- Email 1: trabajo@email.com (principal: true)
- Email 2: personal@email.com (principal: false)

Si se marca Email 2 como principal:
- Email 1: principal → false (automático)
- Email 2: principal → true
```

#### 2. Validación de Formato por Pattern

- **Regla:** Si el tipo de contacto tiene un `pattern`, el valor debe cumplirlo
- **Validación:** Backend y opcionalmente frontend

**Ejemplo:**
```typescript
// EMAIL tiene pattern: ^[^@]+@[^@]+\.[^@]+$

// Válido
valor: "test@example.com"  ✅

// Inválido
valor: "test@invalid"      ❌ Error 400
```

#### 3. Prevención de Duplicados

- **Regla:** No puede haber dos contactos activos con el mismo valor para la misma persona
- **Scope:** Por persona (diferentes personas pueden tener el mismo email)

**Ejemplo:**
```
Persona A:
- email@test.com  ✅ OK

Persona A intenta agregar:
- email@test.com  ❌ Error 409 (Conflict)

Persona B:
- email@test.com  ✅ OK (diferente persona)
```

#### 4. Eliminación de Tipos de Contacto

- **Regla:** No se puede eliminar (hard delete) un tipo si tiene contactos asociados
- **Alternativa:** Usar desactivar (soft delete)

**Ejemplo:**
```
Tipo EMAIL tiene 50 contactos asociados:
DELETE /catalogos/tipos-contacto/1  ❌ Error 409

POST /catalogos/tipos-contacto/1/desactivar  ✅ OK
```

#### 5. Soft Delete de Contactos

- **Regla:** Por defecto DELETE es soft delete (campo activo = false)
- **Hard Delete:** Solo disponible para admin con endpoint `/permanente`

---

## ⚠️ Manejo de Errores

### Códigos de Estado HTTP

| Código | Significado | Cuándo ocurre |
|--------|-------------|---------------|
| `200` | OK | Operación exitosa (GET, PUT, POST activar/desactivar) |
| `201` | Created | Recurso creado exitosamente (POST) |
| `400` | Bad Request | Datos inválidos, validación fallida |
| `404` | Not Found | Recurso no encontrado |
| `409` | Conflict | Conflicto (código duplicado, contacto duplicado, tipo con contactos asociados) |
| `500` | Internal Server Error | Error del servidor |

### Estructura de Error

```typescript
interface ErrorResponse {
  success: false;
  error: string;        // Mensaje de error
  details?: any;        // Detalles adicionales (opcional)
}
```

### Ejemplos de Errores Comunes

#### 1. Tipo de Contacto No Encontrado

```json
{
  "success": false,
  "error": "Tipo de contacto no encontrado"
}
```

**Solución Frontend:**
```typescript
if (response.status === 404) {
  showError('El tipo de contacto no existe o fue eliminado');
}
```

---

#### 2. Código Duplicado

```json
{
  "success": false,
  "error": "Ya existe un tipo de contacto con el código 'EMAIL'"
}
```

**Solución Frontend:**
```typescript
if (response.status === 409) {
  showError('El código ya está en uso. Elija otro código.');
}
```

---

#### 3. Formato de Valor Inválido

```json
{
  "success": false,
  "error": "El formato del valor no es válido para Correo Electrónico"
}
```

**Solución Frontend:**
```typescript
// Validación preventiva en el cliente
const validarFormato = (valor: string, pattern: string | null) => {
  if (!pattern) return true;

  try {
    const regex = new RegExp(pattern);
    return regex.test(valor);
  } catch {
    return true;
  }
};

// Antes de enviar
if (!validarFormato(formData.valor, tipoSeleccionado.pattern)) {
  setError(`Formato inválido para ${tipoSeleccionado.nombre}`);
  return;
}
```

---

#### 4. Contacto Duplicado

```json
{
  "success": false,
  "error": "Ya existe un contacto activo con ese valor para esta persona"
}
```

**Solución Frontend:**
```typescript
if (response.status === 409 && result.error.includes('duplicado')) {
  showError('Ya existe un contacto con ese valor. Use otro valor o edite el existente.');
}
```

---

#### 5. Tipo con Contactos Asociados

```json
{
  "success": false,
  "error": "No se puede eliminar el tipo porque tiene 50 contacto(s) asociado(s). Desactívelo en su lugar."
}
```

**Solución Frontend:**
```typescript
// Mostrar opción de desactivar en lugar de eliminar
if (response.status === 409 && result.error.includes('asociado')) {
  showConfirm(
    '¿Desea desactivar este tipo en lugar de eliminarlo?',
    () => desactivarTipo(tipoId)
  );
}
```

---

### Manejo Genérico de Errores

```typescript
// Utility function para manejar errores de API
async function handleApiCall<T>(
  apiCall: () => Promise<Response>
): Promise<T> {
  try {
    const response = await apiCall();
    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Error desconocido');
    }

    return result.data as T;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Error de conexión');
  }
}

// Uso
try {
  const contactos = await handleApiCall<ContactoPersona[]>(
    () => fetch(`/api/personas/${personaId}/contactos`)
  );

  setContactos(contactos);
} catch (error) {
  showError(error.message);
}
```

---

## 🔄 Migración del Código Frontend

### PASO 1: Actualizar Tipos TypeScript

**ANTES:**
```typescript
// Enum hardcodeado
enum TipoContacto {
  EMAIL = 'EMAIL',
  TELEFONO = 'TELEFONO',
  CELULAR = 'CELULAR',
  WHATSAPP = 'WHATSAPP',
  TELEGRAM = 'TELEGRAM',
  OTRO = 'OTRO'
}

interface Contacto {
  id: number;
  tipoContacto: TipoContacto;  // ENUM
  valor: string;
}
```

**AHORA:**
```typescript
// Tipos dinámicos desde el backend
interface TipoContactoCatalogo {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  icono: string | null;
  pattern: string | null;
  activo: boolean;
  orden: number;
}

interface ContactoPersona {
  id: number;
  tipoContactoId: number;           // ID (número)
  tipoContacto: TipoContactoCatalogo;  // Objeto completo
  valor: string;
}
```

---

### PASO 2: Cargar Tipos desde API

**ANTES:**
```typescript
// Tipos hardcodeados en el código
const TIPOS_CONTACTO = [
  { value: 'EMAIL', label: 'Email' },
  { value: 'TELEFONO', label: 'Teléfono' },
  // ...
];
```

**AHORA:**
```typescript
// Cargar tipos desde API
const [tiposContacto, setTiposContacto] = useState<TipoContactoCatalogo[]>([]);

useEffect(() => {
  fetch('/api/catalogos/tipos-contacto')
    .then(res => res.json())
    .then(result => {
      if (result.success) {
        setTiposContacto(result.data);
      }
    });
}, []);

// Uso en select
<select name="tipoContactoId">
  {tiposContacto.map(tipo => (
    <option key={tipo.id} value={tipo.id}>
      {tipo.icono} {tipo.nombre}
    </option>
  ))}
</select>
```

---

### PASO 3: Actualizar Creación de Contactos

**ANTES:**
```typescript
const data = {
  tipoContacto: 'EMAIL',  // String
  valor: 'test@example.com'
};

fetch(`/api/personas/${personaId}/contactos`, {
  method: 'POST',
  body: JSON.stringify(data)
});
```

**AHORA:**
```typescript
const data = {
  tipoContactoId: 1,  // Number (ID del catálogo)
  valor: 'test@example.com'
};

fetch(`/api/personas/${personaId}/contactos`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
});
```

---

### PASO 4: Actualizar Renderizado de Contactos

**ANTES:**
```typescript
// Mostrar tipo como string
<div>{contacto.tipoContacto}</div>  // "EMAIL"
```

**AHORA:**
```typescript
// Mostrar con información del catálogo
<div>
  <span>{contacto.tipoContacto.icono}</span>
  <span>{contacto.tipoContacto.nombre}</span>
</div>
// Resultado: "📧 Correo Electrónico"
```

---

### PASO 5: Agregar Validación de Formato

**NUEVO (recomendado):**
```typescript
// Validar según el pattern del tipo seleccionado
const tipoSeleccionado = tiposContacto.find(
  t => t.id === formData.tipoContactoId
);

const validarFormato = (valor: string): boolean => {
  if (!tipoSeleccionado?.pattern) return true;

  try {
    const regex = new RegExp(tipoSeleccionado.pattern);
    return regex.test(valor);
  } catch {
    return true;
  }
};

// Usar en el submit
if (!validarFormato(formData.valor)) {
  setError(`Formato inválido para ${tipoSeleccionado.nombre}`);
  return;
}
```

---

### PASO 6: Cachear Tipos de Contacto

**Recomendación:** Cargar los tipos una sola vez y cachearlos.

```typescript
// Context API o estado global (Redux, Zustand, etc.)
const TiposContactoContext = createContext<TipoContactoCatalogo[]>([]);

function TiposContactoProvider({ children }) {
  const [tipos, setTipos] = useState<TipoContactoCatalogo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/catalogos/tipos-contacto')
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          setTipos(result.data);
          // Opcional: guardar en localStorage
          localStorage.setItem('tiposContacto', JSON.stringify(result.data));
        }
        setLoading(false);
      });
  }, []);

  return (
    <TiposContactoContext.Provider value={tipos}>
      {!loading && children}
    </TiposContactoContext.Provider>
  );
}

// Hook personalizado
function useTiposContacto() {
  return useContext(TiposContactoContext);
}

// Uso
function MyComponent() {
  const tipos = useTiposContacto();
  // ...
}
```

---

## ❓ FAQ

### 1. ¿Necesito actualizar todos los contactos existentes?

**No.** La migración SQL ya actualizó automáticamente todos los contactos existentes de ENUM a FK (tipoContactoId). Los datos están intactos.

---

### 2. ¿Qué pasa si creo un contacto con un tipo que luego se desactiva?

El contacto mantiene la referencia al tipo desactivado. El contacto sigue siendo válido. Solo no se podrán crear nuevos contactos de ese tipo.

---

### 3. ¿Puedo tener múltiples contactos principales del mismo tipo?

**No.** El backend garantiza que solo haya 1 contacto principal por tipo. Al marcar uno como principal, los demás se desmarcan automáticamente.

---

### 4. ¿Cómo valido el formato del email/teléfono en el frontend?

Usa el campo `pattern` del tipo de contacto:

```typescript
const tipo = tiposContacto.find(t => t.id === tipoContactoId);
if (tipo?.pattern) {
  const regex = new RegExp(tipo.pattern);
  if (!regex.test(valor)) {
    // Formato inválido
  }
}
```

---

### 5. ¿Puedo crear nuevos tipos de contacto desde el frontend?

**Sí**, si el usuario tiene permisos de admin. Usa `POST /catalogos/tipos-contacto`.

---

### 6. ¿Qué hacer si el backend devuelve error 409 al crear un contacto?

Error 409 = Conflict. Probablemente:
- Ya existe un contacto con ese valor para esa persona
- El código del tipo ya existe (al crear tipo)

Muestra un mensaje al usuario indicando que el valor está duplicado.

---

### 7. ¿Los iconos son obligatorios?

**No**, son opcionales. Pero mejoran la UX. Si no hay icono, puedes usar un icono por defecto o solo el nombre.

---

### 8. ¿Cómo ordeno los tipos de contacto en un selector?

Por defecto vienen ordenados por el campo `orden` (ASC). Puedes cambiar el ordenamiento con el query param `ordenarPor=nombre` o `ordenarPor=codigo`.

---

### 9. ¿Qué pasa si elimino un tipo que tiene contactos?

**Hard delete:** Error 409 - No se puede eliminar
**Soft delete (desactivar):** Se desactiva exitosamente, los contactos existentes quedan intactos

---

### 10. ¿Necesito autenticación para estos endpoints?

Actualmente **NO** (el backend no tiene auth implementado aún). En el futuro, los endpoints de admin (`POST/PUT/DELETE /catalogos/tipos-contacto`) requerirán autenticación.

---

## 📚 Recursos Adicionales

### Endpoints de Prueba (Postman/Insomnia)

Importa esta colección para probar los endpoints:

```json
{
  "name": "SIGESDA - Tipos de Contacto",
  "requests": [
    {
      "name": "Listar Tipos",
      "method": "GET",
      "url": "http://localhost:8000/api/catalogos/tipos-contacto"
    },
    {
      "name": "Crear Tipo",
      "method": "POST",
      "url": "http://localhost:8000/api/catalogos/tipos-contacto",
      "body": {
        "codigo": "LINKEDIN",
        "nombre": "LinkedIn",
        "icono": "💼",
        "orden": 8
      }
    },
    {
      "name": "Listar Contactos Persona",
      "method": "GET",
      "url": "http://localhost:8000/api/personas/1/contactos"
    },
    {
      "name": "Crear Contacto",
      "method": "POST",
      "url": "http://localhost:8000/api/personas/1/contactos",
      "body": {
        "tipoContactoId": 1,
        "valor": "test@example.com",
        "principal": true
      }
    }
  ]
}
```

---

### Links Útiles

- **Documentación Backend:** `/docs/CLAUDE.md`
- **Script de Migración:** `/scripts/migrate-tipos-contacto-to-catalog.sql`
- **Test de Migración:** `/tests/migration/test-tipos-contacto-migration.ts`

---

### Contacto para Soporte

Para preguntas o problemas con la integración:
1. Revisar esta documentación
2. Consultar los ejemplos de código
3. Revisar el código del backend en `/src/controllers/tipo-contacto.controller.ts`

---

**Última actualización:** 2025-01-05
**Versión del documento:** 1.0
**Autor:** Equipo Backend SIGESDA
