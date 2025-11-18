-- ============================================================================
-- FIX horarios_actividades COLUMNS
-- ============================================================================
-- Problem: Table has camelCase actividadId but we need snake_case actividad_id
-- to match the Prisma schema and other tables

BEGIN;

-- Step 1: Add new snake_case column
ALTER TABLE horarios_actividades
  ADD COLUMN IF NOT EXISTS actividad_id INT;

-- Step 2: Copy data from camelCase to snake_case
UPDATE horarios_actividades
SET actividad_id = "actividadId"
WHERE actividad_id IS NULL;

-- Step 3: Add foreign key constraint
ALTER TABLE horarios_actividades
  DROP CONSTRAINT IF EXISTS horarios_actividades_actividad_id_fkey;

ALTER TABLE horarios_actividades
  ADD CONSTRAINT horarios_actividades_actividad_id_fkey
  FOREIGN KEY (actividad_id) REFERENCES actividades(id) ON DELETE CASCADE;

-- Step 4: Drop old camelCase column
ALTER TABLE horarios_actividades
  DROP COLUMN IF EXISTS "actividadId";

-- Step 5: Add NOT NULL constraint (after data migration)
ALTER TABLE horarios_actividades
  ALTER COLUMN actividad_id SET NOT NULL;

-- Step 6: Add snake_case hora columns
ALTER TABLE horarios_actividades
  ADD COLUMN IF NOT EXISTS hora_inicio TEXT;

ALTER TABLE horarios_actividades
  ADD COLUMN IF NOT EXISTS hora_fin TEXT;

-- Step 7: Migrate data
UPDATE horarios_actividades
SET hora_inicio = "horaInicio"
WHERE hora_inicio IS NULL;

UPDATE horarios_actividades
SET hora_fin = "horaFin"
WHERE hora_fin IS NULL;

-- Step 8: Drop old camelCase hora columns
ALTER TABLE horarios_actividades
  DROP COLUMN IF EXISTS "horaInicio";

ALTER TABLE horarios_actividades
  DROP COLUMN IF EXISTS "horaFin";

-- Step 9: Add NOT NULL constraints
ALTER TABLE horarios_actividades
  ALTER COLUMN hora_inicio SET NOT NULL;

ALTER TABLE horarios_actividades
  ALTER COLUMN hora_fin SET NOT NULL;

-- Step 10: Add snake_case timestamp columns
ALTER TABLE horarios_actividades
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();

ALTER TABLE horarios_actividades
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- Step 11: Migrate timestamp data
UPDATE horarios_actividades
SET created_at = "createdAt"
WHERE created_at = NOW()::DATE;

UPDATE horarios_actividades
SET updated_at = "updatedAt"
WHERE updated_at = NOW()::DATE;

-- Step 12: Drop old camelCase timestamp columns
ALTER TABLE horarios_actividades
  DROP COLUMN IF EXISTS "createdAt";

ALTER TABLE horarios_actividades
  DROP COLUMN IF EXISTS "updatedAt";

-- Step 13: Add NOT NULL constraints to timestamps
ALTER TABLE horarios_actividades
  ALTER COLUMN created_at SET NOT NULL;

ALTER TABLE horarios_actividades
  ALTER COLUMN updated_at SET NOT NULL;

-- Step 14: Drop legacy diaSemana ENUM column (if still exists)
ALTER TABLE horarios_actividades
  DROP COLUMN IF EXISTS "diaSemana";

-- Step 15: Recreate unique constraint with new column names
ALTER TABLE horarios_actividades
  DROP CONSTRAINT IF EXISTS horarios_actividades_actividadId_diaSemanaId_horaInicio_key;

ALTER TABLE horarios_actividades
  DROP CONSTRAINT IF EXISTS horarios_actividades_actividad_id_dia_semana_id_hora_inicio_key;

ALTER TABLE horarios_actividades
  ADD CONSTRAINT horarios_actividades_actividad_id_dia_semana_id_hora_inicio_key
  UNIQUE (actividad_id, dia_semana_id, hora_inicio);

COMMIT;

-- Verify
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'horarios_actividades'
AND table_schema = 'public'
ORDER BY ordinal_position;
