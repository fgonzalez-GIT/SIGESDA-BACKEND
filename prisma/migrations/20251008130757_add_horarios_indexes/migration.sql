-- CreateIndex para mejorar performance de consultas en horarios_actividades

-- Índice para consultas por actividadId (muy frecuente)
CREATE INDEX IF NOT EXISTS "idx_horarios_actividad_id" ON "horarios_actividades"("actividadId");

-- Índice para consultas por día de semana (para getActividadesPorDia)
CREATE INDEX IF NOT EXISTS "idx_horarios_dia_semana" ON "horarios_actividades"("diaSemana");

-- Índice para horarios activos (para filtrar rápidamente)
CREATE INDEX IF NOT EXISTS "idx_horarios_activo" ON "horarios_actividades"("activo");

-- Índice compuesto para búsquedas por día y hora (para verificar conflictos)
CREATE INDEX IF NOT EXISTS "idx_horarios_dia_hora" ON "horarios_actividades"("diaSemana", "horaInicio", "horaFin");

-- Índice compuesto para búsquedas de actividad activa por día
CREATE INDEX IF NOT EXISTS "idx_horarios_actividad_dia_activo" ON "horarios_actividades"("actividadId", "diaSemana", "activo");

-- Comentarios para documentación
COMMENT ON INDEX "idx_horarios_actividad_id" IS 'Optimiza getHorariosByActividad';
COMMENT ON INDEX "idx_horarios_dia_semana" IS 'Optimiza findActividadesByDia';
COMMENT ON INDEX "idx_horarios_activo" IS 'Filtrado rápido de horarios activos';
COMMENT ON INDEX "idx_horarios_dia_hora" IS 'Optimiza verificación de conflictos';
COMMENT ON INDEX "idx_horarios_actividad_dia_activo" IS 'Optimiza consultas combinadas';
