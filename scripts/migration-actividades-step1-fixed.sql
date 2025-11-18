-- ============================================================================
-- MIGRACIÓN ACTIVIDADES: PASO 1 - Agregar Columnas Nuevas (SIMPLIFICADO)
-- ============================================================================

BEGIN;

-- ============================================================================
-- TABLA: actividades
-- ============================================================================

-- Agregar columnas nuevas (nullable temporalmente)
ALTER TABLE actividades
  ADD COLUMN IF NOT EXISTS codigo_actividad VARCHAR(50),
  ADD COLUMN IF NOT EXISTS tipo_actividad_id INT,
  ADD COLUMN IF NOT EXISTS categoria_id INT,
  ADD COLUMN IF NOT EXISTS estado_id INT,
  ADD COLUMN IF NOT EXISTS fecha_desde TIMESTAMP,
  ADD COLUMN IF NOT EXISTS fecha_hasta TIMESTAMP,
  ADD COLUMN IF NOT EXISTS costo DECIMAL(8,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS observaciones TEXT;

-- ============================================================================
-- TABLA: horarios_actividades
-- ============================================================================

-- Agregar columna dia_semana_id (FK a dias_semana)
ALTER TABLE horarios_actividades
  ADD COLUMN IF NOT EXISTS dia_semana_id INT;

COMMIT;

-- ============================================================================
-- VERIFICACIÓN
-- ============================================================================

SELECT
  'actividades' as tabla,
  COUNT(*) FILTER (WHERE codigo_actividad IS NOT NULL) as con_codigo,
  COUNT(*) FILTER (WHERE tipo_actividad_id IS NOT NULL) as con_tipo_id,
  COUNT(*) as total
FROM actividades

UNION ALL

SELECT
  'horarios_actividades' as tabla,
  COUNT(*) FILTER (WHERE dia_semana_id IS NOT NULL) as con_dia_semana_id,
  0 as dummy,
  COUNT(*) as total
FROM horarios_actividades;
