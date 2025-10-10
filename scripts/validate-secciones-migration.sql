-- ============================================================================
-- SCRIPT DE VALIDACIÓN POST-MIGRACIÓN
-- Sistema de Secciones/Grupos
-- ============================================================================
-- Ejecutar este script DESPUÉS de aplicar la migración para verificar
-- que todos los datos se migraron correctamente
-- ============================================================================

\echo '============================================================================'
\echo 'VALIDACIÓN DE MIGRACIÓN - SISTEMA DE SECCIONES'
\echo '============================================================================'
\echo ''

-- 1. Verificar que todas las actividades tienen al menos una sección
\echo '1. Verificando que todas las actividades tienen sección...'
SELECT
  COUNT(*) as "actividades_sin_seccion",
  CASE
    WHEN COUNT(*) = 0 THEN '✅ OK'
    ELSE '❌ ERROR: Hay actividades sin sección'
  END as "resultado"
FROM "actividades" a
LEFT JOIN "secciones_actividades" s ON s."actividadId" = a."id"
WHERE s."id" IS NULL;

\echo ''

-- 2. Comparar cantidad de horarios migrados
\echo '2. Comparando cantidad de horarios...'
SELECT
  (SELECT COUNT(*) FROM "horarios_actividades") as "horarios_antiguos",
  (SELECT COUNT(*) FROM "horarios_secciones") as "horarios_nuevos",
  CASE
    WHEN (SELECT COUNT(*) FROM "horarios_actividades") = (SELECT COUNT(*) FROM "horarios_secciones")
    THEN '✅ OK - Misma cantidad'
    ELSE '⚠️  ADVERTENCIA: Diferencia en cantidad'
  END as "resultado";

\echo ''

-- 3. Comparar cantidad de participaciones migradas
\echo '3. Comparando cantidad de participaciones...'
SELECT
  (SELECT COUNT(*) FROM "participacion_actividades") as "participaciones_antiguas",
  (SELECT COUNT(*) FROM "participaciones_secciones") as "participaciones_nuevas",
  CASE
    WHEN (SELECT COUNT(*) FROM "participacion_actividades") = (SELECT COUNT(*) FROM "participaciones_secciones")
    THEN '✅ OK - Misma cantidad'
    ELSE '⚠️  ADVERTENCIA: Diferencia en cantidad'
  END as "resultado";

\echo ''

-- 4. Comparar relaciones docente-actividad vs docente-sección
\echo '4. Comparando relaciones docente...'
SELECT
  (SELECT COUNT(*) FROM "_DocenteActividad") as "relaciones_antiguas",
  (SELECT COUNT(*) FROM "_DocenteSeccion") as "relaciones_nuevas",
  CASE
    WHEN (SELECT COUNT(*) FROM "_DocenteActividad") = (SELECT COUNT(*) FROM "_DocenteSeccion")
    THEN '✅ OK - Misma cantidad'
    ELSE '⚠️  ADVERTENCIA: Diferencia en cantidad'
  END as "resultado";

\echo ''

-- 5. Verificar integridad referencial
\echo '5. Verificando integridad referencial...'

-- 5.1 Secciones huérfanas (sin actividad)
SELECT
  COUNT(*) as "secciones_huerfanas",
  CASE
    WHEN COUNT(*) = 0 THEN '✅ OK'
    ELSE '❌ ERROR: Hay secciones sin actividad'
  END as "resultado"
FROM "secciones_actividades" s
LEFT JOIN "actividades" a ON a."id" = s."actividadId"
WHERE a."id" IS NULL;

-- 5.2 Horarios huérfanos (sin sección)
SELECT
  COUNT(*) as "horarios_huerfanos",
  CASE
    WHEN COUNT(*) = 0 THEN '✅ OK'
    ELSE '❌ ERROR: Hay horarios sin sección'
  END as "resultado"
FROM "horarios_secciones" h
LEFT JOIN "secciones_actividades" s ON s."id" = h."seccionId"
WHERE s."id" IS NULL;

-- 5.3 Participaciones huérfanas (sin sección)
SELECT
  COUNT(*) as "participaciones_huerfanas",
  CASE
    WHEN COUNT(*) = 0 THEN '✅ OK'
    ELSE '❌ ERROR: Hay participaciones sin sección'
  END as "resultado"
FROM "participaciones_secciones" p
LEFT JOIN "secciones_actividades" s ON s."id" = p."seccionId"
WHERE s."id" IS NULL;

\echo ''

-- 6. Verificar que no hay duplicados en secciones
\echo '6. Verificando duplicados en secciones...'
SELECT
  COUNT(*) as "secciones_duplicadas",
  CASE
    WHEN COUNT(*) = 0 THEN '✅ OK'
    ELSE '❌ ERROR: Hay secciones duplicadas (mismo nombre por actividad)'
  END as "resultado"
FROM (
  SELECT "actividadId", "nombre", COUNT(*) as "cantidad"
  FROM "secciones_actividades"
  GROUP BY "actividadId", "nombre"
  HAVING COUNT(*) > 1
) AS duplicados;

\echo ''

-- 7. Estadísticas generales
\echo '7. Estadísticas generales de la migración...'
\echo ''

SELECT
  'Actividades' as "entidad",
  COUNT(*) as "total"
FROM "actividades"
UNION ALL
SELECT
  'Secciones creadas' as "entidad",
  COUNT(*) as "total"
FROM "secciones_actividades"
UNION ALL
SELECT
  'Horarios migrados' as "entidad",
  COUNT(*) as "total"
FROM "horarios_secciones"
UNION ALL
SELECT
  'Participaciones migradas' as "entidad",
  COUNT(*) as "total"
FROM "participaciones_secciones"
UNION ALL
SELECT
  'Relaciones docente migradas' as "entidad",
  COUNT(*) as "total"
FROM "_DocenteSeccion"
UNION ALL
SELECT
  'Reservas aulas migradas' as "entidad",
  COUNT(*) as "total"
FROM "reservas_aulas_secciones";

\echo ''

-- 8. Muestra de datos migrados
\echo '8. Muestra de secciones creadas (primeras 10)...'
\echo ''

SELECT
  s."id",
  s."nombre" as "seccion",
  a."nombre" as "actividad",
  s."codigo",
  s."capacidadMaxima",
  (SELECT COUNT(*) FROM "horarios_secciones" WHERE "seccionId" = s."id") as "horarios",
  (SELECT COUNT(*) FROM "participaciones_secciones" WHERE "seccionId" = s."id") as "participantes"
FROM "secciones_actividades" s
JOIN "actividades" a ON a."id" = s."actividadId"
LIMIT 10;

\echo ''

-- 9. Actividades con más de una sección (debería ser 0 inicialmente)
\echo '9. Actividades con múltiples secciones (inicial: debería ser 0)...'
\echo ''

SELECT
  a."nombre" as "actividad",
  COUNT(s."id") as "cantidad_secciones"
FROM "actividades" a
JOIN "secciones_actividades" s ON s."actividadId" = a."id"
GROUP BY a."id", a."nombre"
HAVING COUNT(s."id") > 1;

\echo ''

-- 10. Resumen final
\echo '============================================================================'
\echo 'RESUMEN DE VALIDACIÓN'
\echo '============================================================================'
\echo ''
\echo 'Si todos los checks anteriores muestran ✅ OK, la migración fue exitosa.'
\echo 'Si hay ❌ ERROR, revisar los datos antes de continuar.'
\echo 'Si hay ⚠️  ADVERTENCIA, investigar las diferencias.'
\echo ''
\echo 'Próximos pasos:'
\echo '1. Si la validación es exitosa, probar la aplicación manualmente'
\echo '2. Ejecutar tests automatizados si existen'
\echo '3. Después de 30 días de operación estable, ejecutar script de limpieza'
\echo '   para eliminar tablas backup'
\echo ''
\echo '============================================================================'
