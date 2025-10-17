-- ============================================================================
-- FASE 3: CREATE TABLAS DE CATÁLOGOS
-- Fecha: 2025-10-15
-- Descripción: Creación de tablas de configuración/catálogos
-- ============================================================================

BEGIN;

-- Mensaje de inicio
DO $$ BEGIN
  RAISE NOTICE 'Iniciando creación de tablas de catálogos...';
END $$;

-- ----------------------------------------------------------------------------
-- CATÁLOGO 1: tipos_actividades
-- ----------------------------------------------------------------------------

CREATE TABLE tipos_actividades (
  id SERIAL PRIMARY KEY,
  codigo VARCHAR(50) NOT NULL UNIQUE,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  activo BOOLEAN NOT NULL DEFAULT true,
  orden INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE tipos_actividades IS 'Catálogo de tipos de actividad (CORO, CLASE_INSTRUMENTO, etc.)';
COMMENT ON COLUMN tipos_actividades.codigo IS 'Código único identificador (CORO, CLASE_CANTO, CLASE_INSTRUMENTO)';

-- Seed inicial
INSERT INTO tipos_actividades (codigo, nombre, descripcion, orden) VALUES
  ('CORO', 'Coro', 'Actividades corales grupales', 1),
  ('CLASE_CANTO', 'Clase de Canto', 'Clases individuales o grupales de canto', 2),
  ('CLASE_INSTRUMENTO', 'Clase de Instrumento', 'Clases de instrumentos musicales', 3);

-- ----------------------------------------------------------------------------
-- CATÁLOGO 2: categorias_actividades
-- ----------------------------------------------------------------------------

CREATE TABLE categorias_actividades (
  id SERIAL PRIMARY KEY,
  codigo VARCHAR(50) NOT NULL UNIQUE,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  activo BOOLEAN NOT NULL DEFAULT true,
  orden INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE categorias_actividades IS 'Categorías dinámicas de actividades (CORO_ADULTOS, PIANO_NIVEL1, etc.)';

-- Seed inicial
INSERT INTO categorias_actividades (codigo, nombre, descripcion, orden) VALUES
  ('CORO_ADULTOS', 'Coro Adultos', 'Coro principal de adultos', 1),
  ('CORO_JUVENIL', 'Coro Juvenil', 'Coro de jóvenes', 2),
  ('CORO_INFANTIL', 'Coro Infantil', 'Coro de niños', 3),
  ('PIANO_INICIAL', 'Piano Inicial', 'Clases de piano nivel inicial', 4),
  ('PIANO_INTERMEDIO', 'Piano Intermedio', 'Clases de piano nivel intermedio', 5),
  ('PIANO_AVANZADO', 'Piano Avanzado', 'Clases de piano nivel avanzado', 6),
  ('CANTO_INICIAL', 'Canto Inicial', 'Clases de canto nivel inicial', 7),
  ('CANTO_INTERMEDIO', 'Canto Intermedio', 'Clases de canto nivel intermedio', 8),
  ('CANTO_AVANZADO', 'Canto Avanzado', 'Clases de canto nivel avanzado', 9),
  ('GUITARRA_INICIAL', 'Guitarra Inicial', 'Clases de guitarra nivel inicial', 10),
  ('GUITARRA_INTERMEDIO', 'Guitarra Intermedio', 'Clases de guitarra nivel intermedio', 11),
  ('GUITARRA_AVANZADO', 'Guitarra Avanzado', 'Clases de guitarra nivel avanzado', 12),
  ('VIOLIN_INICIAL', 'Violín Inicial', 'Clases de violín nivel inicial', 13),
  ('VIOLIN_INTERMEDIO', 'Violín Intermedio', 'Clases de violín nivel intermedio', 14),
  ('VIOLIN_AVANZADO', 'Violín Avanzado', 'Clases de violín nivel avanzado', 15),
  ('GENERAL', 'General', 'Categoría general para actividades sin clasificar', 99);

-- ----------------------------------------------------------------------------
-- CATÁLOGO 3: estados_actividades
-- ----------------------------------------------------------------------------

CREATE TABLE estados_actividades (
  id SERIAL PRIMARY KEY,
  codigo VARCHAR(50) NOT NULL UNIQUE,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  activo BOOLEAN NOT NULL DEFAULT true,
  orden INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE estados_actividades IS 'Estados posibles de una actividad';

-- Seed inicial
INSERT INTO estados_actividades (codigo, nombre, descripcion, orden) VALUES
  ('ACTIVA', 'Activa', 'Actividad en curso y disponible para inscripciones', 1),
  ('INACTIVA', 'Inactiva', 'Actividad temporalmente suspendida', 2),
  ('FINALIZADA', 'Finalizada', 'Actividad completada según cronograma', 3),
  ('CANCELADA', 'Cancelada', 'Actividad cancelada antes de finalizar', 4);

-- ----------------------------------------------------------------------------
-- CATÁLOGO 4: dias_semana
-- ----------------------------------------------------------------------------

CREATE TABLE dias_semana (
  id SERIAL PRIMARY KEY,
  codigo VARCHAR(20) NOT NULL UNIQUE,
  nombre VARCHAR(50) NOT NULL,
  orden INTEGER NOT NULL
);

COMMENT ON TABLE dias_semana IS 'Catálogo de días de la semana';

-- Seed inicial
INSERT INTO dias_semana (codigo, nombre, orden) VALUES
  ('LUNES', 'Lunes', 1),
  ('MARTES', 'Martes', 2),
  ('MIERCOLES', 'Miércoles', 3),
  ('JUEVES', 'Jueves', 4),
  ('VIERNES', 'Viernes', 5),
  ('SABADO', 'Sábado', 6),
  ('DOMINGO', 'Domingo', 7);

-- ----------------------------------------------------------------------------
-- CATÁLOGO 5: roles_docentes
-- ----------------------------------------------------------------------------

CREATE TABLE roles_docentes (
  id SERIAL PRIMARY KEY,
  codigo VARCHAR(50) NOT NULL UNIQUE,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  activo BOOLEAN NOT NULL DEFAULT true,
  orden INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE roles_docentes IS 'Roles que puede tener un docente en una actividad';

-- Seed inicial
INSERT INTO roles_docentes (codigo, nombre, descripcion, orden) VALUES
  ('TITULAR', 'Titular', 'Docente principal a cargo de la actividad', 1),
  ('SUPLENTE', 'Suplente', 'Docente suplente o reemplazo temporal', 2),
  ('AUXILIAR', 'Auxiliar', 'Docente asistente o auxiliar de apoyo', 3),
  ('COORDINADOR', 'Coordinador', 'Coordinador general de la actividad', 4);

-- Mensaje de finalización
DO $$ BEGIN
  RAISE NOTICE 'Creación de tablas de catálogos completada exitosamente';
  RAISE NOTICE 'Tablas creadas: tipos_actividades, categorias_actividades, estados_actividades, dias_semana, roles_docentes';
END $$;

COMMIT;

-- Verificación: Contar registros en cada catálogo
SELECT 'tipos_actividades' as tabla, COUNT(*) as registros FROM tipos_actividades
UNION ALL
SELECT 'categorias_actividades', COUNT(*) FROM categorias_actividades
UNION ALL
SELECT 'estados_actividades', COUNT(*) FROM estados_actividades
UNION ALL
SELECT 'dias_semana', COUNT(*) FROM dias_semana
UNION ALL
SELECT 'roles_docentes', COUNT(*) FROM roles_docentes;
