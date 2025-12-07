-- ============================================================================
-- ROLLBACK: TIPOS DE CONTACTO - TABLA CATÁLOGO → ENUM
-- ============================================================================
-- Fecha: 2025-01-05
-- Descripción: Revierte la migración de tipos de contacto de tabla a ENUM
-- Usar solo en caso de problemas críticos con la migración
-- ============================================================================

-- ⚠️ PRECAUCIÓN: Este script REVIERTE COMPLETAMENTE la migración
-- Solo ejecutar si hay problemas críticos y se necesita volver al estado anterior

-- PASO 1: Verificar que el ENUM TipoContacto existe
-- ============================================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'TipoContacto') THEN
    RAISE EXCEPTION 'ERROR: ENUM TipoContacto no existe. No se puede hacer rollback.';
  END IF;
  RAISE NOTICE 'OK: ENUM TipoContacto existe, continuando rollback...';
END $$;

-- PASO 2: Agregar columna tipo_contacto de nuevo (ENUM)
-- ============================================================================
ALTER TABLE contacto_persona ADD COLUMN tipo_contacto "TipoContacto";

-- PASO 3: Migrar datos de vuelta (FK → ENUM)
-- ============================================================================
UPDATE contacto_persona cp
SET tipo_contacto = tc.codigo::"TipoContacto"
FROM tipo_contacto_catalogo tc
WHERE cp.tipo_contacto_id = tc.id;

-- PASO 4: Verificar migración inversa (no debe haber NULLs)
-- ============================================================================
DO $$
DECLARE
  null_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO null_count
  FROM contacto_persona
  WHERE tipo_contacto IS NULL;

  IF null_count > 0 THEN
    RAISE EXCEPTION 'ERROR: % registros con tipo_contacto NULL. Rollback falló.', null_count;
  ELSE
    RAISE NOTICE 'OK: Todos los registros migraron de vuelta correctamente';
  END IF;
END $$;

-- PASO 5: Hacer NOT NULL la columna restaurada
-- ============================================================================
ALTER TABLE contacto_persona ALTER COLUMN tipo_contacto SET NOT NULL;

-- PASO 6: Eliminar FK constraint
-- ============================================================================
ALTER TABLE contacto_persona DROP CONSTRAINT IF EXISTS fk_contacto_tipo_contacto_id;

-- PASO 7: Eliminar índice nuevo
-- ============================================================================
DROP INDEX IF EXISTS contacto_persona_tipo_contacto_id_idx;

-- PASO 8: Eliminar columna nueva (tipo_contacto_id)
-- ============================================================================
ALTER TABLE contacto_persona DROP COLUMN tipo_contacto_id;

-- PASO 9: Re-crear índice del ENUM
-- ============================================================================
CREATE INDEX contacto_persona_tipo_contacto_idx ON contacto_persona(tipo_contacto);

-- PASO 10: Eliminar tabla catálogo
-- ============================================================================
DROP TABLE IF EXISTS tipo_contacto_catalogo;

-- PASO 11: Verificación final
-- ============================================================================
DO $$
DECLARE
  contactos_count INTEGER;
  enum_null_count INTEGER;
BEGIN
  -- Verificar contactos
  SELECT COUNT(*) INTO contactos_count FROM contacto_persona;
  RAISE NOTICE 'Contactos totales: %', contactos_count;

  -- Verificar que no hay NULLs
  SELECT COUNT(*) INTO enum_null_count
  FROM contacto_persona
  WHERE tipo_contacto IS NULL;

  IF enum_null_count > 0 THEN
    RAISE EXCEPTION 'ERROR: % contactos con tipo_contacto NULL', enum_null_count;
  ELSE
    RAISE NOTICE 'OK: Todos los contactos tienen tipo_contacto válido';
  END IF;

  RAISE NOTICE '========================================';
  RAISE NOTICE 'ROLLBACK COMPLETADO EXITOSAMENTE ✅';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'La tabla se ha restaurado al estado anterior (ENUM)';
END $$;
