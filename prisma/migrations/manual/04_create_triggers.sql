-- ============================================================================
-- FASE 5: CREATE TRIGGERS Y FUNCIONES
-- Fecha: 2025-10-15
-- Descripción: Creación de triggers para updated_at automático
-- ============================================================================

BEGIN;

-- Mensaje de inicio
DO $$ BEGIN
  RAISE NOTICE 'Iniciando creación de triggers y funciones...';
END $$;

-- ----------------------------------------------------------------------------
-- FUNCIÓN: Actualizar updated_at automáticamente
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_updated_at_column() IS 'Función trigger para actualizar automáticamente el campo updated_at';

-- ----------------------------------------------------------------------------
-- TRIGGERS para tablas de catálogos
-- ----------------------------------------------------------------------------

CREATE TRIGGER trg_update_tipos_actividades_updated_at
BEFORE UPDATE ON tipos_actividades
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_update_categorias_actividades_updated_at
BEFORE UPDATE ON categorias_actividades
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_update_estados_actividades_updated_at
BEFORE UPDATE ON estados_actividades
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_update_roles_docentes_updated_at
BEFORE UPDATE ON roles_docentes
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ----------------------------------------------------------------------------
-- TRIGGERS para tabla principal y relacionadas
-- ----------------------------------------------------------------------------

CREATE TRIGGER trg_update_actividades_updated_at
BEFORE UPDATE ON actividades
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_update_horarios_updated_at
BEFORE UPDATE ON horarios_actividades
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_update_reservas_updated_at
BEFORE UPDATE ON reservas_aulas_actividades
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_update_docentes_actividades_updated_at
BEFORE UPDATE ON docentes_actividades
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_update_participaciones_updated_at
BEFORE UPDATE ON participaciones_actividades
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Mensaje de finalización
DO $$ BEGIN
  RAISE NOTICE 'Creación de triggers completada exitosamente';
  RAISE NOTICE 'Total de triggers creados: 9';
END $$;

COMMIT;

-- Verificación: Listar triggers creados
SELECT
  trigger_name,
  event_object_table,
  action_timing,
  event_manipulation
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND trigger_name LIKE '%updated_at%'
ORDER BY event_object_table;
