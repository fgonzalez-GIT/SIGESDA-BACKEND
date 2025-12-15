-- ══════════════════════════════════════════════════════════════════════
-- ROLLBACK: FASE 4 Task 4.2 - Exenciones Temporales
-- Migration: 20251214_fase4_exenciones_temporales
-- ══════════════════════════════════════════════════════════════════════

-- Step 1: Drop trigger
DROP TRIGGER IF EXISTS exenciones_cuota_updated_at_trigger ON "exenciones_cuota";
DROP FUNCTION IF EXISTS update_exenciones_cuota_updated_at();

-- Step 2: Drop index for exencion_id in historial
DROP INDEX IF EXISTS "historial_ajustes_cuota_exencion_id_idx";

-- Step 3: Drop indexes for exenciones_cuota
DROP INDEX IF EXISTS "exenciones_cuota_motivo_exencion_idx";
DROP INDEX IF EXISTS "exenciones_cuota_fecha_inicio_fecha_fin_idx";
DROP INDEX IF EXISTS "exenciones_cuota_activa_idx";
DROP INDEX IF EXISTS "exenciones_cuota_estado_idx";
DROP INDEX IF EXISTS "exenciones_cuota_persona_id_idx";

-- Step 4: Drop foreign keys
ALTER TABLE "historial_ajustes_cuota" DROP CONSTRAINT IF EXISTS "historial_ajustes_cuota_exencion_id_fkey";
ALTER TABLE "exenciones_cuota" DROP CONSTRAINT IF EXISTS "exenciones_cuota_persona_id_fkey";

-- Step 5: Drop exencion_id column from historial
ALTER TABLE "historial_ajustes_cuota" DROP COLUMN IF EXISTS "exencion_id";

-- Step 6: Drop exenciones_cuota table
DROP TABLE IF EXISTS "exenciones_cuota";

-- Step 7: Drop ENUMs
DROP TYPE IF EXISTS "EstadoExencion";
DROP TYPE IF EXISTS "MotivoExencion";
DROP TYPE IF EXISTS "TipoExencion";

-- Note: Cannot remove values from AccionHistorialCuota ENUM easily in PostgreSQL
-- If strict rollback is needed, the entire enum must be recreated without the new values
-- This requires recreating the historial_ajustes_cuota table
-- For safety, we leave the ENUM values in place (they won't cause issues)

-- WARNING: To fully remove CREAR_EXENCION, MODIFICAR_EXENCION, ELIMINAR_EXENCION, APLICAR_EXENCION
-- from AccionHistorialCuota, you would need to:
-- 1. Create new ENUM without those values
-- 2. Alter table to use new ENUM
-- 3. Drop old ENUM
-- This is complex and risky - only do if absolutely necessary

-- Rollback completed successfully!
-- Exenciones system removed, ENUM values remain for safety
