# Integración del Módulo de Familiares - Backend

## Resumen

Se ha completado exitosamente la integración del módulo de Familiares en el backend para soportar todas las funcionalidades implementadas en el frontend.

## Cambios Realizados

### 1. Migración de Base de Datos

**Archivo:** `prisma/migrations/20251025123740_extend_familiares_module/migration.sql`

Se extendió la tabla `familiares` con los siguientes campos:

- **descripcion** (TEXT, opcional): Descripción de la relación familiar
- **permisoResponsableFinanciero** (BOOLEAN, default: false): Permiso RF
- **permisoContactoEmergencia** (BOOLEAN, default: false): Permiso CE
- **permisoAutorizadoRetiro** (BOOLEAN, default: false): Permiso AR
- **descuento** (DECIMAL(5,2), default: 0): Porcentaje de descuento (0-100%)
- **activo** (BOOLEAN, default: true): Estado de la relación
- **grupoFamiliarId** (INTEGER, opcional): ID del grupo familiar

Se agregaron índices:
- `familiares_grupoFamiliarId_idx` en `grupoFamiliarId`
- `familiares_activo_idx` en `activo`

### 2. Tipos de Parentesco Extendidos

Se agregaron 10 nuevos tipos de parentesco al enum `TipoParentesco`:

- ABUELO
- ABUELA
- NIETO
- NIETA
- TIO
- TIA
- SOBRINO
- SOBRINA
- PRIMO
- PRIMA

**Total:** 18 tipos de parentesco (incluyendo OTRO)

### 3. DTOs Actualizados

**Archivo:** `src/dto/familiar.dto.ts`

#### CreateFamiliarDto
```typescript
{
  socioId: number;           // ID del socio principal
  familiarId: number;        // ID del familiar
  parentesco: TipoParentesco;// Tipo de relación (enum)
  descripcion?: string;      // Descripción opcional (max 500 caracteres)
  permisoResponsableFinanciero: boolean; // Default: false
  permisoContactoEmergencia: boolean;    // Default: false
  permisoAutorizadoRetiro: boolean;      // Default: false
  descuento: number;         // 0-100 (Default: 0)
  activo: boolean;           // Default: true
  grupoFamiliarId?: number;  // Opcional
}
```

#### UpdateFamiliarDto
Todos los campos son opcionales excepto el ID en la URL.

### 4. Endpoints Disponibles

#### Crear Relación Familiar
```http
POST /api/familiares
Content-Type: application/json

{
  "socioId": 21,
  "familiarId": 19,
  "parentesco": "HIJO",
  "descripcion": "Relación padre-hijo",
  "permisoResponsableFinanciero": true,
  "permisoContactoEmergencia": true,
  "permisoAutorizadoRetiro": false,
  "descuento": 15.5,
  "activo": true,
  "grupoFamiliarId": null
}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Relación familiar creada exitosamente",
  "data": {
    "id": 2,
    "socioId": 21,
    "familiarId": 19,
    "parentesco": "HIJO",
    "descripcion": "Relación padre-hijo",
    "permisoResponsableFinanciero": true,
    "permisoContactoEmergencia": true,
    "permisoAutorizadoRetiro": false,
    "descuento": "15.5",
    "activo": true,
    "grupoFamiliarId": null,
    "createdAt": "2025-10-25T15:47:10.399Z",
    "updatedAt": "2025-10-25T15:47:10.399Z",
    "socio": { ... },
    "familiar": { ... }
  }
}
```

#### Obtener Familiares de un Socio
```http
GET /api/familiares/socio/:socioId?includeInactivos=false
```

**Ejemplo:**
```bash
GET /api/familiares/socio/21
```

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": 2,
      "socioId": 21,
      "familiarId": 19,
      "parentesco": "HIJO",
      "descripcion": "...",
      "permisoResponsableFinanciero": true,
      "permisoContactoEmergencia": true,
      "permisoAutorizadoRetiro": false,
      "descuento": "15.5",
      "activo": true,
      "grupoFamiliarId": null,
      "familiar": {
        "id": 19,
        "nombre": "Estudia",
        "apellido": "Guitarra",
        "dni": "31000999",
        "numeroSocio": 5,
        "categoria": { ... }
      }
    }
  ],
  "meta": {
    "socioId": "21",
    "includeInactivos": false,
    "total": 1
  }
}
```

#### Actualizar Relación Familiar
```http
PUT /api/familiares/:id
Content-Type: application/json

{
  "descuento": 25,
  "permisoAutorizadoRetiro": true,
  "descripcion": "Actualización de permisos y descuento"
}
```

#### Eliminar Relación Familiar
```http
DELETE /api/familiares/:id
```

#### Obtener Tipos de Parentesco
```http
GET /api/familiares/tipos/parentesco
```

**Respuesta:**
```json
{
  "success": true,
  "data": [
    "HIJO", "HIJA", "CONYUGE", "PADRE", "MADRE",
    "HERMANO", "HERMANA", "ABUELO", "ABUELA",
    "NIETO", "NIETA", "TIO", "TIA", "SOBRINO",
    "SOBRINA", "PRIMO", "PRIMA", "OTRO"
  ],
  "meta": {
    "total": 18
  }
}
```

#### Listar Todas las Relaciones (con filtros)
```http
GET /api/familiares?socioId=21&includeInactivos=false&soloActivos=true&page=1&limit=10
```

#### Obtener Relación por ID
```http
GET /api/familiares/:id
```

#### Verificar si Existe una Relación
```http
GET /api/familiares/verify/:socioId/:familiarId
```

#### Obtener Árbol Familiar
```http
GET /api/familiares/socio/:socioId/tree
```

#### Estadísticas de Parentesco
```http
GET /api/familiares/stats/parentesco
```

#### Operaciones Masivas

**Crear Múltiples Relaciones:**
```http
POST /api/familiares/bulk/create
Content-Type: application/json

{
  "familiares": [
    { "socioId": 21, "familiarId": 19, "parentesco": "HIJO", ... },
    { "socioId": 21, "familiarId": 11, "parentesco": "CONYUGE", ... }
  ]
}
```

**Eliminar Múltiples Relaciones:**
```http
DELETE /api/familiares/bulk/delete
Content-Type: application/json

{
  "ids": [1, 2, 3]
}
```

## Validaciones Implementadas

1. **Validación de Personas:**
   - Ambas personas deben existir
   - **Sin restricción de tipo:** Cualquier combinación de tipos es válida (SOCIO, NO_SOCIO, DOCENTE, PROVEEDOR)
   - Ambas deben estar activas (no tener fechaBaja)

2. **Validación de Relaciones:**
   - No se permite relación de una persona consigo misma
   - No se permiten relaciones duplicadas

3. **Validación de Descuentos:**
   - Rango: 0-100%
   - Decimal con 2 decimales

4. **Validación de Parentesco:**
   - Advertencias por edad (ejemplo: HIJO mayor que el padre)
   - 18 tipos de parentesco válidos

## Cambios en la Lógica de Negocio

### Service (`src/services/familiar.service.ts`)
- Validación de descuento en creación y actualización
- Logging mejorado con información de permisos y descuentos
- Soporte para filtrado por `grupoFamiliarId`

### Repository (`src/repositories/familiar.repository.ts`)
- Queries actualizadas para incluir nuevos campos
- Filtros adicionales: `grupoFamiliarId`, `activo`, `soloActivos`
- Cambio de tipos de ID de `string` (CUID) a `number` (autoincrement)

### Controller (`src/controllers/familiar.controller.ts`)
- Parsing de parámetros numéricos
- Respuestas enriquecidas con datos de socio y familiar

## Compatibilidad con Frontend

El backend está completamente alineado con la implementación del frontend que incluye:

✅ Badges de permisos (RF, CE, AR)
✅ Porcentaje de descuento
✅ Descripción de relación
✅ Estado activo/inactivo
✅ Grupos familiares
✅ 18 tipos de parentesco
✅ CRUD completo desde PersonasPageSimple
✅ Componentes FamiliarItem y ConfirmDeleteDialog
✅ Redux slice con fetchRelacionesDePersona

## Ejemplo de Uso desde Frontend

```typescript
// Crear relación familiar
const nuevaRelacion = {
  socioId: 21,
  familiarId: 19,
  parentesco: 'HIJO',
  descripcion: 'Mi hijo menor',
  permisoResponsableFinanciero: true,
  permisoContactoEmergencia: true,
  permisoAutorizadoRetiro: false,
  descuento: 15.5,
  activo: true,
  grupoFamiliarId: null
};

const response = await fetch('http://localhost:8000/api/familiares', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(nuevaRelacion)
});

const result = await response.json();
```

## Testing

Se realizaron pruebas exitosas de:
- ✅ Creación de relación con nuevos campos
- ✅ Obtención de familiares de un socio
- ✅ Actualización de permisos y descuentos
- ✅ Listado de tipos de parentesco

## Próximos Pasos Opcionales

1. Implementar gestión de **Grupos Familiares** (tabla separada)
2. Agregar endpoint para obtener socios disponibles (excluir familiares existentes)
3. Implementar validaciones más complejas de parentesco (árbol genealógico)
4. Agregar reportes de descuentos familiares
5. Implementar notificaciones para cambios en permisos

## Notas Técnicas

- Base de datos: PostgreSQL
- ORM: Prisma
- Validación: Zod
- Los IDs cambiaron de `string` (CUID) a `number` (autoincrement) para simplificar
- El campo `descuento` se almacena como DECIMAL(5,2) (máx: 999.99)
- Los índices en `grupoFamiliarId` y `activo` mejoran el rendimiento de queries
- **Validación totalmente flexible:** Sin restricciones de tipo de persona (permite cualquier combinación)

## Contacto

Para consultas o mejoras, contactar al equipo de backend.

---
**Fecha de integración:** 2025-10-25
**Versión del backend:** 1.0.0
**Estado:** ✅ COMPLETADO, PROBADO Y AJUSTADO

## Actualizaciones Post-Integración

### 2025-10-25 - Eliminación Completa de Validación de Tipo de Persona

**Cambio:** Se eliminó completamente la validación de tipo de persona, permitiendo relaciones familiares entre **cualquier combinación** de tipos (SOCIO, NO_SOCIO, DOCENTE, PROVEEDOR).

**Justificación:** En un conservatorio musical es común tener relaciones familiares entre personas con diferentes roles:
- Un padre (NO_SOCIO) puede tener un hijo (que estudia música)
- Dos hermanos donde uno es SOCIO y el otro es DOCENTE
- Cónyuges donde uno es SOCIO y el otro NO_SOCIO
- Familiares que participan en diferentes capacidades en la institución

**Impacto:**
- ✅ Permite relaciones entre cualquier tipo de persona
- ✅ Máxima flexibilidad y realismo para gestión familiar
- ✅ Compatible con la estructura de datos existente
- ✅ Solo valida que ambas personas existan y estén activas

**Archivos modificados:**
- `src/services/familiar.service.ts` - Métodos: `createFamiliar`, `getFamiliarsBySocio`, `getFamilyTree`, `createBulkFamiliares`

**Ejemplo comprobado:**
```json
{
  "socioId": 21,        // Francisco Gonzalez (SOCIO)
  "familiarId": 20,     // Mirna María Balcala (NO_SOCIO)
  "parentesco": "CONYUGE"
}
// ✅ Creación exitosa
```
