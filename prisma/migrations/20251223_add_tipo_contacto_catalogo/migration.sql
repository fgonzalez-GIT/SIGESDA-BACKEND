-- ============================================================================
-- Migration: add_tipo_contacto_catalogo
-- Descripción: Crea tabla catálogo para tipos de contacto (migración de ENUM)
-- Fecha: 2025-12-23
-- ============================================================================

-- Crear tabla catálogo tipo_contacto_catalogo
CREATE TABLE tipo_contacto_catalogo (
  id SERIAL PRIMARY KEY,
  codigo VARCHAR(50) UNIQUE NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  icono VARCHAR(50),
  pattern VARCHAR(500),
  activo BOOLEAN DEFAULT true NOT NULL,
  orden INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Insertar 11 tipos predefinidos (incluyendo redes sociales modernas)
INSERT INTO tipo_contacto_catalogo (codigo, nombre, descripcion, icono, pattern, activo, orden) VALUES
('EMAIL',     'Correo Electrónico', 'Dirección de correo electrónico', '📧', '^[^@]+@[^@]+\.[^@]+$', true, 1),
('TELEFONO',  'Teléfono Fijo',      'Número de teléfono fijo',         '☎️', '^\+?[0-9\s\-\(\)]+$',  true, 2),
('CELULAR',   'Teléfono Celular',   'Número de teléfono celular',      '📱', '^\+?[0-9\s\-\(\)]+$',  true, 3),
('WHATSAPP',  'WhatsApp',           'Número de WhatsApp',              '💬', '^\+?[0-9\s\-\(\)]+$',  true, 4),
('TELEGRAM',  'Telegram',           'Usuario de Telegram',             '✈️', NULL,                   true, 5),
('INSTAGRAM', 'Instagram',          'Usuario de Instagram',            '📷', NULL,                   true, 6),
('FACEBOOK',  'Facebook',           'Perfil de Facebook',              '👤', NULL,                   true, 7),
('X',         'X (Twitter)',        'Usuario de X (anteriormente Twitter)', '🐦', NULL,             true, 8),
('TIKTOK',    'TikTok',             'Usuario de TikTok',               '🎵', NULL,                   true, 9),
('LINKEDIN',  'LinkedIn',           'Perfil de LinkedIn',              '💼', NULL,                   true, 10),
('OTRO',      'Otro',               'Otro tipo de contacto',           '📞', NULL,                   true, 99);

-- Crear índices para optimizar queries
CREATE INDEX tipo_contacto_codigo_idx ON tipo_contacto_catalogo(codigo);
CREATE INDEX tipo_contacto_activo_idx ON tipo_contacto_catalogo(activo);
CREATE INDEX tipo_contacto_orden_idx ON tipo_contacto_catalogo(orden);

-- ============================================================================
-- Modificar tabla contacto_persona para usar FK en vez de ENUM
-- ============================================================================

-- Agregar columna temporal para el FK
ALTER TABLE contacto_persona ADD COLUMN tipo_contacto_id INTEGER;

-- Migrar datos del ENUM al FK (mapeo directo por código)
UPDATE contacto_persona
SET tipo_contacto_id = (
  SELECT id FROM tipo_contacto_catalogo
  WHERE codigo = contacto_persona.tipo_contacto::text
);

-- Verificar que no hay NULLs (todos los contactos tienen tipo válido)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM contacto_persona WHERE tipo_contacto_id IS NULL) THEN
    RAISE EXCEPTION 'ERROR: Hay contactos sin tipo_contacto_id válido';
  END IF;
END $$;

-- Hacer NOT NULL la nueva columna
ALTER TABLE contacto_persona ALTER COLUMN tipo_contacto_id SET NOT NULL;

-- Eliminar índice viejo del ENUM
DROP INDEX IF EXISTS contacto_persona_tipo_contacto_idx;

-- Eliminar columna vieja del ENUM
ALTER TABLE contacto_persona DROP COLUMN tipo_contacto;

-- Agregar FK constraint
ALTER TABLE contacto_persona
ADD CONSTRAINT contacto_persona_tipo_contacto_id_fkey
FOREIGN KEY (tipo_contacto_id)
REFERENCES tipo_contacto_catalogo(id)
ON DELETE RESTRICT;

-- Crear índice en la nueva columna FK
CREATE INDEX contacto_persona_tipo_contacto_id_idx ON contacto_persona(tipo_contacto_id);

-- Eliminar ENUM TipoContacto (opcional, puede causar error si hay dependencias)
-- DROP TYPE IF EXISTS "TipoContacto";

-- ============================================================================
-- Verificación final
-- ============================================================================
-- SELECT 'Migration completed successfully' AS status;
