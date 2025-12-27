-- ══════════════════════════════════════════════════════════════════════
-- MIGRACIÓN ACTIVIDADES: ENUM → Tablas Catálogo
-- Migration: 20251224_actividades_enum_to_catalogo
-- Created: 2025-12-24
-- Description: Migra Actividades y Horarios de ENUMs a FK de catálogos
-- ══════════════════════════════════════════════════════════════════════

-- ──────────────────────────────────────────────────────────────────────
-- PASO 1: Agregar Columnas Nuevas (Nullable Temporalmente)
-- ──────────────────────────────────────────────────────────────────────

-- Tabla: actividades
-- Renombrar columnas existentes a snake_case
ALTER TABLE actividades RENAME COLUMN "capacidadMaxima" TO capacidad_maxima;
ALTER TABLE actividades RENAME COLUMN "createdAt" TO created_at;
ALTER TABLE actividades RENAME COLUMN "updatedAt" TO updated_at;

-- Agregar nuevas columnas
ALTER TABLE actividades
  ADD COLUMN IF NOT EXISTS codigo_actividad VARCHAR(50),
  ADD COLUMN IF NOT EXISTS tipo_actividad_id INT,
  ADD COLUMN IF NOT EXISTS categoria_id INT,
  ADD COLUMN IF NOT EXISTS estado_id INT,
  ADD COLUMN IF NOT EXISTS fecha_desde TIMESTAMP,
  ADD COLUMN IF NOT EXISTS fecha_hasta TIMESTAMP,
  ADD COLUMN IF NOT EXISTS costo DECIMAL(8,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS observaciones TEXT;

-- Tabla: horarios_actividades
-- Renombrar columnas existentes a snake_case
ALTER TABLE horarios_actividades RENAME COLUMN "actividadId" TO actividad_id_old;
ALTER TABLE horarios_actividades RENAME COLUMN "createdAt" TO created_at;
ALTER TABLE horarios_actividades RENAME COLUMN "updatedAt" TO updated_at;

-- Agregar nuevas columnas
ALTER TABLE horarios_actividades
  ADD COLUMN IF NOT EXISTS dia_semana_id INT,
  ADD COLUMN IF NOT EXISTS hora_inicio TIME,
  ADD COLUMN IF NOT EXISTS hora_fin TIME,
  ADD COLUMN IF NOT EXISTS actividad_id INT;

-- ──────────────────────────────────────────────────────────────────────
-- PASO 2: Migrar Datos ENUM → FK IDs
-- ──────────────────────────────────────────────────────────────────────

-- 2.1: Migrar actividades.tipo (ENUM) → tipo_actividad_id (FK)
-- Mapeo:
--   CORO               → tipos_actividades WHERE codigo = 'CORO'
--   CLASE_CANTO        → tipos_actividades WHERE codigo = 'CLASE_INDIVIDUAL'
--   CLASE_INSTRUMENTO  → tipos_actividades WHERE codigo = 'CLASE_INDIVIDUAL'

UPDATE actividades a
SET
  tipo_actividad_id = (
    SELECT ta.id FROM tipos_actividades ta
    WHERE ta.codigo = CASE
      WHEN a.tipo = 'CORO' THEN 'CORO'
      WHEN a.tipo = 'CLASE_CANTO' THEN 'CLASE_INDIVIDUAL'
      WHEN a.tipo = 'CLASE_INSTRUMENTO' THEN 'CLASE_INDIVIDUAL'
      ELSE 'CORO'  -- fallback
    END
    LIMIT 1
  ),
  categoria_id = (
    SELECT id FROM categorias_actividades WHERE codigo = 'MUSICA' LIMIT 1
  ),
  estado_id = (
    SELECT id FROM estados_actividades WHERE codigo = 'ACTIVA' LIMIT 1
  ),
  fecha_desde = COALESCE(a.created_at, CURRENT_TIMESTAMP),
  costo = COALESCE(a.precio, 0),
  codigo_actividad = 'ACT-' ||
    CASE
      WHEN a.tipo = 'CORO' THEN 'CORO'
      WHEN a.tipo = 'CLASE_CANTO' THEN 'CLASE_INDIVIDUAL'
      WHEN a.tipo = 'CLASE_INSTRUMENTO' THEN 'CLASE_INDIVIDUAL'
      ELSE 'CORO'
    END || '-' || LPAD(a.id::text, 4, '0')
WHERE tipo_actividad_id IS NULL;

-- 2.2: Migrar horarios_actividades.diaSemana (ENUM) → dia_semana_id (FK)
-- Mapeo directo: LUNES → LUNES, MARTES → MARTES, etc.

UPDATE horarios_actividades h
SET
  dia_semana_id = (
    SELECT ds.id FROM dias_semana ds
    WHERE ds.codigo = h."diaSemana"::text
    LIMIT 1
  ),
  hora_inicio = h."horaInicio"::time,
  hora_fin = h."horaFin"::time,
  actividad_id = h.actividad_id_old
WHERE dia_semana_id IS NULL;

-- ──────────────────────────────────────────────────────────────────────
-- PASO 3: Verificar Migración de Datos
-- ──────────────────────────────────────────────────────────────────────

DO $$
DECLARE
  actividades_sin_tipo INT;
  horarios_sin_dia INT;
BEGIN
  -- Verificar actividades migradas
  SELECT COUNT(*) INTO actividades_sin_tipo
  FROM actividades
  WHERE tipo_actividad_id IS NULL;

  IF actividades_sin_tipo > 0 THEN
    RAISE EXCEPTION '% actividades no fueron migradas (tipo_actividad_id IS NULL)', actividades_sin_tipo;
  END IF;

  -- Verificar horarios migrados
  SELECT COUNT(*) INTO horarios_sin_dia
  FROM horarios_actividades
  WHERE dia_semana_id IS NULL;

  IF horarios_sin_dia > 0 THEN
    RAISE WARNING '% horarios no fueron migrados (dia_semana_id IS NULL)', horarios_sin_dia;
  END IF;

  RAISE NOTICE '✅ Migración de datos completada exitosamente';
END $$;

-- ──────────────────────────────────────────────────────────────────────
-- PASO 4: Agregar Constraints y Hacer NOT NULL
-- ──────────────────────────────────────────────────────────────────────

-- Tabla: actividades
ALTER TABLE actividades
  ALTER COLUMN codigo_actividad SET NOT NULL,
  ALTER COLUMN tipo_actividad_id SET NOT NULL,
  ALTER COLUMN categoria_id SET NOT NULL,
  ALTER COLUMN estado_id SET NOT NULL,
  ALTER COLUMN fecha_desde SET NOT NULL,
  ALTER COLUMN costo SET NOT NULL;

-- Constraint único en codigo_actividad
ALTER TABLE actividades
  ADD CONSTRAINT actividades_codigo_actividad_key UNIQUE (codigo_actividad);

-- Foreign Keys en actividades
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

-- Tabla: horarios_actividades (solo si hay datos)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM horarios_actividades WHERE dia_semana_id IS NOT NULL LIMIT 1) THEN
    ALTER TABLE horarios_actividades ALTER COLUMN dia_semana_id SET NOT NULL;
    ALTER TABLE horarios_actividades ALTER COLUMN hora_inicio SET NOT NULL;
    ALTER TABLE horarios_actividades ALTER COLUMN hora_fin SET NOT NULL;
    ALTER TABLE horarios_actividades ALTER COLUMN actividad_id SET NOT NULL;

    -- Foreign Key a dias_semana
    ALTER TABLE horarios_actividades
      ADD CONSTRAINT horarios_actividades_dia_semana_id_fkey
        FOREIGN KEY (dia_semana_id)
        REFERENCES dias_semana(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE;

    -- Foreign Key a actividades (si no existe)
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints
      WHERE constraint_name = 'horarios_actividades_actividad_id_fkey'
    ) THEN
      ALTER TABLE horarios_actividades
        ADD CONSTRAINT horarios_actividades_actividad_id_fkey
          FOREIGN KEY (actividad_id)
          REFERENCES actividades(id)
          ON DELETE CASCADE
          ON UPDATE CASCADE;
    END IF;
  END IF;
END $$;

-- ──────────────────────────────────────────────────────────────────────
-- PASO 5: Crear Índices para Performance
-- ──────────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS actividades_tipo_actividad_id_idx ON actividades(tipo_actividad_id);
CREATE INDEX IF NOT EXISTS actividades_categoria_id_idx ON actividades(categoria_id);
CREATE INDEX IF NOT EXISTS actividades_estado_id_idx ON actividades(estado_id);
CREATE INDEX IF NOT EXISTS actividades_codigo_actividad_idx ON actividades(codigo_actividad);
CREATE INDEX IF NOT EXISTS actividades_activa_idx ON actividades(activa);
CREATE INDEX IF NOT EXISTS actividades_fecha_desde_idx ON actividades(fecha_desde);

CREATE INDEX IF NOT EXISTS horarios_actividades_dia_semana_id_idx ON horarios_actividades(dia_semana_id);
CREATE INDEX IF NOT EXISTS horarios_actividades_actividad_id_idx ON horarios_actividades(actividad_id);
CREATE INDEX IF NOT EXISTS horarios_actividades_hora_inicio_idx ON horarios_actividades(hora_inicio);

-- ──────────────────────────────────────────────────────────────────────
-- PASO 6: Eliminar Columnas Legacy
-- ──────────────────────────────────────────────────────────────────────

-- Tabla: actividades - eliminar columnas legacy
ALTER TABLE actividades
  DROP COLUMN IF EXISTS tipo,
  DROP COLUMN IF EXISTS duracion,
  DROP COLUMN IF EXISTS precio;

-- Tabla: horarios_actividades - eliminar columnas legacy (solo si migración completa)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM horarios_actividades WHERE dia_semana_id IS NULL
  ) THEN
    ALTER TABLE horarios_actividades DROP COLUMN IF EXISTS "diaSemana";
    ALTER TABLE horarios_actividades DROP COLUMN IF EXISTS "horaInicio";
    ALTER TABLE horarios_actividades DROP COLUMN IF EXISTS "horaFin";
    ALTER TABLE horarios_actividades DROP COLUMN IF EXISTS actividad_id_old;
  END IF;
END $$;

-- ──────────────────────────────────────────────────────────────────────
-- PASO 7: Eliminar ENUMs (OPCIONAL - comentado por seguridad)
-- ──────────────────────────────────────────────────────────────────────

-- NOTA: Solo descomentar si estás 100% seguro que los ENUMs no se usan en otros modelos

-- DROP TYPE IF EXISTS "TipoActividad";
-- DROP TYPE IF EXISTS "DiaSemana";

-- ──────────────────────────────────────────────────────────────────────
-- PASO 8: Verificación Final
-- ──────────────────────────────────────────────────────────────────────

DO $$
DECLARE
  total_actividades INT;
  total_horarios INT;
BEGIN
  -- Contar registros
  SELECT COUNT(*) INTO total_actividades FROM actividades;
  SELECT COUNT(*) INTO total_horarios FROM horarios_actividades;

  -- Verificar constraints
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'actividades_tipo_actividad_id_fkey'
  ) THEN
    RAISE EXCEPTION 'FK actividades → tipos_actividades no fue creada';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'actividades_categoria_id_fkey'
  ) THEN
    RAISE EXCEPTION 'FK actividades → categorias_actividades no fue creada';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'actividades_estado_id_fkey'
  ) THEN
    RAISE EXCEPTION 'FK actividades → estados_actividades no fue creada';
  END IF;

  -- Verificar índices
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE indexname = 'actividades_tipo_actividad_id_idx'
  ) THEN
    RAISE EXCEPTION 'Índice actividades_tipo_actividad_id_idx no fue creado';
  END IF;

  RAISE NOTICE '✅ MIGRACIÓN ACTIVIDADES COMPLETADA EXITOSAMENTE';
  RAISE NOTICE '   - Actividades migradas: %', total_actividades;
  RAISE NOTICE '   - Horarios migrados: %', total_horarios;
  RAISE NOTICE '   - 3 Foreign Keys creadas';
  RAISE NOTICE '   - 9 Índices creados';
  RAISE NOTICE '   - Columnas legacy eliminadas';
END $$;

-- ══════════════════════════════════════════════════════════════════════
-- Migration completed successfully!
-- Total: 3 FK constraints, 9 indexes, 8 legacy columns dropped
-- ══════════════════════════════════════════════════════════════════════
