-- CreateTable: Tabla de Categorías de Socios Dinámicas
CREATE TABLE "categorias_socios" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "montoCuota" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "descuento" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categorias_socios_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "categorias_socios_codigo_key" ON "categorias_socios"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "categorias_socios_nombre_key" ON "categorias_socios"("nombre");

-- Insertar categorías existentes del enum (usando CUID estáticos predefinidos)
INSERT INTO "categorias_socios" (id, codigo, nombre, descripcion, "montoCuota", descuento, orden, "createdAt", "updatedAt")
VALUES
  ('clwactivo000001', 'ACTIVO', 'Socio Activo', 'Socio activo con todos los beneficios', 25000, 0, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('clwestudiant001', 'ESTUDIANTE', 'Estudiante', 'Categoría para estudiantes con descuento', 15000, 40, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('clwfamiliar0001', 'FAMILIAR', 'Familiar', 'Categoría para familiares de socios', 12000, 0, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('clwjubilado0001', 'JUBILADO', 'Jubilado', 'Categoría para jubilados con descuento', 18000, 25, 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- AddColumn: Agregar categoriaId a personas
ALTER TABLE "personas" ADD COLUMN "categoriaId" TEXT;

-- Migrar datos de personas (enum -> FK)
UPDATE "personas" p
SET "categoriaId" = cs.id
FROM "categorias_socios" cs
WHERE p.categoria IS NOT NULL
  AND p.categoria::text = cs.codigo
  AND p.tipo = 'SOCIO';

-- CreateIndex para categoriaId en personas
CREATE INDEX "personas_categoriaId_idx" ON "personas"("categoriaId");

-- AddForeignKey
ALTER TABLE "personas" ADD CONSTRAINT "personas_categoriaId_fkey"
  FOREIGN KEY ("categoriaId") REFERENCES "categorias_socios"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

-- AddColumn: Agregar categoriaId a cuotas
ALTER TABLE "cuotas" ADD COLUMN "categoriaId" TEXT;

-- Migrar datos de cuotas (enum -> FK)
UPDATE "cuotas" c
SET "categoriaId" = cs.id
FROM "categorias_socios" cs
WHERE c.categoria IS NOT NULL
  AND c.categoria::text = cs.codigo;

-- Hacer categoriaId NOT NULL en cuotas (después de migrar datos)
ALTER TABLE "cuotas" ALTER COLUMN "categoriaId" SET NOT NULL;

-- CreateIndex para categoriaId en cuotas
CREATE INDEX "cuotas_categoriaId_idx" ON "cuotas"("categoriaId");

-- AddForeignKey
ALTER TABLE "cuotas" ADD CONSTRAINT "cuotas_categoriaId_fkey"
  FOREIGN KEY ("categoriaId") REFERENCES "categorias_socios"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

-- DropIndex: Eliminar índice único antiguo de cuotas
DROP INDEX "cuotas_categoria_mes_anio_key";

-- CreateIndex: Crear nuevo índice único usando categoriaId
CREATE UNIQUE INDEX "cuotas_categoriaId_mes_anio_key" ON "cuotas"("categoriaId", "mes", "anio");

-- Renombrar enum antiguo (mantener temporalmente para compatibilidad)
ALTER TYPE "CategoriaSocio" RENAME TO "CategoriaSocioLegacy";

-- NOTA: Las siguientes líneas se ejecutarán en una migración futura después de actualizar el código
-- ALTER TABLE "personas" DROP COLUMN "categoria";
-- ALTER TABLE "cuotas" DROP COLUMN "categoria";
-- DROP TYPE "CategoriaSocioLegacy";
