-- ============================================================================
-- FASE 4: CREATE TABLA PRINCIPAL Y RELACIONADAS
-- Fecha: 2025-10-15
-- Descripción: Creación de tabla actividades y tablas relacionadas
-- ============================================================================

BEGIN;

-- Mensaje de inicio
DO $$ BEGIN
  RAISE NOTICE 'Iniciando creación de tabla principal actividades...';
END $$;

-- ----------------------------------------------------------------------------
-- TABLA PRINCIPAL: actividades
-- ----------------------------------------------------------------------------

CREATE TABLE actividades (
  id SERIAL PRIMARY KEY,
  codigo_actividad VARCHAR(50) NOT NULL UNIQUE,
  nombre VARCHAR(200) NOT NULL,
  tipo_actividad_id INTEGER NOT NULL,
  categoria_id INTEGER NOT NULL,
  estado_id INTEGER NOT NULL DEFAULT 1,
  descripcion TEXT,
  fecha_desde TIMESTAMP NOT NULL,
  fecha_hasta TIMESTAMP,
  cupo_maximo INTEGER,
  costo DECIMAL(10,2) NOT NULL DEFAULT 0,
  observaciones TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  -- Foreign Keys
  CONSTRAINT fk_actividad_tipo
    FOREIGN KEY (tipo_actividad_id)
    REFERENCES tipos_actividades(id)
    ON DELETE RESTRICT,

  CONSTRAINT fk_actividad_categoria
    FOREIGN KEY (categoria_id)
    REFERENCES categorias_actividades(id)
    ON DELETE RESTRICT,

  CONSTRAINT fk_actividad_estado
    FOREIGN KEY (estado_id)
    REFERENCES estados_actividades(id)
    ON DELETE RESTRICT,

  -- Constraints
  CONSTRAINT chk_cupo_positivo CHECK (cupo_maximo IS NULL OR cupo_maximo > 0),
  CONSTRAINT chk_costo_no_negativo CHECK (costo >= 0),
  CONSTRAINT chk_fechas_coherentes CHECK (fecha_hasta IS NULL OR fecha_hasta >= fecha_desde)
);

-- Índices de performance
CREATE INDEX idx_actividades_tipo ON actividades(tipo_actividad_id);
CREATE INDEX idx_actividades_categoria ON actividades(categoria_id);
CREATE INDEX idx_actividades_estado ON actividades(estado_id);
CREATE INDEX idx_actividades_vigencia ON actividades(fecha_desde, fecha_hasta);
CREATE INDEX idx_actividades_codigo ON actividades(codigo_actividad);

-- Comentarios
COMMENT ON TABLE actividades IS 'Entidad principal que representa actividades musicales (coros, clases, talleres)';
COMMENT ON COLUMN actividades.codigo_actividad IS 'Código único identificador (ej: CORO-ADU-2025-A, PIANO-NIV1-2025-G1)';
COMMENT ON COLUMN actividades.cupo_maximo IS 'Capacidad máxima de participantes. NULL = sin límite';
COMMENT ON COLUMN actividades.fecha_desde IS 'Fecha de inicio de vigencia de la actividad';
COMMENT ON COLUMN actividades.fecha_hasta IS 'Fecha de fin. NULL = actividad indefinida';

-- ----------------------------------------------------------------------------
-- TABLA: horarios_actividades (1:N con actividades)
-- ----------------------------------------------------------------------------

CREATE TABLE horarios_actividades (
  id SERIAL PRIMARY KEY,
  actividad_id INTEGER NOT NULL,
  dia_semana_id INTEGER NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fin TIME NOT NULL,
  activo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  -- Foreign Keys
  CONSTRAINT fk_horario_actividad
    FOREIGN KEY (actividad_id)
    REFERENCES actividades(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_horario_dia_semana
    FOREIGN KEY (dia_semana_id)
    REFERENCES dias_semana(id)
    ON DELETE RESTRICT,

  -- Constraints
  CONSTRAINT chk_hora_fin_posterior CHECK (hora_fin > hora_inicio)
);

-- Índices de performance
CREATE INDEX idx_horarios_actividad ON horarios_actividades(actividad_id);
CREATE INDEX idx_horarios_dia_semana ON horarios_actividades(dia_semana_id);
CREATE INDEX idx_horarios_composite ON horarios_actividades(actividad_id, dia_semana_id, hora_inicio);
CREATE INDEX idx_horarios_activo ON horarios_actividades(activo);

-- Comentarios
COMMENT ON TABLE horarios_actividades IS 'Horarios recurrentes semanales. Permite múltiples días por actividad (relación 1:N)';
COMMENT ON COLUMN horarios_actividades.hora_inicio IS 'Hora de inicio en formato TIME (ej: 18:00:00)';
COMMENT ON COLUMN horarios_actividades.hora_fin IS 'Hora de fin en formato TIME (ej: 20:00:00)';

-- ----------------------------------------------------------------------------
-- TABLA: reservas_aulas_actividades
-- ----------------------------------------------------------------------------

CREATE TABLE reservas_aulas_actividades (
  id SERIAL PRIMARY KEY,
  horario_id INTEGER NOT NULL,
  aula_id TEXT NOT NULL,
  fecha_vigencia_desde TIMESTAMP NOT NULL,
  fecha_vigencia_hasta TIMESTAMP,
  observaciones TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  -- Foreign Keys
  CONSTRAINT fk_reserva_horario
    FOREIGN KEY (horario_id)
    REFERENCES horarios_actividades(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_reserva_aula
    FOREIGN KEY (aula_id)
    REFERENCES aulas(id)
    ON DELETE RESTRICT,

  -- Constraints
  CONSTRAINT uk_horario_aula UNIQUE (horario_id, aula_id),
  CONSTRAINT chk_vigencia_coherente CHECK (fecha_vigencia_hasta IS NULL OR fecha_vigencia_hasta >= fecha_vigencia_desde)
);

-- Índices de performance
CREATE INDEX idx_reservas_horario ON reservas_aulas_actividades(horario_id);
CREATE INDEX idx_reservas_aula ON reservas_aulas_actividades(aula_id);
CREATE INDEX idx_reservas_vigencia ON reservas_aulas_actividades(fecha_vigencia_desde, fecha_vigencia_hasta);

-- Comentarios
COMMENT ON TABLE reservas_aulas_actividades IS 'Vincula horarios con aulas. Permite cambiar aula sin alterar horario';
COMMENT ON COLUMN reservas_aulas_actividades.fecha_vigencia_desde IS 'Fecha desde la cual aplica esta asignación de aula';
COMMENT ON COLUMN reservas_aulas_actividades.fecha_vigencia_hasta IS 'Fecha hasta la cual aplica. NULL = indefinido';

-- ----------------------------------------------------------------------------
-- TABLA: docentes_actividades (M:N con rol)
-- ----------------------------------------------------------------------------

CREATE TABLE docentes_actividades (
  id SERIAL PRIMARY KEY,
  actividad_id INTEGER NOT NULL,
  docente_id TEXT NOT NULL,
  rol_docente_id INTEGER NOT NULL,
  fecha_asignacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_desasignacion TIMESTAMP,
  activo BOOLEAN NOT NULL DEFAULT true,
  observaciones TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  -- Foreign Keys
  CONSTRAINT fk_docente_actividad
    FOREIGN KEY (actividad_id)
    REFERENCES actividades(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_docente_persona
    FOREIGN KEY (docente_id)
    REFERENCES personas(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_docente_rol
    FOREIGN KEY (rol_docente_id)
    REFERENCES roles_docentes(id)
    ON DELETE RESTRICT,

  -- Constraints
  CONSTRAINT uk_actividad_docente_rol UNIQUE (actividad_id, docente_id, rol_docente_id),
  CONSTRAINT chk_asignacion_coherente CHECK (fecha_desasignacion IS NULL OR fecha_desasignacion >= fecha_asignacion)
);

-- Índices de performance
CREATE INDEX idx_docentes_actividades_actividad ON docentes_actividades(actividad_id);
CREATE INDEX idx_docentes_actividades_docente ON docentes_actividades(docente_id);
CREATE INDEX idx_docentes_actividades_activo ON docentes_actividades(activo);
CREATE INDEX idx_docentes_actividades_rol ON docentes_actividades(rol_docente_id);

-- Comentarios
COMMENT ON TABLE docentes_actividades IS 'Asignación de docentes a actividades con rol específico (Titular, Suplente, Auxiliar, Coordinador)';
COMMENT ON COLUMN docentes_actividades.fecha_asignacion IS 'Fecha en que el docente fue asignado a la actividad';
COMMENT ON COLUMN docentes_actividades.fecha_desasignacion IS 'Fecha en que dejó la actividad. NULL = aún activo';

-- ----------------------------------------------------------------------------
-- TABLA: participaciones_actividades
-- ----------------------------------------------------------------------------

CREATE TABLE participaciones_actividades (
  id SERIAL PRIMARY KEY,
  persona_id TEXT NOT NULL,
  actividad_id INTEGER NOT NULL,
  fecha_inicio TIMESTAMP NOT NULL,
  fecha_fin TIMESTAMP,
  precio_especial DECIMAL(10,2),
  activo BOOLEAN NOT NULL DEFAULT true,
  observaciones TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  -- Foreign Keys
  CONSTRAINT fk_participacion_persona
    FOREIGN KEY (persona_id)
    REFERENCES personas(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_participacion_actividad
    FOREIGN KEY (actividad_id)
    REFERENCES actividades(id)
    ON DELETE CASCADE,

  -- Constraints
  CONSTRAINT uk_persona_actividad UNIQUE (persona_id, actividad_id),
  CONSTRAINT chk_precio_no_negativo CHECK (precio_especial IS NULL OR precio_especial >= 0),
  CONSTRAINT chk_fechas_participacion CHECK (fecha_fin IS NULL OR fecha_fin >= fecha_inicio)
);

-- Índices de performance
CREATE INDEX idx_participaciones_actividad ON participaciones_actividades(actividad_id);
CREATE INDEX idx_participaciones_persona ON participaciones_actividades(persona_id);
CREATE INDEX idx_participaciones_activo ON participaciones_actividades(activo);
CREATE INDEX idx_participaciones_fechas ON participaciones_actividades(fecha_inicio, fecha_fin);

-- Comentarios
COMMENT ON TABLE participaciones_actividades IS 'Inscripciones de alumnos a actividades';
COMMENT ON COLUMN participaciones_actividades.precio_especial IS 'Precio específico para esta persona. NULL = usar precio de actividad';

-- Mensaje de finalización
DO $$ BEGIN
  RAISE NOTICE 'Creación de tabla principal y relacionadas completada exitosamente';
  RAISE NOTICE 'Tablas creadas: actividades, horarios_actividades, reservas_aulas_actividades, docentes_actividades, participaciones_actividades';
END $$;

COMMIT;

-- Verificación: Listar tablas creadas
SELECT table_name,
       (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as num_columnas
FROM information_schema.tables t
WHERE table_schema = 'public'
  AND table_name IN ('actividades', 'horarios_actividades', 'reservas_aulas_actividades',
                     'docentes_actividades', 'participaciones_actividades')
ORDER BY table_name;
