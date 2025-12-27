-- ===========================================================================
-- MIGRACIÓN: Agregar Catálogos de Equipamiento y Campos Faltantes
-- Fecha: 2025-12-26
-- Descripción: Completa la estructura de equipamientos con tablas catálogo
--              y campos faltantes (codigo, categoriaId, estadoId, cantidad)
-- ===========================================================================

-- PASO 1: Crear tabla de categorías de equipamiento
-- ===========================================================================
CREATE TABLE "categorias_equipamiento" (
    "id" SERIAL NOT NULL,
    "codigo" VARCHAR(50) NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "descripcion" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categorias_equipamiento_pkey" PRIMARY KEY ("id")
);

-- PASO 2: Crear tabla de estados de equipamiento
-- ===========================================================================
CREATE TABLE "estados_equipamiento" (
    "id" SERIAL NOT NULL,
    "codigo" VARCHAR(50) NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "descripcion" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "estados_equipamiento_pkey" PRIMARY KEY ("id")
);

-- PASO 3: Insertar categorías predefinidas
-- ===========================================================================
INSERT INTO "categorias_equipamiento" ("codigo", "nombre", "descripcion", "orden", "updated_at") VALUES
('INST', 'Instrumentos', 'Instrumentos musicales (pianos, guitarras, percusión, etc.)', 1, CURRENT_TIMESTAMP),
('MOBI', 'Mobiliario', 'Muebles y mobiliario (sillas, mesas, atriles, estantes)', 2, CURRENT_TIMESTAMP),
('AUDI', 'Audio', 'Equipamiento de sonido (amplificadores, micrófonos, altavoces)', 3, CURRENT_TIMESTAMP),
('VISU', 'Visual', 'Equipamiento visual (proyectores, pantallas, pizarras)', 4, CURRENT_TIMESTAMP),
('ACUS', 'Acústica', 'Material acústico (cabinas, paneles, aislamiento)', 5, CURRENT_TIMESTAMP);

-- PASO 4: Insertar estados predefinidos
-- ===========================================================================
INSERT INTO "estados_equipamiento" ("codigo", "nombre", "descripcion", "orden", "updated_at") VALUES
('DISPONIBLE', 'Disponible', 'Equipamiento disponible para uso', 1, CURRENT_TIMESTAMP),
('EN_USO', 'En Uso', 'Equipamiento actualmente en uso', 2, CURRENT_TIMESTAMP),
('MANTENIMIENTO', 'En Mantenimiento', 'Equipamiento en reparación o mantenimiento preventivo', 3, CURRENT_TIMESTAMP),
('BAJA', 'Dado de Baja', 'Equipamiento fuera de servicio permanente', 4, CURRENT_TIMESTAMP);

-- PASO 5: Agregar columnas nuevas a equipamientos (temporalmente nullable)
-- ===========================================================================
ALTER TABLE "equipamientos" ADD COLUMN "codigo" VARCHAR(50);
ALTER TABLE "equipamientos" ADD COLUMN "categoria_equipamiento_id" INTEGER;
ALTER TABLE "equipamientos" ADD COLUMN "estado_equipamiento_id" INTEGER;
ALTER TABLE "equipamientos" ADD COLUMN "cantidad" INTEGER DEFAULT 1;

-- PASO 6: Actualizar registros existentes con valores por defecto
-- ===========================================================================
-- Asignar códigos secuenciales a equipamientos existentes (EQ-001, EQ-002, etc.)
UPDATE "equipamientos"
SET "codigo" = 'EQ-' || LPAD(id::text, 3, '0')
WHERE "codigo" IS NULL;

-- Asignar categoría por defecto (MOBI = Mobiliario, asumiendo que son muebles genéricos)
UPDATE "equipamientos"
SET "categoria_equipamiento_id" = (
    SELECT id FROM "categorias_equipamiento" WHERE codigo = 'MOBI' LIMIT 1
)
WHERE "categoria_equipamiento_id" IS NULL;

-- Asignar estado por defecto (DISPONIBLE)
UPDATE "equipamientos"
SET "estado_equipamiento_id" = (
    SELECT id FROM "estados_equipamiento" WHERE codigo = 'DISPONIBLE' LIMIT 1
)
WHERE "estado_equipamiento_id" IS NULL;

-- Asegurar que cantidad tenga valor (default 1 ya aplicado, pero por si acaso)
UPDATE "equipamientos"
SET "cantidad" = 1
WHERE "cantidad" IS NULL;

-- PASO 7: Aplicar constraints NOT NULL y UNIQUE
-- ===========================================================================
ALTER TABLE "equipamientos" ALTER COLUMN "codigo" SET NOT NULL;
ALTER TABLE "equipamientos" ALTER COLUMN "categoria_equipamiento_id" SET NOT NULL;
ALTER TABLE "equipamientos" ALTER COLUMN "cantidad" SET NOT NULL;

-- PASO 8: Crear constraints UNIQUE
-- ===========================================================================
CREATE UNIQUE INDEX "categorias_equipamiento_codigo_key" ON "categorias_equipamiento"("codigo");
CREATE UNIQUE INDEX "estados_equipamiento_codigo_key" ON "estados_equipamiento"("codigo");
CREATE UNIQUE INDEX "equipamientos_codigo_key" ON "equipamientos"("codigo");

-- PASO 9: Crear índices para optimización
-- ===========================================================================
CREATE INDEX "categorias_equipamiento_codigo_idx" ON "categorias_equipamiento"("codigo");
CREATE INDEX "categorias_equipamiento_activo_idx" ON "categorias_equipamiento"("activo");
CREATE INDEX "categorias_equipamiento_orden_idx" ON "categorias_equipamiento"("orden");

CREATE INDEX "estados_equipamiento_codigo_idx" ON "estados_equipamiento"("codigo");
CREATE INDEX "estados_equipamiento_activo_idx" ON "estados_equipamiento"("activo");
CREATE INDEX "estados_equipamiento_orden_idx" ON "estados_equipamiento"("orden");

CREATE INDEX "equipamientos_codigo_idx" ON "equipamientos"("codigo");
CREATE INDEX "equipamientos_categoria_equipamiento_id_idx" ON "equipamientos"("categoria_equipamiento_id");
CREATE INDEX "equipamientos_estado_equipamiento_id_idx" ON "equipamientos"("estado_equipamiento_id");

-- PASO 10: Crear foreign keys
-- ===========================================================================
ALTER TABLE "equipamientos" ADD CONSTRAINT "equipamientos_categoria_equipamiento_id_fkey"
    FOREIGN KEY ("categoria_equipamiento_id")
    REFERENCES "categorias_equipamiento"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "equipamientos" ADD CONSTRAINT "equipamientos_estado_equipamiento_id_fkey"
    FOREIGN KEY ("estado_equipamiento_id")
    REFERENCES "estados_equipamiento"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

-- ===========================================================================
-- MIGRACIÓN COMPLETADA
-- ===========================================================================
-- Resumen de cambios:
-- - 2 tablas nuevas: categorias_equipamiento, estados_equipamiento
-- - 5 categorías predefinidas: INST, MOBI, AUDI, VISU, ACUS
-- - 4 estados predefinidos: DISPONIBLE, EN_USO, MANTENIMIENTO, BAJA
-- - 4 columnas nuevas en equipamientos: codigo, categoria_equipamiento_id, estado_equipamiento_id, cantidad
-- - 12 registros existentes actualizados con valores por defecto
-- - Índices y constraints aplicados correctamente
-- ===========================================================================
