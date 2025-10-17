-- ============================================================================
-- FASE 2: DROP DE TABLAS ANTIGUAS
-- Fecha: 2025-10-15
-- Descripción: Eliminación completa de tablas deprecadas y sistema de secciones
-- ============================================================================

BEGIN;

-- Mensaje de inicio
DO $$ BEGIN
  RAISE NOTICE 'Iniciando DROP de tablas antiguas...';
END $$;

-- ----------------------------------------------------------------------------
-- PASO 1: Drop tablas de sistema de SECCIONES (a eliminar completamente)
-- ----------------------------------------------------------------------------

DROP TABLE IF EXISTS reservas_aulas_secciones CASCADE;
DROP TABLE IF EXISTS participaciones_secciones CASCADE;
DROP TABLE IF EXISTS horarios_secciones CASCADE;
DROP TABLE IF EXISTS secciones_actividades CASCADE;

-- Drop tabla de relación M:N de secciones
DROP TABLE IF EXISTS "_DocenteSeccion" CASCADE;

-- ----------------------------------------------------------------------------
-- PASO 2: Drop tablas DEPRECADAS del sistema antiguo
-- ----------------------------------------------------------------------------

DROP TABLE IF EXISTS participacion_actividades CASCADE;
DROP TABLE IF EXISTS reserva_aulas CASCADE;
DROP TABLE IF EXISTS horarios_actividades CASCADE;

-- Drop tabla de relación M:N deprecada
DROP TABLE IF EXISTS "_DocenteActividad" CASCADE;

-- ----------------------------------------------------------------------------
-- PASO 3: Drop tabla principal ACTIVIDADES
-- ----------------------------------------------------------------------------

DROP TABLE IF EXISTS actividades CASCADE;

-- ----------------------------------------------------------------------------
-- PASO 4: Drop enums/tipos legacy
-- ----------------------------------------------------------------------------

DROP TYPE IF EXISTS "TipoActividad" CASCADE;
DROP TYPE IF EXISTS "EstadoActividad" CASCADE;
DROP TYPE IF EXISTS "DiaSemana" CASCADE;
DROP TYPE IF EXISTS "CategoriaSocioLegacy" CASCADE;

-- Mensaje de finalización
DO $$ BEGIN
  RAISE NOTICE 'DROP de tablas antiguas completado exitosamente';
END $$;

COMMIT;

-- Verificación: Listar tablas relacionadas con actividades que aún existan
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND (table_name LIKE '%actividad%' OR table_name LIKE '%seccion%')
ORDER BY table_name;
