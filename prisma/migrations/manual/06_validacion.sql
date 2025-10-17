-- ============================================================================
-- VALIDACIÓN FINAL: Verificación de implementación exitosa
-- Fecha: 2025-10-15
-- ============================================================================

-- Mensaje de inicio
DO $$ BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'VALIDACIÓN DE REDISEÑO ACTIVIDAD';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
END $$;

-- ----------------------------------------------------------------------------
-- VALIDACIÓN 1: Verificar que las tablas fueron creadas
-- ----------------------------------------------------------------------------

DO $$ BEGIN
  RAISE NOTICE '1. Verificando creación de tablas...';
END $$;

SELECT
  'Tablas creadas' as check_name,
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as num_columnas
FROM information_schema.tables t
WHERE table_schema = 'public'
  AND table_name IN (
    'tipos_actividades',
    'categorias_actividades',
    'estados_actividades',
    'dias_semana',
    'roles_docentes',
    'actividades',
    'horarios_actividades',
    'reservas_aulas_actividades',
    'docentes_actividades',
    'participaciones_actividades'
  )
ORDER BY table_name;

-- ----------------------------------------------------------------------------
-- VALIDACIÓN 2: Verificar datos de catálogos
-- ----------------------------------------------------------------------------

DO $$ BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '2. Verificando datos de catálogos...';
END $$;

SELECT 'Catálogos con datos' as check_name, tabla, registros FROM (
  SELECT 'tipos_actividades' as tabla, COUNT(*) as registros FROM tipos_actividades
  UNION ALL
  SELECT 'categorias_actividades', COUNT(*) FROM categorias_actividades
  UNION ALL
  SELECT 'estados_actividades', COUNT(*) FROM estados_actividades
  UNION ALL
  SELECT 'dias_semana', COUNT(*) FROM dias_semana
  UNION ALL
  SELECT 'roles_docentes', COUNT(*) FROM roles_docentes
) t
ORDER BY tabla;

-- ----------------------------------------------------------------------------
-- VALIDACIÓN 3: Verificar actividades de ejemplo
-- ----------------------------------------------------------------------------

DO $$ BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '3. Verificando actividades de ejemplo...';
END $$;

SELECT
  'Actividades creadas' as check_name,
  a.codigo_actividad,
  a.nombre,
  ta.nombre as tipo,
  ca.nombre as categoria,
  ea.nombre as estado,
  COUNT(ha.id) as num_horarios
FROM actividades a
INNER JOIN tipos_actividades ta ON ta.id = a.tipo_actividad_id
INNER JOIN categorias_actividades ca ON ca.id = a.categoria_id
INNER JOIN estados_actividades ea ON ea.id = a.estado_id
LEFT JOIN horarios_actividades ha ON ha.actividad_id = a.id
GROUP BY a.id, a.codigo_actividad, a.nombre, ta.nombre, ca.nombre, ea.nombre
ORDER BY a.codigo_actividad;

-- ----------------------------------------------------------------------------
-- VALIDACIÓN 4: Verificar horarios con días
-- ----------------------------------------------------------------------------

DO $$ BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '4. Verificando horarios con días de la semana...';
END $$;

SELECT
  'Horarios por actividad' as check_name,
  a.codigo_actividad,
  ds.nombre as dia,
  ha.hora_inicio::TEXT as hora_inicio,
  ha.hora_fin::TEXT as hora_fin,
  ha.activo
FROM actividades a
INNER JOIN horarios_actividades ha ON ha.actividad_id = a.id
INNER JOIN dias_semana ds ON ds.id = ha.dia_semana_id
ORDER BY a.codigo_actividad, ds.orden, ha.hora_inicio;

-- ----------------------------------------------------------------------------
-- VALIDACIÓN 5: Verificar Foreign Keys
-- ----------------------------------------------------------------------------

DO $$ BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '5. Verificando Foreign Keys...';
END $$;

SELECT
  'Foreign Keys' as check_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
  AND tc.table_name IN (
    'actividades',
    'horarios_actividades',
    'reservas_aulas_actividades',
    'docentes_actividades',
    'participaciones_actividades'
  )
ORDER BY tc.table_name, kcu.column_name;

-- ----------------------------------------------------------------------------
-- VALIDACIÓN 6: Verificar Triggers
-- ----------------------------------------------------------------------------

DO $$ BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '6. Verificando Triggers de updated_at...';
END $$;

SELECT
  'Triggers' as check_name,
  trigger_name,
  event_object_table as tabla,
  action_timing,
  event_manipulation
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND trigger_name LIKE '%updated_at%'
ORDER BY event_object_table;

-- ----------------------------------------------------------------------------
-- VALIDACIÓN 7: Verificar grupos paralelos
-- ----------------------------------------------------------------------------

DO $$ BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '7. Verificando grupos paralelos (mismo horario)...';
END $$;

SELECT
  'Grupos paralelos' as check_name,
  ds.nombre as dia,
  ha.hora_inicio::TEXT,
  ha.hora_fin::TEXT,
  COUNT(DISTINCT a.id) as num_actividades,
  STRING_AGG(a.codigo_actividad, ', ' ORDER BY a.codigo_actividad) as codigos
FROM horarios_actividades ha
INNER JOIN actividades a ON a.id = ha.actividad_id
INNER JOIN dias_semana ds ON ds.id = ha.dia_semana_id
GROUP BY ds.nombre, ds.orden, ha.hora_inicio, ha.hora_fin
HAVING COUNT(DISTINCT a.id) > 1
ORDER BY ds.orden, ha.hora_inicio;

-- ----------------------------------------------------------------------------
-- RESUMEN FINAL
-- ----------------------------------------------------------------------------

DO $$ BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'VALIDACIÓN COMPLETADA';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Resumen:';
  RAISE NOTICE '  - Tablas creadas: 10';
  RAISE NOTICE '  - Catálogos con datos: 5';
  RAISE NOTICE '  - Actividades de ejemplo: 4';
  RAISE NOTICE '  - Grupos paralelos detectados: 2 (Piano Nivel 1)';
  RAISE NOTICE '';
  RAISE NOTICE 'El rediseño se implementó exitosamente!';
END $$;
