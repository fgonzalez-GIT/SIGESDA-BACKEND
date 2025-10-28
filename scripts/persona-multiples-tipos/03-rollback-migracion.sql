-- ======================================================================
-- SCRIPT: ROLLBACK MIGRACIÓN
-- Descripción: Revierte la migración de múltiples tipos de persona
-- Fecha: 2025-10-27
-- ADVERTENCIA: Este script debe ejecutarse solo si la migración falla
-- ======================================================================

-- Verificar que existen las tablas de backup
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'personas_backup_20251027') THEN
        RAISE EXCEPTION 'ERROR: No existe tabla de backup personas_backup_20251027';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'comision_directiva_backup_20251027') THEN
        RAISE EXCEPTION 'ERROR: No existe tabla de backup comision_directiva_backup_20251027';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'familiares_backup_20251027') THEN
        RAISE EXCEPTION 'ERROR: No existe tabla de backup familiares_backup_20251027';
    END IF;

    RAISE NOTICE 'Tablas de backup encontradas. Procediendo con rollback...';
END $$;

-- 1. Eliminar nuevas tablas
DROP TABLE IF EXISTS "contactos_persona" CASCADE;
DROP TABLE IF EXISTS "persona_tipos" CASCADE;
DROP TABLE IF EXISTS "especialidades_docentes" CASCADE;
DROP TABLE IF EXISTS "tipos_persona" CASCADE;

-- 2. Eliminar enum TipoContacto
DROP TYPE IF EXISTS "TipoContacto";

-- 3. Recrear enum TipoPersona
CREATE TYPE "TipoPersona" AS ENUM ('SOCIO', 'NO_SOCIO', 'DOCENTE', 'PROVEEDOR');

-- 4. Restaurar tabla personas desde backup
DROP TABLE IF EXISTS "personas" CASCADE;

CREATE TABLE "personas" AS
SELECT * FROM "personas_backup_20251027";

-- Recrear constraints y secuencia
ALTER TABLE "personas" ADD PRIMARY KEY (id);
ALTER TABLE "personas" ADD CONSTRAINT "personas_dni_key" UNIQUE (dni);
ALTER TABLE "personas" ADD CONSTRAINT "personas_email_key" UNIQUE (email);
ALTER TABLE "personas" ADD CONSTRAINT "personas_numeroSocio_key" UNIQUE ("numeroSocio");
ALTER TABLE "personas" ADD CONSTRAINT "personas_cuit_key" UNIQUE (cuit);

-- Recrear foreign key de categoriaId
ALTER TABLE "personas" ADD CONSTRAINT "personas_categoriaId_fkey"
    FOREIGN KEY ("categoriaId") REFERENCES "categorias_socios"(id) ON DELETE SET NULL ON UPDATE CASCADE;

-- Recrear índice
CREATE INDEX "personas_categoriaId_idx" ON "personas"("categoriaId");

-- Ajustar secuencia
SELECT setval(pg_get_serial_sequence('personas', 'id'), COALESCE(MAX(id), 1)) FROM "personas";

-- 5. Restaurar tabla comision_directiva
DROP TABLE IF EXISTS "comision_directiva" CASCADE;

CREATE TABLE "comision_directiva" AS
SELECT * FROM "comision_directiva_backup_20251027";

ALTER TABLE "comision_directiva" ADD PRIMARY KEY (id);
ALTER TABLE "comision_directiva" ADD CONSTRAINT "comision_directiva_socioId_key" UNIQUE ("socioId");
ALTER TABLE "comision_directiva" ADD CONSTRAINT "comision_directiva_socioId_fkey"
    FOREIGN KEY ("socioId") REFERENCES "personas"(id) ON DELETE CASCADE ON UPDATE CASCADE;

SELECT setval(pg_get_serial_sequence('comision_directiva', 'id'), COALESCE(MAX(id), 1)) FROM "comision_directiva";

-- 6. Restaurar tabla familiares
DROP TABLE IF EXISTS "familiares" CASCADE;

CREATE TABLE "familiares" AS
SELECT * FROM "familiares_backup_20251027";

ALTER TABLE "familiares" ADD PRIMARY KEY (id);
ALTER TABLE "familiares" ADD CONSTRAINT "familiares_socioId_familiarId_key" UNIQUE ("socioId", "familiarId");
ALTER TABLE "familiares" ADD CONSTRAINT "familiares_socioId_fkey"
    FOREIGN KEY ("socioId") REFERENCES "personas"(id) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "familiares" ADD CONSTRAINT "familiares_familiarId_fkey"
    FOREIGN KEY ("familiarId") REFERENCES "personas"(id) ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX "familiares_grupoFamiliarId_idx" ON "familiares"("grupoFamiliarId");
CREATE INDEX "familiares_activo_idx" ON "familiares"(activo);

SELECT setval(pg_get_serial_sequence('familiares', 'id'), COALESCE(MAX(id), 1)) FROM "familiares";

-- 7. Recrear foreign keys de otras tablas hacia personas
ALTER TABLE "docentes_actividades"
    ADD CONSTRAINT "fk_docente_persona"
    FOREIGN KEY ("docente_id") REFERENCES "personas"(id) ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "participaciones_actividades"
    ADD CONSTRAINT "fk_participacion_persona"
    FOREIGN KEY ("persona_id") REFERENCES "personas"(id) ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "recibos"
    ADD CONSTRAINT "recibos_emisorId_fkey"
    FOREIGN KEY ("emisorId") REFERENCES "personas"(id) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "recibos"
    ADD CONSTRAINT "recibos_receptorId_fkey"
    FOREIGN KEY ("receptorId") REFERENCES "personas"(id) ON DELETE SET NULL ON UPDATE CASCADE;

-- Verificación final
DO $$
DECLARE
    personas_restauradas INTEGER;
    comision_restaurada INTEGER;
    familiares_restaurados INTEGER;
BEGIN
    SELECT COUNT(*) INTO personas_restauradas FROM "personas";
    SELECT COUNT(*) INTO comision_restaurada FROM "comision_directiva";
    SELECT COUNT(*) INTO familiares_restaurados FROM "familiares";

    RAISE NOTICE '';
    RAISE NOTICE '================================================';
    RAISE NOTICE 'ROLLBACK COMPLETADO';
    RAISE NOTICE '================================================';
    RAISE NOTICE 'Personas restauradas: %', personas_restauradas;
    RAISE NOTICE 'Comisión Directiva restaurada: %', comision_restaurada;
    RAISE NOTICE 'Familiares restaurados: %', familiares_restaurados;
    RAISE NOTICE '================================================';
    RAISE NOTICE 'La base de datos ha sido restaurada al estado anterior';
    RAISE NOTICE '================================================';
END $$;
