-- ======================================================================
-- SCRIPT: BACKUP ANTES DE MIGRACIÓN
-- Descripción: Respalda los datos actuales de personas antes de la migración
-- Fecha: 2025-10-27
-- ======================================================================

-- Crear tabla de backup
CREATE TABLE IF NOT EXISTS "personas_backup_20251027" AS
SELECT * FROM "personas";

CREATE TABLE IF NOT EXISTS "comision_directiva_backup_20251027" AS
SELECT * FROM "comision_directiva";

CREATE TABLE IF NOT EXISTS "familiares_backup_20251027" AS
SELECT * FROM "familiares";

-- Verificar cantidad de registros respaldados
DO $$
DECLARE
    personas_count INTEGER;
    comision_count INTEGER;
    familiares_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO personas_count FROM "personas_backup_20251027";
    SELECT COUNT(*) INTO comision_count FROM "comision_directiva_backup_20251027";
    SELECT COUNT(*) INTO familiares_count FROM "familiares_backup_20251027";

    RAISE NOTICE 'BACKUP COMPLETADO:';
    RAISE NOTICE '  - Personas respaldadas: %', personas_count;
    RAISE NOTICE '  - Comision Directiva respaldada: %', comision_count;
    RAISE NOTICE '  - Familiares respaldados: %', familiares_count;
END $$;
