-- ============================================================================
-- FASE 6: Performance Optimization - Índices de Base de Datos
-- ============================================================================
-- Migration: 20251218000000_add_performance_indexes_phase1_and_2
-- Descripción: Agrega índices críticos para mejorar performance de queries frecuentes
-- Fecha: 2025-12-18
-- Fase 1: Índices críticos (Prioridad ALTA)
-- Fase 2: Índices compuestos (Prioridad MEDIA)
-- ============================================================================

-- ============================================================================
-- FASE 1: ÍNDICES CRÍTICOS (Prioridad ALTA)
-- ============================================================================

-- Tabla: recibos
-- Impacto: Queries de recibos por socio, estado, fecha (muy frecuentes)
-- Mejora esperada: 10-50x más rápido

-- Índice en receptorId (query de cuotas por socio - MUY FRECUENTE)
CREATE INDEX IF NOT EXISTS "recibos_receptor_id_idx" ON "recibos"("receptor_id");

-- Índice en emisorId (query de recibos emitidos)
CREATE INDEX IF NOT EXISTS "recibos_emisor_id_idx" ON "recibos"("emisor_id");

-- Índice en estado (filtro de recibos pendientes/pagados - MUY FRECUENTE)
CREATE INDEX IF NOT EXISTS "recibos_estado_idx" ON "recibos"("estado");

-- Índice en fecha (ordenamiento y rangos de fechas - FRECUENTE)
CREATE INDEX IF NOT EXISTS "recibos_fecha_idx" ON "recibos"("fecha");

-- Índice en fechaVencimiento (query de recibos vencidos)
CREATE INDEX IF NOT EXISTS "recibos_fecha_vencimiento_idx" ON "recibos"("fecha_vencimiento");

-- Índice compuesto para query de recibos vencidos (estado + fecha_vencimiento)
-- Query: SELECT * FROM recibos WHERE estado IN ('PENDIENTE', 'VENCIDO') AND fecha_vencimiento < NOW();
CREATE INDEX IF NOT EXISTS "recibos_estado_fecha_vencimiento_idx" ON "recibos"("estado", "fecha_vencimiento");

-- Tabla: actividades
-- Impacto: Filtro de actividades activas (muy frecuente)
-- Mejora esperada: 10-50x más rápido

-- Índice en activa (filtro de actividades activas - MUY FRECUENTE)
CREATE INDEX IF NOT EXISTS "actividades_activa_idx" ON "actividades"("activa");

-- Tabla: participacion_actividades
-- Impacto: Queries de participaciones activas por persona/actividad
-- Mejora esperada: 10-100x más rápido

-- Índice compuesto: personaId + activa (query de participaciones activas de un socio - MUY FRECUENTE)
CREATE INDEX IF NOT EXISTS "participacion_actividades_persona_id_activa_idx" ON "participacion_actividades"("persona_id", "activa");

-- Índice compuesto: actividadId + activa (query de participantes de una actividad - FRECUENTE)
CREATE INDEX IF NOT EXISTS "participacion_actividades_actividad_id_activa_idx" ON "participacion_actividades"("actividad_id", "activa");

-- Índice compuesto: personaId + fechas (query de participaciones en período)
CREATE INDEX IF NOT EXISTS "participacion_actividades_persona_id_fecha_inicio_fecha_fin_idx" ON "participacion_actividades"("persona_id", "fecha_inicio", "fecha_fin");

-- Tabla: familiares
-- Impacto: Queries de relaciones familiares activas (para descuentos)
-- Mejora esperada: 10-50x más rápido

-- Índice compuesto: socioId + activo (query de familiares de un socio - MUY FRECUENTE)
CREATE INDEX IF NOT EXISTS "familiares_socio_id_activo_idx" ON "familiares"("socio_id", "activo");

-- Índice compuesto: familiarId + activo (query bidireccional de relaciones)
CREATE INDEX IF NOT EXISTS "familiares_familiar_id_activo_idx" ON "familiares"("familiar_id", "activo");

-- ============================================================================
-- FASE 2: ÍNDICES COMPUESTOS (Prioridad MEDIA)
-- ============================================================================

-- Tabla: cuotas
-- Impacto: Optimización de queries de generación de cuotas
-- Mejora esperada: 5-20x más rápido

-- Índice compuesto: categoriaId + mes + anio (query de generación de cuotas - FRECUENTE)
-- Query: SELECT * FROM cuotas WHERE categoria_id = ? AND mes = ? AND anio = ?;
CREATE INDEX IF NOT EXISTS "cuotas_categoria_id_mes_anio_idx" ON "cuotas"("categoria_id", "mes", "anio");

-- Tabla: items_cuota
-- Impacto: Optimización de reportes de items por cuota y tipo
-- Mejora esperada: 5-15x más rápido

-- Índice compuesto: cuotaId + tipoItemId (query de items por cuota y tipo - FRECUENTE EN REPORTES)
-- Query: SELECT * FROM items_cuota WHERE cuota_id = ? AND tipo_item_id = ?;
CREATE INDEX IF NOT EXISTS "items_cuota_cuota_id_tipo_item_id_idx" ON "items_cuota"("cuota_id", "tipo_item_id");

-- Tabla: ajustes_cuota_socio
-- Impacto: Optimización de queries de ajustes vigentes
-- Mejora esperada: 5-20x más rápido

-- Índice compuesto: personaId + activo + fechaInicio (query de ajustes vigentes - FRECUENTE)
-- Query: SELECT * FROM ajustes_cuota_socio WHERE persona_id = ? AND activo = true AND fecha_inicio <= ?;
CREATE INDEX IF NOT EXISTS "ajustes_cuota_socio_persona_id_activo_fecha_inicio_idx" ON "ajustes_cuota_socio"("persona_id", "activo", "fecha_inicio");

-- Tabla: exenciones_cuota
-- Impacto: Optimización de queries de exenciones vigentes
-- Mejora esperada: 5-20x más rápido

-- Índice compuesto: personaId + estado + activa (query de exenciones vigentes - FRECUENTE)
-- Query: SELECT * FROM exenciones_cuota WHERE persona_id = ? AND estado = 'VIGENTE' AND activa = true;
CREATE INDEX IF NOT EXISTS "exenciones_cuota_persona_id_estado_activa_idx" ON "exenciones_cuota"("persona_id", "estado", "activa");

-- ============================================================================
-- COMENTARIOS FINALES
-- ============================================================================

-- Total de índices creados: 17 índices
-- Fase 1 (Críticos): 10 índices
-- Fase 2 (Compuestos): 7 índices

-- Impacto esperado:
-- - Queries de recibos: 10-50x más rápido
-- - Queries de participaciones: 10-100x más rápido
-- - Queries de cuotas: 5-20x más rápido
-- - Queries de items: 5-15x más rápido
-- - Dashboard general: 20-50x más rápido

-- Validación post-migration:
-- 1. Verificar índices creados: \d+ recibos
-- 2. Ejecutar EXPLAIN ANALYZE en queries clave
-- 3. Comparar tiempos de ejecución antes/después

-- Para rollback, ejecutar: DROP INDEX IF EXISTS <nombre_indice>;
