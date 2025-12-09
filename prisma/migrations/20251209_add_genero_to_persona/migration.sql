-- ============================================================================
-- Migration: Add genero field to personas table
-- Date: 2025-12-09
-- Description: Adds Genero enum and genero column to support gender-aware
--              bidirectional family relationships (PADRE/MADRE -> HIJO/HIJA)
-- ============================================================================

-- Step 1: Create Genero enum type
CREATE TYPE "Genero" AS ENUM (
  'MASCULINO',
  'FEMENINO',
  'NO_BINARIO',
  'PREFIERO_NO_DECIR'
);

-- Step 2: Add genero column to personas table (nullable for backwards compatibility)
ALTER TABLE "personas"
ADD COLUMN "genero" "Genero";

-- Step 3: Create index on genero field for efficient queries
CREATE INDEX "personas_genero_idx" ON "personas"("genero");

-- Step 4: Add column comment for documentation
COMMENT ON COLUMN "personas"."genero" IS
  'Género de la persona. Usado para determinar relaciones familiares asimétricas (ej: PADRE->HIJO/HIJA según género del hijo). Opcional para mantener retrocompatibilidad.';

-- Step 5: Verification query (commented out - for manual testing)
-- SELECT
--   COUNT(*) as total_personas,
--   COUNT(genero) as personas_con_genero,
--   COUNT(*) - COUNT(genero) as personas_sin_genero
-- FROM personas;

-- Note: Existing personas will have genero = NULL
-- Frontend and services will use masculine form (HIJO, HERMANO) as default when genero is NULL
