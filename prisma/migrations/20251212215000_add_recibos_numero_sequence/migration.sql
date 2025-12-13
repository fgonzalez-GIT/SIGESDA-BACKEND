-- ============================================================================
-- Migración: Agregar secuencia PostgreSQL para numeración de recibos
-- Problema: Race condition en método getNextNumero() con operaciones concurrentes
-- Solución: Usar secuencia nativa de PostgreSQL (thread-safe y atómica)
-- Fecha: 2025-12-12
-- Autor: Sistema SIGESDA - FASE 1 Fixes Críticos
-- ============================================================================

-- Paso 1: Crear secuencia para números de recibos
CREATE SEQUENCE IF NOT EXISTS recibos_numero_seq START 1 INCREMENT 1;

-- Paso 2: Sincronizar secuencia con números existentes
-- Obtener el máximo número existente (asumiendo que todos son numéricos)
DO $$
DECLARE
  max_numero_actual INTEGER;
BEGIN
  -- Intentar obtener el máximo número existente
  SELECT COALESCE(MAX(CAST(numero AS INTEGER)), 0)
  INTO max_numero_actual
  FROM recibos
  WHERE numero ~ '^[0-9]+$';  -- Solo números que son completamente numéricos

  -- Si hay números existentes, ajustar la secuencia
  IF max_numero_actual > 0 THEN
    PERFORM setval('recibos_numero_seq', max_numero_actual);
    RAISE NOTICE 'Secuencia inicializada en: %', max_numero_actual;
  ELSE
    RAISE NOTICE 'No hay recibos existentes, secuencia inicia en 1';
  END IF;
END $$;

-- Paso 3: Crear función para generar próximo número con formato
CREATE OR REPLACE FUNCTION next_recibo_numero()
RETURNS TEXT AS $$
DECLARE
  next_num INTEGER;
BEGIN
  -- Obtener próximo número de la secuencia
  next_num := nextval('recibos_numero_seq');

  -- Retornar número formateado con padding de ceros (8 dígitos)
  RETURN lpad(next_num::text, 8, '0');
END;
$$ LANGUAGE plpgsql;

-- Paso 4: Establecer función como valor por defecto para columna numero
-- Nota: Solo para nuevos recibos, los existentes no se modifican
ALTER TABLE recibos
ALTER COLUMN numero SET DEFAULT next_recibo_numero();

-- Paso 5: Agregar comentarios para documentación
COMMENT ON SEQUENCE recibos_numero_seq IS
  'Secuencia para generar números de recibo únicos y consecutivos. Thread-safe y libre de race conditions.';

COMMENT ON FUNCTION next_recibo_numero() IS
  'Genera el próximo número de recibo formateado con 8 dígitos (ej: 00001234). Usa secuencia PostgreSQL para garantizar unicidad.';

COMMENT ON COLUMN recibos.numero IS
  'Número único de recibo. Se genera automáticamente con formato 8 dígitos (00000001, 00000002, etc.)';

-- Paso 6: Verificación
DO $$
BEGIN
  -- Verificar que la secuencia existe
  IF NOT EXISTS (
    SELECT 1 FROM pg_sequences
    WHERE sequencename = 'recibos_numero_seq'
  ) THEN
    RAISE EXCEPTION 'Error: Secuencia recibos_numero_seq no fue creada';
  END IF;

  -- Verificar que la función existe
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc
    WHERE proname = 'next_recibo_numero'
  ) THEN
    RAISE EXCEPTION 'Error: Función next_recibo_numero() no fue creada';
  END IF;

  RAISE NOTICE 'Migración completada: Secuencia y función creadas exitosamente';
  RAISE NOTICE 'Los nuevos recibos usarán numeración automática';
  RAISE NOTICE 'Próximo número de recibo: %', next_recibo_numero();
END $$;
