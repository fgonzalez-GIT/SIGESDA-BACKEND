-- ============================================================================
-- Migración: Agregar ESPOSA y ESPOSO al enum TipoParentesco
-- Opción: CONVIVENCIA (mantiene CONYUGE para compatibilidad)
-- Fecha: 2025-12-08
-- Autor: Sistema SIGESDA
-- ============================================================================

-- Paso 1: Agregar nuevos valores al enum TipoParentesco
-- Nota: PostgreSQL ENUMs se extienden con ALTER TYPE ADD VALUE
-- Estos comandos deben ejecutarse fuera de un bloque de transacción
ALTER TYPE "TipoParentesco" ADD VALUE IF NOT EXISTS 'ESPOSA';
ALTER TYPE "TipoParentesco" ADD VALUE IF NOT EXISTS 'ESPOSO';

-- Paso 2: PostgreSQL requiere COMMIT antes de usar nuevos valores de ENUM
-- En una migración, esto se maneja automáticamente entre statements

-- Paso 3: Crear índice parcial para mejorar performance de queries
-- Nota: El índice se creará en una migración posterior debido a limitaciones de PostgreSQL
-- con nuevos valores de ENUM en la misma transacción

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
