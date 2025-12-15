-- ══════════════════════════════════════════════════════════════════════
-- ROLLBACK: FASE 4 Ajustes Manuales y Historial
-- Migration: 20251214_fase4_ajustes_manuales_historial
-- ══════════════════════════════════════════════════════════════════════

-- Step 1: Drop trigger
DROP TRIGGER IF EXISTS ajustes_cuota_socio_updated_at_trigger ON "ajustes_cuota_socio";
DROP FUNCTION IF EXISTS update_ajustes_cuota_socio_updated_at();

-- Step 2: Drop indexes for historial_ajustes_cuota
DROP INDEX IF EXISTS "historial_ajustes_cuota_created_at_idx";
DROP INDEX IF EXISTS "historial_ajustes_cuota_accion_idx";
DROP INDEX IF EXISTS "historial_ajustes_cuota_persona_id_idx";
DROP INDEX IF EXISTS "historial_ajustes_cuota_cuota_id_idx";
DROP INDEX IF EXISTS "historial_ajustes_cuota_ajuste_id_idx";

-- Step 3: Drop indexes for ajustes_cuota_socio
DROP INDEX IF EXISTS "ajustes_cuota_socio_fecha_inicio_fecha_fin_idx";
DROP INDEX IF EXISTS "ajustes_cuota_socio_activo_idx";
DROP INDEX IF EXISTS "ajustes_cuota_socio_persona_id_idx";

-- Step 4: Drop foreign keys for historial_ajustes_cuota
ALTER TABLE "historial_ajustes_cuota" DROP CONSTRAINT IF EXISTS "historial_ajustes_cuota_persona_id_fkey";
ALTER TABLE "historial_ajustes_cuota" DROP CONSTRAINT IF EXISTS "historial_ajustes_cuota_cuota_id_fkey";
ALTER TABLE "historial_ajustes_cuota" DROP CONSTRAINT IF EXISTS "historial_ajustes_cuota_ajuste_id_fkey";

-- Step 5: Drop foreign keys for ajustes_cuota_socio
ALTER TABLE "ajustes_cuota_socio" DROP CONSTRAINT IF EXISTS "ajustes_cuota_socio_persona_id_fkey";

-- Step 6: Drop tables
DROP TABLE IF EXISTS "historial_ajustes_cuota";
DROP TABLE IF EXISTS "ajustes_cuota_socio";

-- Step 7: Drop ENUMs
DROP TYPE IF EXISTS "AccionHistorialCuota";
DROP TYPE IF EXISTS "ScopeAjusteCuota";
DROP TYPE IF EXISTS "TipoAjusteCuota";

-- Rollback completed successfully!
