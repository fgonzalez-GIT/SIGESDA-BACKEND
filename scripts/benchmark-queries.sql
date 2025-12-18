-- ============================================================================
-- Script de Benchmark de Queries - FASE 6
-- ============================================================================
-- Propósito: Medir performance de queries frecuentes con EXPLAIN ANALYZE
-- Fecha: 2025-12-18
-- Uso: psql -U sigesda_user -d asociacion_musical -f scripts/benchmark-queries.sql
-- ============================================================================

\timing on

\echo '\n==============================================='
\echo 'BENCHMARK 1: Recibos por Receptor (Query MUY FRECUENTE)'
\echo '==============================================='
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT * FROM recibos
WHERE receptor_id = 1
ORDER BY fecha DESC
LIMIT 50;

\echo '\n==============================================='
\echo 'BENCHMARK 2: Recibos Pendientes (Query FRECUENTE)'
\echo '==============================================='
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT * FROM recibos
WHERE estado = 'PENDIENTE'
ORDER BY fecha DESC
LIMIT 100;

\echo '\n==============================================='
\echo 'BENCHMARK 3: Recibos Vencidos (Query FRECUENTE)'
\echo '==============================================='
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT * FROM recibos
WHERE estado IN ('PENDIENTE', 'VENCIDO')
  AND fecha_vencimiento < NOW()
ORDER BY fecha_vencimiento ASC
LIMIT 100;

\echo '\n==============================================='
\echo 'BENCHMARK 4: Cuotas por Socio (JOIN con Recibos)'
\echo '==============================================='
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT c.* FROM cuotas c
JOIN recibos r ON c.recibo_id = r.id
WHERE r.receptor_id = 1
ORDER BY c.anio DESC, c.mes DESC
LIMIT 50;

\echo '\n==============================================='
\echo 'BENCHMARK 5: Cuotas Impagas (Dashboard)'
\echo '==============================================='
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT c.* FROM cuotas c
JOIN recibos r ON c.recibo_id = r.id
WHERE r.estado IN ('PENDIENTE', 'VENCIDO')
ORDER BY c.anio DESC, c.mes DESC
LIMIT 100;

\echo '\n==============================================='
\echo 'BENCHMARK 6: Participaciones Activas por Persona'
\echo '==============================================='
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT * FROM participacion_actividades
WHERE persona_id = 1 AND activa = true;

\echo '\n==============================================='
\echo 'BENCHMARK 7: Participantes de Actividad'
\echo '==============================================='
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT * FROM participacion_actividades
WHERE actividad_id = 1 AND activa = true;

\echo '\n==============================================='
\echo 'BENCHMARK 8: Actividades Activas'
\echo '==============================================='
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT * FROM actividades
WHERE activa = true
ORDER BY nombre ASC;

\echo '\n==============================================='
\echo 'BENCHMARK 9: Familiares Activos de Socio'
\echo '==============================================='
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT * FROM familiares
WHERE socio_id = 1 AND activo = true;

\echo '\n==============================================='
\echo 'BENCHMARK 10: Items de Cuota (por cuota y tipo)'
\echo '==============================================='
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT * FROM items_cuota
WHERE cuota_id = 1 AND tipo_item_id = 1;

\echo '\n==============================================='
\echo 'BENCHMARK 11: Ajustes Vigentes de Socio'
\echo '==============================================='
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT * FROM ajustes_cuota_socio
WHERE persona_id = 1
  AND activo = true
  AND fecha_inicio <= NOW()
  AND (fecha_fin IS NULL OR fecha_fin >= NOW());

\echo '\n==============================================='
\echo 'BENCHMARK 12: Exenciones Vigentes de Socio'
\echo '==============================================='
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT * FROM exenciones_cuota
WHERE persona_id = 1
  AND estado = 'VIGENTE'
  AND activa = true;

\echo '\n==============================================='
\echo 'BENCHMARK 13: Cuotas por Categoría y Período'
\echo '==============================================='
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT * FROM cuotas
WHERE categoria_id = 1
  AND mes = 12
  AND anio = 2025;

\echo '\n==============================================='
\echo 'BENCHMARKS COMPLETADOS'
\echo '==============================================='
\echo 'Buscar en los resultados:'
\echo '  - "Index Scan" o "Index Only Scan" = BUENO (usa índice)'
\echo '  - "Seq Scan" = MALO (full table scan, no usa índice)'
\echo '  - "Execution Time" < 50ms = EXCELENTE'
\echo '  - "Execution Time" < 200ms = BUENO'
\echo '  - "Execution Time" > 500ms = NECESITA OPTIMIZACIÓN'
\echo '==============================================='

\timing off
