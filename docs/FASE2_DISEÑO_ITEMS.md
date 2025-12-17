# FASE 2: Diseño del Sistema de Ítems de Cuota

**Fecha de inicio**: 2025-12-13
**Estado**: En progreso
**Responsable**: Backend Developer + Database Specialist
**Duración estimada**: 3-4 días

---

## Tabla de Contenidos

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Objetivos de Fase 2](#objetivos-de-fase-2)
3. [Arquitectura del Sistema de Ítems](#arquitectura-del-sistema-de-ítems)
4. [Modelos de Datos](#modelos-de-datos)
5. [Migration SQL](#migration-sql)
6. [Seed de Datos](#seed-de-datos)
7. [Flujo de Migración de Datos Legacy](#flujo-de-migración-de-datos-legacy)
8. [Implementación de Capas](#implementación-de-capas)
9. [Tests](#tests)
10. [Checklist de Tareas](#checklist-de-tareas)

---

## Resumen Ejecutivo

### Problema a Resolver

El sistema actual de cuotas utiliza campos fijos (`montoBase`, `montoActividades`) que limitan la flexibilidad para:
- Agregar nuevos conceptos (descuentos, recargos, bonificaciones)
- Configurar descuentos dinámicamente
- Tener transparencia sobre el desglose de la cuota
- Auditar modificaciones manuales

### Solución Propuesta

Migrar a una **arquitectura de ítems configurables** donde:
- Cada cuota se compone de múltiples ítems (base, actividades, descuentos, etc.)
- Los tipos de ítems se gestionan en una tabla catálogo
- Los ítems pueden ser automáticos o manuales
- Se mantiene historial completo de modificaciones

### Beneficios

- ✅ **Flexibilidad**: Admin puede crear nuevos tipos de ítems sin código
- ✅ **Transparencia**: Desglose detallado de cada componente de la cuota
- ✅ **Auditoría**: Registro completo de quién modificó qué y cuándo
- ✅ **Escalabilidad**: Base para motor de descuentos (Fase 3)

---

## Objetivos de Fase 2

### Objetivos Principales

1. **Diseñar** schema completo del sistema de ítems (tablas + relaciones)
2. **Crear** migration PostgreSQL con validaciones y constraints
3. **Implementar** seed de tipos de ítems predefinidos
4. **Migrar** datos existentes de campos legacy a ítems
5. **Desarrollar** Repository + Service + Controller para ítems
6. **Validar** con tests de integración

### Alcance de Fase 2

**Incluye**:
- ✅ Diseño de tablas `tipos_items_cuota` e `items_cuota`
- ✅ Enum `CategoriaItem` con 6 categorías
- ✅ 8 tipos de ítems predefinidos
- ✅ Migration con rollback seguro
- ✅ Seed de tipos de ítems
- ✅ CRUD completo de ítems
- ✅ Tests de integración

**NO Incluye** (Fases posteriores):
- ❌ Motor de reglas de descuentos (Fase 3)
- ❌ Cuota familiar (Fase 4)
- ❌ Simulación (Fase 5)
- ❌ Optimización batch (Fase 6)

---

## Arquitectura del Sistema de Ítems

### Diseño: 100% Gestionable vía CRUD (Tablas Catálogo)

**Principio**: TODO el sistema de ítems se gestiona mediante **tablas catálogo** editables desde la UI de admin, sin ENUMs ni valores hardcoded.

### Diagrama de Entidades

```
┌───────────────────────────────┐
│  CategoriasItems (Catálogo)   │  ← CRUD Admin
│  ───────────────────────────  │
│  - id (PK)                    │
│  - codigo (UNIQUE)            │
│  - nombre                     │
│  - descripcion                │
│  - icono                      │
│  - color                      │
│  - activo                     │
│  - orden                      │
└───────────────┬───────────────┘
                │
                │ 1:N
                │
┌───────────────▼───────────────┐
│  TiposItemsCuota (Catálogo)   │  ← CRUD Admin
│  ───────────────────────────  │
│  - id (PK)                    │
│  - codigo (UNIQUE)            │
│  - nombre                     │
│  - categoriaItemId (FK)       │─────┐
│  - esCalculado                │     │
│  - formula (JSONB)            │     │ N:1
│  - activo                     │     │
│  - orden                      │     │
└───────────────┬───────────────┘     │
                │                     │
                │ 1:N                 │
                │                     │
┌───────────────▼───────────────┐     │
│      ItemsCuota               │     │
│  ───────────────────────────  │     │
│  - id (PK)                    │     │
│  - cuotaId (FK) ────────┐     │     │
│  - tipoItemId (FK)      │     │     │
│  - concepto             │     │     │
│  - monto                │     │     │
│  - cantidad             │     │     │
│  - esAutomatico         │     │     │
│  - metadata (JSONB)     │     │     │
└─────────────────────────┘     │     │
                                │     │
                ┌───────────────▼─────▼─┐
                │       Cuota           │
                │  ───────────────────  │
                │  - id (PK)            │
                │  - socioId            │
                │  - mes/anio           │
                │  - montoTotal         │
                │  - items[]            │
                └───────────────────────┘
```

### Categorías de Ítems (Tabla Catálogo)

**Tabla**: `categorias_items`

Categorías predefinidas (editables vía CRUD):

| Código | Nombre | Descripción | Icono | Color |
|--------|--------|-------------|-------|-------|
| `BASE` | Cuota Base | Cuota mensual base según categoría de socio | 💰 | blue |
| `ACTIVIDAD` | Actividad | Costo de participación en actividades | 🎵 | green |
| `DESCUENTO` | Descuento | Descuentos (familiar, categoría, etc.) | 🎁 | orange |
| `RECARGO` | Recargo | Recargos (mora, administrativos) | ⚠️ | red |
| `BONIFICACION` | Bonificación | Bonificaciones especiales | ⭐ | purple |
| `OTRO` | Otro | Otros conceptos | 📝 | gray |

**Ventajas de usar tabla catálogo**:
- ✅ Admin puede crear nuevas categorías sin modificar código
- ✅ Personalización de iconos y colores para UI
- ✅ Soft delete con campo `activo`
- ✅ Orden configurable para visualización
- ✅ Consistencia con otros catálogos del sistema

---

## Modelos de Datos

### 1. Modelo: CategoriaItem (Tabla Catálogo)

```prisma
/// Catálogo de categorías de ítems (BASE, ACTIVIDAD, DESCUENTO, etc.)
model CategoriaItem {
  id              Int      @id @default(autoincrement())
  codigo          String   @unique @db.VarChar(50)          // BASE, ACTIVIDAD, DESCUENTO, etc.
  nombre          String   @db.VarChar(100)                 // "Cuota Base", "Actividad", etc.
  descripcion     String?                                   // Descripción detallada
  icono           String?  @db.VarChar(10)                  // Emoji o código de icono
  color           String?  @db.VarChar(20)                  // Color para UI (ej: "blue", "#3B82F6")
  activo          Boolean  @default(true)                   // Soft delete
  orden           Int      @default(0)                      // Orden de visualización

  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @updatedAt @map("updated_at")

  // Relaciones
  tiposItems      TipoItemCuota[]

  @@index([codigo])
  @@index([activo])
  @@index([orden])
  @@map("categorias_items")
}
```

**Campos clave**:
- `codigo`: Identificador único (ej: `BASE`, `ACTIVIDAD`, `DESCUENTO`)
- `icono`: Emoji o código de icono para UI (ej: "💰", "🎵", "🎁")
- `color`: Color hexadecimal o nombre para UI (ej: "blue", "#3B82F6")
- `orden`: Controla el orden de visualización en listas

### 2. Modelo: TipoItemCuota (Tabla Catálogo)

```prisma
/// Catálogo de tipos de ítems configurables para cuotas
model TipoItemCuota {
  id              Int             @id @default(autoincrement())
  codigo          String          @unique @db.VarChar(100)     // CUOTA_BASE_SOCIO, ACTIVIDAD_INDIVIDUAL, etc.
  nombre          String          @db.VarChar(200)             // "Cuota Base Socio", "Actividad Individual"
  descripcion     String?                                      // Descripción detallada
  categoriaItemId Int             @map("categoria_item_id")    // FK a categorias_items
  esCalculado     Boolean         @default(true)               // true = automático, false = manual
  formula         Json?                                        // JSONB con lógica de cálculo
  activo          Boolean         @default(true)               // Soft delete
  orden           Int             @default(0)                  // Orden de aplicación/visualización
  configurable    Boolean         @default(true)               // ¿Usuario puede editarlo?

  createdAt       DateTime        @default(now()) @map("created_at")
  updatedAt       DateTime        @updatedAt @map("updated_at")

  // Relaciones
  categoriaItem   CategoriaItem   @relation(fields: [categoriaItemId], references: [id], onDelete: Restrict)
  itemsCuota      ItemCuota[]

  @@index([codigo])
  @@index([categoriaItemId])
  @@index([activo])
  @@index([orden])
  @@map("tipos_items_cuota")
}
```

**Campos clave**:

- `codigo`: Identificador único para uso programático (ej: `CUOTA_BASE_SOCIO`)
- `categoriaItemId`: FK a tabla `categorias_items` (BASE, ACTIVIDAD, DESCUENTO, etc.)
- `esCalculado`: Si es `true`, se calcula automáticamente; si es `false`, es manual
- `formula`: JSONB con lógica de cálculo (uso futuro en Fase 3)
- `configurable`: Si es `false`, el ítem no puede ser editado por usuarios
- `onDelete: Restrict`: No se puede eliminar una categoría si tiene tipos asociados

### 3. Modelo: ItemCuota

```prisma
/// Ítems individuales que componen una cuota
model ItemCuota {
  id              Int            @id @default(autoincrement())
  cuotaId         Int            @map("cuota_id")              // FK a cuotas
  tipoItemId      Int            @map("tipo_item_id")          // FK a tipos_items_cuota
  concepto        String                                       // Descripción del ítem
  monto           Decimal        @db.Decimal(10, 2)           // Monto del ítem (puede ser negativo)
  cantidad        Decimal        @default(1) @db.Decimal(8, 2) // Cantidad (ej: 2 actividades)
  porcentaje      Decimal?       @db.Decimal(5, 2)            // Porcentaje aplicado (solo descuentos)
  esAutomatico    Boolean        @default(true)                // ¿Se generó automáticamente?
  esEditable      Boolean        @default(false)               // ¿Se puede editar después de creado?
  observaciones   String?                                      // Notas del admin
  metadata        Json?                                        // Datos adicionales (JSONB)

  createdAt       DateTime       @default(now()) @map("created_at")
  updatedAt       DateTime       @updatedAt @map("updated_at")

  // Relaciones
  cuota           Cuota          @relation(fields: [cuotaId], references: [id], onDelete: Cascade)
  tipoItem        TipoItemCuota  @relation(fields: [tipoItemId], references: [id], onDelete: Restrict)

  @@index([cuotaId])
  @@index([tipoItemId])
  @@map("items_cuota")
}
```

**Campos clave**:

- `cuotaId`: Relación con la cuota (CASCADE delete - si se elimina la cuota, se eliminan los ítems)
- `tipoItemId`: Relación con el tipo de ítem (RESTRICT - no se puede eliminar un tipo si tiene ítems)
- `monto`: Puede ser negativo (para descuentos)
- `cantidad`: Permite multiplicar (ej: 2 actividades x $30 = $60)
- `porcentaje`: Solo para descuentos (ej: 15% descuento familiar)
- `esAutomatico`: `true` si fue generado por el sistema, `false` si fue agregado manualmente
- `esEditable`: Controla si el admin puede modificar este ítem
- `metadata`: JSONB para datos adicionales (ej: ID de participación, ID de relación familiar)

### 4. Modificación al Modelo Cuota

```prisma
model Cuota {
  id                  Int          @id @default(autoincrement())
  // ... campos existentes ...

  // DEPRECATED: Se mantienen para retrocompatibilidad, pero se usarán items
  montoBase           Decimal?     @db.Decimal(10, 2) @map("monto_base")
  montoActividades    Decimal?     @db.Decimal(10, 2) @map("monto_actividades")

  // NUEVA RELACIÓN
  items               ItemCuota[]  // Ítems que componen esta cuota

  // ... resto de campos ...
}
```

**Nota**: Los campos `montoBase` y `montoActividades` se marcan como opcionales (`?`) para permitir la transición gradual.

---

## Migration SQL

### Archivo: `prisma/migrations/XXXXXX_add_items_cuota_system/migration.sql`

```sql
-- ══════════════════════════════════════════════════════════════════════
-- FASE 2: Sistema de Ítems de Cuota (3 Tablas Catálogo - 100% CRUD)
-- Fecha: 2025-12-13
-- Descripción: Crea sistema flexible de ítems configurables para cuotas
--              TODO gestionable vía CRUD (sin ENUMs)
-- ══════════════════════════════════════════════════════════════════════

-- ──────────────────────────────────────────────────────────────────────
-- PASO 1: Crear tabla categorias_items (Catálogo de categorías)
-- ──────────────────────────────────────────────────────────────────────

CREATE TABLE "categorias_items" (
  "id"            SERIAL PRIMARY KEY,
  "codigo"        VARCHAR(50) UNIQUE NOT NULL,
  "nombre"        VARCHAR(100) NOT NULL,
  "descripcion"   TEXT,
  "icono"         VARCHAR(10),
  "color"         VARCHAR(20),
  "activo"        BOOLEAN NOT NULL DEFAULT true,
  "orden"         INTEGER NOT NULL DEFAULT 0,
  "created_at"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE "categorias_items" IS 'Catálogo de categorías de ítems (BASE, ACTIVIDAD, DESCUENTO, etc.) - Gestionable vía CRUD';
COMMENT ON COLUMN "categorias_items"."codigo" IS 'Código único (ej: BASE, ACTIVIDAD, DESCUENTO)';
COMMENT ON COLUMN "categorias_items"."icono" IS 'Emoji o código de icono para UI (ej: 💰, 🎵, 🎁)';
COMMENT ON COLUMN "categorias_items"."color" IS 'Color para UI (ej: blue, #3B82F6)';

CREATE INDEX "categorias_items_codigo_idx" ON "categorias_items"("codigo");
CREATE INDEX "categorias_items_activo_idx" ON "categorias_items"("activo");
CREATE INDEX "categorias_items_orden_idx" ON "categorias_items"("orden");

-- ──────────────────────────────────────────────────────────────────────
-- PASO 2: Crear tabla tipos_items_cuota (Catálogo de tipos)
-- ──────────────────────────────────────────────────────────────────────

CREATE TABLE "tipos_items_cuota" (
  "id"                  SERIAL PRIMARY KEY,
  "codigo"              VARCHAR(100) UNIQUE NOT NULL,
  "nombre"              VARCHAR(200) NOT NULL,
  "descripcion"         TEXT,
  "categoria_item_id"   INTEGER NOT NULL,
  "es_calculado"        BOOLEAN NOT NULL DEFAULT true,
  "formula"             JSONB,
  "activo"              BOOLEAN NOT NULL DEFAULT true,
  "orden"               INTEGER NOT NULL DEFAULT 0,
  "configurable"        BOOLEAN NOT NULL DEFAULT true,
  "created_at"          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at"          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "tipos_items_cuota_categoria_item_id_fkey"
    FOREIGN KEY ("categoria_item_id") REFERENCES "categorias_items"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE
);

COMMENT ON TABLE "tipos_items_cuota" IS 'Catálogo de tipos de ítems configurables para cuotas';
COMMENT ON COLUMN "tipos_items_cuota"."codigo" IS 'Código único para identificar el tipo (ej: CUOTA_BASE_SOCIO)';
COMMENT ON COLUMN "tipos_items_cuota"."categoria_item_id" IS 'FK a categorias_items (BASE, ACTIVIDAD, DESCUENTO, etc.)';
COMMENT ON COLUMN "tipos_items_cuota"."es_calculado" IS 'true = automático, false = manual';
COMMENT ON COLUMN "tipos_items_cuota"."formula" IS 'JSONB con lógica de cálculo (uso futuro)';

CREATE INDEX "tipos_items_cuota_codigo_idx" ON "tipos_items_cuota"("codigo");
CREATE INDEX "tipos_items_cuota_categoria_item_id_idx" ON "tipos_items_cuota"("categoria_item_id");
CREATE INDEX "tipos_items_cuota_activo_idx" ON "tipos_items_cuota"("activo");
CREATE INDEX "tipos_items_cuota_orden_idx" ON "tipos_items_cuota"("orden");

-- ──────────────────────────────────────────────────────────────────────
-- PASO 3: Crear tabla items_cuota
-- ──────────────────────────────────────────────────────────────────────

CREATE TABLE "items_cuota" (
  "id"              SERIAL PRIMARY KEY,
  "cuota_id"        INTEGER NOT NULL,
  "tipo_item_id"    INTEGER NOT NULL,
  "concepto"        TEXT NOT NULL,
  "monto"           DECIMAL(10,2) NOT NULL,
  "cantidad"        DECIMAL(8,2) NOT NULL DEFAULT 1,
  "porcentaje"      DECIMAL(5,2),
  "es_automatico"   BOOLEAN NOT NULL DEFAULT true,
  "es_editable"     BOOLEAN NOT NULL DEFAULT false,
  "observaciones"   TEXT,
  "metadata"        JSONB,
  "created_at"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "items_cuota_cuota_id_fkey"
    FOREIGN KEY ("cuota_id") REFERENCES "cuotas"("id")
    ON DELETE CASCADE ON UPDATE CASCADE,

  CONSTRAINT "items_cuota_tipo_item_id_fkey"
    FOREIGN KEY ("tipo_item_id") REFERENCES "tipos_items_cuota"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE
);

COMMENT ON TABLE "items_cuota" IS 'Ítems individuales que componen una cuota (base, actividades, descuentos, etc.)';
COMMENT ON COLUMN "items_cuota"."monto" IS 'Monto del ítem (puede ser negativo para descuentos)';
COMMENT ON COLUMN "items_cuota"."cantidad" IS 'Cantidad aplicada (ej: 2 actividades)';
COMMENT ON COLUMN "items_cuota"."porcentaje" IS 'Porcentaje aplicado (solo para descuentos)';
COMMENT ON COLUMN "items_cuota"."metadata" IS 'Datos adicionales en formato JSON (ej: ID de participación)';

CREATE INDEX "items_cuota_cuota_id_idx" ON "items_cuota"("cuota_id");
CREATE INDEX "items_cuota_tipo_item_id_idx" ON "items_cuota"("tipo_item_id");

-- ──────────────────────────────────────────────────────────────────────
-- PASO 5: Marcar campos legacy como opcionales (nullable)
-- ──────────────────────────────────────────────────────────────────────

ALTER TABLE "cuotas"
  ALTER COLUMN "monto_base" DROP NOT NULL;

ALTER TABLE "cuotas"
  ALTER COLUMN "monto_actividades" DROP NOT NULL;

COMMENT ON COLUMN "cuotas"."monto_base" IS 'DEPRECATED: Usar items[] en su lugar. Se mantiene para retrocompatibilidad';
COMMENT ON COLUMN "cuotas"."monto_actividades" IS 'DEPRECATED: Usar items[] en su lugar. Se mantiene para retrocompatibilidad';

-- ──────────────────────────────────────────────────────────────────────
-- PASO 6: Verificaciones finales
-- ──────────────────────────────────────────────────────────────────────

DO $$
BEGIN
  -- Verificar que las tablas existan
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tipos_items_cuota') THEN
    RAISE EXCEPTION 'Tabla tipos_items_cuota no fue creada';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'items_cuota') THEN
    RAISE EXCEPTION 'Tabla items_cuota no fue creada';
  END IF;

  RAISE NOTICE '✅ Migration completada exitosamente';
END $$;
```

### Rollback Script

**Archivo**: `scripts/rollback-items-cuota-system.sql`

```sql
-- ══════════════════════════════════════════════════════════════════════
-- ROLLBACK: Sistema de Ítems de Cuota (3 Tablas Catálogo)
-- ══════════════════════════════════════════════════════════════════════

-- PASO 1: Eliminar tabla items_cuota (cascade elimina FK)
DROP TABLE IF EXISTS "items_cuota" CASCADE;

-- PASO 2: Eliminar tabla tipos_items_cuota (cascade elimina FK)
DROP TABLE IF EXISTS "tipos_items_cuota" CASCADE;

-- PASO 3: Eliminar tabla categorias_items
DROP TABLE IF EXISTS "categorias_items" CASCADE;

-- PASO 4: Restaurar campos legacy como NOT NULL
ALTER TABLE "cuotas"
  ALTER COLUMN "monto_base" SET NOT NULL,
  ALTER COLUMN "monto_base" SET DEFAULT 0;

ALTER TABLE "cuotas"
  ALTER COLUMN "monto_actividades" SET NOT NULL,
  ALTER COLUMN "monto_actividades" SET DEFAULT 0;

-- PASO 5: Verificación
DO $$
BEGIN
  RAISE NOTICE '✅ Rollback completado - 3 tablas eliminadas';
END $$;
```

---

## Seed de Datos

### Archivo: `prisma/seed-items-catalogos.ts`

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * PASO 1: Categorías de ítems predefinidas (tabla catálogo)
 */
const categoriasItemsDefault = [
  {
    codigo: 'BASE',
    nombre: 'Cuota Base',
    descripcion: 'Cuota mensual base según categoría de socio',
    icono: '💰',
    color: 'blue',
    activo: true,
    orden: 1
  },
  {
    codigo: 'ACTIVIDAD',
    nombre: 'Actividad',
    descripcion: 'Costo de participación en actividades',
    icono: '🎵',
    color: 'green',
    activo: true,
    orden: 2
  },
  {
    codigo: 'DESCUENTO',
    nombre: 'Descuento',
    descripcion: 'Descuentos (familiar, categoría, múltiples actividades)',
    icono: '🎁',
    color: 'orange',
    activo: true,
    orden: 3
  },
  {
    codigo: 'RECARGO',
    nombre: 'Recargo',
    descripcion: 'Recargos (mora, administrativos)',
    icono: '⚠️',
    color: 'red',
    activo: true,
    orden: 4
  },
  {
    codigo: 'BONIFICACION',
    nombre: 'Bonificación',
    descripcion: 'Bonificaciones especiales',
    icono: '⭐',
    color: 'purple',
    activo: true,
    orden: 5
  },
  {
    codigo: 'OTRO',
    nombre: 'Otro',
    descripcion: 'Otros conceptos',
    icono: '📝',
    color: 'gray',
    activo: true,
    orden: 6
  }
];

/**
 * PASO 2: Tipos de ítems predefinidos (referencia a categorías por código)
 */
const tiposItemsDefault = [
  {
    codigo: 'CUOTA_BASE_SOCIO',
    nombre: 'Cuota Base Socio',
    descripcion: 'Cuota mensual base según categoría de socio',
    categoria: CategoriaItem.BASE,
    esCalculado: true,
    formula: JSON.stringify({
      type: 'categoria_monto',
      source: 'categorias_socios.montoCuota'
    }),
    activo: true,
    orden: 1,
    configurable: true
  },
  {
    codigo: 'CUOTA_FAMILIAR',
    nombre: 'Cuota Familiar',
    descripcion: 'Cuota mensual del grupo familiar (solo responsable)',
    categoria: CategoriaItem.BASE,
    esCalculado: true,
    formula: JSON.stringify({
      type: 'grupo_familiar',
      source: 'grupos_familiares.montoCuotaFamiliar'
    }),
    activo: false,  // Se activa en Fase 4
    orden: 2,
    configurable: true
  },
  {
    codigo: 'ACTIVIDAD_INDIVIDUAL',
    nombre: 'Actividad Individual',
    descripcion: 'Costo de actividad individual (instrumento, taller, etc.)',
    categoria: CategoriaItem.ACTIVIDAD,
    esCalculado: true,
    formula: JSON.stringify({
      type: 'participacion',
      source: 'participacion_actividades.precioEspecial ?? actividades.costo'
    }),
    activo: true,
    orden: 10,
    configurable: true
  },
  {
    codigo: 'DESCUENTO_CATEGORIA',
    nombre: 'Descuento por Categoría',
    descripcion: 'Descuento aplicado según categoría de socio (ESTUDIANTE, JUBILADO, etc.)',
    categoria: CategoriaItem.DESCUENTO,
    esCalculado: true,
    formula: JSON.stringify({
      type: 'porcentaje_categoria',
      source: 'categorias_socios.descuento'
    }),
    activo: true,
    orden: 20,
    configurable: true
  },
  {
    codigo: 'DESCUENTO_FAMILIAR',
    nombre: 'Descuento Familiar',
    descripcion: 'Descuento por relación familiar activa',
    categoria: CategoriaItem.DESCUENTO,
    esCalculado: true,
    formula: JSON.stringify({
      type: 'maximo_descuento',
      source: 'familiares.descuento'
    }),
    activo: true,
    orden: 21,
    configurable: true
  },
  {
    codigo: 'DESCUENTO_MULTIPLES_ACTIVIDADES',
    nombre: 'Descuento Múltiples Actividades',
    descripcion: 'Descuento por participar en 2 o más actividades',
    categoria: CategoriaItem.DESCUENTO,
    esCalculado: true,
    formula: JSON.stringify({
      type: 'escalado',
      rules: [
        { condition: 'actividades >= 2', descuento: 10 },
        { condition: 'actividades >= 3', descuento: 20 }
      ]
    }),
    activo: false,  // Se activa con configuración
    orden: 22,
    configurable: true
  },
  {
    codigo: 'RECARGO_MORA',
    nombre: 'Recargo por Mora',
    descripcion: 'Recargo por pago fuera de término',
    categoria: CategoriaItem.RECARGO,
    esCalculado: true,
    formula: JSON.stringify({
      type: 'porcentaje_fijo',
      porcentaje: 10,
      aplicaSi: 'estado = VENCIDO'
    }),
    activo: false,  // Desactivado por default
    orden: 30,
    configurable: true
  },
  {
    codigo: 'BONIFICACION_ESPECIAL',
    nombre: 'Bonificación Especial',
    descripcion: 'Bonificación manual por decisión administrativa',
    categoria: CategoriaItem.BONIFICACION,
    esCalculado: false,  // Manual
    formula: null,
    activo: true,
    orden: 40,
    configurable: true
  }
];

async function seedTiposItems() {
  console.log('🌱 Iniciando seed de tipos de ítems...\n');

  try {
    let creados = 0;
    let actualizados = 0;

    for (const tipo of tiposItemsDefault) {
      const existente = await prisma.tipoItemCuota.findUnique({
        where: { codigo: tipo.codigo }
      });

      if (existente) {
        await prisma.tipoItemCuota.update({
          where: { codigo: tipo.codigo },
          data: tipo
        });
        actualizados++;
        console.log(`   ♻️  ${tipo.codigo} actualizado`);
      } else {
        await prisma.tipoItemCuota.create({
          data: tipo
        });
        creados++;
        console.log(`   ✅ ${tipo.codigo} creado`);
      }
    }

    console.log(`\n📊 RESUMEN:`);
    console.log(`   - Tipos creados: ${creados}`);
    console.log(`   - Tipos actualizados: ${actualizados}`);
    console.log(`   - Total: ${tiposItemsDefault.length}`);
    console.log(`\n✅ Seed de tipos de ítems completado`);

  } catch (error) {
    console.error('❌ Error en seed de tipos de ítems:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar si es el script principal
if (require.main === module) {
  seedTiposItems()
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { seedTiposItems };
```

---

## Flujo de Migración de Datos Legacy

### Estrategia de Migración

**Objetivo**: Convertir cuotas existentes con `montoBase` y `montoActividades` a sistema de ítems.

**Script**: `scripts/migrate-cuotas-to-items.ts`

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateCuotasToItems() {
  console.log('🔄 Iniciando migración de cuotas legacy a sistema de ítems...\n');

  try {
    // 1. Obtener cuotas que aún usan campos legacy
    const cuotasLegacy = await prisma.cuota.findMany({
      where: {
        OR: [
          { montoBase: { not: null } },
          { montoActividades: { not: null } }
        ],
        items: {
          none: {}  // No tienen ítems todavía
        }
      },
      include: {
        categoria: true
      }
    });

    console.log(`📋 Encontradas ${cuotasLegacy.length} cuotas para migrar\n`);

    // 2. Obtener tipos de ítems necesarios
    const tipoCuotaBase = await prisma.tipoItemCuota.findUnique({
      where: { codigo: 'CUOTA_BASE_SOCIO' }
    });
    const tipoActividad = await prisma.tipoItemCuota.findUnique({
      where: { codigo: 'ACTIVIDAD_INDIVIDUAL' }
    });

    if (!tipoCuotaBase || !tipoActividad) {
      throw new Error('Tipos de ítems no encontrados. Ejecute seed primero.');
    }

    let migradas = 0;
    let errores = 0;

    // 3. Migrar cada cuota
    for (const cuota of cuotasLegacy) {
      try {
        await prisma.$transaction(async (tx) => {
          const itemsToCreate = [];

          // 3.1. Crear ítem de cuota base
          if (cuota.montoBase && cuota.montoBase > 0) {
            itemsToCreate.push({
              cuotaId: cuota.id,
              tipoItemId: tipoCuotaBase.id,
              concepto: `Cuota Base - ${cuota.categoria?.nombre || 'Socio'}`,
              monto: cuota.montoBase,
              cantidad: 1,
              esAutomatico: true,
              esEditable: false
            });
          }

          // 3.2. Crear ítem de actividades
          if (cuota.montoActividades && cuota.montoActividades > 0) {
            itemsToCreate.push({
              cuotaId: cuota.id,
              tipoItemId: tipoActividad.id,
              concepto: 'Actividades (migrado de monto_actividades)',
              monto: cuota.montoActividades,
              cantidad: 1,
              esAutomatico: true,
              esEditable: false,
              observaciones: 'Migrado automáticamente desde campo legacy'
            });
          }

          // 3.3. Crear ítems en batch
          if (itemsToCreate.length > 0) {
            await tx.itemCuota.createMany({
              data: itemsToCreate
            });
          }

          // 3.4. Nullificar campos legacy
          await tx.cuota.update({
            where: { id: cuota.id },
            data: {
              montoBase: null,
              montoActividades: null
            }
          });
        });

        migradas++;
        if (migradas % 50 === 0) {
          console.log(`   ⏳ ${migradas}/${cuotasLegacy.length} migradas...`);
        }

      } catch (error) {
        console.error(`   ❌ Error migrando cuota ID ${cuota.id}:`, error);
        errores++;
      }
    }

    console.log(`\n📊 RESUMEN DE MIGRACIÓN:`);
    console.log(`   - Cuotas migradas: ${migradas}`);
    console.log(`   - Errores: ${errores}`);
    console.log(`\n✅ Migración completada`);

  } catch (error) {
    console.error('❌ Error en migración:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar si es el script principal
if (require.main === module) {
  migrateCuotasToItems()
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { migrateCuotasToItems };
```

---

## Implementación de Capas

### Repository Layer

**Archivo**: `src/repositories/item-cuota.repository.ts`

```typescript
import { PrismaClient, Prisma } from '@prisma/client';
import { prisma } from '@/config/database';

export class ItemCuotaRepository {
  /**
   * Buscar ítems por ID de cuota
   */
  async findByCuotaId(cuotaId: number) {
    return await prisma.itemCuota.findMany({
      where: { cuotaId },
      include: {
        tipoItem: true
      },
      orderBy: [
        { tipoItem: { orden: 'asc' } },
        { createdAt: 'asc' }
      ]
    });
  }

  /**
   * Crear ítems en batch
   */
  async createMany(items: Prisma.ItemCuotaCreateManyInput[]) {
    return await prisma.itemCuota.createMany({
      data: items,
      skipDuplicates: false
    });
  }

  /**
   * Actualizar ítem individual
   */
  async update(id: number, data: Prisma.ItemCuotaUpdateInput) {
    return await prisma.itemCuota.update({
      where: { id },
      data,
      include: {
        tipoItem: true,
        cuota: true
      }
    });
  }

  /**
   * Eliminar ítems de una cuota
   */
  async deleteByCuotaId(cuotaId: number) {
    return await prisma.itemCuota.deleteMany({
      where: { cuotaId }
    });
  }

  /**
   * Obtener resumen de ítems por categoría
   */
  async getSummaryByCuotaId(cuotaId: number) {
    const items = await this.findByCuotaId(cuotaId);

    const summary = {
      base: 0,
      actividades: 0,
      descuentos: 0,
      recargos: 0,
      bonificaciones: 0,
      otros: 0,
      total: 0
    };

    for (const item of items) {
      const monto = Number(item.monto);
      summary.total += monto;

      switch (item.tipoItem.categoria) {
        case 'BASE':
          summary.base += monto;
          break;
        case 'ACTIVIDAD':
          summary.actividades += monto;
          break;
        case 'DESCUENTO':
          summary.descuentos += monto;
          break;
        case 'RECARGO':
          summary.recargos += monto;
          break;
        case 'BONIFICACION':
          summary.bonificaciones += monto;
          break;
        case 'OTRO':
          summary.otros += monto;
          break;
      }
    }

    return summary;
  }
}
```

### Service Layer

**Archivo**: `src/services/item-cuota.service.ts`

```typescript
import { ItemCuotaRepository } from '@/repositories/item-cuota.repository';
import { TipoItemCuotaRepository } from '@/repositories/tipo-item-cuota.repository';
import { AppError } from '@/middleware/error.middleware';

export class ItemCuotaService {
  private repository: ItemCuotaRepository;
  private tipoRepository: TipoItemCuotaRepository;

  constructor() {
    this.repository = new ItemCuotaRepository();
    this.tipoRepository = new TipoItemCuotaRepository();
  }

  /**
   * Obtener ítems de una cuota con resumen
   */
  async getItemsByCuotaId(cuotaId: number) {
    const items = await this.repository.findByCuotaId(cuotaId);
    const summary = await this.repository.getSummaryByCuotaId(cuotaId);

    return {
      items,
      summary
    };
  }

  /**
   * Agregar ítem manual a una cuota existente
   */
  async addManualItem(data: {
    cuotaId: number;
    tipoItemCodigo: string;
    monto: number;
    concepto?: string;
    cantidad?: number;
    observaciones?: string;
  }) {
    // 1. Validar tipo de ítem
    const tipoItem = await this.tipoRepository.findByCodigo(data.tipoItemCodigo);
    if (!tipoItem) {
      throw new AppError('Tipo de ítem no encontrado', 404);
    }

    if (!tipoItem.activo) {
      throw new AppError('Tipo de ítem inactivo', 400);
    }

    // 2. Crear ítem
    const item = await this.repository.create({
      cuotaId: data.cuotaId,
      tipoItemId: tipoItem.id,
      concepto: data.concepto || tipoItem.nombre,
      monto: data.monto,
      cantidad: data.cantidad || 1,
      esAutomatico: false,
      esEditable: true,
      observaciones: data.observaciones
    });

    return item;
  }

  /**
   * Actualizar ítem editable
   */
  async updateItem(itemId: number, data: {
    monto?: number;
    cantidad?: number;
    concepto?: string;
    observaciones?: string;
  }) {
    // 1. Verificar que el ítem existe y es editable
    const item = await this.repository.findById(itemId);
    if (!item) {
      throw new AppError('Ítem no encontrado', 404);
    }

    if (!item.esEditable) {
      throw new AppError('Este ítem no es editable', 403);
    }

    // 2. Actualizar
    const updated = await this.repository.update(itemId, data);
    return updated;
  }

  /**
   * Eliminar ítem editable
   */
  async deleteItem(itemId: number) {
    const item = await this.repository.findById(itemId);
    if (!item) {
      throw new AppError('Ítem no encontrado', 404);
    }

    if (!item.esEditable) {
      throw new AppError('Este ítem no puede ser eliminado', 403);
    }

    await this.repository.delete(itemId);
    return { success: true };
  }
}
```

### Controller Layer

**Archivo**: `src/controllers/item-cuota.controller.ts`

```typescript
import { Request, Response, NextFunction } from 'express';
import { ItemCuotaService } from '@/services/item-cuota.service';

export class ItemCuotaController {
  private service: ItemCuotaService;

  constructor() {
    this.service = new ItemCuotaService();
  }

  /**
   * GET /api/cuotas/:cuotaId/items
   * Obtener ítems de una cuota
   */
  getItemsByCuota = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const cuotaId = parseInt(req.params.cuotaId);
      const result = await this.service.getItemsByCuotaId(cuotaId);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/cuotas/:cuotaId/items
   * Agregar ítem manual a una cuota
   */
  addItem = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const cuotaId = parseInt(req.params.cuotaId);
      const item = await this.service.addManualItem({
        cuotaId,
        ...req.body
      });

      res.status(201).json({
        success: true,
        data: item
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /api/items/:id
   * Actualizar ítem editable
   */
  updateItem = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const itemId = parseInt(req.params.id);
      const item = await this.service.updateItem(itemId, req.body);

      res.json({
        success: true,
        data: item
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /api/items/:id
   * Eliminar ítem editable
   */
  deleteItem = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const itemId = parseInt(req.params.id);
      await this.service.deleteItem(itemId);

      res.json({
        success: true,
        message: 'Ítem eliminado correctamente'
      });
    } catch (error) {
      next(error);
    }
  };
}
```

### Routes

**Archivo**: `src/routes/item-cuota.routes.ts`

```typescript
import { Router } from 'express';
import { ItemCuotaController } from '@/controllers/item-cuota.controller';

const router = Router();
const controller = new ItemCuotaController();

// Rutas de ítems de cuota
router.get('/cuotas/:cuotaId/items', controller.getItemsByCuota);
router.post('/cuotas/:cuotaId/items', controller.addItem);
router.put('/items/:id', controller.updateItem);
router.delete('/items/:id', controller.deleteItem);

export default router;
```

---

## Tests

### Test de Integración

**Archivo**: `tests/fase2-items-integration.ts`

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testItemsSystem() {
  console.log('══════════════════════════════════════════════════════════');
  console.log('  FASE 2: TESTS DE INTEGRACIÓN - Sistema de Ítems');
  console.log('══════════════════════════════════════════════════════════\n');

  const tests = {
    passed: 0,
    failed: 0,
    results: [] as any[]
  };

  // TEST 1: Verificar tipos de ítems creados
  console.log('📋 TEST 1: Tipos de ítems predefinidos');
  console.log('─'.repeat(70));
  try {
    const tiposItems = await prisma.tipoItemCuota.findMany({
      orderBy: { orden: 'asc' }
    });

    if (tiposItems.length >= 8) {
      console.log(`   ✅ ${tiposItems.length} tipos de ítems encontrados`);
      tests.passed++;
      tests.results.push({
        name: 'TEST 1: Tipos de ítems',
        status: 'PASSED',
        details: { count: tiposItems.length }
      });
    } else {
      throw new Error(`Solo ${tiposItems.length} tipos encontrados, esperados >= 8`);
    }
  } catch (error: any) {
    console.log(`   ❌ Error: ${error.message}`);
    tests.failed++;
    tests.results.push({
      name: 'TEST 1: Tipos de ítems',
      status: 'FAILED',
      error: error.message
    });
  }

  // TEST 2: Crear cuota con ítems
  console.log('\n📋 TEST 2: Crear cuota con sistema de ítems');
  console.log('─'.repeat(70));
  try {
    // Obtener socio de prueba
    const socio = await prisma.persona.findFirst({
      include: {
        personaTipos: {
          where: { activo: true },
          include: { categoria: true }
        }
      }
    });

    if (!socio) {
      throw new Error('No hay socios de prueba');
    }

    // Crear recibo
    const recibo = await prisma.recibo.create({
      data: {
        socioId: socio.id,
        mes: 12,
        anio: 2025,
        tipoRecibo: 'CUOTA',
        estado: 'PENDIENTE'
      }
    });

    // Crear cuota
    const cuota = await prisma.cuota.create({
      data: {
        categoriaId: socio.personaTipos[0].categoriaId!,
        socioId: socio.id,
        reciboId: recibo.id,
        mes: 12,
        anio: 2025,
        montoTotal: 0  // Se calculará con ítems
      }
    });

    // Obtener tipos de ítems
    const tipoCuotaBase = await prisma.tipoItemCuota.findUnique({
      where: { codigo: 'CUOTA_BASE_SOCIO' }
    });

    // Crear ítems
    await prisma.itemCuota.createMany({
      data: [
        {
          cuotaId: cuota.id,
          tipoItemId: tipoCuotaBase!.id,
          concepto: 'Cuota Base Socio',
          monto: 50.00,
          cantidad: 1,
          esAutomatico: true
        }
      ]
    });

    // Verificar ítems creados
    const items = await prisma.itemCuota.findMany({
      where: { cuotaId: cuota.id },
      include: { tipoItem: true }
    });

    if (items.length > 0) {
      console.log(`   ✅ Cuota creada con ${items.length} ítem(s)`);
      tests.passed++;
      tests.results.push({
        name: 'TEST 2: Crear cuota con ítems',
        status: 'PASSED',
        details: { cuotaId: cuota.id, itemsCount: items.length }
      });
    } else {
      throw new Error('No se crearon ítems');
    }

    // Limpiar
    await prisma.cuota.delete({ where: { id: cuota.id } });
    await prisma.recibo.delete({ where: { id: recibo.id } });

  } catch (error: any) {
    console.log(`   ❌ Error: ${error.message}`);
    tests.failed++;
    tests.results.push({
      name: 'TEST 2: Crear cuota con ítems',
      status: 'FAILED',
      error: error.message
    });
  }

  // Resumen
  console.log('\n' + '═'.repeat(70));
  console.log('  RESUMEN DE TESTS');
  console.log('═'.repeat(70));
  tests.results.forEach(test => {
    const icon = test.status === 'PASSED' ? '✅' : '❌';
    console.log(`${icon} ${test.name}`);
    if (test.error) {
      console.log(`   Error: ${test.error}`);
    }
  });
  console.log('─'.repeat(70));
  console.log(`Total: ${tests.passed + tests.failed} tests`);
  console.log(`Exitosos: ${tests.passed} ✅`);
  console.log(`Fallidos: ${tests.failed} ❌`);
  console.log('─'.repeat(70));

  if (tests.failed > 0) {
    console.log('\n⚠️  ALGUNOS TESTS FALLARON');
    process.exit(1);
  } else {
    console.log('\n🎉 TODOS LOS TESTS PASARON - FASE 2 EN PROGRESO');
  }
}

testItemsSystem()
  .catch((error) => {
    console.error('Error ejecutando tests:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

---

## Checklist de Tareas

### Task 2.1: Schema Prisma ✅

- [x] Definir enum `CategoriaItem`
- [x] Crear modelo `TipoItemCuota`
- [x] Crear modelo `ItemCuota`
- [x] Modificar modelo `Cuota` (agregar relación `items`)
- [ ] Generar Prisma Client (`npx prisma generate`)

### Task 2.2: Migration

- [ ] Crear migration (`npx prisma migrate dev --name add_items_cuota_system`)
- [ ] Verificar migration aplicada correctamente
- [ ] Crear script de rollback (`scripts/rollback-items-cuota-system.sql`)
- [ ] Probar rollback en DB de testing

### Task 2.3: Seed de Tipos de Ítems

- [ ] Crear script `prisma/seed-tipos-items.ts`
- [ ] Definir 8 tipos predefinidos
- [ ] Ejecutar seed (`npx tsx prisma/seed-tipos-items.ts`)
- [ ] Verificar tipos creados en DB

### Task 2.4: Migración de Datos Legacy ✅ COMPLETADA (2025-12-17)

- [x] Crear script `scripts/migrate-cuotas-to-items.ts`
- [x] Crear script `scripts/validate-migration-cuotas-items.ts`
- [x] Crear script `scripts/rollback-migration-cuotas-items.ts`
- [x] Crear migración de schema para hacer campos legacy nullable
- [x] Ejecutar dry-run de migración
- [x] Ejecutar migración real en DB
- [x] Validar migración correcta
- [x] Documentar proceso

**Resultados de Migración** (2025-12-17):
- **Cuotas migradas**: 12/12 (100% éxito)
- **Ítems creados**: 12 (todos con `tipoItemId: CUOTA_BASE_SOCIO`)
- **Validación**: ✅ Todas las validaciones pasaron
  - No hay cuotas legacy pendientes
  - Integridad de montos correcta (montoTotal = suma de ítems)
  - No hay ítems huérfanos
  - Todos los ítems tienen tipo válido
- **Metadata**: Cada ítem migrado incluye `metadata.migratedFrom` para rastreabilidad
- **Rollback**: Script de rollback disponible para emergencias

### Task 2.5: Repository Layer

- [ ] Crear `src/repositories/item-cuota.repository.ts`
- [ ] Crear `src/repositories/tipo-item-cuota.repository.ts`
- [ ] Implementar métodos CRUD
- [ ] Implementar método `getSummaryByCuotaId`

### Task 2.6: Service Layer

- [ ] Crear `src/services/item-cuota.service.ts`
- [ ] Implementar `getItemsByCuotaId`
- [ ] Implementar `addManualItem`
- [ ] Implementar `updateItem`
- [ ] Implementar `deleteItem`
- [ ] Agregar validaciones de negocio

### Task 2.7: Controller y Routes

- [ ] Crear `src/controllers/item-cuota.controller.ts`
- [ ] Crear `src/routes/item-cuota.routes.ts`
- [ ] Registrar rutas en `src/routes/index.ts`
- [ ] Probar endpoints con REST client

### Task 2.8: Tests de Integración

- [ ] Crear `tests/fase2-items-integration.ts`
- [ ] Implementar tests de creación de ítems
- [ ] Implementar tests de actualización
- [ ] Implementar tests de eliminación
- [ ] Ejecutar y validar tests

### Task 2.9: Documentación

- [x] Crear `docs/FASE2_DISEÑO_ITEMS.md`
- [ ] Documentar endpoints en `tests/*.http`
- [ ] Actualizar `PROGRESS_CHECKLIST.md`
- [ ] Commit de cambios

---

## Próximos Pasos (Fase 3)

Una vez completada Fase 2, se iniciará **Fase 3: Motor de Reglas de Descuentos**, que incluye:

1. Tabla `reglas_descuento` con condiciones configurables
2. Motor de evaluación de reglas
3. 4 modos de aplicación de descuentos (acumulativo, exclusivo, máximo, personalizado)
4. Integración con generación automática de cuotas

---

**Documento creado**: 2025-12-13
**Última actualización**: 2025-12-17 (Task 2.4 completada)
**Autor**: Claude Code
**Versión**: 1.1
