-- ============================================================================
-- Script de Validación de Índices - FASE 6
-- ============================================================================
-- Propósito: Verificar que todos los índices de performance fueron creados
-- Fecha: 2025-12-18
-- ============================================================================

-- ============================================================================
-- 1. LISTAR TODOS LOS ÍNDICES CREADOS
-- ============================================================================

\echo '\n==============================================='
\echo 'ÍNDICES EN TABLA: recibos'
\echo '==============================================='
SELECT
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'recibos'
ORDER BY indexname;

\echo '\n==============================================='
\echo 'ÍNDICES EN TABLA: actividades'
\echo '==============================================='
SELECT
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'actividades'
ORDER BY indexname;

\echo '\n==============================================='
\echo 'ÍNDICES EN TABLA: participacion_actividades'
\echo '==============================================='
SELECT
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'participacion_actividades'
ORDER BY indexname;

\echo '\n==============================================='
\echo 'ÍNDICES EN TABLA: familiares'
\echo '==============================================='
SELECT
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'familiares'
ORDER BY indexname;

\echo '\n==============================================='
\echo 'ÍNDICES EN TABLA: cuotas'
\echo '==============================================='
SELECT
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'cuotas'
ORDER BY indexname;

\echo '\n==============================================='
\echo 'ÍNDICES EN TABLA: items_cuota'
\echo '==============================================='
SELECT
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'items_cuota'
ORDER BY indexname;

\echo '\n==============================================='
\echo 'ÍNDICES EN TABLA: ajustes_cuota_socio'
\echo '==============================================='
SELECT
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'ajustes_cuota_socio'
ORDER BY indexname;

\echo '\n==============================================='
\echo 'ÍNDICES EN TABLA: exenciones_cuota'
\echo '==============================================='
SELECT
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'exenciones_cuota'
ORDER BY indexname;

-- ============================================================================
-- 2. ESTADÍSTICAS DE ÍNDICES
-- ============================================================================

\echo '\n==============================================='
\echo 'ESTADÍSTICAS DE USO DE ÍNDICES'
\echo '==============================================='
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan AS index_scans,
    idx_tup_read AS tuples_read,
    idx_tup_fetch AS tuples_fetched
FROM pg_stat_user_indexes
WHERE tablename IN (
    'recibos',
    'actividades',
    'participacion_actividades',
    'familiares',
    'cuotas',
    'items_cuota',
    'ajustes_cuota_socio',
    'exenciones_cuota'
)
ORDER BY tablename, indexname;

-- ============================================================================
-- 3. TAMAÑO DE ÍNDICES
-- ============================================================================

\echo '\n==============================================='
\echo 'TAMAÑO DE ÍNDICES (TOP 20)'
\echo '==============================================='
SELECT
    schemaname,
    tablename,
    indexname,
    pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
FROM pg_stat_user_indexes
WHERE tablename IN (
    'recibos',
    'actividades',
    'participacion_actividades',
    'familiares',
    'cuotas',
    'items_cuota',
    'ajustes_cuota_socio',
    'exenciones_cuota'
)
ORDER BY pg_relation_size(indexrelid) DESC
LIMIT 20;

-- ============================================================================
-- 4. ÍNDICES NO UTILIZADOS (Potencialmente innecesarios)
-- ============================================================================

\echo '\n==============================================='
\echo 'ÍNDICES NO UTILIZADOS (idx_scan = 0)'
\echo '==============================================='
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan AS index_scans
FROM pg_stat_user_indexes
WHERE tablename IN (
    'recibos',
    'actividades',
    'participacion_actividades',
    'familiares',
    'cuotas',
    'items_cuota',
    'ajustes_cuota_socio',
    'exenciones_cuota'
)
AND idx_scan = 0
ORDER BY tablename, indexname;

-- ============================================================================
-- 5. RESUMEN DE ÍNDICES POR TABLA
-- ============================================================================

\echo '\n==============================================='
\echo 'RESUMEN: CANTIDAD DE ÍNDICES POR TABLA'
\echo '==============================================='
SELECT
    tablename,
    COUNT(*) AS total_indexes
FROM pg_indexes
WHERE tablename IN (
    'recibos',
    'actividades',
    'participacion_actividades',
    'familiares',
    'cuotas',
    'items_cuota',
    'ajustes_cuota_socio',
    'exenciones_cuota'
)
GROUP BY tablename
ORDER BY total_indexes DESC;

-- ============================================================================
-- FIN DEL SCRIPT
-- ============================================================================
\echo '\n==============================================='
\echo 'VALIDACIÓN DE ÍNDICES COMPLETADA'
\echo '==============================================='
