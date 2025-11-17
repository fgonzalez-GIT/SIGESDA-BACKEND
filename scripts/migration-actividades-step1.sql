-- ============================================================================
-- MIGRACIÓN ACTIVIDADES: PASO 1 - Agregar Columnas Nuevas
-- ============================================================================
-- Este script agrega las nuevas columnas para catálogos sin eliminar las legacy
-- Permite migración gradual de datos

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
  ADD COLUMN IF NOT EXISTS observaciones TEXT,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- Renombrar capacidadMaxima a capacidad_maxima (snake_case)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'actividades' AND column_name = 'capacidadmaxima'
  ) THEN
    ALTER TABLE actividades RENAME COLUMN "capacidadMaxima" TO capacidad_maxima;
  END IF;
END $$;

-- ============================================================================
-- TABLA: horarios_actividades
-- ============================================================================

-- Agregar columna dia_semana_id (FK a dias_semana)
ALTER TABLE horarios_actividades
  ADD COLUMN IF NOT EXISTS dia_semana_id INT;

-- Cambiar tipo de horaInicio y horaFin a VARCHAR (si son TIME)
DO $$
BEGIN
  -- Renombrar columnas legacy si existen
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'horarios_actividades' AND column_name = 'horainicio'
  ) THEN
    ALTER TABLE horarios_actividades RENAME COLUMN "horaInicio" TO hora_inicio_temp;
    ALTER TABLE horarios_actividades ADD COLUMN hora_inicio VARCHAR(8);
    UPDATE horarios_actividades SET hora_inicio = hora_inicio_temp::TEXT;
    ALTER TABLE horarios_actividades DROP COLUMN hora_inicio_temp;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'horarios_actividades' AND column_name = 'horafin'
  ) THEN
    ALTER TABLE horarios_actividades RENAME COLUMN "horaFin" TO hora_fin_temp;
    ALTER TABLE horarios_actividades ADD COLUMN hora_fin VARCHAR(8);
    UPDATE horarios_actividades SET hora_fin = hora_fin_temp::TEXT;
    ALTER TABLE horarios_actividades DROP COLUMN hora_fin_temp;
  END IF;
END $$;

-- Renombrar actividadId a actividad_id
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'horarios_actividades' AND column_name = 'actividadid'
  ) THEN
    ALTER TABLE horarios_actividades RENAME COLUMN "actividadId" TO actividad_id;
  END IF;
END $$;

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
  COUNT(*) FILTER (WHERE hora_inicio IS NOT NULL) as con_hora_inicio,
  COUNT(*) as total
FROM horarios_actividades;
