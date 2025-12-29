# Diagnóstico: Error al Actualizar Especialidad de Docente

**Fecha:** 2025-12-29
**Reportado por:** Usuario (Frontend)
**Severidad:** 🟡 Media - No es un bug del backend, es un uso incorrecto de endpoints

---

## 📋 Problema Reportado

Al intentar editar/modificar la **Especialidad** de una Persona con tipo **DOCENTE**, el frontend envía una solicitud `PUT` al endpoint `/api/personas/24` con el siguiente payload:

```json
{
  "nombre": "Brisa",
  "apellido": "Vento",
  "dni": "33000111",
  "fechaNacimiento": "1970-12-11",
  "genero": "FEMENINO"
}
```

**Resultado:** La persona se actualiza correctamente (campos demográficos), pero la **especialidad NO se actualiza**.

---

## 🔍 Análisis del Problema

### 1. **Endpoint Utilizado**

```
PUT http://localhost:8000/api/personas/24
```

### 2. **Qué hace este endpoint**

Este endpoint actualiza:
- ✅ Campos demográficos de la tabla `personas` (nombre, apellido, dni, fechaNacimiento, genero)
- ✅ Array completo de `tipos` **SI se incluye en el payload**
- ✅ Array completo de `contactos` **SI se incluye en el payload**

### 3. **Por qué NO actualiza la especialidad**

El payload enviado **NO incluye el array `tipos`**, por lo tanto el backend:

1. Recibe el payload en `src/controllers/persona.controller.ts:105`
2. Valida el schema en `src/dto/persona.dto.ts:126` (campo `tipos` es OPCIONAL)
3. Llama al service en `src/services/persona.service.ts:198`
4. En la línea **246**, el service verifica: `if (data.tipos && data.tipos.length > 0)`
5. Como `data.tipos` es `undefined`, **NO entra** al bloque de procesamiento de tipos
6. Solo actualiza la tabla `personas` sin tocar `persona_tipo`

### 4. **Comportamiento del Repository**

En `src/repositories/persona.repository.ts:427`:

```typescript
// Si NO se envían tipos ni contactos, solo actualizar datos base
return this.prisma.persona.update({
  where: { id },
  data: { ...personaData }, // Solo campos demográficos
  include: {
    tipos: { where: { activo: true }, include: { ... } },
    contactos: { where: { activo: true } }
  }
});
```

El repository retorna la persona con sus tipos existentes (por eso en el response se ve `especialidadId: 6`), pero **NO se actualizaron** porque no se envió el array `tipos`.

---

## ✅ Solución Recomendada

### **Opción 1: Usar endpoint específico para tipos (RECOMENDADO)**

Este es el endpoint correcto y más seguro para actualizar solo la especialidad:

```http
PUT http://localhost:8000/api/personas/24/tipos/27
Content-Type: application/json

{
  "especialidadId": 7
}
```

**Donde:**
- `24` = ID de la persona (personaId)
- `27` = ID del registro en la tabla `persona_tipo` (NO el `tipoPersonaId`)

**¿Cómo obtener el ID del tipo?**

Desde el response actual del `GET /api/personas/24`:

```json
{
  "tipos": [
    {
      "id": 27,  // <-- Este es el ID que necesitas
      "tipoPersonaId": 5,  // DOCENTE (del catálogo)
      "especialidadId": 6,  // Especialidad actual
      "especialidad": {
        "id": 6,
        "codigo": "GENERAL",
        "nombre": "General"
      }
    }
  ]
}
```

**Ventajas:**
- ✅ Más simple: solo enviar el campo que se desea actualizar
- ✅ Más seguro: no afecta otros tipos de la persona
- ✅ Más RESTful: endpoint específico para recurso específico
- ✅ Menos propenso a errores

**Response esperada:**

```json
{
  "success": true,
  "message": "Tipo de persona actualizado exitosamente",
  "data": {
    "id": 27,
    "personaId": 24,
    "tipoPersonaId": 5,
    "especialidadId": 7,  // <-- Actualizado
    "especialidad": {
      "id": 7,
      "codigo": "VIOLIN",
      "nombre": "Violín"
    }
  }
}
```

---

### **Opción 2: Incluir array completo de tipos en PUT /personas/:id**

Si prefieres seguir usando `PUT /api/personas/24`, debes incluir el array `tipos` completo:

```http
PUT http://localhost:8000/api/personas/24
Content-Type: application/json

{
  "nombre": "Brisa",
  "apellido": "Vento",
  "dni": "33000111",
  "fechaNacimiento": "1970-12-11",
  "genero": "FEMENINO",
  "tipos": [
    {
      "tipoPersonaId": 5,
      "especialidadId": 7,  // <-- Nueva especialidad
      "activo": true
    },
    {
      "tipoPersonaId": 6,
      "activo": true
    }
  ]
}
```

**⚠️ IMPORTANTE:** Esta opción realiza un **reemplazo completo** de tipos:
1. Desactiva todos los tipos actuales (`activo = false`)
2. Crea nuevos registros con los tipos enviados en el array

**Riesgos:**
- ❌ Si olvidas incluir un tipo (ej: NO_SOCIO), ese tipo se desactiva
- ❌ Más complejo: requiere mantener estado de TODOS los tipos en el frontend
- ❌ Más propenso a errores de sincronización

**Cuándo usar esta opción:**
- ✅ Cuando necesitas actualizar múltiples tipos simultáneamente
- ✅ Cuando necesitas agregar/eliminar tipos al mismo tiempo
- ✅ Cuando estás haciendo una actualización completa del perfil

---

## 🧪 Testing

Se creó un archivo de pruebas completo en:

```
/tests/test-update-especialidad-docente.http
```

Este archivo incluye:
- ✅ Obtener estado actual de la persona
- ✅ Obtener catálogo de especialidades
- ❌ Demostración del endpoint incorrecto
- ✅ Demostración del endpoint correcto
- ✅ Verificación de la actualización

---

## 📚 Endpoints Relacionados

### **Gestión de Tipos de Persona**

```http
# Asignar nuevo tipo a persona
POST /api/personas/:personaId/tipos

# Obtener tipos de una persona
GET /api/personas/:personaId/tipos?soloActivos=true

# Actualizar datos de un tipo específico
PUT /api/personas/:personaId/tipos/:tipoId

# Desasignar tipo (soft delete)
DELETE /api/personas/:personaId/tipos/:tipoPersonaId

# Eliminar tipo permanentemente (hard delete)
DELETE /api/personas/:personaId/tipos/:tipoPersonaId/hard
```

### **Catálogos**

```http
# Obtener catálogo de especialidades
GET /api/catalogos/especialidades-docentes

# Obtener especialidad por código
GET /api/catalogos/especialidades-docentes/:codigo

# Obtener catálogo de tipos de persona
GET /api/catalogos/tipos-persona

# Obtener tipo por código
GET /api/catalogos/tipos-persona/:codigo
```

---

## 🛠️ Implementación en Frontend

### **Ejemplo en React/TypeScript**

```typescript
// ✅ OPCIÓN 1: Actualizar solo especialidad (RECOMENDADO)
const updateEspecialidad = async (
  personaId: number,
  tipoDocenteId: number,
  nuevaEspecialidadId: number
) => {
  const response = await fetch(
    `http://localhost:8000/api/personas/${personaId}/tipos/${tipoDocenteId}`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        especialidadId: nuevaEspecialidadId
      })
    }
  );

  return response.json();
};

// ❌ OPCIÓN 2: Actualizar con array completo de tipos
const updatePersonaConTipos = async (
  personaId: number,
  personaData: any,
  tipos: any[]
) => {
  const response = await fetch(
    `http://localhost:8000/api/personas/${personaId}`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...personaData,
        tipos: tipos  // Debe incluir TODOS los tipos
      })
    }
  );

  return response.json();
};
```

### **Cómo obtener el `tipoDocenteId` en el frontend**

```typescript
// Al cargar la persona, extraer el ID del tipo DOCENTE
const persona = await fetch(`/api/personas/${personaId}`).then(r => r.json());

const tipoDocente = persona.data.tipos.find(
  (t: any) => t.tipoPersona.codigo === 'DOCENTE'
);

const tipoDocenteId = tipoDocente?.id; // Este es el ID que necesitas
```

---

## 📋 Checklist de Implementación

### Frontend:
- [ ] Cambiar el endpoint de `PUT /personas/:id` a `PUT /personas/:id/tipos/:tipoId`
- [ ] Modificar el payload para enviar solo `{ especialidadId: X }`
- [ ] Extraer el `tipoDocenteId` del response de `GET /personas/:id`
- [ ] Actualizar el componente de formulario de edición
- [ ] Probar con diferentes especialidades
- [ ] Manejar errores (tipo no encontrado, especialidad inválida)

### Testing:
- [ ] Ejecutar pruebas con `/tests/test-update-especialidad-docente.http`
- [ ] Verificar que la especialidad se actualiza correctamente
- [ ] Verificar que otros tipos (NO_SOCIO) no se afectan
- [ ] Verificar que otros campos del tipo DOCENTE se mantienen (honorariosPorHora)

---

## 🎯 Conclusión

**No hay un bug en el backend.** El problema es que el frontend está usando el endpoint incorrecto para actualizar la especialidad.

**Solución inmediata:** Cambiar a `PUT /api/personas/:personaId/tipos/:tipoId`

**Archivo de referencia:** `/tests/test-update-especialidad-docente.http`

**Documentación de endpoints:** Ver `src/routes/persona-tipo.routes.ts`
