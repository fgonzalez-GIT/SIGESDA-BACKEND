-- Migration: Add activo field and remove tipo field from personas table
-- Date: 2025-11-20
-- Description: Implements Option A - Replace legacy 'tipo' field with 'activo' boolean for soft delete

-- Step 1: Add activo column with default value TRUE
ALTER TABLE "personas"
ADD COLUMN "activo" BOOLEAN NOT NULL DEFAULT true;

-- Step 2: Create index on activo for efficient queries
CREATE INDEX "personas_activo_idx" ON "personas"("activo");

-- Step 3: Sync activo with existing fechaBaja data
-- If person has fechaBaja set, mark as inactive
UPDATE "personas"
SET "activo" = false
WHERE "fechaBaja" IS NOT NULL;

-- Step 4: Drop the legacy tipo column (currently always NULL)
ALTER TABLE "personas"
DROP COLUMN IF EXISTS "tipo";

-- Note: The TipoPersona enum will be kept temporarily for backwards compatibility
-- It will be removed in a future migration after all code references are updated
