-- ============================================================================
-- MIGRACIÓN ACTIVIDADES: PASO 2 - Agregar Constraints (SIMPLIFICADO)
-- ============================================================================

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

-- Hacer NOT NULL la columna dia_semana_id (si hay datos)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM horarios_actividades WHERE dia_semana_id IS NOT NULL LIMIT 1) THEN
    ALTER TABLE horarios_actividades ALTER COLUMN dia_semana_id SET NOT NULL;
  END IF;
END $$;

-- Agregar foreign key (si hay datos)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM horarios_actividades WHERE dia_semana_id IS NOT NULL LIMIT 1) THEN
    ALTER TABLE horarios_actividades
      ADD CONSTRAINT horarios_actividades_dia_semana_id_fkey
        FOREIGN KEY (dia_semana_id)
        REFERENCES dias_semana(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE;
  END IF;
END $$;

-- Eliminar columna legacy (SOLO si dia_semana_id está poblado)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM horarios_actividades
    WHERE dia_semana_id IS NOT NULL
  ) AND NOT EXISTS (
    SELECT 1
    FROM horarios_actividades
    WHERE dia_semana_id IS NULL
  ) THEN
    ALTER TABLE horarios_actividades DROP COLUMN IF EXISTS "diaSemana";
  END IF;
END $$;

COMMIT;

-- ============================================================================
-- VERIFICACIÓN FINAL
-- ============================================================================

SELECT 'actividades' as tabla, count(*) as total FROM actividades
UNION ALL
SELECT 'horarios_actividades', count(*) FROM horarios_actividades;
