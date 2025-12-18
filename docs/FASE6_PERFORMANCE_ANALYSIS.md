# FASE 6: Análisis de Performance y Optimización

**Fecha:** 2025-12-18
**Estado:** Task 6.1 - Análisis de Índices de Base de Datos
**Branch:** `feature/cuotas-items-system`

---

## 📊 Análisis de Queries Frecuentes

### 1. Queries Más Comunes Identificados

#### 1.1 Módulo de Recibos
```sql
-- Query 1: Búsqueda de recibos por receptor (socios)
SELECT * FROM recibos WHERE receptor_id = ? ORDER BY fecha DESC;

-- Query 2: Búsqueda de recibos pendientes
SELECT * FROM recibos WHERE estado = 'PENDIENTE';

-- Query 3: Búsqueda de recibos vencidos
SELECT * FROM recibos
WHERE fecha_vencimiento < NOW()
  AND estado IN ('PENDIENTE', 'VENCIDO');

-- Query 4: Búsqueda por rango de fechas
SELECT * FROM recibos
WHERE fecha >= ? AND fecha <= ?
ORDER BY fecha DESC;
```

**Índices necesarios:**
- ✅ `receptorId` (filtro frecuente por socio)
- ✅ `emisorId` (filtro por emisor)
- ✅ `estado` (filtro por estado de pago)
- ✅ `fecha` (ordenamiento y filtros de rango)
- ✅ `fechaVencimiento` (filtro de recibos vencidos)
- ✅ **Índice compuesto:** `(estado, fechaVencimiento)` - Para query de vencidos

#### 1.2 Módulo de Cuotas
```sql
-- Query 1: Búsqueda por período (muy frecuente en generación)
SELECT * FROM cuotas WHERE mes = ? AND anio = ?;

-- Query 2: Búsqueda de cuotas de un socio
SELECT c.* FROM cuotas c
JOIN recibos r ON c.recibo_id = r.id
WHERE r.receptor_id = ?
ORDER BY c.anio DESC, c.mes DESC;

-- Query 3: Dashboard de cuotas impagas
SELECT c.* FROM cuotas c
JOIN recibos r ON c.recibo_id = r.id
WHERE r.estado IN ('PENDIENTE', 'VENCIDO');

-- Query 4: Búsqueda por categoría y período
SELECT * FROM cuotas
WHERE categoria_id = ? AND mes = ? AND anio = ?;
```

**Índices necesarios:**
- ✅ Existing: `[mes, anio]` (búsqueda por período)
- ✅ Existing: `categoriaId` (filtro por categoría)
- ✅ **Nuevo índice compuesto:** `(categoriaId, mes, anio)` - Optimiza query de generación

#### 1.3 Módulo de Items de Cuota
```sql
-- Query 1: Obtener todos los items de una cuota (muy frecuente)
SELECT * FROM items_cuota WHERE cuota_id = ?;

-- Query 2: Buscar items por tipo (reportes)
SELECT * FROM items_cuota WHERE tipo_item_id = ?;

-- Query 3: Reportes de items por cuota y tipo
SELECT * FROM items_cuota
WHERE cuota_id = ? AND tipo_item_id = ?;

-- Query 4: Estadísticas de items por tipo
SELECT tipo_item_id, SUM(monto), COUNT(*)
FROM items_cuota
GROUP BY tipo_item_id;
```

**Índices necesarios:**
- ✅ Existing: `cuotaId` (filtro principal)
- ✅ Existing: `tipoItemId` (filtro por tipo)
- ✅ **Nuevo índice compuesto:** `(cuotaId, tipoItemId)` - Optimiza reportes

#### 1.4 Módulo de Ajustes y Exenciones
```sql
-- Query 1: Ajustes activos de un socio
SELECT * FROM ajustes_cuota_socio
WHERE persona_id = ? AND activo = true;

-- Query 2: Ajustes vigentes en un período
SELECT * FROM ajustes_cuota_socio
WHERE persona_id = ?
  AND fecha_inicio <= ?
  AND (fecha_fin IS NULL OR fecha_fin >= ?)
  AND activo = true;

-- Query 3: Exenciones vigentes
SELECT * FROM exenciones_cuota
WHERE persona_id = ?
  AND estado = 'VIGENTE'
  AND activa = true;

-- Query 4: Historial de cambios de cuota
SELECT * FROM historial_ajustes_cuota
WHERE cuota_id = ?
ORDER BY created_at DESC;
```

**Índices necesarios:**
- ✅ Existing: `ajustes_cuota_socio(personaId, activo, fechaInicio, fechaFin)`
- ✅ Existing: `exenciones_cuota(personaId, estado, activa, fechaInicio, fechaFin)`
- ✅ Existing: `historial_ajustes_cuota(cuotaId, createdAt)`
- ✅ **Nuevo índice compuesto:** `ajustes_cuota_socio(personaId, activo, fechaInicio)` - Query de vigencia
- ✅ **Nuevo índice compuesto:** `exenciones_cuota(personaId, estado, activa)` - Query de vigencia

#### 1.5 Módulo de Actividades y Participaciones
```sql
-- Query 1: Participaciones activas de un socio
SELECT * FROM participacion_actividades
WHERE persona_id = ? AND activa = true;

-- Query 2: Participantes de una actividad
SELECT * FROM participacion_actividades
WHERE actividad_id = ? AND activa = true;

-- Query 3: Participaciones en período
SELECT * FROM participacion_actividades
WHERE persona_id = ?
  AND fecha_inicio <= ?
  AND (fecha_fin IS NULL OR fecha_fin >= ?);

-- Query 4: Actividades activas
SELECT * FROM actividades WHERE activa = true;
```

**Índices necesarios:**
- ✅ **Nuevo:** `actividades(activa)` - Filtro muy frecuente
- ✅ **Nuevo:** `participacion_actividades(personaId, activa)` - Query de participaciones activas
- ✅ **Nuevo:** `participacion_actividades(actividadId, activa)` - Query de participantes
- ✅ **Nuevo:** `participacion_actividades(personaId, fechaInicio, fechaFin)` - Query de período

#### 1.6 Módulo de Familiares
```sql
-- Query 1: Relaciones familiares activas de un socio
SELECT * FROM familiares
WHERE socio_id = ? AND activo = true;

-- Query 2: Familiares con descuento
SELECT * FROM familiares
WHERE socio_id = ? AND activo = true AND descuento > 0;

-- Query 3: Todas las relaciones (bidireccional)
SELECT * FROM familiares
WHERE (socio_id = ? OR familiar_id = ?) AND activo = true;
```

**Índices necesarios:**
- ✅ Existing: `familiares(activo)`
- ✅ **Nuevo:** `familiares(socioId, activo)` - Query principal
- ✅ **Nuevo:** `familiares(familiarId, activo)` - Query bidireccional

---

## 🔍 Índices Faltantes Críticos

### Prioridad ALTA (impacto directo en performance)

1. **recibos.receptorId** - Query de cuotas por socio (muy frecuente)
2. **recibos.emisorId** - Query de recibos emitidos
3. **recibos.estado** - Filtro de recibos pendientes/pagados
4. **recibos.fecha** - Ordenamiento y rangos de fechas
5. **recibos.fechaVencimiento** - Query de recibos vencidos
6. **recibos(estado, fechaVencimiento)** - Índice compuesto para vencidos
7. **actividades.activa** - Filtro de actividades activas
8. **participacion_actividades(personaId, activa)** - Participaciones activas
9. **participacion_actividades(actividadId, activa)** - Participantes de actividad
10. **familiares(socioId, activo)** - Relaciones familiares activas

### Prioridad MEDIA (mejoras de performance)

11. **cuotas(categoriaId, mes, anio)** - Índice compuesto para generación
12. **items_cuota(cuotaId, tipoItemId)** - Índice compuesto para reportes
13. **ajustes_cuota_socio(personaId, activo, fechaInicio)** - Ajustes vigentes
14. **exenciones_cuota(personaId, estado, activa)** - Exenciones vigentes
15. **participacion_actividades(personaId, fechaInicio, fechaFin)** - Período
16. **familiares(familiarId, activo)** - Búsqueda bidireccional
17. **horarios_actividades(actividadId, activo)** - Horarios activos

### Prioridad BAJA (optimizaciones menores)

18. **docentes_actividades(docenteId, activo)** - Docente activo
19. **persona_tipo(personaId, activo)** - Tipos activos (ya existe index individual)
20. **historial_ajustes_cuota(personaId, createdAt)** - Historial por persona

---

## 📈 Impacto Esperado

### Queries de Recibos
- **Antes:** Full table scan en recibos (10,000+ registros)
- **Después:** Index scan con índice en receptorId, estado, fecha
- **Mejora esperada:** 10-50x más rápido (de 500ms a 10-50ms)

### Queries de Cuotas por Socio
- **Antes:** JOIN sin índice en receptorId (nested loop)
- **Después:** Index scan directo
- **Mejora esperada:** 5-20x más rápido (de 200ms a 10-40ms)

### Queries de Participaciones Activas
- **Antes:** Full table scan con filtro activa = true
- **Después:** Index scan directo
- **Mejora esperada:** 10-100x más rápido (de 1000ms a 10-100ms)

### Dashboard de Cuotas Impagas
- **Antes:** JOIN + filtro sin índice en estado
- **Después:** Índice compuesto (estado, fechaVencimiento)
- **Mejora esperada:** 20-50x más rápido (de 800ms a 16-40ms)

---

## 🎯 Plan de Implementación

### Fase 1: Índices Críticos (Prioridad ALTA)
**Tiempo estimado:** 30-60 minutos

1. ✅ Crear migration con índices en `recibos`
2. ✅ Crear índices en `actividades` y `participacion_actividades`
3. ✅ Crear índices en `familiares`
4. ✅ Aplicar migration y validar
5. ✅ Ejecutar EXPLAIN ANALYZE en queries clave

**Comandos:**
```bash
# Generar migration
npx prisma migrate dev --name add_performance_indexes_phase1

# Validar índices creados
psql -h localhost -U postgres -d sigesda -c "\d+ recibos"
psql -h localhost -U postgres -d sigesda -c "\d+ actividades"
```

### Fase 2: Índices Compuestos (Prioridad MEDIA)
**Tiempo estimado:** 30-45 minutos

1. ✅ Crear índices compuestos en `cuotas`, `items_cuota`
2. ✅ Crear índices compuestos en `ajustes_cuota_socio`, `exenciones_cuota`
3. ✅ Validar con queries reales

### Fase 3: Optimizaciones Menores (Prioridad BAJA)
**Tiempo estimado:** 15-30 minutos

1. ✅ Crear índices restantes
2. ✅ Documentar cambios

---

## 📝 Validación de Performance

### Tests de Benchmark

```bash
# Test 1: Query de recibos por receptor
EXPLAIN ANALYZE
SELECT * FROM recibos WHERE receptor_id = 1 ORDER BY fecha DESC LIMIT 50;

# Test 2: Query de cuotas impagas
EXPLAIN ANALYZE
SELECT c.* FROM cuotas c
JOIN recibos r ON c.recibo_id = r.id
WHERE r.estado IN ('PENDIENTE', 'VENCIDO');

# Test 3: Query de participaciones activas
EXPLAIN ANALYZE
SELECT * FROM participacion_actividades
WHERE persona_id = 1 AND activa = true;

# Test 4: Query de recibos vencidos
EXPLAIN ANALYZE
SELECT * FROM recibos
WHERE estado IN ('PENDIENTE', 'VENCIDO')
  AND fecha_vencimiento < NOW();
```

### Métricas a Medir

1. **Execution Time:** Tiempo total de ejecución
2. **Planning Time:** Tiempo de planificación del query
3. **Rows Scanned:** Filas escaneadas vs. retornadas
4. **Index Usage:** Confirmación de uso de índices
5. **Seq Scan vs Index Scan:** Ratio de scans secuenciales vs. índices

**Objetivo:**
- Execution Time < 50ms para queries individuales
- Execution Time < 200ms para queries con JOINs
- Index Scan en 95%+ de queries frecuentes

---

## 🔧 Herramientas de Análisis

### PostgreSQL EXPLAIN ANALYZE
```sql
-- Analizar query plan y performance
EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
SELECT ...;
```

### pg_stat_statements (Extension)
```sql
-- Habilitar extension
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Ver queries más lentas
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 20;
```

### Índices No Utilizados
```sql
-- Identificar índices sin uso
SELECT schemaname, tablename, indexname, idx_scan
FROM pg_stat_user_indexes
WHERE idx_scan = 0
ORDER BY tablename, indexname;
```

---

## 📊 Seguimiento de Progreso

- [ ] **Fase 1:** Índices críticos (10 índices) - EN PROGRESO
- [ ] **Fase 2:** Índices compuestos (7 índices) - PENDIENTE
- [ ] **Fase 3:** Optimizaciones menores (3 índices) - PENDIENTE
- [ ] **Validación:** Benchmarks antes/después - PENDIENTE
- [ ] **Documentación:** Guía de performance - PENDIENTE

**Total de índices a crear:** 20 índices nuevos

---

**Última actualización:** 2025-12-18
**Responsable:** Claude Code
**Próximo paso:** Crear migration de Fase 1 con índices críticos
