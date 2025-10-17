# 🎯 REDISEÑO INTEGRAL: ENTIDAD ACTIVIDAD - SIGESDA

**Fecha de creación:** 2025-10-15
**Versión:** 1.0
**Estado:** Propuesta Técnica
**Autor:** Equipo de Desarrollo SIGESDA

---

## 📋 ÍNDICE

1. [Resumen Ejecutivo](#1-resumen-ejecutivo)
2. [Análisis de Situación Actual](#2-análisis-de-situación-actual)
3. [Nuevo Modelo de Datos](#3-nuevo-modelo-de-datos)
4. [Especificación Técnica Detallada](#4-especificación-técnica-detallada)
5. [Plan de Migración](#5-plan-de-migración)
6. [Anexos](#6-anexos)

---

## 1. RESUMEN EJECUTIVO

### 1.1 Objetivo

Realizar una **redefinición integral** de la estructura de datos de la entidad **Actividad** en SIGESDA, eliminando todos los elementos deprecados/legacy y el apartado SECCIONES, para obtener un modelo limpio, escalable y alineado con los requerimientos funcionales actuales.

### 1.2 Alcance

**Se incluye:**
- Rediseño completo del modelo de datos `Actividad`
- Eliminación de campos y relaciones deprecadas
- Nuevo modelo para gestión de horarios múltiples
- Asignación de docentes y aulas por actividad
- Gestión de categorías dinámicas de actividades
- Plan de migración sin pérdida de datos

**No se incluye:**
- Sistema de secciones/grupos (se elimina completamente)
- Funcionalidades de frontend
- Migración de datos históricos de secciones (se consolidan)

### 1.3 Elementos a Eliminar

**Modelos completos:**
- `SeccionActividad`
- `HorarioSeccion`
- `ParticipacionSeccion`
- `ReservaAulaSeccion`

**Campos deprecados en Actividad:**
- Relación `docentes` vía `@relation("DocenteActividad")` (DEPRECATED)
- Relación `participaciones` → `ParticipacionActividad` (DEPRECATED)
- Relación `reservasAula` → `ReservaAula` (DEPRECATED)
- Relación `horarios` → `HorarioActividad` (DEPRECATED)
- Campo `secciones` → `SeccionActividad[]`

**Enums legacy:**
- `CategoriaSocioLegacy` (ya migrado a tabla dinámica)

---

## 2. ANÁLISIS DE SITUACIÓN ACTUAL

### 2.1 Problemas Identificados

#### A. Duplicidad de Modelos
El schema actual mantiene **dos sistemas paralelos** para gestionar actividades:

1. **Sistema Legacy (DEPRECATED):**
   - `HorarioActividad` → horarios directos en actividad
   - `ParticipacionActividad` → inscripciones directas
   - Relación M:N directa con `Persona` (docentes)

2. **Sistema de Secciones (A ELIMINAR):**
   - `SeccionActividad` → grupos/secciones de actividades
   - `HorarioSeccion` → horarios por sección
   - `ParticipacionSeccion` → inscripciones por sección
   - `ReservaAulaSeccion` → reservas por sección

**Consecuencia:** Confusión en el código, queries complejas, datos inconsistentes.

#### B. Comentarios DEPRECATED en el Código

Archivo: `prisma/schema.prisma`

```prisma
// Línea 144: actividadesImpartidas Actividad[] @relation("DocenteActividad") // DEPRECATED
// Línea 170: docentes Persona[] @relation("DocenteActividad") // DEPRECATED: usar secciones
// Línea 171: participaciones ParticipacionActividad[] // DEPRECATED: usar ParticipacionSeccion
// Línea 172: reservasAula ReservaAula[] // DEPRECATED: usar ReservaAulaSeccion
// Línea 173: horarios HorarioActividad[] // DEPRECATED: usar HorarioSeccion
```

#### C. Sistema de Secciones Complejo e Innecesario

Según los **requerimientos funcionales actualizados**, el sistema no requiere:
- Grupos paralelos con mismo horario
- Gestión independiente de secciones
- Capacidad diferenciada por grupo

**El nuevo enfoque:** Una actividad = una entidad simple con múltiples horarios.

### 2.2 Estado de las Tablas Actuales

```
actividades (principal)
├── horarios_actividades (DEPRECATED → mantener transformado)
├── participacion_actividades (DEPRECATED → mantener transformado)
├── reserva_aulas (DEPRECATED → mantener transformado)
└── secciones_actividades (ELIMINAR)
    ├── horarios_secciones (ELIMINAR)
    ├── participaciones_secciones (ELIMINAR → migrar a participacion_actividades)
    └── reservas_aulas_secciones (ELIMINAR → migrar a reserva_aulas)
```

---

## 3. NUEVO MODELO DE DATOS

### 3.1 Diagrama Entidad-Relación (DER)

```
┌────────────────────────────────────────┐
│          ACTIVIDAD (Principal)         │
├────────────────────────────────────────┤
│ id: String (PK)                        │
│ nombre: String                         │
│ tipo: TipoActividad                    │
│ categoriaId: String (FK)               │◄──────┐
│ descripcion: String?                   │       │
│ fechaDesde: DateTime                   │       │
│ fechaHasta: DateTime?                  │       │
│ cupoMaximo: Int?                       │       │
│ costo: Decimal                         │       │
│ estado: EstadoActividad                │       │
│ observaciones: String?                 │       │
│ createdAt: DateTime                    │       │
│ updatedAt: DateTime                    │       │
└────────────────────────────────────────┘       │
         │                                       │
         │ 1:N                                   │
         ▼                                       │
┌────────────────────────────────────────┐       │
│      HORARIO_ACTIVIDAD (Nuevo)         │       │
├────────────────────────────────────────┤       │
│ id: String (PK)                        │       │
│ actividadId: String (FK)               │       │
│ diaSemana: DiaSemana                   │       │
│ horaInicio: String (HH:MM)             │       │
│ horaFin: String (HH:MM)                │       │
│ activo: Boolean                        │       │
│ createdAt: DateTime                    │       │
│ updatedAt: DateTime                    │       │
└────────────────────────────────────────┘       │
         │                                       │
         │ N:1                                   │
         ▼                                       │
┌────────────────────────────────────────┐       │
│     RESERVA_AULA_ACTIVIDAD (Nuevo)     │       │
├────────────────────────────────────────┤       │
│ id: String (PK)                        │       │
│ horarioId: String (FK)                 │       │
│ aulaId: String (FK)                    │       │
│ fechaVigenciaDesde: DateTime           │       │
│ fechaVigenciaHasta: DateTime?          │       │
│ observaciones: String?                 │       │
│ createdAt: DateTime                    │       │
│ updatedAt: DateTime                    │       │
└────────────────────────────────────────┘       │
                                                 │
┌────────────────────────────────────────┐       │
│   CATEGORIA_ACTIVIDAD (Nueva Tabla)    │───────┘
├────────────────────────────────────────┤
│ id: String (PK)                        │
│ codigo: String (UNIQUE)                │
│ nombre: String                         │
│ descripcion: String?                   │
│ activa: Boolean                        │
│ orden: Int                             │
│ createdAt: DateTime                    │
│ updatedAt: DateTime                    │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│    PARTICIPACION_ACTIVIDAD (Nuevo)     │
├────────────────────────────────────────┤
│ id: String (PK)                        │
│ personaId: String (FK)                 │
│ actividadId: String (FK)               │
│ fechaInicio: DateTime                  │
│ fechaFin: DateTime?                    │
│ precioEspecial: Decimal?               │
│ activa: Boolean                        │
│ observaciones: String?                 │
│ createdAt: DateTime                    │
│ updatedAt: DateTime                    │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│  DOCENTE_ACTIVIDAD (Tabla M:N Impl.)   │
├────────────────────────────────────────┤
│ actividadId: String (FK)               │
│ docenteId: String (FK)                 │
└────────────────────────────────────────┘
```

### 3.2 Definición de Enums

```prisma
enum TipoActividad {
  CORO
  CLASE_CANTO
  CLASE_INSTRUMENTO
}

enum EstadoActividad {
  ACTIVA
  INACTIVA
  FINALIZADA
  CANCELADA
}

enum DiaSemana {
  LUNES
  MARTES
  MIERCOLES
  JUEVES
  VIERNES
  SABADO
  DOMINGO
}
```

---

## 4. ESPECIFICACIÓN TÉCNICA DETALLADA

### 4.1 Schema Prisma Completo (Limpio)

```prisma
// ============================================================================
// MODELO ACTIVIDAD (LIMPIO - Sin elementos deprecados)
// ============================================================================

model Actividad {
  id          String           @id @default(cuid())
  nombre      String
  tipo        TipoActividad
  categoriaId String
  descripcion String?

  // Vigencia
  fechaDesde  DateTime
  fechaHasta  DateTime?

  // Configuración
  cupoMaximo  Int?
  costo       Decimal          @default(0) @db.Decimal(10, 2)
  estado      EstadoActividad  @default(ACTIVA)
  observaciones String?

  // Auditoría
  createdAt   DateTime         @default(now())
  updatedAt   DateTime         @updatedAt

  // Relaciones
  categoria       CategoriaActividad   @relation(fields: [categoriaId], references: [id], onDelete: Restrict)
  horarios        HorarioActividad[]
  docentes        Persona[]            @relation("DocenteActividadNuevo")
  participaciones ParticipacionActividad[]

  @@index([categoriaId])
  @@index([tipo])
  @@index([estado])
  @@index([fechaDesde, fechaHasta])
  @@map("actividades")
}

// ============================================================================
// CATEGORIA DE ACTIVIDAD (Nueva Tabla Dinámica)
// ============================================================================

model CategoriaActividad {
  id          String   @id @default(cuid())
  codigo      String   @unique // "CORO_ADULTOS", "PIANO_NIVEL1", etc.
  nombre      String   @unique
  descripcion String?
  activa      Boolean  @default(true)
  orden       Int      @default(0)

  // Auditoría
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relaciones
  actividades Actividad[]

  @@map("categorias_actividades")
}

// ============================================================================
// HORARIOS (Relación 1:N con Actividad)
// ============================================================================

model HorarioActividad {
  id          String    @id @default(cuid())
  actividadId String
  diaSemana   DiaSemana
  horaInicio  String    // Formato HH:MM
  horaFin     String    // Formato HH:MM
  activo      Boolean   @default(true)

  // Auditoría
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  // Relaciones
  actividad   Actividad @relation(fields: [actividadId], references: [id], onDelete: Cascade)
  reservasAula ReservaAulaActividad[]

  @@index([actividadId])
  @@index([diaSemana])
  @@index([actividadId, diaSemana, horaInicio])
  @@map("horarios_actividades")
}

// ============================================================================
// RESERVAS DE AULA (Vinculadas a horarios recurrentes)
// ============================================================================

model ReservaAulaActividad {
  id                 String   @id @default(cuid())
  horarioId          String
  aulaId             String
  fechaVigenciaDesde DateTime
  fechaVigenciaHasta DateTime?
  observaciones      String?

  // Auditoría
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt

  // Relaciones
  horario            HorarioActividad @relation(fields: [horarioId], references: [id], onDelete: Cascade)
  aula               Aula             @relation(fields: [aulaId], references: [id], onDelete: Restrict)

  @@unique([horarioId, aulaId])
  @@index([horarioId])
  @@index([aulaId])
  @@index([fechaVigenciaDesde, fechaVigenciaHasta])
  @@map("reservas_aulas_actividades")
}

// ============================================================================
// PARTICIPACIONES (Inscripciones a actividades)
// ============================================================================

model ParticipacionActividad {
  id             String    @id @default(cuid())
  personaId      String
  actividadId    String
  fechaInicio    DateTime
  fechaFin       DateTime?
  precioEspecial Decimal?  @db.Decimal(10, 2)
  activa         Boolean   @default(true)
  observaciones  String?

  // Auditoría
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt

  // Relaciones
  persona        Persona   @relation(fields: [personaId], references: [id], onDelete: Cascade)
  actividad      Actividad @relation(fields: [actividadId], references: [id], onDelete: Cascade)

  @@unique([personaId, actividadId])
  @@index([actividadId])
  @@index([personaId])
  @@index([activa])
  @@map("participaciones_actividades")
}

// ============================================================================
// ACTUALIZACION EN MODELO PERSONA
// ============================================================================

model Persona {
  // ... campos existentes ...

  // RELACIONES ACTUALIZADAS (sin deprecados)
  actividadesImpartidas Actividad[]              @relation("DocenteActividadNuevo")
  participacionesActivas ParticipacionActividad[]

  @@map("personas")
}

// ============================================================================
// ACTUALIZACION EN MODELO AULA
// ============================================================================

model Aula {
  // ... campos existentes ...

  // RELACIONES ACTUALIZADAS
  reservasActividades ReservaAulaActividad[]

  @@map("aulas")
}
```

### 4.2 Normalización y Restricciones

#### A. Tercera Forma Normal (3FN)

**Cumplimiento:**
- ✅ **1FN:** Todos los atributos son atómicos
- ✅ **2FN:** No hay dependencias parciales de clave compuesta
- ✅ **3FN:** No hay dependencias transitivas

**Ejemplo:**
- `Actividad.categoriaId` → `CategoriaActividad.id` (FK normalizada)
- `HorarioActividad.actividadId` → `Actividad.id` (FK normalizada)
- `ReservaAulaActividad.horarioId` → `HorarioActividad.id` (FK normalizada)

#### B. Claves Primarias y Foráneas

| Tabla | PK | FKs |
|-------|-----|-----|
| `actividades` | `id` | `categoriaId` → `categorias_actividades.id` |
| `categorias_actividades` | `id` | - |
| `horarios_actividades` | `id` | `actividadId` → `actividades.id` |
| `reservas_aulas_actividades` | `id` | `horarioId` → `horarios_actividades.id`<br>`aulaId` → `aulas.id` |
| `participaciones_actividades` | `id` | `personaId` → `personas.id`<br>`actividadId` → `actividades.id` |

#### C. Constraints e Índices

```sql
-- Unique Constraints
ALTER TABLE categorias_actividades ADD CONSTRAINT uk_categoria_codigo UNIQUE (codigo);
ALTER TABLE categorias_actividades ADD CONSTRAINT uk_categoria_nombre UNIQUE (nombre);
ALTER TABLE reservas_aulas_actividades ADD CONSTRAINT uk_horario_aula UNIQUE (horarioId, aulaId);
ALTER TABLE participaciones_actividades ADD CONSTRAINT uk_persona_actividad UNIQUE (personaId, actividadId);

-- Índices de Performance
CREATE INDEX idx_actividades_categoria ON actividades(categoriaId);
CREATE INDEX idx_actividades_tipo ON actividades(tipo);
CREATE INDEX idx_actividades_estado ON actividades(estado);
CREATE INDEX idx_actividades_vigencia ON actividades(fechaDesde, fechaHasta);

CREATE INDEX idx_horarios_actividad ON horarios_actividades(actividadId);
CREATE INDEX idx_horarios_dia ON horarios_actividades(diaSemana);
CREATE INDEX idx_horarios_composite ON horarios_actividades(actividadId, diaSemana, horaInicio);

CREATE INDEX idx_reservas_horario ON reservas_aulas_actividades(horarioId);
CREATE INDEX idx_reservas_aula ON reservas_aulas_actividades(aulaId);
CREATE INDEX idx_reservas_vigencia ON reservas_aulas_actividades(fechaVigenciaDesde, fechaVigenciaHasta);

CREATE INDEX idx_participaciones_actividad ON participaciones_actividades(actividadId);
CREATE INDEX idx_participaciones_persona ON participaciones_actividades(personaId);
CREATE INDEX idx_participaciones_activa ON participaciones_actividades(activa);
```

### 4.3 Validaciones a Nivel de Base de Datos

```sql
-- Check Constraints
ALTER TABLE actividades ADD CONSTRAINT chk_cupo_positivo
  CHECK (cupoMaximo IS NULL OR cupoMaximo > 0);

ALTER TABLE actividades ADD CONSTRAINT chk_costo_no_negativo
  CHECK (costo >= 0);

ALTER TABLE actividades ADD CONSTRAINT chk_fechas_coherentes
  CHECK (fechaHasta IS NULL OR fechaHasta >= fechaDesde);

-- Validación de formato de hora (mediante trigger)
CREATE OR REPLACE FUNCTION validar_formato_hora()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.horaInicio !~ '^\d{2}:\d{2}$' THEN
    RAISE EXCEPTION 'Formato de horaInicio inválido. Debe ser HH:MM';
  END IF;
  IF NEW.horaFin !~ '^\d{2}:\d{2}$' THEN
    RAISE EXCEPTION 'Formato de horaFin inválido. Debe ser HH:MM';
  END IF;
  IF NEW.horaFin <= NEW.horaInicio THEN
    RAISE EXCEPTION 'horaFin debe ser posterior a horaInicio';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validar_horario
BEFORE INSERT OR UPDATE ON horarios_actividades
FOR EACH ROW EXECUTE FUNCTION validar_formato_hora();
```

---

## 5. PLAN DE MIGRACIÓN

### 5.1 Estrategia General

**Enfoque:** Migración progresiva sin downtime, consolidando datos del sistema de secciones al modelo simplificado.

**Principios:**
1. **Cero pérdida de datos:** Todos los datos de secciones se consolidan en actividades
2. **Reversibilidad:** Backup completo antes de cada fase
3. **Validación continua:** Scripts de verificación en cada etapa
4. **Rollback plan:** Procedimiento documentado para revertir cambios

### 5.2 Fases de Migración

#### FASE 1: Preparación y Análisis (Día 1)

**Objetivos:**
- Backup completo de la base de datos
- Análisis de datos existentes
- Identificación de inconsistencias

**Acciones:**

```bash
# 1.1 Backup completo
pg_dump -h localhost -U usuario -d asociacion_musical > backup_pre_migracion_$(date +%Y%m%d_%H%M%S).sql

# 1.2 Backup de tablas específicas
pg_dump -h localhost -U usuario -d asociacion_musical \
  -t actividades \
  -t horarios_actividades \
  -t secciones_actividades \
  -t horarios_secciones \
  -t participacion_actividades \
  -t participaciones_secciones \
  -t reserva_aulas \
  -t reservas_aulas_secciones \
  > backup_tablas_actividades_$(date +%Y%m%d_%H%M%S).sql
```

**Script de análisis:**

```sql
-- 1.3 Análisis de datos existentes
SELECT 'ACTIVIDADES' as tabla, COUNT(*) as registros FROM actividades
UNION ALL
SELECT 'HORARIOS_ACTIVIDADES', COUNT(*) FROM horarios_actividades
UNION ALL
SELECT 'SECCIONES_ACTIVIDADES', COUNT(*) FROM secciones_actividades
UNION ALL
SELECT 'HORARIOS_SECCIONES', COUNT(*) FROM horarios_secciones
UNION ALL
SELECT 'PARTICIPACIONES_ACTIVIDADES', COUNT(*) FROM participacion_actividades
UNION ALL
SELECT 'PARTICIPACIONES_SECCIONES', COUNT(*) FROM participaciones_secciones
UNION ALL
SELECT 'RESERVAS_AULAS', COUNT(*) FROM reserva_aulas
UNION ALL
SELECT 'RESERVAS_AULAS_SECCIONES', COUNT(*) FROM reservas_aulas_secciones;

-- 1.4 Identificar actividades con secciones
SELECT
  a.id,
  a.nombre,
  COUNT(s.id) as num_secciones
FROM actividades a
LEFT JOIN secciones_actividades s ON s.actividadId = a.id
GROUP BY a.id, a.nombre
HAVING COUNT(s.id) > 0
ORDER BY num_secciones DESC;

-- 1.5 Detectar inconsistencias
SELECT 'Horarios huérfanos' as tipo, COUNT(*) as cantidad
FROM horarios_secciones hs
WHERE NOT EXISTS (SELECT 1 FROM secciones_actividades WHERE id = hs.seccionId)
UNION ALL
SELECT 'Participaciones huérfanas', COUNT(*)
FROM participaciones_secciones ps
WHERE NOT EXISTS (SELECT 1 FROM secciones_actividades WHERE id = ps.seccionId);
```

#### FASE 2: Creación de Tablas Nuevas (Día 1-2)

**Acciones:**

```sql
-- 2.1 Crear tabla CategoriaActividad
CREATE TABLE categorias_actividades (
  id TEXT PRIMARY KEY,
  codigo TEXT NOT NULL UNIQUE,
  nombre TEXT NOT NULL UNIQUE,
  descripcion TEXT,
  activa BOOLEAN NOT NULL DEFAULT true,
  orden INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

-- 2.2 Seed de categorías iniciales
INSERT INTO categorias_actividades (id, codigo, nombre, descripcion, activa, orden, "createdAt", "updatedAt")
VALUES
  (gen_random_uuid(), 'CORO_ADULTOS', 'Coro Adultos', 'Coro principal de adultos', true, 1, NOW(), NOW()),
  (gen_random_uuid(), 'CORO_JUVENIL', 'Coro Juvenil', 'Coro de jóvenes', true, 2, NOW(), NOW()),
  (gen_random_uuid(), 'PIANO_INICIAL', 'Piano Inicial', 'Clases de piano nivel inicial', true, 3, NOW(), NOW()),
  (gen_random_uuid(), 'PIANO_INTERMEDIO', 'Piano Intermedio', 'Clases de piano nivel intermedio', true, 4, NOW(), NOW()),
  (gen_random_uuid(), 'PIANO_AVANZADO', 'Piano Avanzado', 'Clases de piano nivel avanzado', true, 5, NOW(), NOW()),
  (gen_random_uuid(), 'CANTO_INICIAL', 'Canto Inicial', 'Clases de canto nivel inicial', true, 6, NOW(), NOW()),
  (gen_random_uuid(), 'CANTO_INTERMEDIO', 'Canto Intermedio', 'Clases de canto nivel intermedio', true, 7, NOW(), NOW()),
  (gen_random_uuid(), 'GENERAL', 'General', 'Categoría general para actividades sin clasificar', true, 99, NOW(), NOW());

-- 2.3 Agregar campo categoriaId a actividades
ALTER TABLE actividades ADD COLUMN "categoriaId" TEXT;

-- 2.4 Asignar categoría por defecto temporalmente
UPDATE actividades
SET "categoriaId" = (SELECT id FROM categorias_actividades WHERE codigo = 'GENERAL')
WHERE "categoriaId" IS NULL;

-- 2.5 Agregar constraint de FK
ALTER TABLE actividades
ADD CONSTRAINT fk_actividad_categoria
FOREIGN KEY ("categoriaId") REFERENCES categorias_actividades(id) ON DELETE RESTRICT;

-- 2.6 Agregar nuevos campos a actividades
ALTER TABLE actividades ADD COLUMN "fechaDesde" TIMESTAMP(3) DEFAULT NOW();
ALTER TABLE actividades ADD COLUMN "fechaHasta" TIMESTAMP(3);
ALTER TABLE actividades ADD COLUMN "cupoMaximo" INTEGER;
ALTER TABLE actividades ADD COLUMN "costo" DECIMAL(10,2) DEFAULT 0;
ALTER TABLE actividades ADD COLUMN "estado" TEXT DEFAULT 'ACTIVA';
ALTER TABLE actividades ADD COLUMN "observaciones" TEXT;

-- 2.7 Crear enum EstadoActividad
CREATE TYPE "EstadoActividad" AS ENUM ('ACTIVA', 'INACTIVA', 'FINALIZADA', 'CANCELADA');
ALTER TABLE actividades ALTER COLUMN "estado" TYPE "EstadoActividad" USING "estado"::"EstadoActividad";

-- 2.8 Crear nueva tabla reservas_aulas_actividades
CREATE TABLE reservas_aulas_actividades (
  id TEXT PRIMARY KEY,
  "horarioId" TEXT NOT NULL,
  "aulaId" TEXT NOT NULL,
  "fechaVigenciaDesde" TIMESTAMP(3) NOT NULL,
  "fechaVigenciaHasta" TIMESTAMP(3),
  observaciones TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT fk_reserva_horario FOREIGN KEY ("horarioId") REFERENCES horarios_actividades(id) ON DELETE CASCADE,
  CONSTRAINT fk_reserva_aula FOREIGN KEY ("aulaId") REFERENCES aulas(id) ON DELETE RESTRICT,
  CONSTRAINT uk_horario_aula UNIQUE ("horarioId", "aulaId")
);
```

#### FASE 3: Consolidación de Datos de Secciones (Día 2-3)

**Estrategia:** Las secciones se consolidarán en actividades individuales.

**Script de consolidación:**

```sql
-- 3.1 Consolidar horarios de secciones en horarios de actividades
INSERT INTO horarios_actividades (id, "actividadId", "diaSemana", "horaInicio", "horaFin", activo, "createdAt", "updatedAt")
SELECT
  hs.id,
  sa."actividadId",
  hs."diaSemana",
  hs."horaInicio",
  hs."horaFin",
  hs.activo,
  hs."createdAt",
  NOW()
FROM horarios_secciones hs
INNER JOIN secciones_actividades sa ON sa.id = hs."seccionId"
WHERE NOT EXISTS (
  SELECT 1 FROM horarios_actividades ha
  WHERE ha."actividadId" = sa."actividadId"
    AND ha."diaSemana" = hs."diaSemana"
    AND ha."horaInicio" = hs."horaInicio"
    AND ha."horaFin" = hs."horaFin"
);

-- 3.2 Consolidar participaciones de secciones
INSERT INTO participacion_actividades (
  id, "personaId", "actividadId", "fechaInicio", "fechaFin",
  "precioEspecial", activa, observaciones, "createdAt", "updatedAt"
)
SELECT
  ps.id,
  ps."personaId",
  sa."actividadId",
  ps."fechaInicio",
  ps."fechaFin",
  ps."precioEspecial",
  ps.activa,
  CONCAT(
    COALESCE(ps.observaciones, ''),
    ' [Migrado de sección: ', sa.nombre, ']'
  ),
  ps."createdAt",
  NOW()
FROM participaciones_secciones ps
INNER JOIN secciones_actividades sa ON sa.id = ps."seccionId"
ON CONFLICT ("personaId", "actividadId") DO NOTHING;

-- 3.3 Migrar reservas de aulas de secciones
INSERT INTO reservas_aulas_actividades (
  id, "horarioId", "aulaId", "fechaVigenciaDesde", "fechaVigenciaHasta",
  observaciones, "createdAt", "updatedAt"
)
SELECT
  gen_random_uuid(),
  ha.id as "horarioId",
  ras."aulaId",
  ras."fechaVigencia",
  ras."fechaFin",
  CONCAT(
    COALESCE(ras.observaciones, ''),
    ' [Migrado de sección: ', sa.nombre, ']'
  ),
  ras."createdAt",
  NOW()
FROM reservas_aulas_secciones ras
INNER JOIN secciones_actividades sa ON sa.id = ras."seccionId"
INNER JOIN horarios_actividades ha ON ha."actividadId" = sa."actividadId"
  AND ha."diaSemana" = ras."diaSemana"
  AND ha."horaInicio" = ras."horaInicio"
  AND ha."horaFin" = ras."horaFin"
ON CONFLICT ("horarioId", "aulaId") DO NOTHING;

-- 3.4 Consolidar docentes de secciones
INSERT INTO "_DocenteActividadNuevo" ("A", "B")
SELECT DISTINCT sa."actividadId", ds."A" as "docenteId"
FROM "_DocenteSeccion" ds
INNER JOIN secciones_actividades sa ON sa.id = ds."B"
ON CONFLICT DO NOTHING;
```

#### FASE 4: Limpieza y Eliminación de Deprecados (Día 3)

```sql
-- 4.1 Renombrar tablas deprecadas (backup temporal)
ALTER TABLE horarios_secciones RENAME TO _backup_horarios_secciones;
ALTER TABLE participaciones_secciones RENAME TO _backup_participaciones_secciones;
ALTER TABLE reservas_aulas_secciones RENAME TO _backup_reservas_aulas_secciones;
ALTER TABLE secciones_actividades RENAME TO _backup_secciones_actividades;
ALTER TABLE reserva_aulas RENAME TO _backup_reserva_aulas;
ALTER TABLE "_DocenteActividad" RENAME TO "_backup_DocenteActividad";
ALTER TABLE "_DocenteSeccion" RENAME TO "_backup_DocenteSeccion";

-- 4.2 Eliminar relaciones deprecadas del schema (se hace vía migración Prisma)
-- Ver archivo de migración en sección 5.3

-- 4.3 Crear tabla de auditoría de migración
CREATE TABLE migracion_secciones_audit (
  id SERIAL PRIMARY KEY,
  entidad TEXT NOT NULL,
  id_original TEXT NOT NULL,
  id_nuevo TEXT,
  detalle JSONB,
  "createdAt" TIMESTAMP(3) DEFAULT NOW()
);

-- 4.4 Registrar migración
INSERT INTO migracion_secciones_audit (entidad, id_original, id_nuevo, detalle)
SELECT
  'SeccionActividad',
  sa.id,
  sa."actividadId",
  jsonb_build_object(
    'nombre_seccion', sa.nombre,
    'codigo_seccion', sa.codigo,
    'nombre_actividad', a.nombre
  )
FROM _backup_secciones_actividades sa
INNER JOIN actividades a ON a.id = sa."actividadId";
```

#### FASE 5: Validación Post-Migración (Día 3-4)

```sql
-- 5.1 Verificar integridad de datos
SELECT
  'Actividades sin categoría' as validacion,
  COUNT(*) as cantidad
FROM actividades
WHERE "categoriaId" IS NULL
UNION ALL
SELECT
  'Horarios huérfanos',
  COUNT(*)
FROM horarios_actividades ha
WHERE NOT EXISTS (SELECT 1 FROM actividades WHERE id = ha."actividadId")
UNION ALL
SELECT
  'Participaciones huérfanas',
  COUNT(*)
FROM participacion_actividades pa
WHERE NOT EXISTS (SELECT 1 FROM actividades WHERE id = pa."actividadId")
UNION ALL
SELECT
  'Reservas de aula huérfanas',
  COUNT(*)
FROM reservas_aulas_actividades raa
WHERE NOT EXISTS (SELECT 1 FROM horarios_actividades WHERE id = raa."horarioId");

-- 5.2 Verificar que no se perdieron datos
SELECT
  'Total participaciones antes' as metrica,
  (SELECT COUNT(*) FROM _backup_participaciones_secciones) +
  (SELECT COUNT(*) FROM participacion_actividades WHERE "createdAt" < NOW() - INTERVAL '1 day') as valor
UNION ALL
SELECT
  'Total participaciones después',
  COUNT(*)
FROM participacion_actividades;

-- 5.3 Validar horarios consolidados
SELECT
  a.nombre,
  COUNT(DISTINCT ha."diaSemana") as dias_con_horarios,
  COUNT(ha.id) as total_horarios
FROM actividades a
LEFT JOIN horarios_actividades ha ON ha."actividadId" = a.id
GROUP BY a.id, a.nombre
ORDER BY total_horarios DESC;

-- 5.4 Verificar reservas de aulas
SELECT
  a.nombre as actividad,
  au.nombre as aula,
  ha."diaSemana",
  ha."horaInicio",
  ha."horaFin",
  raa."fechaVigenciaDesde",
  raa."fechaVigenciaHasta"
FROM reservas_aulas_actividades raa
INNER JOIN horarios_actividades ha ON ha.id = raa."horarioId"
INNER JOIN actividades a ON a.id = ha."actividadId"
INNER JOIN aulas au ON au.id = raa."aulaId"
ORDER BY ha."diaSemana", ha."horaInicio";
```

### 5.3 Migración Prisma

**Archivo:** `prisma/migrations/YYYYMMDD_rediseno_actividad_completo/migration.sql`

```sql
-- CreateEnum EstadoActividad
CREATE TYPE "EstadoActividad" AS ENUM ('ACTIVA', 'INACTIVA', 'FINALIZADA', 'CANCELADA');

-- CreateTable CategoriaActividad
CREATE TABLE "categorias_actividades" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categorias_actividades_pkey" PRIMARY KEY ("id")
);

-- CreateTable ReservaAulaActividad
CREATE TABLE "reservas_aulas_actividades" (
    "id" TEXT NOT NULL,
    "horarioId" TEXT NOT NULL,
    "aulaId" TEXT NOT NULL,
    "fechaVigenciaDesde" TIMESTAMP(3) NOT NULL,
    "fechaVigenciaHasta" TIMESTAMP(3),
    "observaciones" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reservas_aulas_actividades_pkey" PRIMARY KEY ("id")
);

-- AlterTable actividades
ALTER TABLE "actividades" ADD COLUMN "categoriaId" TEXT NOT NULL DEFAULT 'default_category_id';
ALTER TABLE "actividades" ADD COLUMN "fechaDesde" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "actividades" ADD COLUMN "fechaHasta" TIMESTAMP(3);
ALTER TABLE "actividades" ADD COLUMN "cupoMaximo" INTEGER;
ALTER TABLE "actividades" ADD COLUMN "costo" DECIMAL(10,2) NOT NULL DEFAULT 0;
ALTER TABLE "actividades" ADD COLUMN "estado" "EstadoActividad" NOT NULL DEFAULT 'ACTIVA';
ALTER TABLE "actividades" ADD COLUMN "observaciones" TEXT;
ALTER TABLE "actividades" DROP COLUMN "capacidadMaxima";
ALTER TABLE "actividades" DROP COLUMN "duracion";

-- CreateIndex
CREATE UNIQUE INDEX "categorias_actividades_codigo_key" ON "categorias_actividades"("codigo");
CREATE UNIQUE INDEX "categorias_actividades_nombre_key" ON "categorias_actividades"("nombre");
CREATE INDEX "idx_actividades_categoria" ON "actividades"("categoriaId");
CREATE INDEX "idx_actividades_tipo" ON "actividades"("tipo");
CREATE INDEX "idx_actividades_estado" ON "actividades"("estado");
CREATE INDEX "idx_actividades_vigencia" ON "actividades"("fechaDesde", "fechaHasta");
CREATE UNIQUE INDEX "reservas_aulas_actividades_horarioId_aulaId_key" ON "reservas_aulas_actividades"("horarioId", "aulaId");
CREATE INDEX "idx_reservas_horario" ON "reservas_aulas_actividades"("horarioId");
CREATE INDEX "idx_reservas_aula" ON "reservas_aulas_actividades"("aulaId");
CREATE INDEX "idx_reservas_vigencia" ON "reservas_aulas_actividades"("fechaVigenciaDesde", "fechaVigenciaHasta");

-- AddForeignKey
ALTER TABLE "actividades" ADD CONSTRAINT "actividades_categoriaId_fkey"
  FOREIGN KEY ("categoriaId") REFERENCES "categorias_actividades"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "reservas_aulas_actividades" ADD CONSTRAINT "reservas_aulas_actividades_horarioId_fkey"
  FOREIGN KEY ("horarioId") REFERENCES "horarios_actividades"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "reservas_aulas_actividades" ADD CONSTRAINT "reservas_aulas_actividades_aulaId_fkey"
  FOREIGN KEY ("aulaId") REFERENCES "aulas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- DropTable (después de consolidación)
DROP TABLE IF EXISTS "_backup_horarios_secciones";
DROP TABLE IF EXISTS "_backup_participaciones_secciones";
DROP TABLE IF EXISTS "_backup_reservas_aulas_secciones";
DROP TABLE IF EXISTS "_backup_secciones_actividades";
DROP TABLE IF EXISTS "_backup_reserva_aulas";
DROP TABLE IF EXISTS "_backup_DocenteActividad";
DROP TABLE IF EXISTS "_backup_DocenteSeccion";
```

### 5.4 Plan de Rollback

**En caso de problemas críticos:**

```sql
-- ROLLBACK COMPLETO
BEGIN;

-- 1. Restaurar desde backup
psql -h localhost -U usuario -d asociacion_musical < backup_pre_migracion_YYYYMMDD_HHMMSS.sql

-- 2. Verificar restauración
SELECT COUNT(*) FROM actividades;
SELECT COUNT(*) FROM secciones_actividades;

COMMIT;
```

**Rollback parcial (si solo falla una fase):**

```sql
-- Si falla Fase 3 (consolidación)
DELETE FROM horarios_actividades WHERE "createdAt" >= '2025-10-15'; -- fecha de migración
DELETE FROM participacion_actividades WHERE "createdAt" >= '2025-10-15';
DELETE FROM reservas_aulas_actividades WHERE "createdAt" >= '2025-10-15';

-- Renombrar tablas backup
ALTER TABLE _backup_secciones_actividades RENAME TO secciones_actividades;
ALTER TABLE _backup_horarios_secciones RENAME TO horarios_secciones;
-- etc.
```

---

## 6. ANEXOS

### 6.1 Checklist de Migración

```markdown
## Pre-Migración
- [ ] Backup completo de base de datos creado
- [ ] Backup de tablas específicas creado
- [ ] Scripts de validación probados en staging
- [ ] Plan de rollback documentado
- [ ] Equipo notificado sobre ventana de migración

## Durante Migración
- [ ] Fase 1 completada: Análisis y backup
- [ ] Fase 2 completada: Creación de tablas nuevas
- [ ] Fase 3 completada: Consolidación de datos
- [ ] Fase 4 completada: Limpieza de deprecados
- [ ] Fase 5 completada: Validación post-migración

## Post-Migración
- [ ] Todas las validaciones pasaron exitosamente
- [ ] Cero pérdida de datos confirmada
- [ ] Aplicación funciona correctamente con nuevo schema
- [ ] Tests de integración pasando
- [ ] Documentación actualizada
- [ ] Equipo capacitado en nuevo modelo
```

### 6.2 Casos de Prueba

**CP-001: Crear actividad con horarios múltiples**
```http
POST /api/actividades
Content-Type: application/json

{
  "nombre": "Coro Adultos 2025",
  "tipo": "CORO",
  "categoriaId": "cat_coro_adultos",
  "descripcion": "Coro principal de adultos",
  "fechaDesde": "2025-01-01T00:00:00Z",
  "fechaHasta": "2025-12-31T23:59:59Z",
  "cupoMaximo": 40,
  "costo": 0,
  "estado": "ACTIVA",
  "docenteIds": ["docente_123"],
  "horarios": [
    {
      "diaSemana": "LUNES",
      "horaInicio": "18:00",
      "horaFin": "20:00"
    },
    {
      "diaSemana": "MIERCOLES",
      "horaInicio": "18:00",
      "horaFin": "20:00"
    },
    {
      "diaSemana": "VIERNES",
      "horaInicio": "18:00",
      "horaFin": "20:00"
    }
  ]
}
```

**Resultado esperado:** 201 Created con actividad y horarios creados.

**CP-002: Asignar aula a horario específico**
```http
POST /api/actividades/{actividadId}/horarios/{horarioId}/aulas
Content-Type: application/json

{
  "aulaId": "aula_001",
  "fechaVigenciaDesde": "2025-01-01T00:00:00Z",
  "fechaVigenciaHasta": "2025-12-31T23:59:59Z"
}
```

**Resultado esperado:** 201 Created con reserva de aula creada.

**CP-003: Consultar horario semanal**
```http
GET /api/actividades/horarios/semana
```

**Resultado esperado:** JSON con estructura por días de la semana.

### 6.3 Métricas de Éxito

| Métrica | Objetivo | Medición |
|---------|----------|----------|
| Tiempo de migración | < 4 horas | Timestamp inicio - timestamp fin |
| Pérdida de datos | 0% | Comparación registros antes/después |
| Downtime | < 1 hora | Tiempo que API no responde |
| Errores post-migración | 0 errores críticos | Logs de aplicación primeras 24h |
| Tests pasando | 100% | Suite de tests de integración |
| Performance queries | < 200ms p95 | Métricas de APM |

### 6.4 Glosario

| Término | Definición |
|---------|------------|
| **Actividad** | Entidad principal que representa una clase, coro o taller |
| **CategoríaActividad** | Clasificación dinámica de actividades (ej: Coro Adultos, Piano Nivel 1) |
| **HorarioActividad** | Horario recurrente semanal de una actividad |
| **ReservaAulaActividad** | Asignación de un aula a un horario específico |
| **ParticipacionActividad** | Inscripción de una persona a una actividad |
| **Deprecado** | Código/tabla que se mantiene por compatibilidad pero no debe usarse |
| **Legacy** | Sistema antiguo que será reemplazado |
| **Consolidación** | Proceso de unificar datos de secciones en actividades |

---

## 📞 CONTACTO Y SEGUIMIENTO

**Equipo de Desarrollo SIGESDA**
- Repositorio: `/home/francisco/PROYECTOS/SIGESDA/SIGESDA-BACKEND`
- Documentación: `docs/REDISENO_ACTIVIDAD_COMPLETO.md`

**Última actualización:** 2025-10-15
**Versión del documento:** 1.0
**Estado:** Propuesta pendiente de aprobación

---

**FIN DEL DOCUMENTO**
