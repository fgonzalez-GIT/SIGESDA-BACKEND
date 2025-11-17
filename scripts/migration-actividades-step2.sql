-- ============================================================================
-- MIGRACIÓN ACTIVIDADES: PASO 2 - Agregar Constraints y Eliminar Legacy
-- ============================================================================
-- PREREQUISITO: Ejecutar migrate-actividades-to-catalogos.ts primero
-- Este script hace NOT NULL las columnas nuevas y elimina las legacy

BEGIN;

-- ============================================================================
-- TABLA: actividades
-- ============================================================================

-- Hacer NOT NULL las columnas migradas
ALTER TABLE actividades
  ALTER COLUMN codigo_actividad SET NOT NULL,
  ALTER COLUMN tipo_actividad_id SET NOT NULL,
  ALTER COLUMN categoria_id SET NOT NULL,
  ALTER COLUMN estado_id SET NOT NULL,
  ALTER COLUMN fecha_desde SET NOT NULL,
  ALTER COLUMN costo SET NOT NULL;

-- Agregar constraints únicos
ALTER TABLE actividades
  ADD CONSTRAINT actividades_codigo_actividad_key UNIQUE (codigo_actividad);

-- Agregar foreign keys
ALTER TABLE actividades
  ADD CONSTRAINT actividades_tipo_actividad_id_fkey
    FOREIGN KEY (tipo_actividad_id)
    REFERENCES tipos_actividades(id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE;

ALTER TABLE actividades
  ADD CONSTRAINT actividades_categoria_id_fkey
    FOREIGN KEY (categoria_id)
    REFERENCES categorias_actividades(id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE;

ALTER TABLE actividades
  ADD CONSTRAINT actividades_estado_id_fkey
    FOREIGN KEY (estado_id)
    REFERENCES estados_actividades(id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE;

-- Agregar índices para performance
CREATE INDEX IF NOT EXISTS actividades_tipo_actividad_id_idx ON actividades(tipo_actividad_id);
CREATE INDEX IF NOT EXISTS actividades_categoria_id_idx ON actividades(categoria_id);
CREATE INDEX IF NOT EXISTS actividades_estado_id_idx ON actividades(estado_id);
CREATE INDEX IF NOT EXISTS actividades_activa_idx ON actividades(activa);
CREATE INDEX IF NOT EXISTS actividades_fecha_desde_idx ON actividades(fecha_desde);

-- Eliminar columnas legacy
ALTER TABLE actividades
  DROP COLUMN IF EXISTS tipo,
  DROP COLUMN IF EXISTS duracion,
  DROP COLUMN IF EXISTS precio;

-- ============================================================================
-- TABLA: horarios_actividades
-- ============================================================================

-- Hacer NOT NULL la columna dia_semana_id
ALTER TABLE horarios_actividades
  ALTER COLUMN dia_semana_id SET NOT NULL,
  ALTER COLUMN hora_inicio SET NOT NULL,
  ALTER COLUMN hora_fin SET NOT NULL,
  ALTER COLUMN actividad_id SET NOT NULL;

-- Agregar foreign key
ALTER TABLE horarios_actividades
  ADD CONSTRAINT horarios_actividades_dia_semana_id_fkey
    FOREIGN KEY (dia_semana_id)
    REFERENCES dias_semana(id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE;

-- Agregar constraint único (no duplicar mismo día/hora para misma actividad)
ALTER TABLE horarios_actividades
  ADD CONSTRAINT horarios_actividades_unique_actividad_dia_hora
    UNIQUE (actividad_id, dia_semana_id, hora_inicio);

-- Agregar índices
CREATE INDEX IF NOT EXISTS horarios_actividades_dia_semana_id_idx ON horarios_actividades(dia_semana_id);
CREATE INDEX IF NOT EXISTS horarios_actividades_actividad_id_dia_idx ON horarios_actividades(actividad_id, dia_semana_id);

-- Eliminar columna legacy
ALTER TABLE horarios_actividades
  DROP COLUMN IF EXISTS "diaSemana";

COMMIT;

-- ============================================================================
-- VERIFICACIÓN FINAL
-- ============================================================================

-- Verificar estructura de actividades
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'actividades'
  AND column_name IN (
    'codigo_actividad',
    'tipo_actividad_id',
    'categoria_id',
    'estado_id',
    'fecha_desde',
    'costo'
  )
ORDER BY column_name;

-- Verificar foreign keys
SELECT
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name IN ('actividades', 'horarios_actividades')
ORDER BY tc.table_name, tc.constraint_name;

-- Verificar datos migrados
SELECT
  'actividades' as tabla,
  COUNT(*) as total,
  COUNT(codigo_actividad) as con_codigo,
  COUNT(tipo_actividad_id) as con_tipo
FROM actividades

UNION ALL

SELECT
  'horarios_actividades' as tabla,
  COUNT(*) as total,
  COUNT(dia_semana_id) as con_dia,
  COUNT(hora_inicio) as con_hora
FROM horarios_actividades;
