-- ══════════════════════════════════════════════════════════════════════
-- FASE 3: Motor de Reglas de Descuentos
-- Migration: 20251223_add_fase3_motor_descuentos
-- Created: 2025-12-23
-- Description: Crea las 3 tablas del sistema de descuentos que faltaban
-- ══════════════════════════════════════════════════════════════════════

-- ──────────────────────────────────────────────────────────────────────
-- PASO 1: Crear ENUM ModoAplicacionDescuento
-- ──────────────────────────────────────────────────────────────────────

CREATE TYPE "ModoAplicacionDescuento" AS ENUM (
  'ACUMULATIVO',
  'EXCLUSIVO',
  'MAXIMO',
  'PERSONALIZADO'
);

-- ──────────────────────────────────────────────────────────────────────
-- PASO 2: Crear tabla reglas_descuentos
-- ──────────────────────────────────────────────────────────────────────

CREATE TABLE "reglas_descuentos" (
  "id"                      SERIAL PRIMARY KEY,
  "codigo"                  VARCHAR(100) UNIQUE NOT NULL,
  "nombre"                  VARCHAR(200) NOT NULL,
  "descripcion"             TEXT,
  "prioridad"               INTEGER NOT NULL DEFAULT 0,
  "modo_aplicacion"         "ModoAplicacionDescuento" NOT NULL,
  "max_descuento"           DECIMAL(5,2),
  "condiciones"             JSONB NOT NULL,
  "formula"                 JSONB NOT NULL,
  "activa"                  BOOLEAN NOT NULL DEFAULT true,
  "aplicar_a_base"          BOOLEAN NOT NULL DEFAULT true,
  "aplicar_a_actividades"   BOOLEAN NOT NULL DEFAULT true,
  "created_at"              TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at"              TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "reglas_descuentos_codigo_idx" ON "reglas_descuentos"("codigo");
CREATE INDEX "reglas_descuentos_prioridad_idx" ON "reglas_descuentos"("prioridad");
CREATE INDEX "reglas_descuentos_activa_idx" ON "reglas_descuentos"("activa");

-- ──────────────────────────────────────────────────────────────────────
-- PASO 3: Crear tabla configuracion_descuentos
-- ──────────────────────────────────────────────────────────────────────

CREATE TABLE "configuracion_descuentos" (
  "id"                                SERIAL PRIMARY KEY,
  "limite_descuento_total"            DECIMAL(5,2) NOT NULL DEFAULT 80.00,
  "aplicar_descuentos_a_base"         BOOLEAN NOT NULL DEFAULT true,
  "aplicar_descuentos_a_actividades"  BOOLEAN NOT NULL DEFAULT true,
  "prioridad_reglas"                  JSONB NOT NULL DEFAULT '[]',
  "activa"                            BOOLEAN NOT NULL DEFAULT true,
  "created_at"                        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at"                        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ──────────────────────────────────────────────────────────────────────
-- PASO 4: Crear tabla aplicaciones_reglas
-- ──────────────────────────────────────────────────────────────────────

CREATE TABLE "aplicaciones_reglas" (
  "id"                  SERIAL PRIMARY KEY,
  "cuota_id"            INTEGER NOT NULL,
  "regla_id"            INTEGER NOT NULL,
  "item_cuota_id"       INTEGER,
  "porcentaje_aplicado" DECIMAL(5,2) NOT NULL,
  "monto_descuento"     DECIMAL(10,2) NOT NULL,
  "metadata"            JSONB,
  "created_at"          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "aplicaciones_reglas_cuota_id_fkey"
    FOREIGN KEY ("cuota_id") REFERENCES "cuotas"("id")
    ON DELETE CASCADE ON UPDATE CASCADE,

  CONSTRAINT "aplicaciones_reglas_regla_id_fkey"
    FOREIGN KEY ("regla_id") REFERENCES "reglas_descuentos"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE,

  CONSTRAINT "aplicaciones_reglas_item_cuota_id_fkey"
    FOREIGN KEY ("item_cuota_id") REFERENCES "items_cuota"("id")
    ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "aplicaciones_reglas_cuota_id_idx" ON "aplicaciones_reglas"("cuota_id");
CREATE INDEX "aplicaciones_reglas_regla_id_idx" ON "aplicaciones_reglas"("regla_id");
CREATE INDEX "aplicaciones_reglas_item_cuota_id_idx" ON "aplicaciones_reglas"("item_cuota_id");

-- ──────────────────────────────────────────────────────────────────────
-- PASO 5: Crear triggers para updated_at
-- ──────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_reglas_descuentos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER reglas_descuentos_updated_at_trigger
BEFORE UPDATE ON "reglas_descuentos"
FOR EACH ROW
EXECUTE FUNCTION update_reglas_descuentos_updated_at();

CREATE OR REPLACE FUNCTION update_configuracion_descuentos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER configuracion_descuentos_updated_at_trigger
BEFORE UPDATE ON "configuracion_descuentos"
FOR EACH ROW
EXECUTE FUNCTION update_configuracion_descuentos_updated_at();

-- ──────────────────────────────────────────────────────────────────────
-- PASO 6: Verificaciones finales
-- ──────────────────────────────────────────────────────────────────────

DO $$
BEGIN
  -- Verificar ENUM
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ModoAplicacionDescuento') THEN
    RAISE EXCEPTION 'ENUM ModoAplicacionDescuento no fue creado';
  END IF;

  -- Verificar tablas
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'reglas_descuentos') THEN
    RAISE EXCEPTION 'Tabla reglas_descuentos no fue creada';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'configuracion_descuentos') THEN
    RAISE EXCEPTION 'Tabla configuracion_descuentos no fue creada';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'aplicaciones_reglas') THEN
    RAISE EXCEPTION 'Tabla aplicaciones_reglas no fue creada';
  END IF;

  -- Verificar foreign keys
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'aplicaciones_reglas_cuota_id_fkey'
  ) THEN
    RAISE EXCEPTION 'Foreign key aplicaciones_reglas -> cuotas no fue creada';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'aplicaciones_reglas_regla_id_fkey'
  ) THEN
    RAISE EXCEPTION 'Foreign key aplicaciones_reglas -> reglas_descuentos no fue creada';
  END IF;

  RAISE NOTICE '✅ FASE 3: Motor de Reglas de Descuentos - 3 tablas creadas exitosamente';
  RAISE NOTICE '   - reglas_descuentos';
  RAISE NOTICE '   - configuracion_descuentos';
  RAISE NOTICE '   - aplicaciones_reglas';
END $$;

-- ══════════════════════════════════════════════════════════════════════
-- Migration completed successfully!
-- Total: 1 ENUM, 3 tables, 3 foreign keys, 6 indexes, 2 triggers
-- ══════════════════════════════════════════════════════════════════════
