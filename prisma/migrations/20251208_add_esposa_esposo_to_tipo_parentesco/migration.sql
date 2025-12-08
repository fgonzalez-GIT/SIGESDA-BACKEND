-- ============================================================================
-- Migración: Agregar ESPOSA y ESPOSO al enum TipoParentesco
-- Opción: CONVIVENCIA (mantiene CONYUGE para compatibilidad)
-- Fecha: 2025-12-08
-- Autor: Sistema SIGESDA
-- ============================================================================

-- Paso 1: Agregar nuevos valores al enum TipoParentesco
-- Nota: PostgreSQL ENUMs se extienden con ALTER TYPE ADD VALUE
ALTER TYPE "TipoParentesco" ADD VALUE IF NOT EXISTS 'ESPOSA';
ALTER TYPE "TipoParentesco" ADD VALUE IF NOT EXISTS 'ESPOSO';

-- Paso 2: Verificar valores del enum
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum
        WHERE enumlabel = 'ESPOSA'
        AND enumtypid = 'TipoParentesco'::regtype
    ) THEN
        RAISE EXCEPTION 'Error: No se pudo agregar valor ESPOSA al enum';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_enum
        WHERE enumlabel = 'ESPOSO'
        AND enumtypid = 'TipoParentesco'::regtype
    ) THEN
        RAISE EXCEPTION 'Error: No se pudo agregar valor ESPOSO al enum';
    END IF;

    RAISE NOTICE 'Valores ESPOSA y ESPOSO agregados exitosamente al enum TipoParentesco';
END $$;

-- Paso 3: Crear índice parcial para mejorar performance de queries
-- que filtran por relaciones maritales (CONYUGE, ESPOSA, ESPOSO)
CREATE INDEX IF NOT EXISTS idx_familiares_parentesco_marital
ON familiares(parentesco)
WHERE parentesco IN ('CONYUGE', 'ESPOSA', 'ESPOSO');

-- Paso 4: Comentarios en tabla para documentación
COMMENT ON COLUMN familiares.parentesco IS
  'Tipo de relación familiar. Valores maritales: CONYUGE (genérico neutro), ESPOSA (femenino), ESPOSO (masculino)';

-- Paso 5: Log de auditoría (opcional - requiere tabla configuracion_sistema)
-- INSERT INTO configuracion_sistema (clave, valor, descripcion, tipo)
-- VALUES (
--   'migracion_esposa_esposo_fecha',
--   CURRENT_TIMESTAMP::TEXT,
--   'Fecha de migración que agregó ESPOSA y ESPOSO al enum TipoParentesco',
--   'TIMESTAMP'
-- )
-- ON CONFLICT (clave) DO UPDATE SET valor = CURRENT_TIMESTAMP::TEXT;
