-- ========================================================================
-- SEED: Roles de Docentes
-- ========================================================================
-- Descripción: Poblar catálogo de roles de docentes para actividades
-- Fecha: 2025-11-02
--
-- ========================================================================

-- Limpiar tabla (solo si está vacía o quieres recrear)
-- DELETE FROM roles_docentes;
-- ALTER SEQUENCE roles_docentes_id_seq RESTART WITH 1;

-- Insertar roles de docentes
INSERT INTO "roles_docentes" ("codigo", "nombre", "descripcion", "activo", "orden")
VALUES
  ('TITULAR', 'Docente Titular', 'Docente principal responsable de la actividad', true, 1),
  ('SUPLENTE', 'Docente Suplente', 'Docente que reemplaza al titular en su ausencia', true, 2),
  ('ASISTENTE', 'Docente Asistente', 'Docente de apoyo que colabora con el titular', true, 3),
  ('COLABORADOR', 'Docente Colaborador', 'Docente que colabora ocasionalmente', true, 4),
  ('INVITADO', 'Docente Invitado', 'Docente externo invitado para actividades especiales', true, 5),
  ('COORDINADOR', 'Coordinador', 'Docente que coordina un grupo de actividades', true, 6),
  ('DIRECTOR', 'Director Musical', 'Director de coro o conjunto', true, 7),
  ('ACOMPANANTE', 'Pianista Acompañante', 'Pianista que acompaña clases o ensayos', true, 8)
ON CONFLICT ("codigo") DO NOTHING;

-- Verificación
DO $$
DECLARE
  total_roles INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_roles FROM roles_docentes WHERE activo = true;
  RAISE NOTICE '✅ Total de roles de docentes activos: %', total_roles;
END $$;

-- Mostrar roles creados
SELECT id, codigo, nombre, orden
FROM roles_docentes
ORDER BY orden;
