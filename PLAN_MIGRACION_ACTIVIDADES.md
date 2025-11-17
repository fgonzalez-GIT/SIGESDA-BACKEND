# 📋 PLAN DE MIGRACIÓN: Actividades ENUM → Catálogos

**Fecha**: 2025-11-17
**Objetivo**: Migrar schema de actividades de ENUMs legacy a catálogos con IDs SERIAL
**Estado**: ⚠️ PENDIENTE DE EJECUCIÓN

---

## 🎯 CAMBIOS PRINCIPALES

### 1. **Tabla `actividades`**
- ✅ Agregar: `codigo_actividad` (String UNIQUE)
- ✅ Agregar: `tipo_actividad_id` (FK → tipos_actividades)
- ✅ Agregar: `categoria_id` (FK → categorias_actividades)
- ✅ Agregar: `estado_id` (FK → estados_actividades)
- ✅ Agregar: `fecha_desde` (DateTime)
- ✅ Agregar: `fecha_hasta` (DateTime?)
- ✅ Renombrar: `precio` → `costo`
- ✅ Renombrar: `capacidadMaxima` → `capacidad_maxima`
- ✅ Agregar: `observaciones` (String?)
- ❌ Eliminar: `tipo` (TipoActividad ENUM)
- ❌ Eliminar: `duracion` (no usado)

### 2. **Tabla `horarios_actividades`**
- ✅ Agregar: `dia_semana_id` (FK → dias_semana)
- ✅ Cambiar: `horaInicio` tipo TIME → `hora_inicio` VARCHAR
- ✅ Cambiar: `horaFin` tipo TIME → `hora_fin` VARCHAR
- ❌ Eliminar: `diaSemana` (DiaSemana ENUM)

---

## 📝 FASES DE MIGRACIÓN

### **FASE 1: Preparación** ✅
- [x] Análisis de dependencias
- [x] Backup de base de datos
- [x] Crear plan detallado

### **FASE 2: Migración de Schema** 🔄
**Archivos afectados**:
- `prisma/schema.prisma`
- `prisma/migrations/XXXXXX_migracion_actividades_catalogos/migration.sql`

**Pasos**:
1. Agregar columnas nuevas (nullable temporalmente)
2. Migrar datos existentes (ENUM → ID de catálogo)
3. Hacer columnas NOT NULL
4. Eliminar columnas legacy
5. Agregar constraints e índices

### **FASE 3: Migración de Datos** 🔄
**Script**: `scripts/migrate-actividades-to-catalogos.ts`

**Mapeo ENUM → Catálogo**:
```typescript
ENUM TipoActividad → tipos_actividades
- CORO              → codigo: 'CORO'
- CLASE_CANTO       → codigo: 'CLASE_INDIVIDUAL' o crear nuevo
- CLASE_INSTRUMENTO → codigo: 'CLASE_INDIVIDUAL'

ENUM DiaSemana → dias_semana
- LUNES    → codigo: 'LUNES'
- MARTES   → codigo: 'MARTES'
- ... etc
```

### **FASE 4: Actualización de Código** 🔄
**Archivos a actualizar**:
- ✅ `src/repositories/actividad.repository.ts` (parcial)
- ⚠️ `src/dto/actividad-v2.dto.ts` (ya actualizado)
- ⚠️ `src/services/actividad.service.ts` (necesita ajustes menores)
- ⚠️ `src/controllers/actividad.controller.ts` (OK)

### **FASE 5: Tests** 🔄
- Re-ejecutar `tests/test-actividades-crud.ts`
- Validar todos los endpoints
- Verificar integridad de datos

---

## 🔍 MAPEO DETALLADO

### **Tipos de Actividad**
| ENUM Legacy | Catálogo Código | Catálogo ID | Nombre |
|-------------|-----------------|-------------|---------|
| `CORO` | `CORO` | 1 | Coro |
| `CLASE_CANTO` | `CLASE_INDIVIDUAL` | 2 | Clase Individual |
| `CLASE_INSTRUMENTO` | `CLASE_INDIVIDUAL` | 2 | Clase Individual |

### **Estados de Actividad** (nuevos)
| ID | Código | Nombre | Por Defecto |
|----|--------|--------|-------------|
| 1 | `PLANIFICADA` | Planificada | ❌ |
| 2 | `ACTIVA` | Activa | ✅ |
| 3 | `SUSPENDIDA` | Suspendida | ❌ |
| 4 | `FINALIZADA` | Finalizada | ❌ |

### **Categorías de Actividad** (nuevos)
| ID | Código | Nombre |
|----|--------|--------|
| 1 | `MUSICA` | Música |
| 2 | `DANZA` | Danza |
| 3 | `TEATRO` | Teatro |

---

## ⚠️ CONSIDERACIONES IMPORTANTES

### **Datos Existentes**
- Todas las actividades actuales recibirán `estado_id = 2` (ACTIVA) por defecto
- Todas las actividades recibirán `categoria_id = 1` (MÚSICA) por defecto
- `codigo_actividad` se generará automáticamente: `ACT-{tipo}-{id}`

### **Compatibilidad hacia atrás**
- ❌ El campo `tipo` (ENUM) será eliminado permanentemente
- ⚠️ APIs que usen `tipo` directamente necesitarán actualización
- ✅ DTOs ya están preparados para usar IDs

### **Performance**
- ✅ Se agregarán índices en FKs nuevas
- ✅ Queries usarán JOINs eficientes con catálogos

---

## 📦 DEPENDENCIAS

### **Catálogos Requeridos** (ya existen en seed)
- ✅ `tipos_actividades`
- ✅ `categorias_actividades`
- ✅ `estados_actividades`
- ✅ `dias_semana`

### **Relaciones Afectadas**
- `participacion_actividades` → OK (usa `actividadId`)
- `docentes_actividades` → OK (usa `actividadId`)
- `horarios_actividades` → ⚠️ REQUIERE MIGRACIÓN (DiaSemana ENUM)
- `secciones_actividades` → OK (usa `actividadId`)

---

## 🚀 INSTRUCCIONES DE EJECUCIÓN

### **1. Backup**
```bash
pg_dump -h localhost -U postgres sigesda > backup_pre_migracion_actividades.sql
```

### **2. Ejecutar Migración de Schema**
```bash
npx prisma migrate dev --name migracion_actividades_catalogos
```

### **3. Ejecutar Script de Migración de Datos**
```bash
npx ts-node scripts/migrate-actividades-to-catalogos.ts
```

### **4. Generar Cliente Prisma**
```bash
npm run db:generate
```

### **5. Validar**
```bash
npx ts-node tests/test-actividades-crud.ts
```

---

## 📊 CRITERIOS DE ÉXITO

- ✅ Todas las actividades tienen `tipo_actividad_id`, `categoria_id`, `estado_id`
- ✅ Todos los horarios usan `dia_semana_id` (FK)
- ✅ No quedan referencias a ENUMs legacy (`TipoActividad`, `DiaSemana`)
- ✅ Tests pasan exitosamente (9/9)
- ✅ API endpoints funcionan correctamente
- ✅ Seed genera datos con nueva estructura

---

## 🔄 ROLLBACK

En caso de error:
```bash
# Restaurar backup
psql -h localhost -U postgres sigesda < backup_pre_migracion_actividades.sql

# Revertir migración Prisma
npx prisma migrate resolve --rolled-back XXXXXX_migracion_actividades_catalogos

# Volver a checkout del schema anterior
git checkout HEAD~1 -- prisma/schema.prisma
```

---

## 📝 NOTAS

- Esta migración es **IRREVERSIBLE** en producción
- Se recomienda ejecutar primero en ambiente de desarrollo
- Coordinar con equipo para ventana de mantenimiento si hay datos en producción
