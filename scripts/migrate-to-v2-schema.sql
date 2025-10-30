-- ========================================================================
-- MIGRACIÓN A ARQUITECTURA V2: MÚLTIPLES TIPOS POR PERSONA
-- ========================================================================
-- Fecha: 2025-10-30
-- Descripción: Migración de modelo legacy (un solo tipo por persona)
--              a modelo V2 (múltiples tipos por persona)
--
-- CAMBIOS PRINCIPALES:
-- 1. Crear tabla TipoPersonaCatalogo (renombrar tipos_persona)
-- 2. Crear tabla PersonaTipo (relación many-to-many)
-- 3. Crear tabla EspecialidadDocente (catálogo de especialidades)
-- 4. Crear tabla ContactoPersona (múltiples contactos)
-- 5. Migrar datos existentes del modelo legacy al nuevo

-- ========================================================================
-- PASO 1: CREAR NUEVAS TABLAS
-- ========================================================================

-- 1.1 Crear TipoPersonaCatalogo (catálogo de tipos de persona)
CREATE TABLE IF NOT EXISTS "tipo_persona_catalogo" (
  "id" SERIAL PRIMARY KEY,
  "codigo" VARCHAR(50) UNIQUE NOT NULL,
  "nombre" VARCHAR(100) NOT NULL,
  "descripcion" TEXT,
  "activo" BOOLEAN NOT NULL DEFAULT true,
  "orden" INTEGER NOT NULL DEFAULT 0,
  "requires_categoria" BOOLEAN NOT NULL DEFAULT false,
  "requires_especialidad" BOOLEAN NOT NULL DEFAULT false,
  "requires_cuit" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "tipo_persona_catalogo_codigo_idx" ON "tipo_persona_catalogo"("codigo");
CREATE INDEX "tipo_persona_catalogo_activo_idx" ON "tipo_persona_catalogo"("activo");
CREATE INDEX "tipo_persona_catalogo_orden_idx" ON "tipo_persona_catalogo"("orden");

-- 1.2 Crear EspecialidadDocente (catálogo de especialidades)
CREATE TABLE IF NOT EXISTS "especialidad_docente" (
  "id" SERIAL PRIMARY KEY,
  "codigo" VARCHAR(50) UNIQUE NOT NULL,
  "nombre" VARCHAR(100) NOT NULL,
  "descripcion" TEXT,
  "activo" BOOLEAN NOT NULL DEFAULT true,
  "orden" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "especialidad_docente_codigo_idx" ON "especialidad_docente"("codigo");
CREATE INDEX "especialidad_docente_activo_idx" ON "especialidad_docente"("activo");

-- 1.3 Crear PersonaTipo (relación many-to-many entre Persona y TipoPersonaCatalogo)
CREATE TABLE IF NOT EXISTS "persona_tipo" (
  "id" SERIAL PRIMARY KEY,
  "persona_id" INTEGER NOT NULL,
  "tipo_persona_id" INTEGER NOT NULL,
  "activo" BOOLEAN NOT NULL DEFAULT true,
  "fecha_asignacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "fecha_desasignacion" TIMESTAMP(3),

  -- Campos específicos de SOCIO
  "categoria_id" INTEGER,
  "numero_socio" INTEGER,
  "fecha_ingreso" TIMESTAMP(3),
  "fecha_baja" TIMESTAMP(3),
  "motivo_baja" VARCHAR(200),

  -- Campos específicos de DOCENTE
  "especialidad_id" INTEGER,
  "honorarios_por_hora" DECIMAL(10, 2),

  -- Campos específicos de PROVEEDOR
  "cuit" VARCHAR(11),
  "razon_social" VARCHAR(200),

  "observaciones" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY ("persona_id") REFERENCES "personas"("id") ON DELETE CASCADE,
  FOREIGN KEY ("tipo_persona_id") REFERENCES "tipo_persona_catalogo"("id") ON DELETE RESTRICT,
  FOREIGN KEY ("categoria_id") REFERENCES "categorias_socios"("id") ON DELETE SET NULL,
  FOREIGN KEY ("especialidad_id") REFERENCES "especialidad_docente"("id") ON DELETE SET NULL,

  UNIQUE ("persona_id", "tipo_persona_id")
);

CREATE INDEX "persona_tipo_persona_id_idx" ON "persona_tipo"("persona_id");
CREATE INDEX "persona_tipo_tipo_persona_id_idx" ON "persona_tipo"("tipo_persona_id");
CREATE INDEX "persona_tipo_activo_idx" ON "persona_tipo"("activo");
CREATE INDEX "persona_tipo_categoria_id_idx" ON "persona_tipo"("categoria_id");
CREATE INDEX "persona_tipo_especialidad_id_idx" ON "persona_tipo"("especialidad_id");
CREATE INDEX "persona_tipo_numero_socio_idx" ON "persona_tipo"("numero_socio");

-- 1.4 Crear ContactoPersona (múltiples contactos por persona)
CREATE TYPE "TipoContacto" AS ENUM ('EMAIL', 'TELEFONO', 'CELULAR', 'WHATSAPP', 'TELEGRAM', 'OTRO');

CREATE TABLE IF NOT EXISTS "contacto_persona" (
  "id" SERIAL PRIMARY KEY,
  "persona_id" INTEGER NOT NULL,
  "tipo_contacto" "TipoContacto" NOT NULL,
  "valor" VARCHAR(200) NOT NULL,
  "principal" BOOLEAN NOT NULL DEFAULT false,
  "activo" BOOLEAN NOT NULL DEFAULT true,
  "observaciones" VARCHAR(500),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY ("persona_id") REFERENCES "personas"("id") ON DELETE CASCADE
);

CREATE INDEX "contacto_persona_persona_id_idx" ON "contacto_persona"("persona_id");
CREATE INDEX "contacto_persona_tipo_contacto_idx" ON "contacto_persona"("tipo_contacto");
CREATE INDEX "contacto_persona_activo_idx" ON "contacto_persona"("activo");
CREATE INDEX "contacto_persona_principal_idx" ON "contacto_persona"("principal");

-- ========================================================================
-- PASO 2: POBLAR CATÁLOGOS
-- ========================================================================

-- 2.1 Poblar TipoPersonaCatalogo desde tipos_persona existente
INSERT INTO "tipo_persona_catalogo" (
  "codigo", "nombre", "descripcion", "activo", "orden",
  "requires_categoria", "requires_especialidad", "requires_cuit"
)
SELECT
  "codigo", "nombre", "descripcion", "activo", "orden",
  "requires_categoria", "requires_especialidad", "requires_cuit"
FROM "tipos_persona"
ON CONFLICT ("codigo") DO NOTHING;

-- 2.2 Poblar EspecialidadDocente con especialidades iniciales
INSERT INTO "especialidad_docente" ("codigo", "nombre", "descripcion", "activo", "orden")
VALUES
  ('GENERAL', 'General', 'Especialidad general', true, 1),
  ('CANTO', 'Canto', 'Especialidad en canto', true, 2),
  ('PIANO', 'Piano', 'Especialidad en piano', true, 3),
  ('GUITARRA', 'Guitarra', 'Especialidad en guitarra', true, 4),
  ('VIOLIN', 'Violín', 'Especialidad en violín', true, 5),
  ('TEORIA', 'Teoría Musical', 'Especialidad en teoría musical', true, 6),
  ('CORO', 'Dirección Coral', 'Especialidad en dirección coral', true, 7)
ON CONFLICT ("codigo") DO NOTHING;

-- ========================================================================
-- PASO 3: MIGRAR DATOS LEGACY A NUEVO MODELO
-- ========================================================================

-- 3.1 Migrar tipos de personas existentes a PersonaTipo
INSERT INTO "persona_tipo" (
  "persona_id",
  "tipo_persona_id",
  "activo",
  "fecha_asignacion",
  "categoria_id",
  "numero_socio",
  "fecha_ingreso",
  "fecha_baja",
  "motivo_baja",
  "especialidad_id",
  "honorarios_por_hora",
  "cuit",
  "razon_social"
)
SELECT
  p."id" AS "persona_id",
  tpc."id" AS "tipo_persona_id",
  CASE
    WHEN p."fecha_baja" IS NULL THEN true
    ELSE false
  END AS "activo",
  COALESCE(p."fecha_ingreso", p."created_at") AS "fecha_asignacion",

  -- Campos específicos de SOCIO
  CASE WHEN p."tipo" = 'SOCIO' THEN p."categoria_id" ELSE NULL END,
  CASE WHEN p."tipo" = 'SOCIO' THEN p."numero_socio" ELSE NULL END,
  CASE WHEN p."tipo" = 'SOCIO' THEN p."fecha_ingreso" ELSE NULL END,
  CASE WHEN p."tipo" = 'SOCIO' THEN p."fecha_baja" ELSE NULL END,
  CASE WHEN p."tipo" = 'SOCIO' THEN p."motivo_baja" ELSE NULL END,

  -- Campos específicos de DOCENTE
  CASE WHEN p."tipo" = 'DOCENTE' THEN 1 ELSE NULL END, -- especialidad_id = 1 (GENERAL)
  CASE WHEN p."tipo" = 'DOCENTE' THEN p."honorarios_por_hora" ELSE NULL END,

  -- Campos específicos de PROVEEDOR
  CASE WHEN p."tipo" = 'PROVEEDOR' THEN p."cuit" ELSE NULL END,
  CASE WHEN p."tipo" = 'PROVEEDOR' THEN p."razon_social" ELSE NULL END
FROM "personas" p
INNER JOIN "tipo_persona_catalogo" tpc ON tpc."codigo" = p."tipo"::text
ON CONFLICT ("persona_id", "tipo_persona_id") DO NOTHING;

-- 3.2 Migrar emails y teléfonos a ContactoPersona
-- Migrar emails
INSERT INTO "contacto_persona" ("persona_id", "tipo_contacto", "valor", "principal", "activo")
SELECT
  "id" AS "persona_id",
  'EMAIL'::TipoContacto AS "tipo_contacto",
  "email" AS "valor",
  true AS "principal",
  true AS "activo"
FROM "personas"
WHERE "email" IS NOT NULL AND "email" != ''
ON CONFLICT DO NOTHING;

-- Migrar teléfonos
INSERT INTO "contacto_persona" ("persona_id", "tipo_contacto", "valor", "principal", "activo")
SELECT
  "id" AS "persona_id",
  'TELEFONO'::TipoContacto AS "tipo_contacto",
  "telefono" AS "valor",
  true AS "principal",
  true AS "activo"
FROM "personas"
WHERE "telefono" IS NOT NULL AND "telefono" != ''
ON CONFLICT DO NOTHING;

-- ========================================================================
-- RESUMEN DE MIGRACIÓN
-- ========================================================================
-- ✅ Se crearon las siguientes tablas:
--    - tipo_persona_catalogo
--    - especialidad_docente
--    - persona_tipo
--    - contacto_persona
--
-- ✅ Se poblaron los catálogos:
--    - tipo_persona_catalogo (desde tipos_persona)
--    - especialidad_docente (especialidades iniciales)
--
-- ✅ Se migraron los datos:
--    - Tipos de personas legacy → persona_tipo
--    - Emails → contacto_persona
--    - Teléfonos → contacto_persona
--
-- ⚠️ IMPORTANTE: Las columnas legacy en la tabla personas NO se eliminan aún
--               para mantener compatibilidad y permitir rollback
--
-- 📝 NOTA: Para completar la migración, se debe:
--          1. Actualizar el código para usar las nuevas tablas
--          2. Probar exhaustivamente
--          3. Una vez validado, eliminar las columnas legacy de personas
