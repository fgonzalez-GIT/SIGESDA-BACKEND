-- Script para crear tabla de tipos de persona
-- Ejecutar manualmente contra la base de datos

CREATE TABLE IF NOT EXISTS tipos_persona (
  id SERIAL PRIMARY KEY,
  codigo VARCHAR(50) UNIQUE NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  activo BOOLEAN DEFAULT TRUE NOT NULL,
  orden INTEGER DEFAULT 0 NOT NULL,
  requires_categoria BOOLEAN DEFAULT FALSE NOT NULL,
  requires_especialidad BOOLEAN DEFAULT FALSE NOT NULL,
  requires_cuit BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_tipos_persona_codigo ON tipos_persona(codigo);
CREATE INDEX IF NOT EXISTS idx_tipos_persona_activo ON tipos_persona(activo);
CREATE INDEX IF NOT EXISTS idx_tipos_persona_orden ON tipos_persona(orden);

-- Trigger para actualizar updated_at automáticamente
CREATE TRIGGER update_tipos_persona_updated_at BEFORE UPDATE ON tipos_persona
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE tipos_persona IS 'Catálogo de tipos de persona (NO_SOCIO, SOCIO, DOCENTE, PROVEEDOR)';
COMMENT ON COLUMN tipos_persona.requires_categoria IS 'Indica si este tipo requiere categoría de socio';
COMMENT ON COLUMN tipos_persona.requires_especialidad IS 'Indica si este tipo requiere especialidad (para docentes)';
COMMENT ON COLUMN tipos_persona.requires_cuit IS 'Indica si este tipo requiere CUIT (para proveedores)';
