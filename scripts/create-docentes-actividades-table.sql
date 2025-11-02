-- ========================================================================
-- CORRECCIÓN CRÍTICA: Creación de tabla docentes_actividades
-- ========================================================================
-- Fecha: 2025-11-02
-- Descripción: Tabla faltante para asignación de docentes a actividades
--              con soporte para roles específicos
--
-- PROBLEMA RESUELTO:
-- - El código en actividad.repository.ts referenciaba tabla inexistente
-- - La asignación de docentes a actividades NO funcionaba
-- - Faltaba soporte para roles de docentes en actividades
--
-- ========================================================================

-- Crear tabla docentes_actividades
CREATE TABLE IF NOT EXISTS "docentes_actividades" (
  "id" SERIAL PRIMARY KEY,
  "actividad_id" INTEGER NOT NULL,
  "docente_id" INTEGER NOT NULL,
  "rol_docente_id" INTEGER NOT NULL,
  "fecha_asignacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "fecha_desasignacion" TIMESTAMP(3),
  "activo" BOOLEAN NOT NULL DEFAULT true,
  "observaciones" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  -- Foreign Keys
  CONSTRAINT "docentes_actividades_actividad_id_fkey"
    FOREIGN KEY ("actividad_id")
    REFERENCES "actividades"("id")
    ON DELETE CASCADE
    ON UPDATE CASCADE,

  CONSTRAINT "docentes_actividades_docente_id_fkey"
    FOREIGN KEY ("docente_id")
    REFERENCES "personas"("id")
    ON DELETE CASCADE
    ON UPDATE CASCADE,

  CONSTRAINT "docentes_actividades_rol_docente_id_fkey"
    FOREIGN KEY ("rol_docente_id")
    REFERENCES "roles_docentes"("id")
    ON DELETE RESTRICT
    ON UPDATE CASCADE,

  -- Unique Constraint: Un docente no puede tener el mismo rol dos veces en la misma actividad
  CONSTRAINT "unique_docente_actividad_rol"
    UNIQUE ("actividad_id", "docente_id", "rol_docente_id")
);

-- Crear índices para optimizar queries frecuentes
CREATE INDEX "docentes_actividades_actividad_id_idx" ON "docentes_actividades"("actividad_id");
CREATE INDEX "docentes_actividades_docente_id_idx" ON "docentes_actividades"("docente_id");
CREATE INDEX "docentes_actividades_rol_docente_id_idx" ON "docentes_actividades"("rol_docente_id");
CREATE INDEX "docentes_actividades_activo_idx" ON "docentes_actividades"("activo");

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_docentes_actividades_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_docentes_actividades_updated_at
  BEFORE UPDATE ON "docentes_actividades"
  FOR EACH ROW
  EXECUTE FUNCTION update_docentes_actividades_updated_at();

-- ========================================================================
-- VERIFICACIÓN
-- ========================================================================

-- Verificar que la tabla fue creada correctamente
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'docentes_actividades'
  ) THEN
    RAISE NOTICE '✅ Tabla docentes_actividades creada exitosamente';
  ELSE
    RAISE EXCEPTION '❌ Error: Tabla docentes_actividades NO fue creada';
  END IF;
END $$;

-- Verificar foreign keys
DO $$
DECLARE
  fk_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO fk_count
  FROM information_schema.table_constraints
  WHERE constraint_type = 'FOREIGN KEY'
  AND table_name = 'docentes_actividades';

  IF fk_count = 3 THEN
    RAISE NOTICE '✅ 3 Foreign Keys configuradas correctamente';
  ELSE
    RAISE WARNING '⚠️  Se esperaban 3 Foreign Keys, se encontraron %', fk_count;
  END IF;
END $$;

-- Verificar índices
DO $$
DECLARE
  index_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO index_count
  FROM pg_indexes
  WHERE tablename = 'docentes_actividades';

  IF index_count >= 4 THEN
    RAISE NOTICE '✅ Índices creados correctamente (% índices)', index_count;
  ELSE
    RAISE WARNING '⚠️  Se esperaban al menos 4 índices, se encontraron %', index_count;
  END IF;
END $$;

-- Mostrar estructura de la tabla
\d docentes_actividades;

-- ========================================================================
-- NOTAS DE MIGRACIÓN
-- ========================================================================
-- ✅ La tabla soporta:
--    - Asignación de múltiples docentes a una actividad
--    - Diferentes roles por docente (titular, suplente, asistente, etc.)
--    - Soft delete (campo activo)
--    - Tracking de fechas de asignación/desasignación
--    - Observaciones por asignación
--
-- ✅ Constraints:
--    - ON DELETE CASCADE: Si se elimina actividad o persona, se eliminan asignaciones
--    - ON DELETE RESTRICT: No se puede eliminar un rol si hay asignaciones activas
--    - UNIQUE: Previene duplicados (misma persona + actividad + rol)
--
-- ✅ Índices optimizan:
--    - Búsqueda de docentes por actividad
--    - Búsqueda de actividades por docente
--    - Filtrado por rol
--    - Filtrado por estado activo/inactivo
--
-- 📝 TODO después de aplicar esta migración:
--    1. Ejecutar: npm run db:generate
--    2. Verificar que el código en actividad.repository.ts funcione
--    3. Poblar tabla roles_docentes si está vacía
--
