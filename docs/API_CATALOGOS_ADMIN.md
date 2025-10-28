# DOCUMENTACIÓN API: GESTIÓN ADMINISTRATIVA DE CATÁLOGOS

API para administración de catálogos de tipos de persona y especialidades docentes.

**⚠️ IMPORTANTE:** Todos estos endpoints requieren autenticación y rol de ADMINISTRADOR.

---

## 📋 ÍNDICE

1. [Gestión de Tipos de Persona](#gestión-de-tipos-de-persona)
2. [Gestión de Especialidades Docentes](#gestión-de-especialidades-docentes)
3. [Validaciones y Restricciones](#validaciones-y-restricciones)
4. [Ejemplos de Uso](#ejemplos-de-uso)
5. [Códigos de Error](#códigos-de-error)

---

## 🏷️ GESTIÓN DE TIPOS DE PERSONA

### 1. Crear Tipo de Persona

```http
POST /api/admin/catalogos/tipos-persona
Content-Type: application/json
Authorization: Bearer <admin-token>

{
  "codigo": "VOLUNTARIO",
  "nombre": "Voluntario",
  "descripcion": "Persona que colabora voluntariamente con el club",
  "activo": true,
  "orden": 5
}
```

**Validaciones:**
- `codigo`: Requerido, 2-50 caracteres, solo MAYÚSCULAS y guiones bajos
- `nombre`: Requerido, 1-100 caracteres
- `descripcion`: Opcional, máximo 500 caracteres
- `activo`: Boolean, default: true
- `orden`: Entero positivo, default: 0

**Respuesta (201 Created):**

```json
{
  "success": true,
  "message": "Tipo de persona 'Voluntario' creado exitosamente",
  "data": {
    "id": 5,
    "codigo": "VOLUNTARIO",
    "nombre": "Voluntario",
    "descripcion": "Persona que colabora voluntariamente con el club",
    "activo": true,
    "orden": 5,
    "createdAt": "2025-10-27T20:00:00.000Z",
    "updatedAt": "2025-10-27T20:00:00.000Z"
  }
}
```

**Errores comunes:**
- `409 Conflict`: Ya existe un tipo con ese código
- `400 Bad Request`: Código reservado del sistema (NO_SOCIO, SOCIO, DOCENTE, PROVEEDOR)
- `422 Validation Error`: Formato de código inválido

---

### 2. Listar Tipos con Estadísticas

```http
GET /api/admin/catalogos/tipos-persona
Authorization: Bearer <admin-token>
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
      "orden": 1,
      "personasActivas": 15,
      "esProtegido": true,
      "createdAt": "2025-10-27T00:00:00.000Z",
      "updatedAt": "2025-10-27T00:00:00.000Z"
    },
    {
      "id": 5,
      "codigo": "VOLUNTARIO",
      "nombre": "Voluntario",
      "descripcion": "Persona que colabora voluntariamente",
      "activo": true,
      "orden": 5,
      "personasActivas": 3,
      "esProtegido": false,
      "createdAt": "2025-10-27T20:00:00.000Z",
      "updatedAt": "2025-10-27T20:00:00.000Z"
    }
  ]
}
```

**Nota:** `esProtegido: true` indica que es un tipo del sistema que no se puede eliminar.

---

### 3. Obtener Tipo por ID

```http
GET /api/admin/catalogos/tipos-persona/5
Authorization: Bearer <admin-token>
```

**Respuesta (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": 5,
    "codigo": "VOLUNTARIO",
    "nombre": "Voluntario",
    "descripcion": "Persona que colabora voluntariamente",
    "activo": true,
    "orden": 5
  }
}
```

---

### 4. Actualizar Tipo

```http
PUT /api/admin/catalogos/tipos-persona/5
Content-Type: application/json
Authorization: Bearer <admin-token>

{
  "nombre": "Voluntario del Club",
  "descripcion": "Persona que colabora activamente con actividades del club",
  "orden": 6
}
```

**Respuesta (200 OK):**

```json
{
  "success": true,
  "message": "Tipo de persona 'Voluntario del Club' actualizado exitosamente",
  "data": {
    "id": 5,
    "codigo": "VOLUNTARIO",
    "nombre": "Voluntario del Club",
    "descripcion": "Persona que colabora activamente con actividades del club",
    "activo": true,
    "orden": 6
  }
}
```

**Nota:** No se puede cambiar el `codigo` una vez creado.

---

### 5. Activar/Desactivar Tipo

```http
PATCH /api/admin/catalogos/tipos-persona/5/toggle
Content-Type: application/json
Authorization: Bearer <admin-token>

{
  "activo": false
}
```

**Respuesta (200 OK):**

```json
{
  "success": true,
  "message": "Tipo de persona 'Voluntario del Club' desactivado exitosamente",
  "data": {
    "id": 5,
    "codigo": "VOLUNTARIO",
    "nombre": "Voluntario del Club",
    "activo": false,
    "orden": 6
  }
}
```

**Validación:** No se puede desactivar si hay personas con este tipo asignado activamente.

**Error:**

```json
{
  "success": false,
  "error": "No se puede desactivar el tipo. Hay 3 persona(s) con este tipo asignado activamente",
  "statusCode": 400
}
```

---

### 6. Eliminar Tipo

```http
DELETE /api/admin/catalogos/tipos-persona/5
Authorization: Bearer <admin-token>
```

**Respuesta (200 OK):**

```json
{
  "success": true,
  "message": "Tipo de persona 'Voluntario del Club' eliminado exitosamente",
  "data": {
    "id": 5,
    "codigo": "VOLUNTARIO",
    "nombre": "Voluntario del Club"
  }
}
```

**Restricciones:**
- ❌ No se puede eliminar si es tipo del sistema (NO_SOCIO, SOCIO, DOCENTE, PROVEEDOR)
- ❌ No se puede eliminar si hay personas con este tipo (incluso inactivas)
- ✅ Sugerencia: Desactivar en lugar de eliminar para mantener historial

**Error:**

```json
{
  "success": false,
  "error": "No se puede eliminar el tipo. Hay 5 persona(s) con este tipo asignado. Considere desactivarlo en lugar de eliminarlo.",
  "statusCode": 400
}
```

---

## 🎓 GESTIÓN DE ESPECIALIDADES DOCENTES

### 1. Crear Especialidad

```http
POST /api/admin/catalogos/especialidades-docentes
Content-Type: application/json
Authorization: Bearer <admin-token>

{
  "codigo": "DANZA_CONTEMPORANEA",
  "nombre": "Danza Contemporánea",
  "descripcion": "Especialidad en técnicas de danza moderna y contemporánea",
  "activo": true,
  "orden": 2
}
```

**Respuesta (201 Created):**

```json
{
  "success": true,
  "message": "Especialidad 'Danza Contemporánea' creada exitosamente",
  "data": {
    "id": 2,
    "codigo": "DANZA_CONTEMPORANEA",
    "nombre": "Danza Contemporánea",
    "descripcion": "Especialidad en técnicas de danza moderna y contemporánea",
    "activo": true,
    "orden": 2,
    "createdAt": "2025-10-27T20:30:00.000Z",
    "updatedAt": "2025-10-27T20:30:00.000Z"
  }
}
```

---

### 2. Listar Especialidades con Estadísticas

```http
GET /api/admin/catalogos/especialidades-docentes
Authorization: Bearer <admin-token>
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
      "descripcion": null,
      "activo": true,
      "orden": 1,
      "docentesActivos": 8,
      "esProtegida": true,
      "createdAt": "2025-10-27T00:00:00.000Z",
      "updatedAt": "2025-10-27T00:00:00.000Z"
    },
    {
      "id": 2,
      "codigo": "DANZA_CONTEMPORANEA",
      "nombre": "Danza Contemporánea",
      "descripcion": "Especialidad en técnicas de danza moderna",
      "activo": true,
      "orden": 2,
      "docentesActivos": 2,
      "esProtegida": false,
      "createdAt": "2025-10-27T20:30:00.000Z",
      "updatedAt": "2025-10-27T20:30:00.000Z"
    }
  ]
}
```

---

### 3. Obtener Especialidad por ID

```http
GET /api/admin/catalogos/especialidades-docentes/2
Authorization: Bearer <admin-token>
```

---

### 4. Actualizar Especialidad

```http
PUT /api/admin/catalogos/especialidades-docentes/2
Content-Type: application/json
Authorization: Bearer <admin-token>

{
  "nombre": "Danza Moderna y Contemporánea",
  "descripcion": "Especialidad completa en danza moderna",
  "orden": 3
}
```

---

### 5. Activar/Desactivar Especialidad

```http
PATCH /api/admin/catalogos/especialidades-docentes/2/toggle
Content-Type: application/json
Authorization: Bearer <admin-token>

{
  "activo": false
}
```

**Validación:** No se puede desactivar si hay docentes con esta especialidad.

---

### 6. Eliminar Especialidad

```http
DELETE /api/admin/catalogos/especialidades-docentes/2
Authorization: Bearer <admin-token>
```

**Restricciones:**
- ❌ No se puede eliminar GENERAL (especialidad del sistema)
- ❌ No se puede eliminar si hay docentes con esta especialidad
- ✅ Sugerencia: Desactivar en lugar de eliminar

---

## ✅ VALIDACIONES Y RESTRICCIONES

### Formato de Código

```
✅ Válidos:
- VOLUNTARIO
- TIPO_NUEVO
- ESPECIALIDAD_CUSTOM
- DANZA_CONTEMPORANEA

❌ Inválidos:
- voluntario (debe ser MAYÚSCULAS)
- Tipo-Nuevo (no se permiten guiones normales)
- Tipo Nuevo (no se permiten espacios)
- 123_TIPO (no debe empezar con números)
```

### Tipos Protegidos del Sistema

**Tipos de Persona:**
- NO_SOCIO
- SOCIO
- DOCENTE
- PROVEEDOR

**Especialidades:**
- GENERAL

**Restricciones:**
- ❌ No se pueden eliminar
- ✅ Sí se pueden actualizar (nombre, descripción, orden)
- ✅ Sí se pueden desactivar (si no hay personas/docentes asignados)

### Validación de Integridad

**Antes de eliminar un tipo:**
1. Verificar que no es tipo del sistema
2. Verificar que no hay personas con ese tipo (activas o inactivas)
3. Si hay personas: sugerir desactivar en lugar de eliminar

**Antes de desactivar:**
1. Verificar que no hay personas/docentes ACTIVOS con ese tipo
2. Si hay: mostrar cantidad de afectados

---

## 💡 EJEMPLOS DE USO

### Ejemplo 1: Crear Tipo "BECADO"

```bash
curl -X POST http://localhost:8000/api/admin/catalogos/tipos-persona \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin-token>" \
  -d '{
    "codigo": "BECADO",
    "nombre": "Becado",
    "descripcion": "Socio con beca total o parcial",
    "activo": true,
    "orden": 6
  }'
```

**Uso inmediato:**

```bash
# Asignar tipo BECADO a una persona
curl -X POST http://localhost:8000/api/personas/1/tipos \
  -H "Content-Type: application/json" \
  -d '{
    "tipoPersonaCodigo": "BECADO"
  }'
```

---

### Ejemplo 2: Crear Especialidad "TEATRO_MUSICAL"

```bash
curl -X POST http://localhost:8000/api/admin/catalogos/especialidades-docentes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin-token>" \
  -d '{
    "codigo": "TEATRO_MUSICAL",
    "nombre": "Teatro Musical",
    "descripcion": "Especialidad en actuación, canto y danza para musicales",
    "activo": true,
    "orden": 3
  }'
```

---

### Ejemplo 3: Flujo Completo de Administración

```bash
# 1. Listar tipos existentes
curl -X GET http://localhost:8000/api/admin/catalogos/tipos-persona \
  -H "Authorization: Bearer <admin-token>"

# 2. Crear nuevo tipo
curl -X POST http://localhost:8000/api/admin/catalogos/tipos-persona \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin-token>" \
  -d '{
    "codigo": "INSTRUCTOR_EXTERNO",
    "nombre": "Instructor Externo",
    "descripcion": "Instructor contratado externamente",
    "orden": 7
  }'

# 3. Actualizar tipo
curl -X PUT http://localhost:8000/api/admin/catalogos/tipos-persona/6 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin-token>" \
  -d '{
    "nombre": "Instructor Invitado",
    "descripcion": "Instructor especial invitado"
  }'

# 4. Desactivar tipo (cuando ya no se use)
curl -X PATCH http://localhost:8000/api/admin/catalogos/tipos-persona/6/toggle \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin-token>" \
  -d '{"activo": false}'
```

---

### Ejemplo 4: Manejo de Errores

**Intentar eliminar tipo con personas asignadas:**

```bash
curl -X DELETE http://localhost:8000/api/admin/catalogos/tipos-persona/2 \
  -H "Authorization: Bearer <admin-token>"

# Respuesta:
{
  "success": false,
  "error": "No se puede eliminar el tipo. Hay 25 persona(s) con este tipo asignado. Considere desactivarlo en lugar de eliminarlo.",
  "statusCode": 400
}
```

**Intentar eliminar tipo del sistema:**

```bash
curl -X DELETE http://localhost:8000/api/admin/catalogos/tipos-persona/1 \
  -H "Authorization: Bearer <admin-token>"

# Respuesta:
{
  "success": false,
  "error": "No se puede eliminar el tipo 'NO_SOCIO' porque es un tipo del sistema",
  "statusCode": 400
}
```

---

## ❌ CÓDIGOS DE ERROR

| Código | Descripción | Causa Común |
|--------|-------------|-------------|
| 400 | Bad Request | Código reservado del sistema, o hay personas/docentes asignados |
| 401 | Unauthorized | Token no válido o expirado |
| 403 | Forbidden | Usuario no tiene rol ADMIN |
| 404 | Not Found | Tipo o especialidad no existe |
| 409 | Conflict | Código duplicado |
| 422 | Validation Error | Formato de datos inválido |
| 500 | Server Error | Error interno del servidor |

---

## 🔐 SEGURIDAD

### Autenticación y Autorización

**Todos los endpoints requieren:**

1. **Autenticación**: Token JWT válido
2. **Autorización**: Rol de ADMINISTRADOR

```javascript
// Ejemplo de headers requeridos
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "Content-Type": "application/json"
}
```

### Auditoría

Todas las operaciones administrativas se registran en logs:

```
INFO: Tipo de persona creado: VOLUNTARIO - Voluntario (ID: 5) [admin@user.com]
INFO: Tipo de persona actualizado: VOLUNTARIO (ID: 5) [admin@user.com]
INFO: Tipo de persona desactivado: VOLUNTARIO (ID: 5) [admin@user.com]
INFO: Tipo de persona eliminado: VOLUNTARIO (ID: 5) [admin@user.com]
```

---

## 📊 MEJORES PRÁCTICAS

### 1. Antes de Eliminar

❌ **Mal:**
```bash
# Intentar eliminar directamente
DELETE /api/admin/catalogos/tipos-persona/5
```

✅ **Bien:**
```bash
# 1. Verificar uso
GET /api/admin/catalogos/tipos-persona

# 2. Si tiene personas asignadas, desactivar
PATCH /api/admin/catalogos/tipos-persona/5/toggle
Body: {"activo": false}

# 3. Solo eliminar si nunca se usó
DELETE /api/admin/catalogos/tipos-persona/5
```

### 2. Nomenclatura de Códigos

✅ **Recomendado:**
- Usar SNAKE_CASE en MAYÚSCULAS
- Ser descriptivo pero conciso
- Evitar abreviaturas confusas

```
✅ BUENOS:
VOLUNTARIO
BECADO
INSTRUCTOR_INVITADO
DANZA_CONTEMPORANEA

❌ EVITAR:
VOL (poco descriptivo)
VoluntarioDelClub (no es snake_case)
```

### 3. Orden de Visualización

El campo `orden` determina cómo se muestran los catálogos:

```json
{
  "orden": 1,  // Se muestra primero
  "orden": 2,  // Se muestra segundo
  "orden": 10  // Se muestra al final
}
```

---

**Última actualización:** 2025-10-27
