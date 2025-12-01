-- ============================================================================
-- SCRIPT DE RESETEO: AULAS, EQUIPAMIENTOS Y RESERVAS
-- ============================================================================
-- Este script elimina TODOS los datos relacionados con:
-- - Aulas y Equipamientos
-- - Reservas de Aulas
-- - Catálogos relacionados (Tipos, Estados, Categorías)
--
-- ADVERTENCIA: Esta operación es IRREVERSIBLE. Se perderán todos los datos.
-- ============================================================================

-- Desactivar temporalmente las foreign key checks para facilitar el truncate
-- (En PostgreSQL no existe esta opción, usaremos CASCADE)

BEGIN;

-- ============================================================================
-- NIVEL 1: ELIMINAR DATOS TRANSACCIONALES (Dependencias más altas)
-- ============================================================================

TRUNCATE TABLE reservas_aulas_secciones CASCADE;
-- Elimina: Reservas recurrentes de aulas asignadas a secciones
-- Dependencias: aulas, secciones_actividades

TRUNCATE TABLE reserva_aulas CASCADE;
-- Elimina: Reservas puntuales de aulas
-- Dependencias: aulas, actividades, personas, estados_reservas

TRUNCATE TABLE aulas_equipamientos CASCADE;
-- Elimina: Relación many-to-many entre aulas y equipamientos
-- Dependencias: aulas, equipamientos

-- ============================================================================
-- NIVEL 2: ELIMINAR MAESTROS (Aulas, Equipamientos)
-- ============================================================================

TRUNCATE TABLE aulas CASCADE;
-- Elimina: Todas las aulas
-- Dependencias: tipos_aulas, estados_aulas

TRUNCATE TABLE equipamientos CASCADE;
-- Elimina: Todos los equipamientos
-- Dependencias: categorias_equipamiento

-- ============================================================================
-- NIVEL 3: ELIMINAR CATÁLOGOS
-- ============================================================================

TRUNCATE TABLE estados_reservas CASCADE;
-- Elimina: Estados de reserva (PENDIENTE, CONFIRMADA, COMPLETADA, CANCELADA, RECHAZADA)

TRUNCATE TABLE estados_aulas CASCADE;
-- Elimina: Estados de aula (DISPONIBLE, EN_MANTENIMIENTO, CERRADA, RESERVADA)

TRUNCATE TABLE tipos_aulas CASCADE;
-- Elimina: Tipos de aula (TEORIA, PRACTICA, ESTUDIO, ENSAYO, AUDITORIO)

TRUNCATE TABLE categorias_equipamiento CASCADE;
-- Elimina: Categorías de equipamiento (INST_MUS, MOB, TEC_AUDIO, INFRAEST, DIDACT)

-- ============================================================================
-- RESETEO DE SECUENCIAS (AUTO_INCREMENT)
-- ============================================================================

-- Resetear las secuencias a 1 para que los nuevos registros empiecen desde 1
ALTER SEQUENCE aulas_id_seq RESTART WITH 1;
ALTER SEQUENCE equipamientos_id_seq RESTART WITH 1;
ALTER SEQUENCE aulas_equipamientos_id_seq RESTART WITH 1;
ALTER SEQUENCE reserva_aulas_id_seq RESTART WITH 1;
ALTER SEQUENCE reservas_aulas_secciones_id_seq RESTART WITH 1;
ALTER SEQUENCE tipos_aulas_id_seq RESTART WITH 1;
ALTER SEQUENCE estados_aulas_id_seq RESTART WITH 1;
ALTER SEQUENCE estados_reservas_id_seq RESTART WITH 1;
ALTER SEQUENCE categorias_equipamiento_id_seq RESTART WITH 1;

COMMIT;

-- ============================================================================
-- RESUMEN DE OPERACIÓN
-- ============================================================================

SELECT 'Reset completado exitosamente' AS status;
SELECT 'Tablas vaciadas: 9' AS tablas_afectadas;
SELECT 'Secuencias reseteadas: 9' AS secuencias_reseteadas;

-- ============================================================================
-- PRÓXIMO PASO: Ejecutar el seed para recargar datos
-- ============================================================================
-- Comando: npm run db:seed
-- O: npx ts-node prisma/seed.ts
-- ============================================================================
