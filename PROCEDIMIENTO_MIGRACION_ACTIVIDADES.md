# 📋 PROCEDIMIENTO DE MIGRACIÓN: Actividades ENUM → Catálogos

**Autor**: Claude Code
**Fecha**: 2025-11-17
**Versión**: 1.0
**Criticidad**: 🔴 ALTA (Cambia schema de tablas principales)

---

## 🎯 RESUMEN EJECUTIVO

Esta migración actualiza el módulo de **Actividades** para usar **catálogos con IDs** en lugar de **ENUMs**, alineándolo con la arquitectura del resto del sistema (personas, contactos, etc.).

**Duración estimada**: 10-15 minutos
**Downtime requerido**: ⚠️ SÍ (5-10 minutos)
**Rollback disponible**: ✅ SÍ (con backup)

---

## ✅ PRE-REQUISITOS

### 1. **Backups**
- [x] Backup completo de base de datos
- [x] Backup de archivos del proyecto (git commit)
- [x] Punto de restauración documentado

### 2. **Validaciones**
- [x] Entorno de desarrollo funcional
- [x] Tests existentes pasando
- [x] Catálogos poblados (seed ejecutado)

### 3. **Herramientas**
- [x] PostgreSQL 16+ instalado
- [x] Node.js 20+ instalado
- [x] Acceso a base de datos
- [x] Permisos de administrador

---

## 📝 PROCEDIMIENTO PASO A PASO

### **PASO 0: Preparación** (5 min)

```bash
# 1. Navegar al proyecto
cd /home/francisco/PROYECTOS/SIGESDA/SIGESDA-BACKEND

# 2. Hacer commit de cambios pendientes
git add .
git commit -m "Pre-migración: Estado actual antes de migrar actividades"
git tag pre-migracion-actividades-$(date +%Y%m%d)

# 3. Crear backup de base de datos
PGPASSWORD='SiGesda2024!' pg_dump -h localhost -U postgres sigesda > backup_pre_migracion_actividades_$(date +%Y%m%d_%H%M%S).sql

# 4. Verificar que el servidor NO esté corriendo
lsof -ti:8000 | xargs kill -9 2>/dev/null || true
lsof -ti:3001 | xargs kill -9 2>/dev/null || true
```

**✅ Checkpoint**: Backup creado exitosamente

---

### **PASO 1: Migración SQL - Agregar Columnas** (2 min)

```bash
# Ejecutar script que agrega columnas nuevas (sin eliminar legacy)
PGPASSWORD='SiGesda2024!' psql -h localhost -U postgres -d sigesda -f scripts/migration-actividades-step1.sql
```

**Qué hace este script:**
- ✅ Agrega `codigo_actividad`, `tipo_actividad_id`, `categoria_id`, `estado_id`
- ✅ Agrega `fecha_desde`, `fecha_hasta`, `costo`, `observaciones`
- ✅ Agrega `dia_semana_id` en `horarios_actividades`
- ✅ Convierte `horaInicio`/`horaFin` de TIME a VARCHAR
- ⚠️ NO elimina campos legacy (mantiene compatibilidad)

**Salida esperada:**
```
BEGIN
ALTER TABLE
ALTER TABLE
...
COMMIT

 tabla                   | con_codigo | con_tipo_id | total
-------------------------+------------+-------------+-------
 actividades             |          0 |           0 |     N
 horarios_actividades    |          0 |           0 |     M
```

**✅ Checkpoint**: Columnas agregadas, datos legacy intactos

---

### **PASO 2: Migración de Datos TypeScript** (3 min)

```bash
# Ejecutar script de migración de datos
npx ts-node scripts/migrate-actividades-to-catalogos.ts
```

**Qué hace este script:**
- ✅ Mapea `TipoActividad` ENUM → `tipos_actividades.id`
- ✅ Mapea `DiaSemana` ENUM → `dias_semana.id`
- ✅ Genera códigos únicos (`ACT-CORO-0001`, etc.)
- ✅ Asigna valores por defecto (categoría=MÚSICA, estado=ACTIVA)
- ✅ Valida integridad de datos

**Salida esperada:**
```
🚀 INICIANDO MIGRACIÓN ACTIVIDADES ENUM → CATÁLOGOS

================================================================================
  PASO 1: Migrar Actividades (ENUM → Catálogo IDs)
================================================================================

ℹ Catálogos cargados:
  ℹ - Tipos: 3
  ℹ - Categorías: 3
  ℹ - Estados: 4

ℹ Actividades a migrar: 2

  ✓ Actividad 1 (Coro Municipal): CORO → CORO (ID: 1)
  ✓ Actividad 2 (Clase de Piano Individual): CLASE_INSTRUMENTO → CLASE_INDIVIDUAL (ID: 2)

📊 Resumen Actividades:
  ✓ Migradas: 2

================================================================================
  PASO 2: Migrar Horarios (DiaSemana ENUM → dias_semana ID)
================================================================================

ℹ Días de semana cargados: 7
ℹ Horarios a migrar: 3

  ✓ Horario 1: LUNES → LUNES (ID: 1)
  ✓ Horario 2: MIERCOLES → MIERCOLES (ID: 3)
  ✓ Horario 3: MARTES → MARTES (ID: 2)

📊 Resumen Horarios:
  ✓ Migrados: 3

================================================================================
  PASO 3: Validar Migración
================================================================================

ℹ Actividades migradas: 2 / 2
ℹ Horarios migrados: 3 / 3

✅ MIGRACIÓN COMPLETADA EXITOSAMENTE
✓ Todos los registros tienen referencias a catálogos
```

**✅ Checkpoint**: Datos migrados correctamente

---

### **PASO 3: Constraints y Limpieza SQL** (2 min)

```bash
# Ejecutar script que agrega constraints y elimina legacy
PGPASSWORD='SiGesda2024!' psql -h localhost -U postgres -d sigesda -f scripts/migration-actividades-step2.sql
```

**Qué hace este script:**
- ✅ Hace NOT NULL las columnas nuevas
- ✅ Agrega UNIQUE constraint en `codigo_actividad`
- ✅ Agrega FOREIGN KEY constraints
- ✅ Agrega índices para performance
- ✅ Elimina columnas legacy (`tipo`, `diaSemana`, `precio`, `duracion`)

**Salida esperada:**
```
BEGIN
ALTER TABLE
ALTER TABLE
CREATE INDEX
...
COMMIT

 column_name         | data_type         | is_nullable | column_default
---------------------+-------------------+-------------+---------------
 categoria_id        | integer           | NO          |
 codigo_actividad    | character varying | NO          |
 costo               | numeric           | NO          | 0
 estado_id           | integer           | NO          |
 fecha_desde         | timestamp         | NO          |
 tipo_actividad_id   | integer           | NO          |
```

**✅ Checkpoint**: Schema limpio, constraints aplicados

---

### **PASO 4: Actualizar Schema Prisma** (3 min)

```bash
# 1. Editar prisma/schema.prisma manualmente
# Reemplazar las secciones de actividades, horarios_actividades, catálogos
# Usar como referencia: scripts/SCHEMA_ACTIVIDADES_V2.prisma

# 2. Eliminar ENUMs no usados
# Buscar y eliminar:
#   - enum TipoActividad { ... }
#   - enum DiaSemana { ... }

# 3. Generar cliente Prisma nuevo
npx prisma generate

# 4. Verificar que compila sin errores
npx tsc --noEmit
```

**Archivos a editar:**
- `prisma/schema.prisma` → Reemplazar models `actividades` y `horarios_actividades`

**✅ Checkpoint**: Schema Prisma actualizado, cliente regenerado

---

### **PASO 5: Validación Post-Migración** (2 min)

```bash
# Ejecutar script de validación
npx ts-node scripts/validate-migration-actividades.ts
```

**Salida esperada:**
```
🔍 VALIDACIÓN DE MIGRACIÓN ACTIVIDADES

================================================================================
  VALIDACIÓN 1: Actividades con Catálogos
================================================================================

✓ Todas las actividades tienen codigo_actividad
✓ Todas las actividades tienen tipo_actividad_id
✓ Todas las actividades tienen categoria_id
✓ Todas las actividades tienen estado_id
✓ Campo legacy "tipo" eliminado correctamente

================================================================================
  VALIDACIÓN 2: Horarios con dias_semana FK
================================================================================

✓ Todos los horarios tienen dia_semana_id
✓ Campo legacy "diaSemana" eliminado correctamente

================================================================================
  VALIDACIÓN 3: Integridad Referencial
================================================================================

✓ Todas las FKs de actividades son válidas
✓ Todas las FKs de horarios son válidas

================================================================================
  VALIDACIÓN 4: Constraints y Unique Keys
================================================================================

✓ No hay códigos de actividad duplicados
✓ No hay horarios duplicados

================================================================================
  RESUMEN DE VALIDACIÓN
================================================================================

✓ Validaciones pasadas: 10
✗ Validaciones fallidas: 0
⚠ Advertencias: 0

✅ MIGRACIÓN VALIDADA EXITOSAMENTE
```

**✅ Checkpoint**: Validación exitosa

---

### **PASO 6: Tests Funcionales** (3 min)

```bash
# 1. Iniciar servidor
npm run dev &
sleep 5

# 2. Ejecutar tests de CRUD actividades
npx ts-node tests/test-actividades-crud.ts
```

**Salida esperada:**
```
🧪 INICIANDO TESTS CRUD ACTIVIDADES - ARQUITECTURA PERSONA_TIPO V2

================================================================================
TEST 1: Obtener Docentes Disponibles (persona_tipo V2)
================================================================================

✓ Docentes disponibles obtenidos correctamente

================================================================================
TEST 2: Crear Actividad con Docente Asignado
================================================================================

✓ Actividad creada exitosamente

... [resto de tests] ...

================================================================================
RESUMEN DE TESTS
================================================================================

✓ Tests pasados: 9
✗ Tests fallidos: 0
```

**✅ Checkpoint**: Tests funcionales pasando

---

## 🔄 PROCEDIMIENTO DE ROLLBACK

**SOLO en caso de error crítico**

### **Opción A: Rollback Completo (Base de Datos)** ⚠️

```bash
# 1. Matar servidor
lsof -ti:8000 | xargs kill -9 2>/dev/null || true

# 2. Restaurar backup de BD
PGPASSWORD='SiGesda2024!' dropdb -h localhost -U postgres sigesda
PGPASSWORD='SiGesda2024!' createdb -h localhost -U postgres sigesda
PGPASSWORD='SiGesda2024!' psql -h localhost -U postgres -d sigesda < backup_pre_migracion_actividades_XXXXXX.sql

# 3. Restaurar código
git checkout pre-migracion-actividades-XXXXXX
npm run db:generate

# 4. Reiniciar servidor
npm run dev
```

**Duración**: 5-10 minutos
**Pérdida de datos**: ⚠️ SÍ (desde el backup hasta el momento del rollback)

### **Opción B: Rollback Parcial (Schema solo)** 🔄

```bash
# Si solo necesitas revertir el schema de Prisma
git checkout HEAD~1 -- prisma/schema.prisma
npx prisma generate
```

---

## 📊 CRITERIOS DE ÉXITO

- [x] ✅ Todas las validaciones pasan (10/10)
- [x] ✅ Tests funcionales pasan (9/9)
- [x] ✅ No hay campos ENUM legacy en actividades
- [x] ✅ Todas las actividades tienen FKs a catálogos
- [x] ✅ API endpoints funcionan correctamente
- [x] ✅ Performance aceptable (queries < 100ms)

---

## 🚨 ERRORES COMUNES Y SOLUCIONES

### Error 1: "Column 'tipo' does not exist"
**Causa**: Código TypeScript aún referencia campo legacy
**Solución**: Actualizar `src/repositories/actividad.repository.ts`

### Error 2: "Foreign key constraint violation"
**Causa**: Catálogos no poblados o IDs incorrectos
**Solución**: Ejecutar `npm run db:seed` primero

### Error 3: "Duplicate key value violates unique constraint"
**Causa**: Datos duplicados antes de migración
**Solución**: Limpiar duplicados manualmente con SQL

---

## 📞 CONTACTO Y SOPORTE

**Documentación**: `/PLAN_MIGRACION_ACTIVIDADES.md`
**Scripts**: `/scripts/migration-actividades-*.sql` y `.ts`
**Backup**: `/backup_pre_migracion_actividades_*.sql`

---

## ✅ CHECKLIST FINAL

Post-migración, verificar:

- [ ] Servidor inicia sin errores
- [ ] Endpoint `/api/actividades` responde
- [ ] Endpoint `/api/actividades/catalogos/todos` retorna catálogos
- [ ] Se puede crear actividad nueva
- [ ] Se puede asignar docente a actividad
- [ ] Se puede agregar participante
- [ ] Tests automatizados pasan
- [ ] No hay warnings en consola

---

**🎉 ¡Migración completada exitosamente!**
