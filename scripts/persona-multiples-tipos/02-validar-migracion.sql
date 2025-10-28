-- ======================================================================
-- SCRIPT: VALIDAR MIGRACIÓN
-- Descripción: Valida que la migración se haya realizado correctamente
-- Fecha: 2025-10-27
-- ======================================================================

-- 1. Verificar que existen las nuevas tablas
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tipos_persona') THEN
        RAISE EXCEPTION 'ERROR: Tabla tipos_persona no existe';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'especialidades_docentes') THEN
        RAISE EXCEPTION 'ERROR: Tabla especialidades_docentes no existe';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'persona_tipos') THEN
        RAISE EXCEPTION 'ERROR: Tabla persona_tipos no existe';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'contactos_persona') THEN
        RAISE EXCEPTION 'ERROR: Tabla contactos_persona no existe';
    END IF;

    RAISE NOTICE '✓ Todas las tablas nuevas existen';
END $$;

-- 2. Verificar catálogos
DO $$
DECLARE
    tipos_count INTEGER;
    especialidades_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO tipos_count FROM "tipos_persona";
    SELECT COUNT(*) INTO especialidades_count FROM "especialidades_docentes";

    IF tipos_count < 4 THEN
        RAISE EXCEPTION 'ERROR: tipos_persona debe tener al menos 4 registros, tiene %', tipos_count;
    END IF;

    IF especialidades_count < 1 THEN
        RAISE EXCEPTION 'ERROR: especialidades_docentes debe tener al menos 1 registro, tiene %', especialidades_count;
    END IF;

    RAISE NOTICE '✓ Catálogos cargados correctamente';
    RAISE NOTICE '  - Tipos de persona: %', tipos_count;
    RAISE NOTICE '  - Especialidades docentes: %', especialidades_count;
END $$;

-- 3. Verificar que todas las personas tienen al menos un tipo
DO $$
DECLARE
    personas_total INTEGER;
    personas_con_tipo INTEGER;
    personas_sin_tipo INTEGER;
BEGIN
    SELECT COUNT(*) INTO personas_total FROM "personas";
    SELECT COUNT(DISTINCT "personaId") INTO personas_con_tipo FROM "persona_tipos";
    personas_sin_tipo := personas_total - personas_con_tipo;

    IF personas_sin_tipo > 0 THEN
        RAISE WARNING 'ADVERTENCIA: Hay % personas sin tipo asignado', personas_sin_tipo;
        -- Listar las personas sin tipo
        RAISE NOTICE 'Personas sin tipo:';
        FOR r IN
            SELECT p.id, p.nombre, p.apellido, p.dni
            FROM "personas" p
            LEFT JOIN "persona_tipos" pt ON p.id = pt."personaId"
            WHERE pt.id IS NULL
        LOOP
            RAISE NOTICE '  - ID: %, DNI: %, Nombre: % %', r.id, r.dni, r.nombre, r.apellido;
        END LOOP;
    ELSE
        RAISE NOTICE '✓ Todas las personas tienen al menos un tipo asignado';
    END IF;

    RAISE NOTICE '  - Total personas: %', personas_total;
    RAISE NOTICE '  - Personas con tipo: %', personas_con_tipo;
END $$;

-- 4. Verificar migración de contactos
DO $$
DECLARE
    emails_en_personas INTEGER;
    emails_en_contactos INTEGER;
    telefonos_en_personas INTEGER;
    telefonos_en_contactos INTEGER;
BEGIN
    SELECT COUNT(*) INTO emails_en_personas FROM "personas" WHERE email IS NOT NULL;
    SELECT COUNT(*) INTO emails_en_contactos FROM "contactos_persona" WHERE "tipoContacto" = 'EMAIL';

    SELECT COUNT(*) INTO telefonos_en_personas FROM "personas" WHERE telefono IS NOT NULL;
    SELECT COUNT(*) INTO telefonos_en_contactos FROM "contactos_persona" WHERE "tipoContacto" = 'TELEFONO';

    IF emails_en_contactos < emails_en_personas THEN
        RAISE WARNING 'ADVERTENCIA: No se migraron todos los emails (personas: %, contactos: %)',
            emails_en_personas, emails_en_contactos;
    ELSE
        RAISE NOTICE '✓ Emails migrados correctamente';
    END IF;

    IF telefonos_en_contactos < telefonos_en_personas THEN
        RAISE WARNING 'ADVERTENCIA: No se migraron todos los teléfonos (personas: %, contactos: %)',
            telefonos_en_personas, telefonos_en_contactos;
    ELSE
        RAISE NOTICE '✓ Teléfonos migrados correctamente';
    END IF;

    RAISE NOTICE '  - Emails: % en personas, % en contactos', emails_en_personas, emails_en_contactos;
    RAISE NOTICE '  - Teléfonos: % en personas, % en contactos', telefonos_en_personas, telefonos_en_contactos;
END $$;

-- 5. Verificar migración de socios
DO $$
DECLARE
    socios_count INTEGER;
    socios_con_categoria INTEGER;
    socios_con_numero INTEGER;
BEGIN
    SELECT COUNT(*) INTO socios_count
    FROM "persona_tipos" pt
    JOIN "tipos_persona" tp ON pt."tipoPersonaId" = tp.id
    WHERE tp.codigo = 'SOCIO';

    SELECT COUNT(*) INTO socios_con_categoria
    FROM "persona_tipos" pt
    JOIN "tipos_persona" tp ON pt."tipoPersonaId" = tp.id
    WHERE tp.codigo = 'SOCIO' AND pt."categoriaId" IS NOT NULL;

    SELECT COUNT(*) INTO socios_con_numero
    FROM "persona_tipos" pt
    JOIN "tipos_persona" tp ON pt."tipoPersonaId" = tp.id
    WHERE tp.codigo = 'SOCIO' AND pt."numeroSocio" IS NOT NULL;

    RAISE NOTICE '✓ Socios migrados:';
    RAISE NOTICE '  - Total socios: %', socios_count;
    RAISE NOTICE '  - Con categoría: %', socios_con_categoria;
    RAISE NOTICE '  - Con número de socio: %', socios_con_numero;
END $$;

-- 6. Verificar migración de docentes
DO $$
DECLARE
    docentes_count INTEGER;
    docentes_con_especialidad INTEGER;
BEGIN
    SELECT COUNT(*) INTO docentes_count
    FROM "persona_tipos" pt
    JOIN "tipos_persona" tp ON pt."tipoPersonaId" = tp.id
    WHERE tp.codigo = 'DOCENTE';

    SELECT COUNT(*) INTO docentes_con_especialidad
    FROM "persona_tipos" pt
    JOIN "tipos_persona" tp ON pt."tipoPersonaId" = tp.id
    WHERE tp.codigo = 'DOCENTE' AND pt."especialidadId" IS NOT NULL;

    RAISE NOTICE '✓ Docentes migrados:';
    RAISE NOTICE '  - Total docentes: %', docentes_count;
    RAISE NOTICE '  - Con especialidad: %', docentes_con_especialidad;
END $$;

-- 7. Verificar migración de proveedores
DO $$
DECLARE
    proveedores_count INTEGER;
    proveedores_con_cuit INTEGER;
BEGIN
    SELECT COUNT(*) INTO proveedores_count
    FROM "persona_tipos" pt
    JOIN "tipos_persona" tp ON pt."tipoPersonaId" = tp.id
    WHERE tp.codigo = 'PROVEEDOR';

    SELECT COUNT(*) INTO proveedores_con_cuit
    FROM "persona_tipos" pt
    JOIN "tipos_persona" tp ON pt."tipoPersonaId" = tp.id
    WHERE tp.codigo = 'PROVEEDOR' AND pt.cuit IS NOT NULL;

    RAISE NOTICE '✓ Proveedores migrados:';
    RAISE NOTICE '  - Total proveedores: %', proveedores_count;
    RAISE NOTICE '  - Con CUIT: %', proveedores_con_cuit;
END $$;

-- 8. Verificar que no existen columnas viejas en personas
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'personas' AND column_name = 'tipo'
    ) THEN
        RAISE EXCEPTION 'ERROR: La columna "tipo" aún existe en personas';
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'personas' AND column_name = 'categoriaId'
    ) THEN
        RAISE EXCEPTION 'ERROR: La columna "categoriaId" aún existe en personas';
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'personas' AND column_name = 'numeroSocio'
    ) THEN
        RAISE EXCEPTION 'ERROR: La columna "numeroSocio" aún existe en personas';
    END IF;

    RAISE NOTICE '✓ Columnas antiguas eliminadas correctamente';
END $$;

-- 9. Verificar actualización de tablas relacionadas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'comision_directiva' AND column_name = 'personaId'
    ) THEN
        RAISE EXCEPTION 'ERROR: comision_directiva no tiene columna personaId';
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'comision_directiva' AND column_name = 'socioId'
    ) THEN
        RAISE EXCEPTION 'ERROR: comision_directiva aún tiene columna socioId';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'familiares' AND column_name = 'personaPrincipalId'
    ) THEN
        RAISE EXCEPTION 'ERROR: familiares no tiene columna personaPrincipalId';
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'familiares' AND column_name = 'socioId'
    ) THEN
        RAISE EXCEPTION 'ERROR: familiares aún tiene columna socioId';
    END IF;

    RAISE NOTICE '✓ Tablas relacionadas actualizadas correctamente';
END $$;

-- ======================================================================
-- RESUMEN FINAL
-- ======================================================================
DO $$
DECLARE
    personas_count INTEGER;
    persona_tipos_count INTEGER;
    contactos_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO personas_count FROM "personas";
    SELECT COUNT(*) INTO persona_tipos_count FROM "persona_tipos";
    SELECT COUNT(*) INTO contactos_count FROM "contactos_persona";

    RAISE NOTICE '';
    RAISE NOTICE '================================================';
    RAISE NOTICE 'RESUMEN DE LA MIGRACIÓN';
    RAISE NOTICE '================================================';
    RAISE NOTICE 'Personas en el sistema: %', personas_count;
    RAISE NOTICE 'Asignaciones de tipos: %', persona_tipos_count;
    RAISE NOTICE 'Contactos registrados: %', contactos_count;
    RAISE NOTICE '================================================';
    RAISE NOTICE 'MIGRACIÓN VALIDADA EXITOSAMENTE';
    RAISE NOTICE '================================================';
END $$;
