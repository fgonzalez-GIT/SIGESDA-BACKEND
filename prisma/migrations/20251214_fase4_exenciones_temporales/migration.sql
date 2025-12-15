-- ══════════════════════════════════════════════════════════════════════
-- FASE 4: Task 4.2 - Exenciones Temporales
-- Migration: 20251214_fase4_exenciones_temporales
-- Created: 2025-12-14
-- ══════════════════════════════════════════════════════════════════════

-- Step 1: Update AccionHistorialCuota ENUM (add exencion actions)
ALTER TYPE "AccionHistorialCuota" ADD VALUE 'CREAR_EXENCION';
ALTER TYPE "AccionHistorialCuota" ADD VALUE 'MODIFICAR_EXENCION';
ALTER TYPE "AccionHistorialCuota" ADD VALUE 'ELIMINAR_EXENCION';
ALTER TYPE "AccionHistorialCuota" ADD VALUE 'APLICAR_EXENCION';

-- Step 2: Create ENUMS for exenciones
CREATE TYPE "TipoExencion" AS ENUM (
  'TOTAL',
  'PARCIAL'
);

CREATE TYPE "MotivoExencion" AS ENUM (
  'BECA',
  'SOCIO_FUNDADOR',
  'SOCIO_HONORARIO',
  'SITUACION_ECONOMICA',
  'SITUACION_SALUD',
  'INTERCAMBIO_SERVICIOS',
  'PROMOCION',
  'FAMILIAR_DOCENTE',
  'OTRO'
);

CREATE TYPE "EstadoExencion" AS ENUM (
  'PENDIENTE_APROBACION',
  'APROBADA',
  'RECHAZADA',
  'VIGENTE',
  'VENCIDA',
  'REVOCADA'
);

-- Step 3: Create exenciones_cuota table
CREATE TABLE "exenciones_cuota" (
  "id" SERIAL PRIMARY KEY,
  "persona_id" INTEGER NOT NULL,
  "tipo_exencion" "TipoExencion" NOT NULL,
  "motivo_exencion" "MotivoExencion" NOT NULL,
  "estado" "EstadoExencion" NOT NULL DEFAULT 'PENDIENTE_APROBACION',
  "porcentaje_exencion" DECIMAL(5,2) NOT NULL DEFAULT 100.00,
  "fecha_inicio" TIMESTAMP(3) NOT NULL,
  "fecha_fin" TIMESTAMP(3),
  "descripcion" VARCHAR(500) NOT NULL,
  "justificacion" TEXT,
  "documentacion_adjunta" VARCHAR(255),
  "solicitado_por" VARCHAR(100),
  "fecha_solicitud" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "aprobado_por" VARCHAR(100),
  "fecha_aprobacion" TIMESTAMP(3),
  "observaciones" TEXT,
  "activa" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Step 4: Add Foreign Key to personas
ALTER TABLE "exenciones_cuota"
  ADD CONSTRAINT "exenciones_cuota_persona_id_fkey"
  FOREIGN KEY ("persona_id")
  REFERENCES "personas"("id")
  ON DELETE CASCADE
  ON UPDATE CASCADE;

-- Step 5: Add exencion_id column to historial_ajustes_cuota
ALTER TABLE "historial_ajustes_cuota"
  ADD COLUMN "exencion_id" INTEGER;

-- Step 6: Add Foreign Key for exencion in historial
ALTER TABLE "historial_ajustes_cuota"
  ADD CONSTRAINT "historial_ajustes_cuota_exencion_id_fkey"
  FOREIGN KEY ("exencion_id")
  REFERENCES "exenciones_cuota"("id")
  ON DELETE CASCADE
  ON UPDATE CASCADE;

-- Step 7: Create Indexes for exenciones_cuota
CREATE INDEX "exenciones_cuota_persona_id_idx" ON "exenciones_cuota"("persona_id");
CREATE INDEX "exenciones_cuota_estado_idx" ON "exenciones_cuota"("estado");
CREATE INDEX "exenciones_cuota_activa_idx" ON "exenciones_cuota"("activa");
CREATE INDEX "exenciones_cuota_fecha_inicio_fecha_fin_idx" ON "exenciones_cuota"("fecha_inicio", "fecha_fin");
CREATE INDEX "exenciones_cuota_motivo_exencion_idx" ON "exenciones_cuota"("motivo_exencion");

-- Step 8: Create Index for exencion_id in historial
CREATE INDEX "historial_ajustes_cuota_exencion_id_idx" ON "historial_ajustes_cuota"("exencion_id");

-- Step 9: Create trigger for updated_at on exenciones_cuota
CREATE OR REPLACE FUNCTION update_exenciones_cuota_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER exenciones_cuota_updated_at_trigger
BEFORE UPDATE ON "exenciones_cuota"
FOR EACH ROW
EXECUTE FUNCTION update_exenciones_cuota_updated_at();

-- Migration completed successfully!
-- Total: 4 ENUM values added, 3 new ENUMs, 1 table, 1 column added, 2 foreign keys, 6 indexes, 1 trigger
