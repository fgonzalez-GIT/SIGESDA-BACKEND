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
-- PASO 4: Marcar campos legacy como opcionales (nullable)
-- ──────────────────────────────────────────────────────────────────────
-- NOTA: Los campos montoBase y montoActividades ya existen en la tabla cuotas
-- Prisma los marca como opcionales (?) en el schema, pero NO modificamos la DB
-- para mantener compatibilidad con datos existentes

-- ──────────────────────────────────────────────────────────────────────
-- PASO 5: Verificaciones finales
-- ──────────────────────────────────────────────────────────────────────

DO $$
BEGIN
  -- Verificar que las tablas existan
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'categorias_items') THEN
    RAISE EXCEPTION 'Tabla categorias_items no fue creada';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tipos_items_cuota') THEN
    RAISE EXCEPTION 'Tabla tipos_items_cuota no fue creada';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'items_cuota') THEN
    RAISE EXCEPTION 'Tabla items_cuota no fue creada';
  END IF;

  RAISE NOTICE '✅ FASE 2: Sistema de Ítems de Cuota - 3 tablas creadas exitosamente';
END $$;
