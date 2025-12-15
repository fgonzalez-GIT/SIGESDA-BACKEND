-- ══════════════════════════════════════════════════════════════════════
-- FASE 4: Funcionalidades Pendientes - Ajustes Manuales y Historial
-- Migration: 20251214_fase4_ajustes_manuales_historial
-- Created: 2025-12-14
-- ══════════════════════════════════════════════════════════════════════

-- Step 1: Create ENUMS
CREATE TYPE "TipoAjusteCuota" AS ENUM (
  'DESCUENTO_FIJO',
  'DESCUENTO_PORCENTAJE',
  'RECARGO_FIJO',
  'RECARGO_PORCENTAJE',
  'MONTO_FIJO_TOTAL'
);

CREATE TYPE "ScopeAjusteCuota" AS ENUM (
  'TODOS_ITEMS',
  'SOLO_BASE',
  'SOLO_ACTIVIDADES',
  'ITEMS_ESPECIFICOS'
);

CREATE TYPE "AccionHistorialCuota" AS ENUM (
  'CREAR_AJUSTE',
  'MODIFICAR_AJUSTE',
  'ELIMINAR_AJUSTE',
  'APLICAR_AJUSTE_MANUAL',
  'RECALCULAR_CUOTA',
  'REGENERAR_CUOTA'
);

-- Step 2: Create ajustes_cuota_socio table
CREATE TABLE "ajustes_cuota_socio" (
  "id" SERIAL PRIMARY KEY,
  "persona_id" INTEGER NOT NULL,
  "tipo_ajuste" "TipoAjusteCuota" NOT NULL,
  "valor" DECIMAL(10,2) NOT NULL,
  "concepto" VARCHAR(200) NOT NULL,
  "fecha_inicio" TIMESTAMP(3) NOT NULL,
  "fecha_fin" TIMESTAMP(3),
  "activo" BOOLEAN NOT NULL DEFAULT true,
  "motivo" TEXT,
  "observaciones" TEXT,
  "aplica_a" "ScopeAjusteCuota" NOT NULL DEFAULT 'TODOS_ITEMS',
  "items_afectados" JSONB,
  "aprobado_por" VARCHAR(100),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Step 3: Create historial_ajustes_cuota table
CREATE TABLE "historial_ajustes_cuota" (
  "id" SERIAL PRIMARY KEY,
  "ajuste_id" INTEGER,
  "cuota_id" INTEGER,
  "persona_id" INTEGER NOT NULL,
  "accion" "AccionHistorialCuota" NOT NULL,
  "datos_previos" JSONB,
  "datos_nuevos" JSONB NOT NULL,
  "usuario" VARCHAR(100),
  "motivo_cambio" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Step 4: Add Foreign Keys for ajustes_cuota_socio
ALTER TABLE "ajustes_cuota_socio"
  ADD CONSTRAINT "ajustes_cuota_socio_persona_id_fkey"
  FOREIGN KEY ("persona_id")
  REFERENCES "personas"("id")
  ON DELETE CASCADE
  ON UPDATE CASCADE;

-- Step 5: Add Foreign Keys for historial_ajustes_cuota
ALTER TABLE "historial_ajustes_cuota"
  ADD CONSTRAINT "historial_ajustes_cuota_ajuste_id_fkey"
  FOREIGN KEY ("ajuste_id")
  REFERENCES "ajustes_cuota_socio"("id")
  ON DELETE CASCADE
  ON UPDATE CASCADE;

ALTER TABLE "historial_ajustes_cuota"
  ADD CONSTRAINT "historial_ajustes_cuota_cuota_id_fkey"
  FOREIGN KEY ("cuota_id")
  REFERENCES "cuotas"("id")
  ON DELETE CASCADE
  ON UPDATE CASCADE;

ALTER TABLE "historial_ajustes_cuota"
  ADD CONSTRAINT "historial_ajustes_cuota_persona_id_fkey"
  FOREIGN KEY ("persona_id")
  REFERENCES "personas"("id")
  ON DELETE CASCADE
  ON UPDATE CASCADE;

-- Step 6: Create Indexes for ajustes_cuota_socio
CREATE INDEX "ajustes_cuota_socio_persona_id_idx" ON "ajustes_cuota_socio"("persona_id");
CREATE INDEX "ajustes_cuota_socio_activo_idx" ON "ajustes_cuota_socio"("activo");
CREATE INDEX "ajustes_cuota_socio_fecha_inicio_fecha_fin_idx" ON "ajustes_cuota_socio"("fecha_inicio", "fecha_fin");

-- Step 7: Create Indexes for historial_ajustes_cuota
CREATE INDEX "historial_ajustes_cuota_ajuste_id_idx" ON "historial_ajustes_cuota"("ajuste_id");
CREATE INDEX "historial_ajustes_cuota_cuota_id_idx" ON "historial_ajustes_cuota"("cuota_id");
CREATE INDEX "historial_ajustes_cuota_persona_id_idx" ON "historial_ajustes_cuota"("persona_id");
CREATE INDEX "historial_ajustes_cuota_accion_idx" ON "historial_ajustes_cuota"("accion");
CREATE INDEX "historial_ajustes_cuota_created_at_idx" ON "historial_ajustes_cuota"("created_at");

-- Step 8: Create trigger for updated_at on ajustes_cuota_socio
CREATE OR REPLACE FUNCTION update_ajustes_cuota_socio_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ajustes_cuota_socio_updated_at_trigger
BEFORE UPDATE ON "ajustes_cuota_socio"
FOR EACH ROW
EXECUTE FUNCTION update_ajustes_cuota_socio_updated_at();

-- Migration completed successfully!
-- Total: 3 ENUMs, 2 tables, 4 foreign keys, 8 indexes, 1 trigger
