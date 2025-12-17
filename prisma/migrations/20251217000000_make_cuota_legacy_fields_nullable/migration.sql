-- ═══════════════════════════════════════════════════════════════════════════
-- Migración: Hacer campos legacy de cuota nullable
-- ═══════════════════════════════════════════════════════════════════════════
-- FASE 2 - Task 2.4: Preparación para migración a sistema de ítems
--
-- Permite que montoBase y montoActividades sean NULL para permitir la
-- transición al sistema de ítems desagregados.
--
-- @date 2025-12-17
-- ═══════════════════════════════════════════════════════════════════════════

-- Hacer nullable el campo montoBase (columna en camelCase)
ALTER TABLE "cuotas" ALTER COLUMN "montoBase" DROP NOT NULL;

-- Hacer nullable el campo montoActividades (columna en camelCase)
ALTER TABLE "cuotas" ALTER COLUMN "montoActividades" DROP NOT NULL;

-- Comentario explicativo
COMMENT ON COLUMN "cuotas"."montoBase" IS 'Monto base de la cuota (LEGACY - usar items_cuota en su lugar). Nullable para migración a sistema de ítems.';
COMMENT ON COLUMN "cuotas"."montoActividades" IS 'Monto de actividades (LEGACY - usar items_cuota en su lugar). Nullable para migración a sistema de ítems.';
