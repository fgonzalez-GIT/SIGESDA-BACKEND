# 📊 ESTADO DE MIGRACIÓN ACTIVIDADES - REPORTE FINAL

**Fecha**: 2025-11-17
**Estado General**: ⚠️ **PARCIALMENTE COMPLETADA**
**Progreso**: 6/8 pasos completados (75%)

---

## ✅ PASOS COMPLETADOS EXITOSAMENTE

### PASO 0: Preparación y Backups ✅
- Creado tag git: `pre-migracion-actividades-v2`
- Commit de respaldo creado en rama `backend-etapa-5`
- Rollback disponible mediante git

### PASO 1: Migración SQL - Agregar Columnas Nuevas ✅
**Archivo**: `scripts/migration-actividades-step1-fixed.sql`

**Cambios aplicados en BD**:
```sql
-- Tabla: actividades
ALTER TABLE actividades ADD COLUMN codigo_actividad VARCHAR(50);
ALTER TABLE actividades ADD COLUMN tipo_actividad_id INT;
ALTER TABLE actividades ADD COLUMN categoria_id INT;
ALTER TABLE actividades ADD COLUMN estado_id INT;
ALTER TABLE actividades ADD COLUMN fecha_desde TIMESTAMP;
ALTER TABLE actividades ADD COLUMN fecha_hasta TIMESTAMP;
ALTER TABLE actividades ADD COLUMN costo DECIMAL(8,2) DEFAULT 0;
ALTER TABLE actividades ADD COLUMN observaciones TEXT;

-- Tabla: horarios_actividades
ALTER TABLE horarios_actividades ADD COLUMN dia_semana_id INT;
```

**Resultado**: ✅ Columnas agregadas sin romper compatibilidad

---

### PASO 2: Migración de Datos (ENUM → Catálogo IDs) ✅
**Archivo**: `scripts/migrate-actividades-to-catalogos.ts`

**Resultados de la migración**:
```
✓ Actividad 3 (Coro Municipal): CORO → CORO (ID: 4)
✓ Actividad 4 (Clase de Piano Individual): CLASE_INSTRUMENTO → CLASE_INDIVIDUAL (ID: 5)

📊 Resumen Actividades:
  ✓ Migradas: 2/2
  ✗ Errores: 0

📊 Resumen Horarios:
  ✓ Migrados: 0 (no había horarios)
  ✗ Errores: 0

✅ MIGRACIÓN COMPLETADA EXITOSAMENTE
```

**Mapeo aplicado**:
- `TipoActividad.CORO` → `tipos_actividades.id = 4`
- `TipoActividad.CLASE_INSTRUMENTO` → `tipos_actividades.id = 5`

---

### PASO 3: Migración SQL - Constraints y Limpieza ✅
**Archivo**: `scripts/migration-actividades-step2-fixed.sql`

**Cambios aplicados**:
```sql
-- Constraints NOT NULL
ALTER TABLE actividades ALTER COLUMN codigo_actividad SET NOT NULL;
ALTER TABLE actividades ALTER COLUMN tipo_actividad_id SET NOT NULL;
ALTER TABLE actividades ALTER COLUMN categoria_id SET NOT NULL;
ALTER TABLE actividades ALTER COLUMN estado_id SET NOT NULL;

-- Constraints UNIQUE
ALTER TABLE actividades ADD CONSTRAINT actividades_codigo_actividad_key UNIQUE (codigo_actividad);

-- Foreign Keys
ALTER TABLE actividades ADD CONSTRAINT actividades_tipo_actividad_id_fkey
  FOREIGN KEY (tipo_actividad_id) REFERENCES tipos_actividades(id);
ALTER TABLE actividades ADD CONSTRAINT actividades_categoria_id_fkey
  FOREIGN KEY (categoria_id) REFERENCES categorias_actividades(id);
ALTER TABLE actividades ADD CONSTRAINT actividades_estado_id_fkey
  FOREIGN KEY (estado_id) REFERENCES estados_actividades(id);

-- Índices
CREATE INDEX actividades_tipo_actividad_id_idx ON actividades(tipo_actividad_id);
CREATE INDEX actividades_categoria_id_idx ON actividades(categoria_id);
CREATE INDEX actividades_estado_id_idx ON actividades(estado_id);

-- Eliminar columnas legacy
ALTER TABLE actividades DROP COLUMN tipo;
ALTER TABLE actividades DROP COLUMN duracion;
ALTER TABLE actividades DROP COLUMN precio;
```

**Resultado**: ✅ Integridad referencial establecida correctamente

---

### PASO 4: Actualizar Schema Prisma ✅
**Archivo**: `prisma/schema.prisma`

**Cambios aplicados**:

#### Model `actividades` actualizado:
```prisma
model actividades {
  id                        Int                         @id @default(autoincrement())
  codigoActividad           String                      @unique @map("codigo_actividad")
  nombre                    String
  tipoActividadId           Int                         @map("tipo_actividad_id")
  categoriaId               Int                         @map("categoria_id")
  estadoId                  Int                         @map("estado_id")
  descripcion               String?
  fechaDesde                DateTime                    @map("fecha_desde")
  fechaHasta                DateTime?                   @map("fecha_hasta")
  capacidadMaxima           Int?
  costo                     Decimal                     @default(0)
  activa                    Boolean                     @default(true)
  observaciones             String?
  createdAt                 DateTime                    @default(now())
  updatedAt                 DateTime                    @updatedAt

  // Relaciones a catálogos
  tiposActividades          tipos_actividades           @relation(fields: [tipoActividadId], references: [id])
  categoriasActividades     categorias_actividades      @relation(fields: [categoriaId], references: [id])
  estadosActividades        estados_actividades         @relation(fields: [estadoId], references: [id])

  // Relaciones a otras tablas
  horarios_actividades      horarios_actividades[]
  participacion_actividades participacion_actividades[]
  docentes_actividades      docentes_actividades[]
  // ... otras relaciones
}
```

#### Model `horarios_actividades` actualizado:
```prisma
model horarios_actividades {
  id          Int         @id @default(autoincrement())
  actividadId Int         @map("actividad_id")
  diaSemanaId Int         @map("dia_semana_id")
  horaInicio  String      @map("hora_inicio") @db.VarChar(8)
  horaFin     String      @map("hora_fin") @db.VarChar(8)
  activo      Boolean     @default(true)
  createdAt   DateTime    @default(now()) @map("created_at")
  updatedAt   DateTime    @updatedAt @map("updated_at")

  actividades actividades @relation(fields: [actividadId], references: [id], onDelete: Cascade)
  diasSemana  dias_semana @relation(fields: [diaSemanaId], references: [id], onDelete: Restrict)

  @@unique([actividadId, diaSemanaId, horaInicio])
}
```

#### Model `docentes_actividades` actualizado:
```prisma
model docentes_actividades {
  id                 Int            @id @default(autoincrement())
  actividadId        Int            @map("actividad_id")
  docenteId          Int            @map("docente_id")
  rolDocenteId       Int            @map("rol_docente_id")
  // ... otros campos

  actividades        actividades    @relation(fields: [actividadId], references: [id])
  personas           Persona        @relation(fields: [docenteId], references: [id])
  rolesDocentes      roles_docentes @relation(fields: [rolDocenteId], references: [id])
}
```

#### Catálogos con relaciones inversas agregadas:
```prisma
model tipos_actividades {
  // ... campos del catálogo
  actividades actividades[] // ✅ Relación inversa agregada
}

model categorias_actividades {
  // ... campos del catálogo
  actividades actividades[] // ✅ Relación inversa agregada
}

model estados_actividades {
  // ... campos del catálogo
  actividades actividades[] // ✅ Relación inversa agregada
}

model dias_semana {
  // ... campos del catálogo
  horariosActividades horarios_actividades[] // ✅ Relación inversa agregada
}
```

#### ENUMs eliminados:
```prisma
// ❌ ELIMINADOS:
// enum TipoActividad { CORO, CLASE_CANTO, CLASE_INSTRUMENTO }
// enum DiaSemana { LUNES, MARTES, ... DOMINGO }
```

**Resultado**: ✅ Schema actualizado y Prisma Client regenerado

---

### PASO 5: Validación Post-Migración ✅
**Archivo**: `scripts/validate-migration-actividades.ts`

**Resultados de validación**:
```
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
⚠ Campo legacy "diaSemana" aún existe (horarios_actividades vacía, no se eliminó)

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
⚠ Advertencias: 1

⚠️ MIGRACIÓN COMPLETADA CON ADVERTENCIAS
```

**Resultado**: ✅ Validación exitosa (advertencia no crítica)

---

## ❌ PASOS PENDIENTES

### PASO 6: Actualizar Repository `actividad.repository.ts` ❌ **BLOQUEADO**

**Problema identificado**: El repository tiene **incompatibilidades masivas** con el nuevo schema porque fue escrito para la arquitectura legacy con ENUMs.

#### Errores encontrados en tiempo de ejecución:

1. **Método `create()`** - Línea 18:
   ```typescript
   // ❌ ERROR: Usa campos legacy (tipo, precio, duracion) que ya no existen
   return this.prisma.actividades.create({
     data: {
       tipo: data.tipo,           // ❌ Campo eliminado
       precio: data.precio,       // ❌ Campo eliminado
       duracion: data.duracion,   // ❌ Campo eliminado
       // Falta: codigoActividad (requerido)
       // Falta: tipoActividadId (requerido)
       // Falta: categoriaId (requerido)
       // Falta: estadoId (requerido)
       // Falta: fechaDesde (requerido)
     }
   });
   ```

2. **Método `findByCodigoActividad()`** - Línea 311:
   ```typescript
   // ❌ ERROR: Usa nombre de campo en snake_case
   where: { codigo_actividad: codigo } // ❌ Debe ser: codigoActividad
   ```

3. **Método `findAll()`** - Líneas 173-210:
   ```typescript
   // ❌ ERROR: Usa nombres de relación incorrectos
   include: {
     tipos_actividades: true,           // ❌ Ya corregido a: tiposActividades
     categorias_actividades: true,      // ❌ Ya corregido a: categoriasActividades
     estados_actividades: true,         // ❌ Ya corregido a: estadosActividades
     horarios_actividades: {
       include: { dias_semana: true }   // ❌ Ya corregido a: diasSemana
     },
     docentes_actividades: {
       include: { roles_docentes: true } // ⚠️ Este es correcto (snake_case en schema)
     },
     _count: {
       select: {
         participacion_actividades: {
           where: { activo: true }      // ❌ Debe ser: activa (tabla usa 'activa')
         }
       }
     }
   }
   ```

4. **Método `update()`** - Similar al `create()`:
   - Usa campos legacy
   - No maneja nuevos campos requeridos
   - Lógica de horarios usa ENUM `DiaSemana`

5. **Todos los métodos de búsqueda**:
   - Usan `codigo_actividad` en vez de `codigoActividad`
   - Retornan campos legacy que ya no existen

#### Cambios necesarios en `actividad.repository.ts`:

**Métodos que requieren refactorización completa**:
- ❌ `create()` - Línea 15-50
- ❌ `findByCodigoActividad()` - Línea 310-319
- ❌ `update()` - Línea 320-380
- ✅ `findAll()` - Parcialmente corregido (quedan ajustes menores)
- ❌ `agregarHorario()` - Línea 400-450 (usa ENUM DiaSemana)
- ❌ `actualizarHorario()` - Línea 450-500 (usa ENUM DiaSemana)
- ❌ Todos los SELECT que retornan `codigo_actividad` en vez de `codigoActividad`

**Estimación de trabajo**: 3-4 horas de refactorización completa

---

### PASO 7: Tests Funcionales ❌ **BLOQUEADO POR PASO 6**

**Archivo**: `tests/test-actividades-crud.ts`

**Estado actual**: 1/9 tests pasando

```
✓ Tests pasados: 1
  - TEST 1: Obtener Docentes Disponibles (persona_tipo V2) ✅

✗ Tests fallidos: 8 (bloqueados por repository)
  - TEST 2: Crear Actividad con Docente Asignado ❌
  - TEST 3: Validar Rechazo sin Tipo DOCENTE ❌
  - TEST 4: Agregar Participante a Actividad ❌
  - TEST 5: Validar Capacidad Máxima ❌
  - TEST 6: Listar Actividades con Filtros ❌
  - TEST 7: Obtener Detalle de Actividad ❌
  - TEST 8: Actualizar Actividad ❌
  - TEST 9: Eliminar Actividad ❌
```

**Nota**: El único test que pasa (`getDocentesDisponibles`) es porque ya fue adaptado a la arquitectura `persona_tipo` V2 en la Fase 1.

---

## 📋 ARCHIVOS MODIFICADOS

### Scripts de Migración (Completados)
- ✅ `scripts/migration-actividades-step1-fixed.sql`
- ✅ `scripts/migrate-actividades-to-catalogos.ts`
- ✅ `scripts/migration-actividades-step2-fixed.sql`
- ✅ `scripts/validate-migration-actividades.ts`

### Schema y Código (Parcialmente Completados)
- ✅ `prisma/schema.prisma` - Actualizado completamente
- ⚠️ `src/repositories/actividad.repository.ts` - **REQUIERE REFACTORIZACIÓN COMPLETA**
- ✅ `src/dto/actividad-v2.dto.ts` - Validación `diaSemanaId` corregida (sin max(7))
- ✅ `src/dto/horario-actividad.dto.ts` - Validación `diaSemanaId` corregida
- ✅ `src/dto/reserva-aula-actividad.dto.ts` - Validación `diaSemanaId` corregida

### Servicios y Controladores
- ✅ `src/services/actividad.service.ts` - Ya adaptado en Fase 1 (método `asignarDocente`)
- ⚠️ Otros métodos del service dependen del repository (bloqueados)
- ⚠️ `src/controllers/actividad.controller.ts` - Funcional pero limitado por repository

---

## 🔄 CAMBIOS REALIZADOS EN REGLAS (CLAUDE.md)

Durante la migración se aplicó estrictamente la regla de naming:

```markdown
### Naming Convention
- ✅ **MANDATORY**: ALWAYS use camelCase for Prisma schema fields and TypeScript code
- **Example**: `capacidadMaxima` (NOT `cupo_maximo`, NOT `capacidad_maxima`)
- **Note**: Use `@map("snake_case")` when PostgreSQL table uses snake_case column names
```

**Aplicaciones concretas**:
- `codigo_actividad` → `codigoActividad` (en Prisma y TypeScript)
- `tipo_actividad_id` → `tipoActividadId` (en Prisma)
- `categoria_id` → `categoriaId` (en Prisma)
- `estado_id` → `estadoId` (en Prisma)
- `dia_semana_id` → `diaSemanaId` (en Prisma)
- Relaciones: `tiposActividades`, `categoriasActividades`, `estadosActividades`, `diasSemana`, `rolesDocentes`

**EXCEPCIÓN ENCONTRADA**: La relación `rolesDocentes` en el modelo `docentes_actividades` usa camelCase en el schema pero el nombre del modelo target sigue siendo `roles_docentes` (snake_case). Esto es correcto según las convenciones de Prisma.

---

## 🎯 PRÓXIMOS PASOS RECOMENDADOS

### Opción A: Completar la Migración (Recomendado)

1. **Refactorizar `actividad.repository.ts` completo** (3-4 horas):
   - Actualizar método `create()` para usar nuevos campos
   - Actualizar método `update()` para usar nuevos campos
   - Corregir todos los `where` clauses (camelCase)
   - Actualizar todas las queries de horarios (dia_semana_id)
   - Actualizar count de participaciones (activa, no activo)
   - Eliminar cualquier referencia a ENUMs legacy

2. **Ejecutar tests y corregir errores** (1-2 horas):
   - Ejecutar `npx ts-node tests/test-actividades-crud.ts`
   - Corregir errores uno por uno
   - Validar que los 9 tests pasen

3. **Actualizar Service y Controller si es necesario** (1 hora):
   - Revisar que los DTOs estén bien mapeados
   - Actualizar lógica de negocio si cambió

4. **Documentar y commit final** (30 min):
   - Crear commit con todos los cambios
   - Actualizar CLAUDE.md con lecciones aprendidas
   - Tag: `migracion-actividades-v2-completada`

**Tiempo total estimado**: 5-7 horas

---

### Opción B: Rollback y Re-planificar

Si se prefiere un approach más conservador:

1. **Rollback a tag pre-migración**:
   ```bash
   git checkout pre-migracion-actividades-v2
   git checkout -b backend-etapa-5-rollback
   ```

2. **Crear plan de migración incremental**:
   - Fase 1: Migrar solo `create()` y `findAll()`
   - Fase 2: Migrar `update()` y `delete()`
   - Fase 3: Migrar métodos de horarios
   - Fase 4: Migrar métodos de docentes

3. **Ejecutar tests después de cada fase**

---

## 🐛 ERRORES CONOCIDOS Y WORKAROUNDS

### Error 1: `Unknown field rolesDocentes`
**Causa**: Confusión entre nombre de relación y nombre de modelo
**Solución**: La relación en el schema debe llamarse `rolesDocentes` (camelCase) pero el modelo sigue siendo `roles_docentes`
**Estado**: ✅ Resuelto en schema, pendiente regenerar Prisma client si hay issues

### Error 2: `Unknown argument codigo_actividad`
**Causa**: Uso de snake_case en queries
**Solución**: Usar `codigoActividad` en todas las queries
**Estado**: ⚠️ Parcialmente resuelto (quedan instancias en repository)

### Error 3: `Argument codigoActividad is missing`
**Causa**: Método `create()` no incluye campos requeridos del nuevo schema
**Solución**: Refactorizar método `create()` completo
**Estado**: ❌ No resuelto (bloqueante)

### Error 4: `Unknown field participaciones_actividades`
**Causa**: Nombre incorrecto (plural en vez de singular)
**Solución**: Usar `participacion_actividades`
**Estado**: ✅ Resuelto

### Error 5: `Unknown argument activo in participacion_actividades`
**Causa**: La tabla usa `activa` no `activo`
**Solución**: Cambiar filtro a `{ activa: true }`
**Estado**: ❌ No resuelto (pendiente en repository)

---

## 📊 ESTADÍSTICAS DE LA MIGRACIÓN

### Base de Datos
- **Columnas agregadas**: 8 (actividades) + 1 (horarios_actividades)
- **Columnas eliminadas**: 3 (tipo, duracion, precio)
- **Foreign Keys agregados**: 3 (tipos, categorias, estados)
- **Índices creados**: 5
- **Constraints agregados**: 1 UNIQUE
- **Registros migrados**: 2 actividades, 0 horarios

### Código
- **Archivos creados**: 4 scripts de migración
- **Archivos modificados**: 5 (schema, repository, 3 DTOs)
- **Líneas de código migración**: ~600 líneas
- **ENUMs eliminados**: 2 (TipoActividad, DiaSemana)
- **Modelos actualizados**: 5 (actividades, horarios, docentes, catálogos)

### Tests
- **Tests creados**: 9
- **Tests pasando**: 1/9 (11%)
- **Tests bloqueados**: 8/9 (89% por repository)

---

## ✅ LECCIONES APRENDIDAS

1. **Naming Convention es crítica**: Mezclar snake_case y camelCase genera confusión masiva
2. **Prisma Client debe regenerarse**: Después de cada cambio de schema
3. **Repository debe actualizarse en bloque**: No funciona actualizar parcialmente
4. **Tests son esenciales**: Sin tests, los errores se descubren en producción
5. **Planificación incremental**: Mejor migrar por fases que todo de golpe
6. **Validación post-migración**: El script de validación fue crucial para detectar problemas

---

## 📝 NOTAS FINALES

- ⚠️ **NO DESPLEGAR EN PRODUCCIÓN**: Migración incompleta
- ✅ **Base de datos está correcta**: Schema y datos migrados OK
- ❌ **Código no funcional**: Repository requiere refactorización
- 🔄 **Rollback disponible**: Tag `pre-migracion-actividades-v2`
- 📧 **Decisión requerida**: Usuario debe elegir Opción A o B

---

**Generado automáticamente el**: 2025-11-17
**Última actualización**: PASO 5 completado exitosamente
**Siguiente acción recomendada**: Refactorizar `actividad.repository.ts`
