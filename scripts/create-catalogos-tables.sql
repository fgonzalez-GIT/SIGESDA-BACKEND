-- Script para crear tablas de catálogos de actividades
-- Ejecutar manualmente contra la base de datos

-- 1. Tabla: tipos_actividades
CREATE TABLE IF NOT EXISTS tipos_actividades (
  id SERIAL PRIMARY KEY,
  codigo VARCHAR(50) UNIQUE NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  activo BOOLEAN DEFAULT TRUE NOT NULL,
  orden INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_tipos_actividades_codigo ON tipos_actividades(codigo);
CREATE INDEX IF NOT EXISTS idx_tipos_actividades_activo ON tipos_actividades(activo);
CREATE INDEX IF NOT EXISTS idx_tipos_actividades_orden ON tipos_actividades(orden);

-- 2. Tabla: categorias_actividades
CREATE TABLE IF NOT EXISTS categorias_actividades (
  id SERIAL PRIMARY KEY,
  codigo VARCHAR(50) UNIQUE NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  activo BOOLEAN DEFAULT TRUE NOT NULL,
  orden INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_categorias_actividades_codigo ON categorias_actividades(codigo);
CREATE INDEX IF NOT EXISTS idx_categorias_actividades_activo ON categorias_actividades(activo);
CREATE INDEX IF NOT EXISTS idx_categorias_actividades_orden ON categorias_actividades(orden);

-- 3. Tabla: estados_actividades
CREATE TABLE IF NOT EXISTS estados_actividades (
  id SERIAL PRIMARY KEY,
  codigo VARCHAR(50) UNIQUE NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  activo BOOLEAN DEFAULT TRUE NOT NULL,
  orden INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_estados_actividades_codigo ON estados_actividades(codigo);
CREATE INDEX IF NOT EXISTS idx_estados_actividades_activo ON estados_actividades(activo);
CREATE INDEX IF NOT EXISTS idx_estados_actividades_orden ON estados_actividades(orden);

-- 4. Tabla: dias_semana
CREATE TABLE IF NOT EXISTS dias_semana (
  id SERIAL PRIMARY KEY,
  codigo VARCHAR(50) UNIQUE NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  orden INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_dias_semana_codigo ON dias_semana(codigo);
CREATE INDEX IF NOT EXISTS idx_dias_semana_orden ON dias_semana(orden);

-- 5. Tabla: roles_docentes
CREATE TABLE IF NOT EXISTS roles_docentes (
  id SERIAL PRIMARY KEY,
  codigo VARCHAR(50) UNIQUE NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  activo BOOLEAN DEFAULT TRUE NOT NULL,
  orden INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_roles_docentes_codigo ON roles_docentes(codigo);
CREATE INDEX IF NOT EXISTS idx_roles_docentes_activo ON roles_docentes(activo);
CREATE INDEX IF NOT EXISTS idx_roles_docentes_orden ON roles_docentes(orden);

-- Triggers para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tipos_actividades_updated_at BEFORE UPDATE ON tipos_actividades
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categorias_actividades_updated_at BEFORE UPDATE ON categorias_actividades
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_estados_actividades_updated_at BEFORE UPDATE ON estados_actividades
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dias_semana_updated_at BEFORE UPDATE ON dias_semana
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_roles_docentes_updated_at BEFORE UPDATE ON roles_docentes
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE tipos_actividades IS 'Catálogo de tipos de actividades (CORO, CLASE_CANTO, etc.)';
COMMENT ON TABLE categorias_actividades IS 'Catálogo de categorías de actividades (INFANTIL, ADULTO, etc.)';
COMMENT ON TABLE estados_actividades IS 'Catálogo de estados de actividades (ACTIVA, CANCELADA, etc.)';
COMMENT ON TABLE dias_semana IS 'Catálogo de días de la semana para horarios';
COMMENT ON TABLE roles_docentes IS 'Catálogo de roles de docentes (TITULAR, ASISTENTE, etc.)';
