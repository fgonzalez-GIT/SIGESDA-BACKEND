-- ============================================================================
-- FASE 6: SEED DE DATOS DE EJEMPLO
-- Fecha: 2025-10-15
-- Descripción: Inserción de datos de prueba para validación
-- ============================================================================

BEGIN;

-- Mensaje de inicio
DO $$ BEGIN
  RAISE NOTICE 'Iniciando seed de datos de ejemplo...';
END $$;

-- ----------------------------------------------------------------------------
-- EJEMPLO 1: Coro Adultos (múltiples días)
-- ----------------------------------------------------------------------------

-- Actividad: Coro Adultos 2025
INSERT INTO actividades (
  codigo_actividad,
  nombre,
  tipo_actividad_id,
  categoria_id,
  estado_id,
  descripcion,
  fecha_desde,
  fecha_hasta,
  cupo_maximo,
  costo
) VALUES (
  'CORO-ADU-2025-A',
  'Coro Adultos 2025',
  (SELECT id FROM tipos_actividades WHERE codigo = 'CORO'),
  (SELECT id FROM categorias_actividades WHERE codigo = 'CORO_ADULTOS'),
  (SELECT id FROM estados_actividades WHERE codigo = 'ACTIVA'),
  'Coro principal de adultos con repertorio variado',
  '2025-01-01 00:00:00',
  '2025-12-31 23:59:59',
  40,
  0
);

-- Horarios del coro (Lunes, Miércoles, Viernes 18:00-20:00)
INSERT INTO horarios_actividades (actividad_id, dia_semana_id, hora_inicio, hora_fin)
SELECT
  (SELECT id FROM actividades WHERE codigo_actividad = 'CORO-ADU-2025-A'),
  ds.id,
  '18:00:00',
  '20:00:00'
FROM dias_semana ds
WHERE ds.codigo IN ('LUNES', 'MIERCOLES', 'VIERNES');

-- ----------------------------------------------------------------------------
-- EJEMPLO 2: Piano Nivel 1 - Grupo 1
-- ----------------------------------------------------------------------------

INSERT INTO actividades (
  codigo_actividad,
  nombre,
  tipo_actividad_id,
  categoria_id,
  estado_id,
  descripcion,
  fecha_desde,
  cupo_maximo,
  costo
) VALUES (
  'PIANO-NIV1-2025-G1',
  'Piano Nivel 1 - Grupo 1',
  (SELECT id FROM tipos_actividades WHERE codigo = 'CLASE_INSTRUMENTO'),
  (SELECT id FROM categorias_actividades WHERE codigo = 'PIANO_INICIAL'),
  (SELECT id FROM estados_actividades WHERE codigo = 'ACTIVA'),
  'Clases de piano para principiantes - Grupo 1',
  '2025-01-01 00:00:00',
  4,
  5000.00
);

-- Horario Piano Grupo 1 (Lunes 18:00-19:00)
INSERT INTO horarios_actividades (actividad_id, dia_semana_id, hora_inicio, hora_fin)
VALUES (
  (SELECT id FROM actividades WHERE codigo_actividad = 'PIANO-NIV1-2025-G1'),
  (SELECT id FROM dias_semana WHERE codigo = 'LUNES'),
  '18:00:00',
  '19:00:00'
);

-- ----------------------------------------------------------------------------
-- EJEMPLO 3: Piano Nivel 1 - Grupo 2 (PARALELO)
-- ----------------------------------------------------------------------------

INSERT INTO actividades (
  codigo_actividad,
  nombre,
  tipo_actividad_id,
  categoria_id,
  estado_id,
  descripcion,
  fecha_desde,
  cupo_maximo,
  costo
) VALUES (
  'PIANO-NIV1-2025-G2',
  'Piano Nivel 1 - Grupo 2',
  (SELECT id FROM tipos_actividades WHERE codigo = 'CLASE_INSTRUMENTO'),
  (SELECT id FROM categorias_actividades WHERE codigo = 'PIANO_INICIAL'),
  (SELECT id FROM estados_actividades WHERE codigo = 'ACTIVA'),
  'Clases de piano para principiantes - Grupo 2 (paralelo)',
  '2025-01-01 00:00:00',
  4,
  5000.00
);

-- Horario Piano Grupo 2 (Lunes 18:00-19:00 - MISMO HORARIO QUE GRUPO 1)
INSERT INTO horarios_actividades (actividad_id, dia_semana_id, hora_inicio, hora_fin)
VALUES (
  (SELECT id FROM actividades WHERE codigo_actividad = 'PIANO-NIV1-2025-G2'),
  (SELECT id FROM dias_semana WHERE codigo = 'LUNES'),
  '18:00:00',
  '19:00:00'
);

-- ----------------------------------------------------------------------------
-- EJEMPLO 4: Canto Intermedio
-- ----------------------------------------------------------------------------

INSERT INTO actividades (
  codigo_actividad,
  nombre,
  tipo_actividad_id,
  categoria_id,
  estado_id,
  descripcion,
  fecha_desde,
  cupo_maximo,
  costo
) VALUES (
  'CANTO-INT-2025-A',
  'Canto Intermedio 2025',
  (SELECT id FROM tipos_actividades WHERE codigo = 'CLASE_CANTO'),
  (SELECT id FROM categorias_actividades WHERE codigo = 'CANTO_INTERMEDIO'),
  (SELECT id FROM estados_actividades WHERE codigo = 'ACTIVA'),
  'Clases de canto nivel intermedio',
  '2025-01-01 00:00:00',
  6,
  4500.00
);

-- Horarios Canto (Martes y Jueves 15:00-16:30)
INSERT INTO horarios_actividades (actividad_id, dia_semana_id, hora_inicio, hora_fin)
SELECT
  (SELECT id FROM actividades WHERE codigo_actividad = 'CANTO-INT-2025-A'),
  ds.id,
  '15:00:00',
  '16:30:00'
FROM dias_semana ds
WHERE ds.codigo IN ('MARTES', 'JUEVES');

-- Mensaje de finalización
DO $$ BEGIN
  RAISE NOTICE 'Seed de datos de ejemplo completado exitosamente';
  RAISE NOTICE 'Actividades creadas: 4';
  RAISE NOTICE '  - Coro Adultos (3 horarios)';
  RAISE NOTICE '  - Piano Nivel 1 Grupo 1 (1 horario)';
  RAISE NOTICE '  - Piano Nivel 1 Grupo 2 - PARALELO (1 horario)';
  RAISE NOTICE '  - Canto Intermedio (2 horarios)';
END $$;

COMMIT;

-- Verificación: Mostrar actividades creadas con sus horarios
SELECT
  a.codigo_actividad,
  a.nombre,
  ta.nombre as tipo,
  ca.nombre as categoria,
  ea.nombre as estado,
  a.cupo_maximo,
  a.costo,
  COUNT(ha.id) as num_horarios
FROM actividades a
INNER JOIN tipos_actividades ta ON ta.id = a.tipo_actividad_id
INNER JOIN categorias_actividades ca ON ca.id = a.categoria_id
INNER JOIN estados_actividades ea ON ea.id = a.estado_id
LEFT JOIN horarios_actividades ha ON ha.actividad_id = a.id
GROUP BY a.id, a.codigo_actividad, a.nombre, ta.nombre, ca.nombre, ea.nombre, a.cupo_maximo, a.costo
ORDER BY a.codigo_actividad;
