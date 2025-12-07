-- ============================================================================
-- MIGRACIÓN: TIPOS DE CONTACTO - ENUM → TABLA CATÁLOGO
-- ============================================================================
-- Fecha: 2025-01-05
-- Descripción: Migra tipos de contacto de ENUM a tabla catálogo separada
-- Patrón de referencia: EspecialidadDocente
-- ============================================================================

-- PASO 1: Crear tabla catálogo tipo_contacto_catalogo
-- ============================================================================
CREATE TABLE tipo_contacto_catalogo (
  id SERIAL PRIMARY KEY,
  codigo VARCHAR(50) UNIQUE NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  icono VARCHAR(50),
  pattern VARCHAR(500),  -- Regex de validación (ej: '^[^@]+@[^@]+\.[^@]+$' para email)
  activo BOOLEAN DEFAULT true NOT NULL,
  orden INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- PASO 2: Insertar tipos existentes del ENUM
-- ============================================================================
INSERT INTO tipo_contacto_catalogo (codigo, nombre, descripcion, icono, pattern, activo, orden) VALUES
('EMAIL',     'Correo Electrónico', 'Dirección de correo electrónico', '📧', '^[^@]+@[^@]+\.[^@]+$', true, 1),
('TELEFONO',  'Teléfono Fijo',      'Número de teléfono fijo',         '☎️',  '^\+?[0-9\s\-\(\)]+$',  true, 2),
('CELULAR',   'Teléfono Celular',   'Número de teléfono celular',      '📱', '^\+?[0-9\s\-\(\)]+$',  true, 3),
('WHATSAPP',  'WhatsApp',           'Número de WhatsApp',              '💬', '^\+?[0-9\s\-\(\)]+$',  true, 4),
('TELEGRAM',  'Telegram',           'Usuario de Telegram',             '✈️',  NULL,                   true, 5),
('OTRO',      'Otro',               'Otro tipo de contacto',           '📞', NULL,                   true, 99);

-- PASO 3: Agregar columna temporal tipo_contacto_id
-- ============================================================================
ALTER TABLE contacto_persona ADD COLUMN tipo_contacto_id INTEGER;

-- PASO 4: Migrar datos del ENUM a la FK
-- ============================================================================
-- Convertir el ENUM a texto y hacer JOIN con la tabla catálogo
UPDATE contacto_persona cp
SET tipo_contacto_id = tc.id
FROM tipo_contacto_catalogo tc
WHERE cp.tipo_contacto::TEXT = tc.codigo;

-- PASO 5: Verificar migración (no debe haber NULLs)
-- ============================================================================
DO $$
DECLARE
  null_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO null_count
  FROM contacto_persona
  WHERE tipo_contacto_id IS NULL;

  IF null_count > 0 THEN
    RAISE EXCEPTION 'ERROR: % registros con tipo_contacto_id NULL. Migración falló.', null_count;
  ELSE
    RAISE NOTICE 'OK: Todos los registros migraron correctamente (0 NULL)';
  END IF;
END $$;

-- PASO 6: Hacer NOT NULL la nueva columna
-- ============================================================================
ALTER TABLE contacto_persona ALTER COLUMN tipo_contacto_id SET NOT NULL;

-- PASO 7: Eliminar índice viejo del ENUM
-- ============================================================================
DROP INDEX IF EXISTS contacto_persona_tipo_contacto_idx;

-- PASO 8: Eliminar la columna vieja del ENUM
-- ============================================================================
ALTER TABLE contacto_persona DROP COLUMN tipo_contacto;

-- PASO 9: Agregar FK constraint
-- ============================================================================
ALTER TABLE contacto_persona
  ADD CONSTRAINT fk_contacto_tipo_contacto_id
  FOREIGN KEY (tipo_contacto_id)
  REFERENCES tipo_contacto_catalogo(id)
  ON DELETE RESTRICT;

-- PASO 10: Crear índices
-- ============================================================================
CREATE INDEX contacto_persona_tipo_contacto_id_idx ON contacto_persona(tipo_contacto_id);
CREATE INDEX tipo_contacto_codigo_idx ON tipo_contacto_catalogo(codigo);
CREATE INDEX tipo_contacto_activo_idx ON tipo_contacto_catalogo(activo);
CREATE INDEX tipo_contacto_orden_idx ON tipo_contacto_catalogo(orden);

-- PASO 11: Verificación final
-- ============================================================================
DO $$
DECLARE
  tipos_count INTEGER;
  contactos_count INTEGER;
  orphan_count INTEGER;
BEGIN
  -- Verificar tipos creados
  SELECT COUNT(*) INTO tipos_count FROM tipo_contacto_catalogo;
  RAISE NOTICE 'Tipos de contacto en catálogo: %', tipos_count;

  -- Verificar contactos migrados
  SELECT COUNT(*) INTO contactos_count FROM contacto_persona;
  RAISE NOTICE 'Contactos totales: %', contactos_count;

  -- Verificar integridad referencial
  SELECT COUNT(*) INTO orphan_count
  FROM contacto_persona cp
  LEFT JOIN tipo_contacto_catalogo tc ON cp.tipo_contacto_id = tc.id
  WHERE tc.id IS NULL;

  IF orphan_count > 0 THEN
    RAISE EXCEPTION 'ERROR: % contactos sin tipo válido (orphan records)', orphan_count;
  ELSE
    RAISE NOTICE 'OK: Integridad referencial verificada (0 orphan records)';
  END IF;

  RAISE NOTICE '========================================';
  RAISE NOTICE 'MIGRACIÓN COMPLETADA EXITOSAMENTE ✅';
  RAISE NOTICE '========================================';
END $$;

-- PASO 12 (OPCIONAL): Eliminar el ENUM TipoContacto
-- ============================================================================
-- ⚠️ PRECAUCIÓN: Solo ejecutar si NO hay otras columnas usando este ENUM
-- Verificar antes con:
-- SELECT table_name, column_name
-- FROM information_schema.columns
-- WHERE udt_name = 'TipoContacto';

-- Si el resultado está vacío (no hay otras columnas usándolo), ejecutar:
-- DROP TYPE "TipoContacto";
-- RAISE NOTICE 'ENUM TipoContacto eliminado';

-- Si hay otras columnas usándolo, NO EJECUTAR DROP y dejar el ENUM.
