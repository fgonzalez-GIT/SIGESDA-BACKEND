-- ============================================================================
-- SCRIPT DE ROLLBACK - SISTEMA DE SECCIONES
-- ============================================================================
-- ⚠️  ADVERTENCIA: Este script ELIMINA las tablas de secciones y todos sus datos
-- Solo ejecutar si hay un problema crítico con la migración
-- Asegurarse de tener un backup completo de la base de datos antes de ejecutar
-- ============================================================================

\echo '============================================================================'
\echo '⚠️  ADVERTENCIA: ROLLBACK DE MIGRACIÓN DE SECCIONES'
\echo '============================================================================'
\echo ''
\echo 'Este script eliminará:'
\echo '- Todas las secciones creadas'
\echo '- Todos los horarios migrados a secciones'
\echo '- Todas las participaciones migradas a secciones'
\echo '- Todas las reservas de aulas migradas a secciones'
\echo ''
\echo 'Las tablas antiguas se mantendrán intactas.'
\echo ''
\echo 'Presione Ctrl+C para cancelar o Enter para continuar...'
\prompt 'Continuar?' confirm

-- Paso 1: Eliminar tablas de secciones (en orden inverso por foreign keys)
\echo '1. Eliminando reservas de aulas de secciones...'
DROP TABLE IF EXISTS "reservas_aulas_secciones" CASCADE;

\echo '2. Eliminando participaciones de secciones...'
DROP TABLE IF EXISTS "participaciones_secciones" CASCADE;

\echo '3. Eliminando horarios de secciones...'
DROP TABLE IF EXISTS "horarios_secciones" CASCADE;

\echo '4. Eliminando relación docente-sección...'
DROP TABLE IF EXISTS "_DocenteSeccion" CASCADE;

\echo '5. Eliminando secciones...'
DROP TABLE IF EXISTS "secciones_actividades" CASCADE;

\echo ''
\echo '✅ Tablas de secciones eliminadas'
\echo ''

-- Paso 2: Verificar que las tablas antiguas siguen intactas
\echo 'Verificando que las tablas antiguas están intactas...'
\echo ''

SELECT
  'horarios_actividades' as "tabla",
  COUNT(*) as "registros"
FROM "horarios_actividades"
UNION ALL
SELECT
  'participacion_actividades' as "tabla",
  COUNT(*) as "registros"
FROM "participacion_actividades"
UNION ALL
SELECT
  '_DocenteActividad' as "tabla",
  COUNT(*) as "registros"
FROM "_DocenteActividad"
UNION ALL
SELECT
  'reserva_aulas' as "tabla",
  COUNT(*) as "registros"
FROM "reserva_aulas";

\echo ''
\echo '============================================================================'
\echo 'ROLLBACK COMPLETADO'
\echo '============================================================================'
\echo ''
\echo 'Próximos pasos:'
\echo '1. Verificar que la aplicación funciona con las tablas antiguas'
\echo '2. Investigar el problema que causó el rollback'
\echo '3. Corregir el problema en el código/migración'
\echo '4. Volver a intentar la migración cuando esté listo'
\echo ''
\echo 'NOTA: Si hubo modificaciones al schema.prisma, revertirlas manualmente'
\echo 'desde el backup: prisma/schema.prisma.backup_YYYYMMDD_HHMMSS'
\echo ''
\echo '============================================================================'
