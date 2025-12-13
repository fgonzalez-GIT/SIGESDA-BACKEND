-- ============================================================================
-- Migración: Eliminar constraint único problemático de tabla cuotas
-- Problema: @@unique([categoriaId, mes, anio]) permite solo 1 cuota por categoría/período
-- Solución: Eliminar constraint y agregar índice compuesto para performance
-- Fecha: 2025-12-12
-- Autor: Sistema SIGESDA - FASE 1 Fixes Críticos
-- ============================================================================

-- Paso 1: Eliminar constraint único problemático
-- Este constraint impide que múltiples socios de la misma categoría
-- tengan cuota en el mismo período
ALTER TABLE "cuotas" DROP CONSTRAINT IF EXISTS "cuotas_categoriaId_mes_anio_key";

-- Paso 1.1: También eliminar el índice único asociado (por si existe como índice)
DROP INDEX IF EXISTS "cuotas_categoriaId_mes_anio_key";

-- Paso 2: Crear índice compuesto para mejorar performance de queries por período
-- Este índice NO es único, permitiendo múltiples cuotas por categoría/período
CREATE INDEX IF NOT EXISTS "cuotas_mes_anio_idx" ON "cuotas"("mes", "anio");

-- Paso 3: Documentación
COMMENT ON TABLE "cuotas" IS 'Cuotas mensuales de socios. Múltiples socios de la misma categoría pueden tener cuota en el mismo período.';
COMMENT ON COLUMN "cuotas"."mes" IS 'Mes de la cuota (1-12)';
COMMENT ON COLUMN "cuotas"."anio" IS 'Año de la cuota';
COMMENT ON COLUMN "cuotas"."categoriaId" IS 'Categoría del socio al momento de generar la cuota';

-- Paso 4: Verificación
-- El constraint único en reciboId se mantiene (cada cuota tiene un recibo único)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes
        WHERE indexname = 'cuotas_mes_anio_idx'
    ) THEN
        RAISE EXCEPTION 'Error: No se pudo crear el índice cuotas_mes_anio_idx';
    END IF;

    RAISE NOTICE 'Migración completada exitosamente: Constraint único eliminado e índice creado';
END $$;
