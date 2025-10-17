# 🎯 REDISEÑO ACTIVIDAD - VERSIÓN REVISADA Y AJUSTADA

**Fecha:** 2025-10-15
**Versión:** 2.0 (Revisión post-feedback)
**Estado:** Propuesta Técnica Ajustada

---

## 📋 CAMBIOS RESPECTO A VERSIÓN 1.0

### Ajustes Implementados

1. ✅ **IDs tipo SERIAL** en todas las tablas (no CUID/UUID)
2. ✅ **Tipo de Actividad** como FK a tabla `tipos_actividades`
3. ✅ **Estado** como FK a tabla `estados_actividades`
4. ✅ **Rol de Docente** en tabla M:N `docentes_actividades`
5. ✅ **Grupos paralelos** como actividades independientes con código diferenciador
6. ✅ **Eliminación completa** de tablas actuales (no migración)
7. ✅ **Persistencia de múltiples días** aclarada (relación 1:N)

---

## 1. NUEVO MODELO DE DATOS (VERSIÓN FINAL)

### 1.1 Diagrama Entidad-Relación (DER)

```
┌─────────────────────────────────────┐
│     TIPOS_ACTIVIDADES (Catálogo)    │
├─────────────────────────────────────┤
│ id: SERIAL (PK)                     │
│ codigo: VARCHAR(50) UNIQUE          │
│ nombre: VARCHAR(100)                │
│ descripcion: TEXT                   │
│ activo: BOOLEAN                     │
│ orden: INTEGER                      │
└─────────────────────────────────────┘
                │
                │ 1:N
                ▼
┌─────────────────────────────────────┐
│   CATEGORIAS_ACTIVIDADES (Config)   │
├─────────────────────────────────────┤
│ id: SERIAL (PK)                     │
│ codigo: VARCHAR(50) UNIQUE          │
│ nombre: VARCHAR(100)                │
│ descripcion: TEXT                   │
│ activo: BOOLEAN                     │
│ orden: INTEGER                      │
└─────────────────────────────────────┘
                │
                │ 1:N
                ▼
┌─────────────────────────────────────┐
│  ESTADOS_ACTIVIDADES (Catálogo)     │
├─────────────────────────────────────┤
│ id: SERIAL (PK)                     │
│ codigo: VARCHAR(50) UNIQUE          │
│ nombre: VARCHAR(100)                │
│ descripcion: TEXT                   │
│ activo: BOOLEAN                     │
│ orden: INTEGER                      │
└─────────────────────────────────────┘
                │
                │ 1:N
                ▼
┌─────────────────────────────────────┐
│        ACTIVIDADES (Principal)       │
├─────────────────────────────────────┤
│ id: SERIAL (PK)                     │◄────────┐
│ codigo_actividad: VARCHAR(50) UNIQUE│         │
│ nombre: VARCHAR(200)                │         │
│ tipo_actividad_id: INTEGER (FK)     │         │
│ categoria_id: INTEGER (FK)          │         │
│ estado_id: INTEGER (FK)             │         │
│ descripcion: TEXT                   │         │
│ fecha_desde: TIMESTAMP              │         │
│ fecha_hasta: TIMESTAMP              │         │
│ cupo_maximo: INTEGER                │         │
│ costo: DECIMAL(10,2)                │         │
│ observaciones: TEXT                 │         │
│ created_at: TIMESTAMP               │         │
│ updated_at: TIMESTAMP               │         │
└─────────────────────────────────────┘         │
         │                                      │
         │ 1:N                                  │
         ▼                                      │
┌─────────────────────────────────────┐         │
│      HORARIOS_ACTIVIDADES            │         │
├─────────────────────────────────────┤         │
│ id: SERIAL (PK)                     │         │
│ actividad_id: INTEGER (FK)          │         │
│ dia_semana_id: INTEGER (FK)         │         │
│ hora_inicio: TIME                   │         │
│ hora_fin: TIME                      │         │
│ activo: BOOLEAN                     │         │
│ created_at: TIMESTAMP               │         │
│ updated_at: TIMESTAMP               │         │
└─────────────────────────────────────┘         │
         │                                      │
         │ 1:N                                  │
         ▼                                      │
┌─────────────────────────────────────┐         │
│    RESERVAS_AULAS_ACTIVIDADES        │         │
├─────────────────────────────────────┤         │
│ id: SERIAL (PK)                     │         │
│ horario_id: INTEGER (FK)            │         │
│ aula_id: INTEGER (FK)               │         │
│ fecha_vigencia_desde: TIMESTAMP     │         │
│ fecha_vigencia_hasta: TIMESTAMP     │         │
│ observaciones: TEXT                 │         │
│ created_at: TIMESTAMP               │         │
│ updated_at: TIMESTAMP               │         │
└─────────────────────────────────────┘         │
                                                │
┌─────────────────────────────────────┐         │
│      DIAS_SEMANA (Catálogo)         │         │
├─────────────────────────────────────┤         │
│ id: SERIAL (PK)                     │         │
│ codigo: VARCHAR(20) UNIQUE          │         │
│ nombre: VARCHAR(50)                 │         │
│ orden: INTEGER                      │         │
└─────────────────────────────────────┘         │
                                                │
┌─────────────────────────────────────┐         │
│     ROLES_DOCENTES (Catálogo)       │         │
├─────────────────────────────────────┤         │
│ id: SERIAL (PK)                     │         │
│ codigo: VARCHAR(50) UNIQUE          │         │
│ nombre: VARCHAR(100)                │         │
│ descripcion: TEXT                   │         │
│ activo: BOOLEAN                     │         │
│ orden: INTEGER                      │         │
└─────────────────────────────────────┘         │
                                                │
┌─────────────────────────────────────┐         │
│   DOCENTES_ACTIVIDADES (M:N + rol)  │         │
├─────────────────────────────────────┤         │
│ id: SERIAL (PK)                     │         │
│ actividad_id: INTEGER (FK) ─────────┼─────────┘
│ docente_id: INTEGER (FK) ───────────┼──► personas.id
│ rol_docente_id: INTEGER (FK)        │
│ fecha_asignacion: TIMESTAMP         │
│ fecha_desasignacion: TIMESTAMP      │
│ activo: BOOLEAN                     │
│ observaciones: TEXT                 │
│ created_at: TIMESTAMP               │
│ updated_at: TIMESTAMP               │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│   PARTICIPACIONES_ACTIVIDADES        │
├─────────────────────────────────────┤
│ id: SERIAL (PK)                     │
│ persona_id: INTEGER (FK)            │
│ actividad_id: INTEGER (FK)          │
│ fecha_inicio: TIMESTAMP             │
│ fecha_fin: TIMESTAMP                │
│ precio_especial: DECIMAL(10,2)      │
│ activo: BOOLEAN                     │
│ observaciones: TEXT                 │
│ created_at: TIMESTAMP               │
│ updated_at: TIMESTAMP               │
└─────────────────────────────────────┘
```

---

## 2. DEFINICIÓN DE TABLAS (SQL DDL)

### 2.1 Tablas de Catálogos/Configuración

```sql
-- ============================================================================
-- TABLA: tipos_actividades
-- Descripción: Catálogo de tipos de actividad (CORO, CLASE_INSTRUMENTO, etc.)
-- ============================================================================
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

-- Seed inicial
INSERT INTO tipos_actividades (codigo, nombre, descripcion, orden) VALUES
  ('CORO', 'Coro', 'Actividades corales grupales', 1),
  ('CLASE_CANTO', 'Clase de Canto', 'Clases individuales o grupales de canto', 2),
  ('CLASE_INSTRUMENTO', 'Clase de Instrumento', 'Clases de instrumentos musicales', 3);

-- ============================================================================
-- TABLA: categorias_actividades
-- Descripción: Categorías dinámicas (CORO_ADULTOS, PIANO_NIVEL1, etc.)
-- ============================================================================
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

-- Seed inicial
INSERT INTO categorias_actividades (codigo, nombre, descripcion, orden) VALUES
  ('CORO_ADULTOS', 'Coro Adultos', 'Coro principal de adultos', 1),
  ('CORO_JUVENIL', 'Coro Juvenil', 'Coro de jóvenes', 2),
  ('PIANO_INICIAL', 'Piano Inicial', 'Clases de piano nivel inicial', 3),
  ('PIANO_INTERMEDIO', 'Piano Intermedio', 'Clases de piano nivel intermedio', 4),
  ('PIANO_AVANZADO', 'Piano Avanzado', 'Clases de piano nivel avanzado', 5),
  ('CANTO_INICIAL', 'Canto Inicial', 'Clases de canto nivel inicial', 6),
  ('CANTO_INTERMEDIO', 'Canto Intermedio', 'Clases de canto nivel intermedio', 7),
  ('GUITARRA_INICIAL', 'Guitarra Inicial', 'Clases de guitarra nivel inicial', 8),
  ('GENERAL', 'General', 'Categoría general', 99);

-- ============================================================================
-- TABLA: estados_actividades
-- Descripción: Estados posibles de una actividad
-- ============================================================================
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

-- Seed inicial
INSERT INTO estados_actividades (codigo, nombre, descripcion, orden) VALUES
  ('ACTIVA', 'Activa', 'Actividad en curso', 1),
  ('INACTIVA', 'Inactiva', 'Actividad temporalmente suspendida', 2),
  ('FINALIZADA', 'Finalizada', 'Actividad completada', 3),
  ('CANCELADA', 'Cancelada', 'Actividad cancelada', 4);

-- ============================================================================
-- TABLA: dias_semana
-- Descripción: Catálogo de días de la semana
-- ============================================================================
CREATE TABLE dias_semana (
  id SERIAL PRIMARY KEY,
  codigo VARCHAR(20) NOT NULL UNIQUE,
  nombre VARCHAR(50) NOT NULL,
  orden INTEGER NOT NULL
);

-- Seed inicial
INSERT INTO dias_semana (codigo, nombre, orden) VALUES
  ('LUNES', 'Lunes', 1),
  ('MARTES', 'Martes', 2),
  ('MIERCOLES', 'Miércoles', 3),
  ('JUEVES', 'Jueves', 4),
  ('VIERNES', 'Viernes', 5),
  ('SABADO', 'Sábado', 6),
  ('DOMINGO', 'Domingo', 7);

-- ============================================================================
-- TABLA: roles_docentes
-- Descripción: Roles que puede tener un docente en una actividad
-- ============================================================================
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

-- Seed inicial
INSERT INTO roles_docentes (codigo, nombre, descripcion, orden) VALUES
  ('TITULAR', 'Titular', 'Docente principal a cargo de la actividad', 1),
  ('SUPLENTE', 'Suplente', 'Docente suplente o reemplazo', 2),
  ('AUXILIAR', 'Auxiliar', 'Docente asistente o auxiliar', 3),
  ('COORDINADOR', 'Coordinador', 'Coordinador de la actividad', 4);
```

### 2.2 Tabla Principal: Actividades

```sql
-- ============================================================================
-- TABLA: actividades
-- Descripción: Entidad principal de actividades (clases, coros, talleres)
-- ============================================================================
CREATE TABLE actividades (
  id SERIAL PRIMARY KEY,
  codigo_actividad VARCHAR(50) NOT NULL UNIQUE,
  nombre VARCHAR(200) NOT NULL,
  tipo_actividad_id INTEGER NOT NULL,
  categoria_id INTEGER NOT NULL,
  estado_id INTEGER NOT NULL DEFAULT 1, -- ACTIVA por defecto
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
COMMENT ON TABLE actividades IS 'Entidad principal que representa actividades musicales';
COMMENT ON COLUMN actividades.codigo_actividad IS 'Código único identificador (ej: CORO-ADU-2025-A, PIANO-NIV1-2025-G1)';
COMMENT ON COLUMN actividades.cupo_maximo IS 'Capacidad máxima de participantes. NULL = sin límite';
COMMENT ON COLUMN actividades.fecha_desde IS 'Fecha de inicio de vigencia de la actividad';
COMMENT ON COLUMN actividades.fecha_hasta IS 'Fecha de fin. NULL = actividad indefinida';
```

### 2.3 Tabla: Horarios de Actividades

```sql
-- ============================================================================
-- TABLA: horarios_actividades
-- Descripción: Horarios recurrentes semanales de cada actividad (1:N)
-- Nota: Una actividad puede tener múltiples horarios (días diferentes)
-- ============================================================================
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
COMMENT ON TABLE horarios_actividades IS 'Horarios recurrentes semanales. Permite múltiples días por actividad';
COMMENT ON COLUMN horarios_actividades.hora_inicio IS 'Hora de inicio en formato TIME (ej: 18:00:00)';
COMMENT ON COLUMN horarios_actividades.hora_fin IS 'Hora de fin en formato TIME (ej: 20:00:00)';
```

### 2.4 Tabla: Reservas de Aulas

```sql
-- ============================================================================
-- TABLA: reservas_aulas_actividades
-- Descripción: Asignación de aulas a horarios específicos con vigencia temporal
-- ============================================================================
CREATE TABLE reservas_aulas_actividades (
  id SERIAL PRIMARY KEY,
  horario_id INTEGER NOT NULL,
  aula_id INTEGER NOT NULL,
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
```

### 2.5 Tabla: Docentes-Actividades (M:N con rol)

```sql
-- ============================================================================
-- TABLA: docentes_actividades
-- Descripción: Relación M:N entre docentes y actividades con rol específico
-- Permite: múltiples docentes por actividad, cada uno con su rol
-- ============================================================================
CREATE TABLE docentes_actividades (
  id SERIAL PRIMARY KEY,
  actividad_id INTEGER NOT NULL,
  docente_id INTEGER NOT NULL,
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
COMMENT ON TABLE docentes_actividades IS 'Asignación de docentes a actividades con rol específico (Titular, Suplente, etc.)';
COMMENT ON COLUMN docentes_actividades.fecha_asignacion IS 'Fecha en que el docente fue asignado a la actividad';
COMMENT ON COLUMN docentes_actividades.fecha_desasignacion IS 'Fecha en que dejó la actividad. NULL = aún activo';
```

### 2.6 Tabla: Participaciones (Inscripciones)

```sql
-- ============================================================================
-- TABLA: participaciones_actividades
-- Descripción: Inscripciones de personas (alumnos) a actividades
-- ============================================================================
CREATE TABLE participaciones_actividades (
  id SERIAL PRIMARY KEY,
  persona_id INTEGER NOT NULL,
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
```

---

## 3. GESTIÓN DE GRUPOS PARALELOS

### 3.1 Concepto

**Grupos paralelos** son actividades del mismo tipo que se dictan en el mismo horario pero con distintos docentes y/o aulas.

**Implementación:** Cada grupo paralelo es una **Actividad independiente** con un código único diferenciador.

### 3.2 Ejemplo Práctico

**Caso:** Piano Nivel 1 con 2 grupos paralelos los lunes 18:00-19:00

```sql
-- Grupo 1
INSERT INTO actividades (codigo_actividad, nombre, tipo_actividad_id, categoria_id, fecha_desde, cupo_maximo, costo)
VALUES ('PIANO-NIV1-2025-G1', 'Piano Nivel 1 - Grupo 1', 3, 3, '2025-01-01', 4, 5000);

-- Horario Grupo 1
INSERT INTO horarios_actividades (actividad_id, dia_semana_id, hora_inicio, hora_fin)
VALUES (1, 1, '18:00', '19:00'); -- LUNES 18:00-19:00

-- Docente Grupo 1
INSERT INTO docentes_actividades (actividad_id, docente_id, rol_docente_id)
VALUES (1, 10, 1); -- Docente María como TITULAR

-- Aula Grupo 1
INSERT INTO reservas_aulas_actividades (horario_id, aula_id, fecha_vigencia_desde)
VALUES (1, 1, '2025-01-01'); -- Aula 1

-- Grupo 2 (paralelo)
INSERT INTO actividades (codigo_actividad, nombre, tipo_actividad_id, categoria_id, fecha_desde, cupo_maximo, costo)
VALUES ('PIANO-NIV1-2025-G2', 'Piano Nivel 1 - Grupo 2', 3, 3, '2025-01-01', 4, 5000);

-- Horario Grupo 2 (mismo horario que Grupo 1)
INSERT INTO horarios_actividades (actividad_id, dia_semana_id, hora_inicio, hora_fin)
VALUES (2, 1, '18:00', '19:00'); -- LUNES 18:00-19:00

-- Docente Grupo 2 (diferente docente)
INSERT INTO docentes_actividades (actividad_id, docente_id, rol_docente_id)
VALUES (2, 15, 1); -- Docente Juan como TITULAR

-- Aula Grupo 2 (diferente aula)
INSERT INTO reservas_aulas_actividades (horario_id, aula_id, fecha_vigencia_desde)
VALUES (2, 2, '2025-01-01'); -- Aula 2
```

### 3.3 Nomenclatura de Códigos

**Formato recomendado:** `{TIPO}-{CATEGORIA}-{AÑO}-{GRUPO}`

**Ejemplos:**
- `CORO-ADU-2025-A` → Coro Adultos 2025 Grupo A
- `CORO-ADU-2025-B` → Coro Adultos 2025 Grupo B
- `PIANO-NIV1-2025-G1` → Piano Nivel 1 2025 Grupo 1
- `PIANO-NIV1-2025-G2` → Piano Nivel 1 2025 Grupo 2
- `CANTO-INT-2025-MAÑ` → Canto Intermedio 2025 Mañana
- `CANTO-INT-2025-TAR` → Canto Intermedio 2025 Tarde

---

## 4. PERSISTENCIA DE MÚLTIPLES DÍAS

### 4.1 Explicación Técnica

La selección múltiple de días se persiste mediante **relación 1:N** entre `actividades` y `horarios_actividades`.

**No requiere:**
- ❌ Tabla intermedia `actividad_dia_semana`
- ❌ Campo serializado (array/JSON)
- ❌ Campos múltiples `dia1`, `dia2`, etc.

### 4.2 Ejemplo: Coro 3 días por semana

```sql
-- Crear actividad
INSERT INTO actividades (codigo_actividad, nombre, tipo_actividad_id, categoria_id, fecha_desde, cupo_maximo)
VALUES ('CORO-ADU-2025-A', 'Coro Adultos 2025', 1, 1, '2025-01-01', 40);

-- Insertar 3 horarios (3 días distintos)
INSERT INTO horarios_actividades (actividad_id, dia_semana_id, hora_inicio, hora_fin) VALUES
  (1, 1, '18:00', '20:00'), -- LUNES
  (1, 3, '18:00', '20:00'), -- MIÉRCOLES
  (1, 5, '18:00', '20:00'); -- VIERNES
```

**Consulta para obtener todos los días de una actividad:**

```sql
SELECT
  a.nombre,
  ds.nombre as dia,
  ha.hora_inicio,
  ha.hora_fin
FROM actividades a
INNER JOIN horarios_actividades ha ON ha.actividad_id = a.id
INNER JOIN dias_semana ds ON ds.id = ha.dia_semana_id
WHERE a.id = 1
ORDER BY ds.orden, ha.hora_inicio;
```

**Resultado:**
```
Coro Adultos 2025  | Lunes      | 18:00 | 20:00
Coro Adultos 2025  | Miércoles  | 18:00 | 20:00
Coro Adultos 2025  | Viernes    | 18:00 | 20:00
```

---

## 5. PLAN DE IMPLEMENTACIÓN (SIN MIGRACIÓN)

### 5.1 Estrategia: DROP y CREATE Fresh

**Dado que no hay datos de producción a conservar:**

1. ✅ **DROP completo** de todas las tablas relacionadas con actividades
2. ✅ **CREATE fresh** de la nueva estructura limpia
3. ✅ **SEED** de datos de catálogos
4. ❌ **NO migración** de datos existentes

### 5.2 Script de Implementación Completo

```sql
-- ============================================================================
-- SCRIPT DE IMPLEMENTACIÓN: REDISEÑO ACTIVIDAD
-- Fecha: 2025-10-15
-- Versión: 2.0
-- Acción: DROP completo + CREATE fresh (sin migración)
-- ============================================================================

BEGIN;

-- ----------------------------------------------------------------------------
-- PASO 1: DROP de tablas existentes (en orden de dependencias)
-- ----------------------------------------------------------------------------

-- Drop tablas de secciones (sistema a eliminar)
DROP TABLE IF EXISTS reservas_aulas_secciones CASCADE;
DROP TABLE IF EXISTS participaciones_secciones CASCADE;
DROP TABLE IF EXISTS horarios_secciones CASCADE;
DROP TABLE IF EXISTS secciones_actividades CASCADE;

-- Drop tablas deprecadas
DROP TABLE IF EXISTS participacion_actividades CASCADE;
DROP TABLE IF EXISTS reserva_aulas CASCADE;
DROP TABLE IF EXISTS horarios_actividades CASCADE;

-- Drop relaciones M:N
DROP TABLE IF EXISTS _DocenteActividad CASCADE;
DROP TABLE IF EXISTS _DocenteSeccion CASCADE;

-- Drop tabla principal
DROP TABLE IF EXISTS actividades CASCADE;

-- Drop tipos/enums legacy
DROP TYPE IF EXISTS "TipoActividad" CASCADE;
DROP TYPE IF EXISTS "EstadoActividad" CASCADE;
DROP TYPE IF EXISTS "DiaSemana" CASCADE;

-- ----------------------------------------------------------------------------
-- PASO 2: CREATE de nuevas tablas de catálogos
-- ----------------------------------------------------------------------------

-- [AQUÍ VA TODO EL DDL DE LA SECCIÓN 2.1]
-- tipos_actividades, categorias_actividades, estados_actividades,
-- dias_semana, roles_docentes

-- ----------------------------------------------------------------------------
-- PASO 3: CREATE de tabla principal y relacionadas
-- ----------------------------------------------------------------------------

-- [AQUÍ VA TODO EL DDL DE LAS SECCIONES 2.2 a 2.6]
-- actividades, horarios_actividades, reservas_aulas_actividades,
-- docentes_actividades, participaciones_actividades

-- ----------------------------------------------------------------------------
-- PASO 4: CREATE de triggers y funciones
-- ----------------------------------------------------------------------------

-- Trigger para updated_at automático
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger a todas las tablas
CREATE TRIGGER trg_update_actividades_updated_at
BEFORE UPDATE ON actividades
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_update_horarios_updated_at
BEFORE UPDATE ON horarios_actividades
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_update_reservas_updated_at
BEFORE UPDATE ON reservas_aulas_actividades
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_update_docentes_actividades_updated_at
BEFORE UPDATE ON docentes_actividades
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_update_participaciones_updated_at
BEFORE UPDATE ON participaciones_actividades
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ----------------------------------------------------------------------------
-- PASO 5: SEED de datos de prueba (opcional)
-- ----------------------------------------------------------------------------

-- Actividad de ejemplo 1: Coro Adultos
INSERT INTO actividades (codigo_actividad, nombre, tipo_actividad_id, categoria_id, estado_id, fecha_desde, cupo_maximo, costo)
VALUES ('CORO-ADU-2025-A', 'Coro Adultos 2025', 1, 1, 1, '2025-01-01', 40, 0);

-- Horarios del coro (Lunes, Miércoles, Viernes)
INSERT INTO horarios_actividades (actividad_id, dia_semana_id, hora_inicio, hora_fin) VALUES
  (1, 1, '18:00', '20:00'),
  (1, 3, '18:00', '20:00'),
  (1, 5, '18:00', '20:00');

-- Actividad de ejemplo 2: Piano Nivel 1 - Grupo 1
INSERT INTO actividades (codigo_actividad, nombre, tipo_actividad_id, categoria_id, estado_id, fecha_desde, cupo_maximo, costo)
VALUES ('PIANO-NIV1-2025-G1', 'Piano Nivel 1 - Grupo 1', 3, 3, 1, '2025-01-01', 4, 5000);

-- Horario Piano Grupo 1
INSERT INTO horarios_actividades (actividad_id, dia_semana_id, hora_inicio, hora_fin)
VALUES (2, 1, '18:00', '19:00');

-- Actividad de ejemplo 3: Piano Nivel 1 - Grupo 2 (paralelo)
INSERT INTO actividades (codigo_actividad, nombre, tipo_actividad_id, categoria_id, estado_id, fecha_desde, cupo_maximo, costo)
VALUES ('PIANO-NIV1-2025-G2', 'Piano Nivel 1 - Grupo 2', 3, 3, 1, '2025-01-01', 4, 5000);

-- Horario Piano Grupo 2 (mismo horario, grupo paralelo)
INSERT INTO horarios_actividades (actividad_id, dia_semana_id, hora_inicio, hora_fin)
VALUES (3, 1, '18:00', '19:00');

COMMIT;

-- ----------------------------------------------------------------------------
-- PASO 6: Verificación
-- ----------------------------------------------------------------------------

-- Verificar tablas creadas
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name LIKE '%actividad%'
ORDER BY table_name;

-- Verificar datos de ejemplo
SELECT
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
GROUP BY a.id, a.codigo_actividad, a.nombre, ta.nombre, ca.nombre, ea.nombre;
```

---

## 6. SCHEMA PRISMA ACTUALIZADO

```prisma
// ============================================================================
// MODELOS PARA GESTIÓN DE ACTIVIDADES (VERSIÓN 2.0 - REVISADA)
// ============================================================================

// Catálogo: Tipos de Actividad
model TipoActividad {
  id          Int          @id @default(autoincrement())
  codigo      String       @unique @db.VarChar(50)
  nombre      String       @db.VarChar(100)
  descripcion String?      @db.Text
  activo      Boolean      @default(true)
  orden       Int          @default(0)
  createdAt   DateTime     @default(now()) @map("created_at")
  updatedAt   DateTime     @updatedAt @map("updated_at")

  // Relaciones
  actividades Actividad[]

  @@map("tipos_actividades")
}

// Catálogo: Categorías de Actividad
model CategoriaActividad {
  id          Int          @id @default(autoincrement())
  codigo      String       @unique @db.VarChar(50)
  nombre      String       @db.VarChar(100)
  descripcion String?      @db.Text
  activo      Boolean      @default(true)
  orden       Int          @default(0)
  createdAt   DateTime     @default(now()) @map("created_at")
  updatedAt   DateTime     @updatedAt @map("updated_at")

  // Relaciones
  actividades Actividad[]

  @@map("categorias_actividades")
}

// Catálogo: Estados de Actividad
model EstadoActividad {
  id          Int          @id @default(autoincrement())
  codigo      String       @unique @db.VarChar(50)
  nombre      String       @db.VarChar(100)
  descripcion String?      @db.Text
  activo      Boolean      @default(true)
  orden       Int          @default(0)
  createdAt   DateTime     @default(now()) @map("created_at")
  updatedAt   DateTime     @updatedAt @map("updated_at")

  // Relaciones
  actividades Actividad[]

  @@map("estados_actividades")
}

// Catálogo: Días de la Semana
model DiaSemana {
  id      Int      @id @default(autoincrement())
  codigo  String   @unique @db.VarChar(20)
  nombre  String   @db.VarChar(50)
  orden   Int

  // Relaciones
  horarios HorarioActividad[]

  @@map("dias_semana")
}

// Catálogo: Roles de Docente
model RolDocente {
  id          Int          @id @default(autoincrement())
  codigo      String       @unique @db.VarChar(50)
  nombre      String       @db.VarChar(100)
  descripcion String?      @db.Text
  activo      Boolean      @default(true)
  orden       Int          @default(0)
  createdAt   DateTime     @default(now()) @map("created_at")
  updatedAt   DateTime     @updatedAt @map("updated_at")

  // Relaciones
  docentesActividades DocenteActividad[]

  @@map("roles_docentes")
}

// Entidad Principal: Actividad
model Actividad {
  id               Int                @id @default(autoincrement())
  codigoActividad  String             @unique @map("codigo_actividad") @db.VarChar(50)
  nombre           String             @db.VarChar(200)
  tipoActividadId  Int                @map("tipo_actividad_id")
  categoriaId      Int                @map("categoria_id")
  estadoId         Int                @map("estado_id") @default(1)
  descripcion      String?            @db.Text
  fechaDesde       DateTime           @map("fecha_desde")
  fechaHasta       DateTime?          @map("fecha_hasta")
  cupoMaximo       Int?               @map("cupo_maximo")
  costo            Decimal            @default(0) @db.Decimal(10, 2)
  observaciones    String?            @db.Text
  createdAt        DateTime           @default(now()) @map("created_at")
  updatedAt        DateTime           @updatedAt @map("updated_at")

  // Relaciones
  tipoActividad    TipoActividad      @relation(fields: [tipoActividadId], references: [id], onDelete: Restrict)
  categoria        CategoriaActividad @relation(fields: [categoriaId], references: [id], onDelete: Restrict)
  estado           EstadoActividad    @relation(fields: [estadoId], references: [id], onDelete: Restrict)
  horarios         HorarioActividad[]
  docentes         DocenteActividad[]
  participaciones  ParticipacionActividad[]

  @@index([tipoActividadId], name: "idx_actividades_tipo")
  @@index([categoriaId], name: "idx_actividades_categoria")
  @@index([estadoId], name: "idx_actividades_estado")
  @@index([fechaDesde, fechaHasta], name: "idx_actividades_vigencia")
  @@index([codigoActividad], name: "idx_actividades_codigo")
  @@map("actividades")
}

// Horarios de Actividades (1:N)
model HorarioActividad {
  id          Int        @id @default(autoincrement())
  actividadId Int        @map("actividad_id")
  diaSemanaId Int        @map("dia_semana_id")
  horaInicio  DateTime   @map("hora_inicio") @db.Time
  horaFin     DateTime   @map("hora_fin") @db.Time
  activo      Boolean    @default(true)
  createdAt   DateTime   @default(now()) @map("created_at")
  updatedAt   DateTime   @updatedAt @map("updated_at")

  // Relaciones
  actividad   Actividad  @relation(fields: [actividadId], references: [id], onDelete: Cascade)
  diaSemana   DiaSemana  @relation(fields: [diaSemanaId], references: [id], onDelete: Restrict)
  reservasAula ReservaAulaActividad[]

  @@index([actividadId], name: "idx_horarios_actividad")
  @@index([diaSemanaId], name: "idx_horarios_dia_semana")
  @@index([actividadId, diaSemanaId, horaInicio], name: "idx_horarios_composite")
  @@index([activo], name: "idx_horarios_activo")
  @@map("horarios_actividades")
}

// Reservas de Aulas para Actividades
model ReservaAulaActividad {
  id                  Int              @id @default(autoincrement())
  horarioId           Int              @map("horario_id")
  aulaId              Int              @map("aula_id")
  fechaVigenciaDesde  DateTime         @map("fecha_vigencia_desde")
  fechaVigenciaHasta  DateTime?        @map("fecha_vigencia_hasta")
  observaciones       String?          @db.Text
  createdAt           DateTime         @default(now()) @map("created_at")
  updatedAt           DateTime         @updatedAt @map("updated_at")

  // Relaciones
  horario             HorarioActividad @relation(fields: [horarioId], references: [id], onDelete: Cascade)
  aula                Aula             @relation(fields: [aulaId], references: [id], onDelete: Restrict)

  @@unique([horarioId, aulaId], name: "uk_horario_aula")
  @@index([horarioId], name: "idx_reservas_horario")
  @@index([aulaId], name: "idx_reservas_aula")
  @@index([fechaVigenciaDesde, fechaVigenciaHasta], name: "idx_reservas_vigencia")
  @@map("reservas_aulas_actividades")
}

// Docentes-Actividades (M:N con rol)
model DocenteActividad {
  id                  Int         @id @default(autoincrement())
  actividadId         Int         @map("actividad_id")
  docenteId           Int         @map("docente_id")
  rolDocenteId        Int         @map("rol_docente_id")
  fechaAsignacion     DateTime    @default(now()) @map("fecha_asignacion")
  fechaDesasignacion  DateTime?   @map("fecha_desasignacion")
  activo              Boolean     @default(true)
  observaciones       String?     @db.Text
  createdAt           DateTime    @default(now()) @map("created_at")
  updatedAt           DateTime    @updatedAt @map("updated_at")

  // Relaciones
  actividad           Actividad   @relation(fields: [actividadId], references: [id], onDelete: Cascade)
  docente             Persona     @relation(fields: [docenteId], references: [id], onDelete: Cascade)
  rolDocente          RolDocente  @relation(fields: [rolDocenteId], references: [id], onDelete: Restrict)

  @@unique([actividadId, docenteId, rolDocenteId], name: "uk_actividad_docente_rol")
  @@index([actividadId], name: "idx_docentes_actividades_actividad")
  @@index([docenteId], name: "idx_docentes_actividades_docente")
  @@index([activo], name: "idx_docentes_actividades_activo")
  @@index([rolDocenteId], name: "idx_docentes_actividades_rol")
  @@map("docentes_actividades")
}

// Participaciones (Inscripciones)
model ParticipacionActividad {
  id             Int       @id @default(autoincrement())
  personaId      Int       @map("persona_id")
  actividadId    Int       @map("actividad_id")
  fechaInicio    DateTime  @map("fecha_inicio")
  fechaFin       DateTime? @map("fecha_fin")
  precioEspecial Decimal?  @map("precio_especial") @db.Decimal(10, 2)
  activo         Boolean   @default(true)
  observaciones  String?   @db.Text
  createdAt      DateTime  @default(now()) @map("created_at")
  updatedAt      DateTime  @updatedAt @map("updated_at")

  // Relaciones
  persona        Persona   @relation(fields: [personaId], references: [id], onDelete: Cascade)
  actividad      Actividad @relation(fields: [actividadId], references: [id], onDelete: Cascade)

  @@unique([personaId, actividadId], name: "uk_persona_actividad")
  @@index([actividadId], name: "idx_participaciones_actividad")
  @@index([personaId], name: "idx_participaciones_persona")
  @@index([activo], name: "idx_participaciones_activo")
  @@index([fechaInicio, fechaFin], name: "idx_participaciones_fechas")
  @@map("participaciones_actividades")
}

// Actualización en modelo Persona (agregar relación)
model Persona {
  // ... campos existentes ...

  // Relaciones con actividades
  docenteActividades DocenteActividad[]
  participaciones    ParticipacionActividad[]

  @@map("personas")
}

// Actualización en modelo Aula (agregar relación)
model Aula {
  // ... campos existentes ...

  // Relaciones con actividades
  reservasActividades ReservaAulaActividad[]

  @@map("aulas")
}
```

---

## 7. COMPARATIVA: ANTES vs DESPUÉS

| Aspecto | ANTES (v1.0) | DESPUÉS (v2.0) |
|---------|--------------|----------------|
| **IDs** | CUID (String) | SERIAL (Integer) |
| **Tipo Actividad** | Enum hardcoded | FK a tabla `tipos_actividades` |
| **Estado** | Enum hardcoded | FK a tabla `estados_actividades` |
| **Día Semana** | Enum hardcoded | FK a tabla `dias_semana` |
| **Hora** | String (HH:MM) | TIME (nativo) |
| **Rol Docente** | No existía | FK a tabla `roles_docentes` |
| **Grupos paralelos** | Secciones (complejo) | Actividades independientes con código |
| **Múltiples días** | 1:N `HorarioActividad` | 1:N `HorarioActividad` (sin cambio) |
| **Migración** | Scripts complejos | DROP + CREATE fresh |

---

## 8. CHECKLIST DE IMPLEMENTACIÓN

```markdown
## Preparación
- [ ] Backup completo de base de datos actual
- [ ] Revisión del script DDL completo
- [ ] Ajustes finales según feedback del equipo

## Ejecución
- [ ] Ejecutar script de DROP de tablas antiguas
- [ ] Ejecutar script de CREATE de catálogos
- [ ] Ejecutar script de CREATE de tabla principal
- [ ] Ejecutar script de CREATE de tablas relacionadas
- [ ] Crear triggers de updated_at
- [ ] Ejecutar SEED de datos de catálogos
- [ ] Ejecutar SEED de datos de ejemplo (opcional)

## Validación
- [ ] Verificar que todas las tablas fueron creadas
- [ ] Verificar FKs y constraints
- [ ] Verificar índices
- [ ] Probar INSERT de actividad con múltiples horarios
- [ ] Probar INSERT de grupos paralelos
- [ ] Probar queries de consulta

## Actualización de Código
- [ ] Actualizar schema.prisma
- [ ] Ejecutar `npx prisma generate`
- [ ] Actualizar DTOs
- [ ] Actualizar Repositories
- [ ] Actualizar Services
- [ ] Actualizar Controllers

## Testing
- [ ] Tests unitarios
- [ ] Tests de integración
- [ ] Tests E2E

## Documentación
- [ ] Actualizar README
- [ ] Documentar estructura de códigos de actividad
- [ ] Guía de uso de grupos paralelos
```

---

## 9. QUERIES ÚTILES

### 9.1 Consultar actividades con todos sus datos

```sql
SELECT
  a.id,
  a.codigo_actividad,
  a.nombre,
  ta.nombre as tipo,
  ca.nombre as categoria,
  ea.nombre as estado,
  a.fecha_desde,
  a.fecha_hasta,
  a.cupo_maximo,
  a.costo
FROM actividades a
INNER JOIN tipos_actividades ta ON ta.id = a.tipo_actividad_id
INNER JOIN categorias_actividades ca ON ca.id = a.categoria_id
INNER JOIN estados_actividades ea ON ea.id = a.estado_id
ORDER BY a.fecha_desde DESC;
```

### 9.2 Consultar horarios de una actividad

```sql
SELECT
  a.nombre as actividad,
  ds.nombre as dia,
  ha.hora_inicio,
  ha.hora_fin,
  au.nombre as aula
FROM actividades a
INNER JOIN horarios_actividades ha ON ha.actividad_id = a.id
INNER JOIN dias_semana ds ON ds.id = ha.dia_semana_id
LEFT JOIN reservas_aulas_actividades raa ON raa.horario_id = ha.id
LEFT JOIN aulas au ON au.id = raa.aula_id
WHERE a.id = 1
ORDER BY ds.orden, ha.hora_inicio;
```

### 9.3 Consultar docentes de una actividad con roles

```sql
SELECT
  a.nombre as actividad,
  p.nombre || ' ' || p.apellido as docente,
  rd.nombre as rol,
  da.fecha_asignacion,
  da.activo
FROM actividades a
INNER JOIN docentes_actividades da ON da.actividad_id = a.id
INNER JOIN personas p ON p.id = da.docente_id
INNER JOIN roles_docentes rd ON rd.id = da.rol_docente_id
WHERE a.id = 1
ORDER BY rd.orden;
```

### 9.4 Detectar grupos paralelos (mismo horario)

```sql
SELECT
  ds.nombre as dia,
  ha.hora_inicio,
  ha.hora_fin,
  COUNT(DISTINCT a.id) as num_actividades,
  STRING_AGG(a.codigo_actividad, ', ') as codigos
FROM horarios_actividades ha
INNER JOIN actividades a ON a.id = ha.actividad_id
INNER JOIN dias_semana ds ON ds.id = ha.dia_semana_id
WHERE a.estado_id = 1 -- ACTIVA
GROUP BY ds.nombre, ds.orden, ha.hora_inicio, ha.hora_fin
HAVING COUNT(DISTINCT a.id) > 1
ORDER BY ds.orden, ha.hora_inicio;
```

---

**FIN DEL DOCUMENTO REVISADO**

---

## 📞 CONTACTO

**Equipo SIGESDA**
Documento: `docs/REDISENO_ACTIVIDAD_REVISADO.md`
Versión: 2.0
Última actualización: 2025-10-15
