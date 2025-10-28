-- ======================================================================
-- MIGRACIÓN: PERSONA CON MÚLTIPLES TIPOS
-- Fecha: 2025-10-27
-- Descripción: Rediseño del módulo Persona para soportar múltiples tipos
-- ======================================================================

-- ======================================================================
-- PASO 1: CREAR NUEVOS CATÁLOGOS
-- ======================================================================

-- 1.1. Crear catálogo tipos_persona
CREATE TABLE "tipos_persona" (
    "id" SERIAL PRIMARY KEY,
    "codigo" VARCHAR(50) UNIQUE NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "descripcion" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Insertar tipos iniciales
INSERT INTO "tipos_persona" (codigo, nombre, descripcion, activo, orden) VALUES
    ('NO_SOCIO', 'No Socio', 'Persona sin membresía', true, 1),
    ('SOCIO', 'Socio', 'Socio del club', true, 2),
    ('DOCENTE', 'Docente', 'Instructor de actividades', true, 3),
    ('PROVEEDOR', 'Proveedor', 'Proveedor de servicios', true, 4);

-- 1.2. Crear catálogo especialidades_docentes
CREATE TABLE "especialidades_docentes" (
    "id" SERIAL PRIMARY KEY,
    "codigo" VARCHAR(50) UNIQUE NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "descripcion" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Insertar especialidad por defecto
INSERT INTO "especialidades_docentes" (codigo, nombre, activo, orden) VALUES
    ('GENERAL', 'General', true, 1);

-- 1.3. Crear enum TipoContacto
CREATE TYPE "TipoContacto" AS ENUM (
    'EMAIL',
    'TELEFONO',
    'CELULAR',
    'WHATSAPP',
    'FACEBOOK',
    'INSTAGRAM',
    'LINKEDIN',
    'TWITTER',
    'OTRO'
);

-- ======================================================================
-- PASO 2: CREAR TABLA DE RELACIÓN persona_tipos
-- ======================================================================

CREATE TABLE "persona_tipos" (
    "id" SERIAL PRIMARY KEY,
    "personaId" INTEGER NOT NULL,
    "tipoPersonaId" INTEGER NOT NULL,
    "fechaAsignacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaDesasignacion" TIMESTAMP(3),
    "activo" BOOLEAN NOT NULL DEFAULT true,

    -- Campos específicos SOCIO
    "categoriaId" INTEGER,
    "numeroSocio" INTEGER UNIQUE,
    "fechaIngreso" TIMESTAMP(3),
    "fechaBaja" TIMESTAMP(3),
    "motivoBaja" TEXT,

    -- Campos específicos DOCENTE
    "especialidadId" INTEGER,
    "honorariosPorHora" DECIMAL(10,2),

    -- Campos específicos PROVEEDOR
    "cuit" VARCHAR(11) UNIQUE,
    "razonSocial" VARCHAR(200),

    "observaciones" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "persona_tipos_personaId_tipoPersonaId_key" UNIQUE ("personaId", "tipoPersonaId")
);

-- Crear índices
CREATE INDEX "persona_tipos_personaId_idx" ON "persona_tipos"("personaId");
CREATE INDEX "persona_tipos_tipoPersonaId_idx" ON "persona_tipos"("tipoPersonaId");
CREATE INDEX "persona_tipos_activo_idx" ON "persona_tipos"("activo");

-- Agregar foreign keys
ALTER TABLE "persona_tipos" ADD CONSTRAINT "persona_tipos_personaId_fkey"
    FOREIGN KEY ("personaId") REFERENCES "personas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "persona_tipos" ADD CONSTRAINT "persona_tipos_tipoPersonaId_fkey"
    FOREIGN KEY ("tipoPersonaId") REFERENCES "tipos_persona"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "persona_tipos" ADD CONSTRAINT "persona_tipos_categoriaId_fkey"
    FOREIGN KEY ("categoriaId") REFERENCES "categorias_socios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "persona_tipos" ADD CONSTRAINT "persona_tipos_especialidadId_fkey"
    FOREIGN KEY ("especialidadId") REFERENCES "especialidades_docentes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ======================================================================
-- PASO 3: CREAR TABLA contactos_persona
-- ======================================================================

CREATE TABLE "contactos_persona" (
    "id" SERIAL PRIMARY KEY,
    "personaId" INTEGER NOT NULL,
    "tipoContacto" "TipoContacto" NOT NULL,
    "valor" VARCHAR(200) NOT NULL,
    "principal" BOOLEAN NOT NULL DEFAULT false,
    "observaciones" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contactos_persona_personaId_fkey"
        FOREIGN KEY ("personaId") REFERENCES "personas"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Crear índices
CREATE INDEX "contactos_persona_personaId_idx" ON "contactos_persona"("personaId");
CREATE INDEX "contactos_persona_tipoContacto_idx" ON "contactos_persona"("tipoContacto");
CREATE INDEX "contactos_persona_activo_idx" ON "contactos_persona"("activo");

-- ======================================================================
-- PASO 4: MIGRAR DATOS EXISTENTES
-- ======================================================================

-- 4.1. Migrar tipos de personas a persona_tipos
INSERT INTO "persona_tipos" (
    "personaId",
    "tipoPersonaId",
    "activo",
    "categoriaId",
    "numeroSocio",
    "fechaIngreso",
    "fechaBaja",
    "motivoBaja",
    "especialidadId",
    "honorariosPorHora",
    "cuit",
    "razonSocial"
)
SELECT
    p.id,
    tp.id AS "tipoPersonaId",
    CASE WHEN p."fechaBaja" IS NULL THEN true ELSE false END AS activo,
    p."categoriaId",
    p."numeroSocio",
    p."fechaIngreso",
    p."fechaBaja",
    p."motivoBaja",
    CASE
        WHEN p.tipo = 'DOCENTE' THEN
            (SELECT id FROM "especialidades_docentes" WHERE codigo = 'GENERAL')
        ELSE NULL
    END AS "especialidadId",
    p."honorariosPorHora",
    p.cuit,
    p."razonSocial"
FROM "personas" p
JOIN "tipos_persona" tp ON tp.codigo = p.tipo::text;

-- 4.2. Migrar contactos EMAIL
INSERT INTO "contactos_persona" ("personaId", "tipoContacto", valor, principal, activo)
SELECT id, 'EMAIL'::TipoContacto, email, true, true
FROM "personas"
WHERE email IS NOT NULL;

-- 4.3. Migrar contactos TELEFONO
INSERT INTO "contactos_persona" ("personaId", "tipoContacto", valor, principal, activo)
SELECT id, 'TELEFONO'::TipoContacto, telefono, true, true
FROM "personas"
WHERE telefono IS NOT NULL;

-- ======================================================================
-- PASO 5: MODIFICAR TABLA personas (ELIMINAR COLUMNAS MIGRADAS)
-- ======================================================================

-- Eliminar constraint de foreign key categoriaId
ALTER TABLE "personas" DROP CONSTRAINT IF EXISTS "personas_categoriaId_fkey";

-- Eliminar índice de categoriaId
DROP INDEX IF EXISTS "personas_categoriaId_idx";

-- Eliminar columnas específicas de tipos
ALTER TABLE "personas" DROP COLUMN IF EXISTS "tipo";
ALTER TABLE "personas" DROP COLUMN IF EXISTS "categoriaId";
ALTER TABLE "personas" DROP COLUMN IF EXISTS "numeroSocio";
ALTER TABLE "personas" DROP COLUMN IF EXISTS "fechaIngreso";
ALTER TABLE "personas" DROP COLUMN IF EXISTS "fechaBaja";
ALTER TABLE "personas" DROP COLUMN IF EXISTS "motivoBaja";
ALTER TABLE "personas" DROP COLUMN IF EXISTS "especialidad";
ALTER TABLE "personas" DROP COLUMN IF EXISTS "honorariosPorHora";
ALTER TABLE "personas" DROP COLUMN IF EXISTS "cuit";
ALTER TABLE "personas" DROP COLUMN IF EXISTS "razonSocial";

-- ======================================================================
-- PASO 6: ACTUALIZAR OTRAS TABLAS (RENOMBRAR COLUMNAS)
-- ======================================================================

-- 6.1. Actualizar tabla comision_directiva
ALTER TABLE "comision_directiva"
    RENAME COLUMN "socioId" TO "personaId";

-- 6.2. Actualizar tabla familiares
ALTER TABLE "familiares"
    RENAME COLUMN "socioId" TO "personaPrincipalId";

-- Actualizar constraint unique
ALTER TABLE "familiares"
    DROP CONSTRAINT IF EXISTS "familiares_socioId_familiarId_key";

ALTER TABLE "familiares"
    ADD CONSTRAINT "familiares_personaPrincipalId_familiarId_key"
    UNIQUE ("personaPrincipalId", "familiarId");

-- ======================================================================
-- PASO 7: ELIMINAR ENUM TipoPersona (YA NO SE USA)
-- ======================================================================

DROP TYPE IF EXISTS "TipoPersona";

-- ======================================================================
-- PASO 8: ACTUALIZAR CONSTRAINTS Y VALIDACIONES
-- ======================================================================

-- Constraint: Una persona debe tener al menos un tipo activo
-- (esto se validará en la lógica de negocio)

-- Verificación de datos
DO $$
DECLARE
    personas_sin_tipo INTEGER;
    personas_migradas INTEGER;
BEGIN
    SELECT COUNT(*) INTO personas_sin_tipo
    FROM "personas" p
    LEFT JOIN "persona_tipos" pt ON p.id = pt."personaId"
    WHERE pt.id IS NULL;

    SELECT COUNT(DISTINCT "personaId") INTO personas_migradas
    FROM "persona_tipos";

    RAISE NOTICE 'Personas sin tipo asignado: %', personas_sin_tipo;
    RAISE NOTICE 'Personas migradas: %', personas_migradas;

    IF personas_sin_tipo > 0 THEN
        RAISE WARNING 'HAY % PERSONAS SIN TIPO ASIGNADO', personas_sin_tipo;
    END IF;
END $$;

-- ======================================================================
-- FIN DE LA MIGRACIÓN
-- ======================================================================
