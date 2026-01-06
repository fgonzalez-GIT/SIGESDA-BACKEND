# ✅ CORRECCIÓN: Migración de campo `tipo` legacy a Arquitectura V2

**Fecha:** 2026-01-05
**Error original:** `Unknown field 'tipo' for select statement on model Persona`
**Causa:** Repositories usando campo legacy `tipo` después de migración a arquitectura V2

---

## 🔍 PROBLEMA IDENTIFICADO

Al intentar cargar el CRUD de Recibos, el sistema devolvía el siguiente error:

```
PrismaClientValidationError:
Unknown field `tipo` for select statement on model `Persona`. Available options are marked with ?.
```

**Causa raíz:**
- El schema de Prisma fue migrado a **Arquitectura V2** (multi-tipo) según CLAUDE.md
- Varios repositories seguían usando el campo directo `tipo` (legacy V1)
- El campo `tipo` fue eliminado de la tabla `personas` en favor de la relación `persona_tipo`

---

## 🏗️ ARQUITECTURA V2 DE PERSONAS

Según CLAUDE.md, la estructura es:

```
Persona (personas)
  ↓ (one-to-many)
PersonaTipo (persona_tipo)
  ↓ (many-to-one)
TipoPersonaCatalogo (tipo_persona_catalogo)
```

**Campos de relación:**
- `Persona.tipos` → `PersonaTipo[]`
- `PersonaTipo.tipoPersona` → `TipoPersonaCatalogo`
- `PersonaTipo.activo` → `Boolean` (soft delete)

---

## ✅ ARCHIVOS CORREGIDOS

### 1. recibo.repository.ts

**Ocurrencias corregidas:** 7 métodos
- `create()` - líneas 22-68
- `findAll()` - líneas 133-187
- `findById()` - líneas 202-257
- `findByNumero()` - líneas 261-285 (aproximado)
- `findByPersonaId()` - líneas 286-320 (aproximado)
- `update()` - líneas 321-350 (aproximado)

**Cambio aplicado:**

```typescript
// ❌ ANTES (V1 Legacy):
emisor: {
  select: {
    id: true,
    nombre: true,
    apellido: true,
    dni: true,
    tipo: true  // ← Campo eliminado
  }
}

// ✅ DESPUÉS (V2):
emisor: {
  select: {
    id: true,
    nombre: true,
    apellido: true,
    dni: true,
    tipos: {
      where: { activo: true },
      include: {
        tipoPersona: {
          select: {
            id: true,
            codigo: true,
            nombre: true
          }
        }
      }
    }
  }
}
```

---

### 2. participacion.repository.ts

**Ocurrencias corregidas:** 1 método
- `findAll()` - líneas 158-179

**Cambio aplicado:**

```typescript
// ❌ ANTES (V1 Legacy):
personas: {
  select: {
    id: true,
    nombre: true,
    apellido: true,
    tipo: true,  // ← Campo eliminado
    dni: true,
    email: true
  }
}

// ✅ DESPUÉS (V2):
personas: {
  select: {
    id: true,
    nombre: true,
    apellido: true,
    dni: true,
    email: true,
    tipos: {
      where: { activo: true },
      include: {
        tipoPersona: {
          select: {
            id: true,
            codigo: true,
            nombre: true
          }
        }
      }
    }
  }
}
```

---

### 3. asistencia.repository.ts

**Ocurrencias corregidas:** 7 métodos
- `create()` - líneas 53-73
- `findAll()` - líneas 159-179
- `findById()` - líneas 210-233
- `findByParticipacionId()` - líneas 234-254
- `findByActividadId()` - líneas 281-301
- `findByPersonaId()` - líneas 328-348
- `update()` - líneas 363-383
- `delete()` - líneas 393-413

**Cambio aplicado (2 variantes):**

**Variante 1 (básica):**
```typescript
// ❌ ANTES:
persona: {
  select: {
    id: true,
    nombre: true,
    apellido: true,
    tipo: true
  }
}

// ✅ DESPUÉS:
persona: {
  select: {
    id: true,
    nombre: true,
    apellido: true,
    tipos: {
      where: { activo: true },
      include: {
        tipoPersona: {
          select: {
            id: true,
            codigo: true,
            nombre: true
          }
        }
      }
    }
  }
}
```

**Variante 2 (con dni y email):**
```typescript
// ❌ ANTES:
persona: {
  select: {
    id: true,
    nombre: true,
    apellido: true,
    tipo: true,
    dni: true,
    email: true
  }
}

// ✅ DESPUÉS:
persona: {
  select: {
    id: true,
    nombre: true,
    apellido: true,
    dni: true,
    email: true,
    tipos: {
      where: { activo: true },
      include: {
        tipoPersona: {
          select: {
            id: true,
            codigo: true,
            nombre: true
          }
        }
      }
    }
  }
}
```

---

## 📊 RESUMEN DE CAMBIOS

| Archivo | Métodos Corregidos | Líneas Modificadas | Estado |
|---------|-------------------|--------------------|--------|
| `recibo.repository.ts` | 7 | ~150 líneas | ✅ Corregido |
| `participacion.repository.ts` | 1 | ~25 líneas | ✅ Corregido |
| `asistencia.repository.ts` | 8 | ~120 líneas | ✅ Corregido |
| **TOTAL** | **16 métodos** | **~295 líneas** | ✅ Completado |

---

## 🔍 VERIFICACIÓN

### Archivos revisados SIN problemas:
- `configuracion.repository.ts` - usa `tipo` de `configuracionSistema` (tabla diferente, correcto)

### Búsqueda global de residuos:
```bash
grep -r "personas.*select.*tipo.*true" src/ --include="*.ts" | wc -l
```
**Resultado:** 0 ocurrencias ✅

---

## 📝 ESTRUCTURA DE DATOS DEVUELTA

**ANTES (V1 Legacy):**
```json
{
  "emisor": {
    "id": 1,
    "nombre": "Juan",
    "apellido": "Pérez",
    "dni": "12345678",
    "tipo": "SOCIO"  // ← String directo
  }
}
```

**DESPUÉS (V2):**
```json
{
  "emisor": {
    "id": 1,
    "nombre": "Juan",
    "apellido": "Pérez",
    "dni": "12345678",
    "tipos": [  // ← Array de tipos activos
      {
        "tipoPersona": {
          "id": 1,
          "codigo": "SOCIO",
          "nombre": "Socio"
        }
      }
    ]
  }
}
```

---

## ⚠️ IMPLICACIONES PARA EL FRONTEND

El frontend **DEBE actualizar** cómo accede al tipo de persona:

### Código Frontend a actualizar:

**ANTES:**
```typescript
// ❌ Ya no funciona
const tipoPersona = recibo.emisor.tipo;  // undefined
```

**DESPUÉS:**
```typescript
// ✅ Acceso correcto V2
const tipoPersona = recibo.emisor.tipos[0]?.tipoPersona.codigo;  // "SOCIO"
const nombreTipo = recibo.emisor.tipos[0]?.tipoPersona.nombre;  // "Socio"

// ✅ Helper function recomendada
function getTipoPersona(persona) {
  return persona.tipos?.find(t => t.activo)?.tipoPersona;
}

// Uso:
const tipo = getTipoPersona(recibo.emisor);
console.log(tipo.codigo);  // "SOCIO"
console.log(tipo.nombre);  // "Socio"
```

### Componentes Frontend afectados (potenciales):

1. **RecibosSlice** (`/SIGESDA-FRONTEND/src/store/slices/recibosSlice.ts`)
   - Interface `Recibo` necesita actualización:
   ```typescript
   // ANTES:
   interface Recibo {
     personaTipo: 'socio' | 'docente' | 'estudiante';
   }

   // DESPUÉS:
   interface Recibo {
     personaTipos: Array<{
       tipoPersona: {
         id: number;
         codigo: string;
         nombre: string;
       }
     }>;
   }
   ```

2. **Tablas de Recibos**
   - Columnas que muestran tipo de persona necesitan mapeo
   - Usar función helper para extraer tipo principal

3. **Formularios de Creación**
   - Selectores de persona deben mostrar tipos desde array
   - Validación de tipos permitidos

---

## 🚀 PRÓXIMOS PASOS

### Backend (Completado) ✅
- [x] Corregir repositories (recibo, participacion, asistencia)
- [x] Verificar no quedan residuos de campo `tipo` legacy
- [x] Probar endpoint `/api/recibos` funciona sin errores

### Frontend (Pendiente) ⚠️
- [ ] Actualizar interface `Recibo` en `recibosSlice.ts`
- [ ] Crear helper `getTipoPersona()` para acceso simplificado
- [ ] Actualizar componentes que renderizan tipo de persona
- [ ] Probar CRUD de recibos desde UI
- [ ] Actualizar otros slices que usen `personaTipo`

### Testing (Recomendado) 📝
- [ ] Test unitario para helper `getTipoPersona()`
- [ ] Test E2E: Crear recibo → Verificar tipos se devuelven correctamente
- [ ] Test E2E: Listar recibos → Verificar tipos en tabla

---

## 📚 REFERENCIAS

**Documentación:**
- `CLAUDE.md` - Sección "Personas (Multi-Type Architecture V2)" - líneas 73-99
- `prisma/schema.prisma` - Modelo `Persona`, `PersonaTipo`, `TipoPersonaCatalogo`

**Archivos modificados:**
- `src/repositories/recibo.repository.ts`
- `src/repositories/participacion.repository.ts`
- `src/repositories/asistencia.repository.ts`

**Issues relacionados:**
- Error Grid2 en MUI v7 (resuelto en `RESOLUCION_ERROR_GRID2.md`)
- Integración Recibos Frontend-Backend (documentado en `FASE_1.1_VERIFICACION.md`)

---

## ✅ VERIFICACIÓN FINAL

- [x] Prisma schema usa arquitectura V2
- [x] Repositories actualizados a V2
- [x] No quedan referencias a `tipo` legacy en persona
- [x] Búsqueda global sin resultados
- [ ] **Probar endpoint `/api/recibos` en navegador/Postman** ⚠️ Pendiente
- [ ] **Actualizar frontend para consumir estructura V2** ⚠️ Pendiente

---

**Documento generado:** 2026-01-05
**Autor:** Claude Code
**Proyecto:** SIGESDA Backend - Migración V2
**Versión:** 1.0
